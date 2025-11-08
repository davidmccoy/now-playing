/**
 * Transport module for zone subscriptions and now playing data extraction
 *
 * Handles subscribing to Roon zones and extracting now playing information
 */

import * as output from '../output.js';
import { ImageManager } from './image.js';

export interface TransportService {
  subscribe_zones: (callback: (response: string, data: any) => void) => void;
}

interface Zone {
  zone_id: string;
  display_name: string;
  outputs: any[];
  now_playing?: NowPlayingData;
  state?: string;
}

interface NowPlayingData {
  seek_position?: number;
  length?: number;
  image_key?: string;
  one_line?: {
    line1: string;
  };
  two_line?: {
    line1: string;
    line2: string;
  };
  three_line?: {
    line1: string;
    line2: string;
    line3: string;
  };
}

interface ZonesData {
  zones?: Zone[];
  zones_changed?: Zone[];
  zones_removed?: string[];
  zones_seek_changed?: any[];
}

/**
 * Manages zone subscriptions and now playing state
 */
export class TransportManager {
  private transportService: TransportService | null = null;
  private imageManager: ImageManager;
  private currentZoneId: string | null = null;
  private lastImageKey: string | null = null;

  constructor(imageManager: ImageManager) {
    this.imageManager = imageManager;
  }

  /**
   * Set the Roon transport service and start subscribing to zones
   */
  setTransportService(service: TransportService): void {
    output.info('=== SETTING TRANSPORT SERVICE ===');
    output.info(`Service object received: ${!!service}`);
    output.info(`Service has subscribe_zones: ${!!(service && service.subscribe_zones)}`);

    this.transportService = service;
    output.info('Transport service stored, now subscribing to zones...');
    this.subscribeToZones();
  }

  /**
   * Clear the transport service
   */
  clearTransportService(): void {
    this.transportService = null;
    this.currentZoneId = null;
    this.lastImageKey = null;
    output.debug('Transport service cleared');
  }

  /**
   * Subscribe to all zones and listen for updates
   */
  private subscribeToZones(): void {
    if (!this.transportService) {
      output.warn('Cannot subscribe to zones: transport service not available');
      return;
    }

    output.info('=== SUBSCRIBING TO ZONES ===');
    output.info('Calling transportService.subscribe_zones()...');

    try {
      this.transportService.subscribe_zones((response: string, data: ZonesData) => {
        output.info(`=== ZONE SUBSCRIPTION CALLBACK FIRED ===`);
        output.info(`Response type: ${response}`);
        output.info(`Data keys: ${JSON.stringify(Object.keys(data || {}))}`);

        if (response === 'Subscribed') {
          output.info('✓ Successfully subscribed to zones');
          output.info(`Initial zones count: ${(data.zones || []).length}`);
          // Initial zone data
          this.handleZonesUpdate(data);
        } else if (response === 'Changed') {
          output.info('Zone state changed');
          output.info(`Changed zones count: ${(data.zones_changed || []).length}`);
          // Zone state changed
          this.handleZonesUpdate(data);
        } else if (response === 'NetworkError' || response === 'ConnectionError') {
          output.warn(`Connection error: ${response}`);
          output.emitStatus('disconnected', 'Lost connection to Roon Core');
        } else {
          output.warn(`Unknown zone subscription response: ${response}`);
        }
      });

      output.info('✓ Zone subscription callback registered');
    } catch (error) {
      output.error('Error subscribing to zones:', error);
      output.emitError('Failed to subscribe to zones');
    }
  }

  /**
   * Handle zone updates from Roon
   */
  private async handleZonesUpdate(data: ZonesData): Promise<void> {
    try {
      output.info('=== HANDLING ZONES UPDATE ===');

      // Handle seek position changes separately - these don't contain full zone data
      if (data.zones_seek_changed && data.zones_seek_changed.length > 0 && !data.zones && !data.zones_changed) {
        output.debug(`Seek position update for ${data.zones_seek_changed.length} zone(s) - ignoring (no zone data)`);
        return;
      }

      // Get all zones (either from initial subscription or changes)
      const zones = data.zones || data.zones_changed || [];

      output.info(`Total zones received: ${zones.length}`);

      if (zones.length === 0) {
        output.debug('No zones in update');
        // Don't clear the current zone just because we got a seek update
        // Only clear if we explicitly got zones_removed or an empty zones array from a real update
        if (data.zones_removed && data.zones_removed.length > 0) {
          output.info('Zones were removed, clearing state');
          if (this.currentZoneId) {
            output.emitNowPlaying('', '', '', 'stopped');
            this.currentZoneId = null;
            this.lastImageKey = null;
          }
        }
        return;
      }

      // Log all zones for debugging
      zones.forEach((zone, idx) => {
        output.info(`Zone ${idx + 1}: ${zone.display_name} (${zone.zone_id}) - state: ${zone.state}`);
      });

      // Find first playing zone (for MVP, we'll just use the first active zone)
      // Future enhancement: allow user to select which zone to display
      const activeZone = zones.find(
        (zone) => zone.state === 'playing' || zone.state === 'paused'
      ) || zones[0];

      if (!activeZone) {
        output.warn('No active zone found despite having zones');
        return;
      }

      output.info(`Selected active zone: ${activeZone.display_name} (${activeZone.state})`);

      // Update current zone
      this.currentZoneId = activeZone.zone_id;

      // Extract now playing data
      await this.extractAndEmitNowPlaying(activeZone);
    } catch (error) {
      output.error('Error handling zone update:', error);
    }
  }

  /**
   * Extract now playing information from a zone and emit it
   */
  private async extractAndEmitNowPlaying(zone: Zone): Promise<void> {
    const nowPlaying = zone.now_playing;
    const state = zone.state || 'stopped';

    // Handle stopped state
    if (state === 'stopped' || !nowPlaying) {
      output.emitNowPlaying('', '', '', 'stopped');
      this.lastImageKey = null;
      return;
    }

    // Extract metadata from the three_line, two_line, or one_line structures
    // Roon provides metadata in these structures with varying levels of detail
    let title = '';
    let artist = '';
    let album = '';

    if (nowPlaying.three_line) {
      // three_line typically has: line1=title, line2=artist, line3=album
      title = nowPlaying.three_line.line1 || '';
      artist = nowPlaying.three_line.line2 || '';
      album = nowPlaying.three_line.line3 || '';
    } else if (nowPlaying.two_line) {
      // two_line typically has: line1=title, line2=artist
      title = nowPlaying.two_line.line1 || '';
      artist = nowPlaying.two_line.line2 || '';
    } else if (nowPlaying.one_line) {
      // one_line just has the title
      title = nowPlaying.one_line.line1 || '';
    }

    // Map Roon state to our state enum
    const playbackState: output.PlaybackState =
      state === 'playing' ? 'playing' :
      state === 'paused' ? 'paused' :
      'stopped';

    // Fetch artwork if available and changed
    let artwork: string | undefined;
    const imageKey = nowPlaying.image_key;

    if (imageKey && imageKey !== this.lastImageKey) {
      output.debug(`New image key detected: ${imageKey}`);
      artwork = await this.imageManager.fetchArtwork(imageKey);
      this.lastImageKey = imageKey;
    } else if (imageKey === this.lastImageKey) {
      // Same image key, try to get from cache
      artwork = await this.imageManager.fetchArtwork(imageKey);
    }

    // Emit the now playing data
    output.emitNowPlaying(title, artist, album, playbackState, artwork);
    output.debug(`Emitted now playing: ${title} by ${artist} (${playbackState})`);
  }
}

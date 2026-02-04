# Macaroon - macOS Menu Bar App for Roon

A macOS menu bar application that displays currently playing music from [Roon](https://roonlabs.com/) in your menu bar. Built with [Tauri](https://tauri.app/) (Rust) and Node.js.

![License](https://img.shields.io/badge/license-MIT-blue)
![Platform](https://img.shields.io/badge/platform-macOS-lightgrey)

## Features

- **Real-time Display**: Shows currently playing track information (title, artist, album) directly in your macOS menu bar
- **Album Artwork**: Displays album art thumbnail alongside track information
- **Zone Selection**: Select which Roon zone to display when you have multiple zones
- **Automatic Discovery**: Automatically discovers and connects to Roon Core on your network
- **Manual Connection**: Supports direct connection to Roon Core via environment variables

## Installation

### From GitHub Releases

1. Download the latest `.dmg` file from the [Releases](https://github.com/davidmccoy/now-playing/releases) page
2. Open the `.dmg` and drag **Macaroon** to your Applications folder
3. Launch Macaroon from Applications

### First Launch (Important!)

Since Macaroon is not signed with an Apple Developer certificate, macOS will block it by default. To open it:

1. **First attempt**: Double-click Macaroon. You'll see a warning that it "cannot be opened because the developer cannot be verified"
2. **Allow the app**: Go to **System Settings → Privacy & Security**
3. Scroll down to the Security section where you'll see "Macaroon was blocked from use"
4. Click **Open Anyway**
5. In the confirmation dialog, click **Open**

You only need to do this once. After that, Macaroon will open normally.

### Authorizing in Roon

After launching Macaroon:

1. The app will appear in your menu bar with a macaroon icon
2. It will automatically search for Roon Core on your network
3. When found, you need to authorize the extension in Roon:
   - Open **Roon**
   - Go to **Settings → Extensions**
   - Find **"Macaroon"** and click **Enable**

Once authorized, the menu bar will display your currently playing track with album artwork.

## Usage

### Menu Bar Display

The menu bar shows:

- Album artwork (or macaroon icon when nothing is playing)
- Track title and primary artist
- Automatically truncates long titles with ellipsis
- Updates in real-time as tracks change

### Zone Selection

If you have multiple Roon zones (different rooms/outputs):

1. Click the menu bar icon
2. Select the zone you want to display from the list
3. The selected zone is remembered between sessions

### Launch at Login

To have Macaroon start automatically when you log in:

1. Click the menu bar icon
2. Check **"Launch at Login"**

### Quitting

Click the menu bar icon and select **Quit** to exit the application.

## Manual Connection

If auto-discovery doesn't find your Roon Core, you can specify it manually:

```bash
ROON_HOST=192.168.1.100 /Applications/Macaroon.app/Contents/MacOS/Macaroon
```

Or with a custom port:

```bash
ROON_HOST=192.168.1.100 ROON_PORT=9100 /Applications/Macaroon.app/Contents/MacOS/Macaroon
```

## Building from Source

### Prerequisites

- macOS 10.15 (Catalina) or later
- Rust 1.75.0+
- Node.js 20.18.0+
- Xcode Command Line Tools

### Build Steps

1. Clone the repository:

```bash
git clone https://github.com/davidmccoy/now-playing.git
cd now-playing
```

2. Install dependencies:

```bash
npm install
cd sidecar && npm install && cd ..
```

3. Build the sidecar:

```bash
cd sidecar && npm run build && cd ..
```

4. Run in development mode:

```bash
npm run dev
```

5. Build for production:

```bash
npm run build
```

The built application will be in `src-tauri/target/release/bundle/`.

## How It Works

The application uses a **sidecar architecture**:

1. **Tauri App (Rust)**: Manages the macOS menu bar icon and renders the display
   - Image compositor with album art and text rendering
   - System tray integration with zone selection
   - SF Pro system font for native macOS appearance
   - Automatic dark/light mode detection

2. **Node.js Sidecar**: Connects to Roon Core and streams playback data
   - Roon API integration for real-time updates
   - Auto-discovery of Roon Core on local network
   - Album artwork fetching and encoding
   - JSON-based communication with Rust app

## Troubleshooting

### App doesn't appear in menu bar

- Check if another menu bar item is covering it
- Look for the macaroon icon or album artwork
- Try quitting and relaunching

### Can't connect to Roon Core

- Ensure Roon Core is running and on the same network
- Check firewall settings (Roon uses port 9100)
- Try manual connection with `ROON_HOST` environment variable
- Verify the extension is enabled in Roon Settings → Extensions

### Extension not showing in Roon

- Make sure Macaroon is running
- Check that your Mac and Roon Core are on the same network
- Restart both Macaroon and Roon

### No album artwork

- Some tracks may not have artwork in your library
- A macaroon silhouette is shown when no artwork is available

### Text hard to read

- Macaroon detects dark/light mode at startup
- If you switch modes, restart Macaroon for correct colors

## Configuration

Macaroon stores its configuration in:

- **macOS**: `~/Library/Application Support/Macaroon/`

This includes:

- Roon pairing credentials (so you don't need to re-authorize)
- Selected zone preference

## License

MIT

## Acknowledgments

- Built with [Tauri](https://tauri.app/)
- Uses [Roon API](https://github.com/RoonLabs/node-roon-api)
- Font: SF Pro (macOS system font)

## Related Projects

- [Roon Labs](https://roonlabs.com/) - The music player this integrates with
- [Roon API Documentation](https://github.com/RoonLabs/node-roon-api)

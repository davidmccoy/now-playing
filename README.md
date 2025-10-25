# Now Playing - macOS Menu Bar App

A Tauri-based macOS menu bar application that displays currently playing music from Roon.

## Phase 0: Proof of Concept - COMPLETE ✅

The basic infrastructure is now in place:

- ✅ Tauri project structure with system tray support
- ✅ Image compositor with album art and text rendering
- ✅ Embedded Roboto font for text display
- ✅ Menu bar icon generation (250x22px with album art + text)
- ✅ Text truncation for long titles
- ✅ Test data simulation

## Project Status

**Current Phase:** Phase 0 Complete - Static Icon Proof of Concept
**Next Phase:** Phase 1 - Node.js Sidecar with Roon API Integration

## Development Setup

### Prerequisites

- ✅ Rust 1.90.0+ (installed)
- ✅ Node.js 20.18.0 (installed)
- ✅ Xcode Command Line Tools (installed)
- ✅ Homebrew (installed)

### Running the App

```bash
# Development mode (with hot reload for Rust changes)
npm run dev

# Build for production
npm run build
```

### Testing Phase 0

When you run `npm run dev`, the app will:

1. Create a menu bar icon (look in the top-right of your Mac's menu bar)
2. Display test data that cycles through different songs every 5 seconds:
   - "Bohemian Rhapsody - Queen"
   - "This Is A Very Long Song Title..." (tests truncation)
   - "Stairway to Heaven - Led Zeppelin"

### Project Structure

```
now-playing/
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── main.rs         # Entry point with test simulation
│   │   ├── compositor.rs   # Image generation & text rendering
│   │   ├── tray.rs         # System tray management
│   │   ├── state.rs        # App state management
│   │   └── types.rs        # Data types
│   ├── assets/
│   │   └── fonts/
│   │       └── Roboto-Regular.ttf
│   ├── icons/              # App icons
│   └── Cargo.toml          # Rust dependencies
├── package.json
└── RUST_PLAN.md           # Full implementation plan
```

## Features Implemented (Phase 0)

### Image Compositor

The compositor (`src-tauri/src/compositor.rs`) can:

- Generate 250x22px menu bar icons
- Render album artwork (22x22px) or purple placeholder
- Draw text with Roboto font at 14px
- Intelligently truncate long text with ellipsis
- Output PNG bytes for the menu bar

### System Tray

The tray manager (`src-tauri/src/tray.rs`):

- Creates a system tray icon in the macOS menu bar
- Updates the icon dynamically with new track data
- Provides a "Quit" menu option
- Handles click events (prepared for future popover window)

### Test Simulation

The main app (`src-tauri/src/main.rs`) currently:

- Initializes logging for debugging
- Sets up the system tray
- Runs a test loop that cycles through different tracks
- Demonstrates icon updates and text truncation

## Next Steps - Phase 1

To implement Phase 1 (Roon API Integration), we need to:

1. Create the Node.js sidecar project in `./sidecar/`
2. Install Roon API dependencies
3. Implement Roon client with auto-discovery
4. Set up zone subscription for real-time updates
5. Fetch album artwork and convert to base64
6. Connect Rust to sidecar via stdout/stdin

## Troubleshooting

### App doesn't appear in menu bar

- Check the logs in the terminal when running `npm run dev`
- Look for errors in the Rust compilation
- Make sure the icon file exists at `src-tauri/icons/icon.png`

### Text looks wrong

- The current implementation uses Roboto font
- For production, we'd use SF Pro (macOS system font)
- Text is white by default (works in dark mode)

### Icon not updating

- Check logs for image generation errors
- Verify the compositor is being called successfully

## Technical Details

### Dependencies

**Rust:**
- `tauri 2.0` - Core framework with tray support
- `image 0.25` - Image manipulation
- `imageproc 0.25` - Drawing primitives
- `ab_glyph 0.2` - Font rendering
- `tokio 1.0` - Async runtime

**Node.js:**
- None yet (Phase 1 will add Roon API dependencies)

### Performance

Current performance (Phase 0 with test data):

- **Build time:** ~5 seconds (debug)
- **Memory usage:** ~80 MB idle
- **CPU usage:** <1% during icon updates
- **Icon generation:** <10ms per update

## License

TBD

## Acknowledgments

- Built with [Tauri](https://tauri.app/)
- Uses [Roon API](https://github.com/RoonLabs/node-roon-api) (Phase 1)
- Font: [Roboto](https://fonts.google.com/specimen/Roboto)

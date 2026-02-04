use anyhow::{Context, Result};
use auto_launch::AutoLaunchBuilder;

/// Get the AutoLaunch instance for this app
fn get_auto_launch() -> Result<auto_launch::AutoLaunch> {
    // Get the path to the current executable
    let current_exe = std::env::current_exe()
        .context("Failed to get current executable path")?;

    // For macOS .app bundles, we need to use the .app path, not the binary inside
    // The binary is at: Macaroon.app/Contents/MacOS/macaroon
    // We want: Macaroon.app
    let app_path = if cfg!(target_os = "macos") {
        let path_str = current_exe.to_string_lossy();
        if path_str.contains(".app/Contents/MacOS") {
            // Extract the .app path
            if let Some(idx) = path_str.find(".app/Contents/MacOS") {
                let app_path = &path_str[..idx + 4]; // +4 for ".app"
                std::path::PathBuf::from(app_path)
            } else {
                current_exe.clone()
            }
        } else {
            current_exe.clone()
        }
    } else {
        current_exe.clone()
    };

    let app_path_str = app_path.to_string_lossy().to_string();

    let mut builder = AutoLaunchBuilder::new();
    builder
        .set_app_name("Macaroon")
        .set_app_path(&app_path_str);

    // Use LaunchAgent on macOS (the modern approach)
    #[cfg(target_os = "macos")]
    builder.set_macos_launch_mode(auto_launch::MacOSLaunchMode::LaunchAgent);

    builder.build().context("Failed to create AutoLaunch instance")
}

/// Check if the app is set to launch at login
pub fn is_enabled() -> bool {
    match get_auto_launch() {
        Ok(auto_launch) => auto_launch.is_enabled().unwrap_or(false),
        Err(e) => {
            log::warn!("Failed to check auto-launch status: {}", e);
            false
        }
    }
}

/// Enable or disable launch at login
pub fn set_enabled(enabled: bool) -> Result<()> {
    let auto_launch = get_auto_launch()?;

    if enabled {
        auto_launch.enable().context("Failed to enable auto-launch")?;
        log::info!("Auto-launch enabled");
    } else {
        auto_launch.disable().context("Failed to disable auto-launch")?;
        log::info!("Auto-launch disabled");
    }

    Ok(())
}

/// Toggle launch at login and return the new state
pub fn toggle() -> Result<bool> {
    let current = is_enabled();
    let new_state = !current;
    set_enabled(new_state)?;
    Ok(new_state)
}

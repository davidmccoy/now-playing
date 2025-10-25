// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod compositor;
mod state;
mod tray;
mod types;

use std::time::Duration;

fn main() {
    // Initialize logger
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info"))
        .init();

    log::info!("Starting Now Playing menu bar app");

    tauri::Builder::default()
        .setup(|app| {
            log::info!("Setting up application");

            // Create shared state
            let state = state::create_state();

            // Initialize system tray
            tray::TrayManager::setup(app.handle(), state.clone())
                .expect("Failed to setup system tray");

            log::info!("System tray initialized");

            // For Phase 0: Simulate updating the tray with test data
            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                log::info!("Starting test update loop");

                // Wait a bit for the UI to initialize
                tokio::time::sleep(Duration::from_secs(2)).await;

                // Test 1: Short title
                log::info!("Test 1: Short title");
                if let Err(e) = tray::TrayManager::update_test_icon(
                    &app_handle,
                    "Bohemian Rhapsody",
                    "Queen",
                ) {
                    log::error!("Failed to update icon: {}", e);
                }

                tokio::time::sleep(Duration::from_secs(5)).await;

                // Test 2: Very long title to test truncation
                log::info!("Test 2: Long title (truncation test)");
                if let Err(e) = tray::TrayManager::update_test_icon(
                    &app_handle,
                    "This Is A Very Long Song Title That Should Definitely Be Truncated",
                    "Artist With An Extremely Long Name",
                ) {
                    log::error!("Failed to update icon: {}", e);
                }

                tokio::time::sleep(Duration::from_secs(5)).await;

                // Test 3: Another song
                log::info!("Test 3: Another track");
                if let Err(e) = tray::TrayManager::update_test_icon(
                    &app_handle,
                    "Stairway to Heaven",
                    "Led Zeppelin",
                ) {
                    log::error!("Failed to update icon: {}", e);
                }

                log::info!("Test updates complete");
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

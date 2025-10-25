use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NowPlayingData {
    pub title: String,
    pub artist: String,
    pub album: String,
    pub state: PlaybackState,
    pub artwork: Option<String>, // base64 data URL
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum PlaybackState {
    Playing,
    Paused,
    Stopped,
}

#[derive(Debug, Clone)]
pub struct AppState {
    pub current_track: Option<NowPlayingData>,
    pub connection_status: ConnectionStatus,
}

#[derive(Debug, Clone, PartialEq)]
pub enum ConnectionStatus {
    Disconnected,
    Discovering,
    Connected,
    Error(String),
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            current_track: None,
            connection_status: ConnectionStatus::Disconnected,
        }
    }
}

use std::sync::{Arc, Mutex};
use tauri::Manager;
use tokio::sync::oneshot;
use warp::Filter;
use std::thread;

// Server handle to manage the HTTP server shutdown
type ServerHandle = Arc<Mutex<Option<oneshot::Sender<()>>>>;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn start_server(folder: String, app_handle: tauri::AppHandle) -> Result<String, String> {
    let server_handle: ServerHandle = app_handle.state::<ServerHandle>().inner().clone();
    
    // Check if server is already running
    {
        let handle = server_handle.lock().unwrap();
        if handle.is_some() {
            return Err("Server is already running".to_string());
        }
    }

    // Create a oneshot channel for server shutdown
    let (shutdown_tx, shutdown_rx) = oneshot::channel();
    
    // Store the shutdown sender
    {
        let mut handle = server_handle.lock().unwrap();
        *handle = Some(shutdown_tx);
    }

    let folder_clone = folder.clone();
    
    // Start the Rust-based HTTP server in a separate thread
    thread::spawn(move || {
        let rt = tokio::runtime::Runtime::new().unwrap();
        rt.block_on(async {
            // Serve static files from the project folder
            let files = warp::fs::dir(folder_clone)
                .with(warp::cors().allow_any_origin())
                .with(warp::reply::with::header("Cache-Control", "no-cache"));
            
            // Add a default route for the root that serves index.html
            let index_path = format!("{}/index.html", folder);
            let index_route = warp::path::end()
                .and(warp::fs::file(index_path));
                
            let routes = index_route.or(files);
            
            let (_addr, server) = warp::serve(routes)
                .bind_with_graceful_shutdown(([127, 0, 0, 1], 8080), async {
                    shutdown_rx.await.ok();
                });
                
            server.await;
        });
    });

    Ok("Server started on http://127.0.0.1:8080".to_string())
}

#[tauri::command]
async fn stop_server(app_handle: tauri::AppHandle) -> Result<String, String> {
    let server_handle: ServerHandle = app_handle.state::<ServerHandle>().inner().clone();
    
    let mut handle = server_handle.lock().unwrap();
    if let Some(shutdown_tx) = handle.take() {
        let _ = shutdown_tx.send(());
        Ok("Server stopped".to_string())
    } else {
        Err("No server running".to_string())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let server_handle: ServerHandle = Arc::new(Mutex::new(None));
    
    tauri::Builder::default()
        .manage(server_handle)
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, start_server, stop_server])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

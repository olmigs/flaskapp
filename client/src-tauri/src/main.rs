#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::process::Command;

fn main() {
  
  tauri::Builder::default()
  .setup(|_app| {
    tauri::async_runtime::spawn(async move { 
      Command::new("./server")
      .current_dir("/Users/migs/test/rbk_0915/server")
      .spawn()
      .expect("process failed to execute")
    });
    Ok(())
  })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

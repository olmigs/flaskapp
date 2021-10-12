  #![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
  )]

  // use pyo3::prelude::*;
  use std::{thread, time::Duration};
  // use serde::{Serialize, Deserialize};
  use tauri::{api::{path, process}, Manager, WindowEvent};

//   #[tauri::command]
//   fn import_rbk() {
    
//   }

  fn main() {
    // Python::with_gil(|py| {
    //     let casio_rbk = PyModule::import(py, "casio_rbk")
    //         .expect("where the hell is casio-rbk");
    //     // let foo = casio_rbk.RegistrationBank.
    // });
    tauri::Builder::default()
        .setup(|app| {
            let package_info = app.package_info();
            let path = path::resource_dir(package_info)
               .expect("resources not found");

            let (_rcv, server) = process::Command::new_sidecar("server")
                .expect("failed to create command")
                .current_dir(path) // migsnote: required on macOS
                .spawn()
                .expect("server failed to execute");
            println!("{:#?}", server.pid());
            // migsnote: hack!
            thread::sleep(Duration::from_millis(5000));

            let server_id = server.pid();
            let window = app.get_window("main").unwrap();
            window.on_window_event(move |event| {
                match event {
                    WindowEvent::CloseRequested => {
                        // macOS
                        let status = process::Command::new("kill")
                            .args(&[server_id.to_string()])
                            .output()
                            .expect("process failed to be killed");

                        // winNT
                        // let status = process::Command::new("taskkill")
                        //     .args(["/F", "/PID", &server_id.to_string(), "/T"])
                        //     .output()
                        //     .expect("process failed to be killed");
                        
                        println!("{:#?}", &status.stdout);
                    },
                    _ => {},
                }
            });
            // tauri::async_runtime::spawn(async move{
            //     let status = server.wait();
            //     println!("{:?}", status);   
            // });       
            Ok(())
        })
        // .invoke_handler(tauri::generate_handler![kill_server])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

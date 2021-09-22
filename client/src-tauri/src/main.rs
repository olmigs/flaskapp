  #![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
  )]

  use std::{
      fs, thread,
      time::Duration,
    };
  // use serde::{Serialize, Deserialize};
  use tauri::{Manager, api::path, WindowEvent};
  use std::process::{Command};

  // #[derive(Debug, Serialize, Deserialize)]
  // struct MixerConfig {
  //     server: String,
  // }

  // `MixerConfig` implements `Default`
  // impl ::std::default::Default for MixerConfig {
  //   fn default() -> Self { Self { server: "".into() } }
  // }

//   #[tauri::command]
//   fn kill_server(mut serv: Child) {
//       serv.kill().expect("server wasn't running");
//   }

  fn main() {
    // let path = Path(fs::canonicalize(env::current_exe()?);
    // println!("The current directory is {}", path.display());
    // let rel_path = RelativePath::new("client.toml").to_logical_path(".");
    // println!("Is absolute: {} to string {}", rel_path.is_absolute(), rel_path.to_string_lossy());
    // let cfg: MixerConfig = confy::load_path(rel_path)
    //       .expect("config fucked");
    // let mut server = Command::new("./server")
    //         .current_dir(cfg.server)
    //         .stdout(Stdio::piped())
    //         .spawn()
    //         .expect("process failed to execute");
    // println!("{}", server.id());
    tauri::Builder::default()
        .setup(|app| {
            let package_info = app.package_info();
            let path = path::resource_dir(package_info)
                .expect("resources not found");
            let server_path = path.join("server");
            println!("{:?}", fs::canonicalize(&server_path));
            // let cfg: MixerConfig = confy::load_path(cfg_path)
            //     .expect("config fucked");
            // println!("{}", cfg.server);
            let server = Command::new("./server")
                .current_dir(server_path)
                // .stdout(Stdio::piped())
                .spawn()
                .expect("process failed to execute");
            
            // migsnote: hack!
            thread::sleep(Duration::from_millis(5000));
            
            let server_id = server.id();
            let window = app.get_window("main").unwrap();
            window.on_window_event(move |event| {
                match event {
                    WindowEvent::CloseRequested => {
                        // let status = server.kill();
                        Command::new("kill")
                            .arg(server_id.to_string())
                            .spawn()
                            .expect("process failed to be killed");
                        println!("you did it fucker");
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

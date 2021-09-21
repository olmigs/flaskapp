  #![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
  )]

  // use std::{env, fs};
//   use confy;
//   use relative_path::RelativePath;
  use std::{
      fs, thread,
      time::Duration,
    };
  use serde::{Serialize, Deserialize};
  use tauri::{
      api::path,
      CloseRequestApi,
      Event::{ExitRequested},
      Manager,
    };
  // use std::path::Path;
  use std::process::{Command, Stdio};

  #[derive(Debug, Serialize, Deserialize)]
  struct MixerConfig {
      server: String,
  }

  // `MixerConfig` implements `Default`
  impl ::std::default::Default for MixerConfig {
    fn default() -> Self { Self { server: "".into() } }
  }

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
            // let handle = app.handle();
            let package_info = app.package_info();
            let path = path::resource_dir(package_info)
                .expect("resources not found");
            let cfg_path = path.join("cfg/client.toml");
            println!("{:?}", fs::canonicalize(&cfg_path));
            let cfg: MixerConfig = confy::load_path(cfg_path)
                .expect("config fucked");
            println!("{}", cfg.server);
            let mut server = Command::new("./server")
                .current_dir(cfg.server)
                .stdout(Stdio::piped())
                .spawn()
                .expect("process failed to execute");
            // migsnote: hack!
            thread::sleep(Duration::from_millis(5000));
            tauri::async_runtime::spawn(async move {
                // let foo = app.handle();
                // let window = app.get_window("main").unwrap();
                // let event = window.listen_global(Event::ExitRequested, handler);
                let status = server.wait()
                    .expect("server closing for reasons...");
                println!("{}", status.success());
            });
            Ok(())
        })
        // .invoke_handler(tauri::generate_handler![kill_server])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    // server.kill().expect("server wasn't running anyway");
}

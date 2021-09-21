  #![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
  )]

  // use std::{env, fs};
  use confy;
  use relative_path::RelativePath;
  use serde::{Serialize, Deserialize};
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

  fn main() {
    // let path = Path(fs::canonicalize(env::current_exe()?);
    // println!("The current directory is {}", path.display());
      tauri::Builder::default()
      .setup(|_app| {
        let rel_path = RelativePath::new("client.toml");
        let cfg: MixerConfig = confy::load_path(rel_path.to_path("."))
          .expect("config fucked");
          let mut handle = Command::new("./server")
            .current_dir(cfg.server)
            .stdout(Stdio::piped())
            .spawn()
            .expect("process failed to execute");
        tauri::async_runtime::spawn(async move { 
          // Command::new("C:\\Users\\balde\\Documents\\dev_migs\\flaskapp\\server\\dist\\server\\server.exe")
          let status = handle.wait()
            .expect("child process encountered an error");
          println!("child status was: {}", status);
        });
        Ok(())
      })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    }

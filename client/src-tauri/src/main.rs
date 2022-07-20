#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use serde::Deserialize;
use std::{
    fs,
    io::{BufReader, Result},
    path::PathBuf,
    sync::{Arc, Mutex},
    thread,
    time::Duration,
};
use tauri::{
    api::{
        path,
        process::{Command, CommandEvent, Output},
    },
    Manager, WindowEvent, State
};

#[derive(Deserialize, Debug)]
struct FolderDesc {
    name: String,
    files: Vec<String>,
}

// #[derive(Sync)]
struct ApiKey{
    key: Arc<Mutex<String>>
}

impl ApiKey {
    pub fn new() -> ApiKey {
        ApiKey {
            key: Arc::new(Mutex::new("".to_string()))
        }
    }
    pub fn get(&self) -> String {
        return self.key.lock().unwrap().clone();
    }
    pub fn set(&self, update_val: String) {
        // ideally happens exactly once
        if self.get().is_empty() {
            *self.key.lock().unwrap() = update_val;
        }
    }
    pub fn is_valid(value: String) -> (bool, String) {
        let split = value.split("starting session ");
        let vec = split.collect::<Vec<&str>>();
        if vec.len() == 2 {
            let mut test_str = vec[1].to_string();
            test_str = test_str.replace(|c: char| !c.is_ascii_hexdigit(), "");
            (true, test_str)
        } else {
            (false, value)
        }
    }
}

//#region STAGEFILES

fn get_copy_files(mut app_dir: PathBuf) -> Result<Vec<FolderDesc>> {
    app_dir.push("db");
    app_dir.push("files.json");
    let file = fs::File::open(app_dir)?;
    let reader = BufReader::new(file);
    let u = serde_json::from_reader(reader)?;
    Ok(u)
}

fn check_then_create_or_write(src: PathBuf, dest: PathBuf, is_dir: bool) {
    if !dest.as_path().exists() {
        if is_dir {
            println!("about to make dir {:#?}", &dest);
            fs::create_dir(&dest).expect("dir not created");
            println!("wrote to dir: {:#?}", dest);
        } else {
            println!("about to make file {:#?}", &dest);
            let data = fs::read(src).expect("couldn't read src data");
            fs::write(&dest, data).expect("couldn't write to dest");
            println!("wrote to file: {:#?}", dest);
        }
    }
}

fn copy_files(mut src: PathBuf, mut dest: PathBuf) -> Result<()> {
    // run if dest folder already exists
    if !dest.as_path().exists() {
        fs::create_dir(&dest).expect("dir not created");
        let files = get_copy_files(src.clone()).unwrap();
        for folder in files {
            // create folder, if doesn't exist
            src.push(&folder.name);
            dest.push(folder.name);
            check_then_create_or_write(src.clone(), dest.clone(), true);
            // iterate and create files, if don't exist
            for file in folder.files {
                src.push(&file);
                dest.push(file);
                check_then_create_or_write(src.clone(), dest.clone(), false);
                src.pop();
                dest.pop();
            }
            src.pop();
            dest.pop();
        }
    }
    Ok(())
}

//#endregion

#[cfg(not(windows))]
fn manual_kill(id: u32) -> Output {
    let cmd = Command::new("kill").args(&[id.to_string()]);
    cmd.output().expect("process failed to be killed")
}

#[cfg(windows)]
fn manual_kill(id: u32) -> Output {
    let cmd = Command::new("taskkill").args(&["/F", "/PID", &id.to_string(), "/T"]);
    cmd.output().expect("process failed to be killed")
}

#[tauri::command]
fn get_api_key(state: State<ApiKey>) -> String {
    state.inner().get()
}

fn main() {
    tauri::Builder::default()
        .manage(ApiKey::new())
        .setup(|app| {
            let package_info = app.package_info();
            let resource_dir =
                path::resource_dir(package_info, &app.env()).expect("resources not found");
            let mut data_dir = path::data_dir().expect("data not found");
            let resource_str =
                String::from(resource_dir.clone().to_str().expect("couldn't to_str"));
            println!("RESOURCE DIR: {}", &resource_str);

            let mut be_safe = false;
            if resource_str.contains("Program Files") {
                println!("Installed to an elevated directory....");
                data_dir.push("RBK Mixer");
                match copy_files(resource_dir.clone(), data_dir.clone()) {
                    Ok(()) => println!("Files copied to resource directory."),
                    Err(e) => panic!("{}", e),
                }
                be_safe = true;
            }

            let mut curr_dir = resource_dir;
            if be_safe {
                curr_dir = data_dir;
            }

            // start the server
            let (mut rx, server) = Command::new_sidecar("rbk_server")
                .expect("failed to create command")
                .current_dir(curr_dir)
                .spawn()
                .expect("server failed to execute");
            let server_id = server.pid();
            println!("CHILD PID: {:#?}", &server_id);
            // get app handle
            let app_handle = app.handle();
            // register API key listener
            tauri::async_runtime::spawn(async move {
                // read events such as stdout
                while let Some(event) = rx.recv().await {
                    if let CommandEvent::Stderr(line) = event {
                        let state: State<ApiKey> = app_handle.state();
                        // check validity and scrub value
                        let (valid, scrubbed_val) = ApiKey::is_valid(line);
                        if valid {
                            state.set(scrubbed_val);
                        } else {
                            println!("FROM SERVER STDERR: {}", scrubbed_val);
                        }
                        
                    }
                }
            });
            // migsnote: hack!
            thread::sleep(Duration::from_millis(5000));

            let window = app.get_window("main").unwrap();
            window.on_window_event(move |event| match event {
                WindowEvent::CloseRequested { .. } => {
                    let status = manual_kill(server_id);
                    println!("{:#?}", &status);
                }
                _ => {}
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_api_key,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

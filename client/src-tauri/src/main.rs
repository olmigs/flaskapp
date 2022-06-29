#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

// use pyo3::prelude::*;
use serde::Deserialize;
use std::{
    fs,
    io::{BufReader, Result},
    path::PathBuf,
    thread,
    time::Duration,
};
use tauri::{
    api::{
        path,
        process::{Command, Output},
    },
    Manager, WindowEvent,
};

#[derive(Deserialize, Debug)]
struct FolderDesc {
    name: String,
    files: Vec<String>,
}

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
            println!("about to make {:#?}", &dest);
            // thread::sleep(Duration::from_millis(5000));
            fs::create_dir(&dest).expect("dir not created");
            println!("wrote to dir: {:#?}", dest);
        } else {
            println!("about to make {:#?}", &dest);
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
        // println!("{:#?}", files);
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

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let package_info = app.package_info();
            let resource_dir =
                path::resource_dir(package_info, &app.env()).expect("resources not found");
            let mut data_dir = path::data_dir().expect("data not found");
            let resource_str =
                String::from(resource_dir.clone().to_str().expect("couldn't to_str"));
            println!("{}", &resource_str);

            let mut be_safe = false;
            if resource_str.contains("Program Files") {
                println!("let's copypasta");
                data_dir.push("RBK Mixer");
                match copy_files(resource_dir.clone(), data_dir.clone()) {
                    Ok(()) => println!("files copied"),
                    Err(e) => panic!("{}", e),
                }
                be_safe = true;
            }

            let mut curr_dir = resource_dir;
            if be_safe {
                curr_dir = data_dir;
            }

            // start the server
            let (_rcv, server) = Command::new_sidecar("server")
                .expect("failed to create command")
                .current_dir(curr_dir)
                .spawn()
                .expect("server failed to execute");
            println!("{:#?}", server.pid());
            // migsnote: hack!
            thread::sleep(Duration::from_millis(5000));

            let server_id = server.pid();
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
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

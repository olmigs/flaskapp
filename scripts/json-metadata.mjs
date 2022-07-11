import { writeFileSync, readdirSync, readFileSync } from 'fs';
import config from '../client/src-tauri/tauri.conf.json';

const vNo = 'v' + config.package.version;
const githubPre =
    'https://github.com/olmigs/rbk-mixer/raw/rc/release/download/'; // https://github.com/olmigs/rbk_mixer/release/download/';
const now = () => {
    return new Date();
};

const mac1 = 'darwin-x86_64';
const mac2 = 'darwin-aarch64';
const win = 'windows-x86_64';

const releaseRoot = `../release/download/${vNo}`;
const x86s = readdirSync(releaseRoot).filter((val) =>
    val.includes('RBK Mixer')
);
const aarchPre = '/silicon';
const pkgNames = {
    'darwin-x86_64': '/' + x86s.filter((val) => val.includes('tar')).join(),
    'darwin-aarch64': aarchPre + '/' + readdirSync(releaseRoot + aarchPre)[0],
    'windows-x86_64': '/' + x86s.filter((val) => val.includes('msi')).join(),
};

function getSignature(pkgName) {
    const sigRoot = '../sig_migs/' + vNo;
    const macx86 = sigRoot + '/' + mac1;

    let path = '';
    switch (pkgName) {
        case mac1:
            path = `${sigRoot}/${mac1}/${pkgNames[mac1]}.sig`;
            break;
        case mac2:
            path = `${sigRoot}${pkgNames[mac1]}.sig`;
            break;
        case win:
            path = `${sigRoot}${pkgNames[win]}.sig`;
            break;
    }
    return readFileSync(path).toString();
}

const plats = {
    'darwin-x86_64': {
        signature: getSignature(mac1),
        url: githubPre + vNo + pkgNames[mac1],
    },
    'darwin-aarch64': {
        signature: getSignature(mac2),
        url: githubPre + vNo + pkgNames[mac2],
    },
    'windows-x86_64': {
        signature: getSignature(win),
        url: githubPre + vNo + pkgNames[win],
    },
};

const json = {
    version: vNo,
    notes: "I'm testing the updater",
    pub_date: now(),
    platforms: plats,
};

// console.log(json);
writeFileSync('../release/metadata.json', JSON.stringify(json));

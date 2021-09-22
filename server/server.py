import traceback, os, json, datetime
import casio_rbk as cas
import patch_name as ptch
# from casio_rbk.casio_rbk import RegistrationBank, Part
# from casio_rbk.patch_name import patch_name
from flask import Flask, send_from_directory, request, jsonify
from pathlib import Path
from shutil import copyfile
from waitress import serve
THIS_FOLDER = Path.cwd() # dev_migs: Path(__file__)
# for part in THIS_FOLDER.parents:
#     APP_PATHSTR += str(part)
# APP_PATHSTR.replace('/server', '')
BUNDLE_DIR = Path(__file__).parents[1]
APP_FOLDER = Path.cwd() / BUNDLE_DIR # dev_migs: Path(THIS_FOLDER.parents[1])
PUBLIC_FOLDER = APP_FOLDER / 'ui' / 'public'
DB_FOLDER = APP_FOLDER / 'db'
FILE_FOLDER = APP_FOLDER / 'file'
# os.path.dirname(os.path.abspath(__file__)).replace(str(THIS_FOLDER), '')

app = Flask(__name__)

# Path for our main Svelte page
@app.route("/", methods=['GET'])
def base():
    return send_from_directory(PUBLIC_FOLDER, 'index.html')

# Path for all the static files (compiled JS/CSS, etc.)
@app.route("/<path:path>")
def home(path):
    return send_from_directory(PUBLIC_FOLDER, path)

@app.route("/log", methods = ['PUT'])
def logFromPut():
    if request.method == 'PUT':
        log('::: PUTLOG   ' + request.form['line'])
        return jsonify('OK')

@app.route("/slots", methods=['GET'])
def slots():
    if request.method == 'GET':
        slots_json = os.path.join(DB_FOLDER, 'slots.json')
        with open(slots_json, 'r') as f:
            dict = json.load(f)
            return jsonify(dict['slots'])

@app.route("/names", methods=['GET'])
def names():
     if request.method == 'GET':
        names_json = os.path.join(DB_FOLDER, 'names.json')
        with open(names_json, 'r') as f:
            dict = json.load(f)
            return jsonify(dict['names'])

@app.route("/import", methods=['GET'])
def rbk_import():
    if request.method == 'GET':
        log("caught a GET --- in import")
        log(str(APP_FOLDER))
        getInfoFromRBKFile(request.args.get('filename'))
        return jsonify('OK')

@app.route("/export", methods=['POST'])
def rbk_export():
    if request.method == 'POST':
        log("caught a POST --- in export")
        dict = request.form
        if (len(dict) == 0):
            log("in EXPORT -- dict empty!")
            return jsonify('NO DATA'), 402
        data = getArrayFromForm(dict)
        updateJSONSlots(data)
        try:
            # replace method used bc Tauri sends string literals including double quotes 
            outputToRBKFile(dict['filepath'].replace('"', ''), dict['filename'].replace('"', ''), data['slots'])
        except FileNotFoundError:
            os.remove(os.path.join(FILE_FOLDER, 'copy.rbk'))
            return jsonify('FILE NOT FOUND'), 401
        return jsonify('OK')

def getInfoFromRBKFile(absFilename):
    p = Path(absFilename)
    log("is it real? " + str(p.exists()))
    with open(absFilename, "rb") as rbk:
        log("file opened!")
        try:
            foo = cas.RegistrationBank.readFile(rbk)
            log("read worked?")
            for r in foo[0:4]:
                (patch, bank) = r.getPatchBank(cas.Part.U1)
                log(str(patch) + " | " + str(bank))
        except:
            log("Unexpected error: " + traceback.format_exc())
            log("fuck: what's wrong COUGH " + str(p))

    with open(absFilename, "rb") as f:
        data_names = {}
        data_names['names'] = []
        data_slots = {}
        data_slots['slots'] = []
        data_patchinfo = {}
        data_patchinfo['patchinfo'] = []
        rb = cas.RegistrationBank.readFile(f)
        try:
            for r in rb[0:4]:
                (patch_u1, bankmsb_u1) = r.getPatchBank(cas.Part.U1)
                (patch_u2, bankmsb_u2) = r.getPatchBank(cas.Part.U2)
                (patch_l, bankmsb_l) = r.getPatchBank(cas.Part.L)

                # returns { u1, u2, l }
                vols = r.getVolumes()
                pans = r.getPans()

                slotlist = [ vols[0], pans[0], vols[1], pans[1], vols[2], pans[2] ]
                data_slots['slots'].append(formatSlotList(slotlist))
                data_names['names'].append({
                    'u1': ptch.patch_name(patch_u1, bankmsb_u1),
                    'u2': ptch.patch_name(patch_u2, bankmsb_u2),
                    'l': ptch.patch_name(patch_l, bankmsb_l)
                })
                data_patchinfo['patchinfo'].append({
                    'u1': {
                        'patch': patch_u1,
                        'bankMSB': bankmsb_u1
                    },
                    'u2': {
                        'patch': patch_u2,
                        'bankMSB': bankmsb_u2
                    },
                    'l': {
                        'patch': patch_l,
                        'bankMSB': bankmsb_l
                    }
                })
        except:
            log("Unexpected error: " + traceback.format_exc())
            log("fuck, this file don't exist: " + absFilename)
    updateJSONSlots(data_slots)
    names_json = os.path.join(DB_FOLDER, 'names.json')
    patchinfo_json = os.path.join(DB_FOLDER, 'patchinfo.json')
    with open(names_json, 'w') as outfile_names:
        json.dump(data_names, outfile_names, indent=4)
    with open(patchinfo_json, 'w') as outfile_patchinfo:
        json.dump(data_patchinfo, outfile_patchinfo, indent=4)

def getArrayFromForm(dict):
    curr_list = getEmptySlotList()
    arr = {}
    arr['slots'] = [{}, {}, {}, {}]
    for i in range(4):
        arr['slots'][i] = formatSlotList(getEmptySlotList())
    for key in dict:
        if (key == 'filename' or key == 'filepath'):
            continue
        parms = key.split('_')
        # parm_index = getIndexFromParms(parms[1], parms[2])
        val = int(dict[key].replace('"', '')) # nasty cast, plus remove double quotes from string literal
        if val > 127:
            val = 127
        if val < 0:
            val = 0
        arr['slots'][int(parms[0])][parms[1]][parms[2]] = val
    return arr

def outputToRBKFile(path, filename, slots):
    # absFilename = path + filename
    absFilename = os.path.join(path, filename)
    log(absFilename)
    # log("file name: " + absFilename)
    try:
        with open(absFilename, "r+b") as f0:
            writeToFile(f0, slots)
    except FileNotFoundError:
        log("new file, getting dummy first")
        writeToFileFromDummy(absFilename, slots)
        try: 
            # need to update Patch Names
            with open(absFilename, "r+b") as f1:
                patchinfo_json = os.path.join(DB_FOLDER, 'patchinfo.json')
                with open(patchinfo_json, 'r') as data:
                    dict = json.load(data)
                    rb = cas.RegistrationBank.readFile(f1)
                    i = 0
                    for r in rb[0:4]:
                        r.setPatchBank(cas.Part.U1, dict['patchinfo'][i]['u1']['patch'], dict['patchinfo'][i]['u1']['bankMSB'])
                        r.setPatchBank(cas.Part.U2, dict['patchinfo'][i]['u2']['patch'], dict['patchinfo'][i]['u2']['bankMSB'])
                        r.setPatchBank(cas.Part.L, dict['patchinfo'][i]['l']['patch'], dict['patchinfo'][i]['l']['bankMSB'])
                        i += 1
                    rb.writeFile(f1)
        except:
            log("updating patch names fails!")
    except:
        log("FUCK! -- in export")

def writeToFileFromDummy(absFilename, slots):
    dummyFile = os.path.join(FILE_FOLDER, '.dummy.rbk') # read only
    dummyFileCopy = os.path.join(FILE_FOLDER, 'copy.rbk')
    copyfile(dummyFile, dummyFileCopy)
    with open(dummyFileCopy, "r+b") as file:
        writeToFile(file, slots)
    copyfile(dummyFileCopy, absFilename)
    os.remove(dummyFileCopy)

def writeToFile(f, slots):
    rb = cas.RegistrationBank.readFile(f)
    i = 0
    for r in rb[0:4]:
        # returns { u1, u2, l }
        r.setVolumes(slots[i]['u1']['vol'], slots[i]['u2']['vol'], slots[i]['l']['vol'])
        r.setPans(slots[i]['u1']['pan'], slots[i]['u2']['pan'], slots[i]['l']['pan'])
        i += 1
    rb.writeFile(f)

def updateJSONSlots(slots):
    slots_json = os.path.join(DB_FOLDER, 'slots.json')
    with open(slots_json, 'w') as outfile:
        json.dump(slots, outfile, indent=4)

def getEmptySlotList():
    return [-1, -1, -1, -1, -1, -1]

def formatSlotList(arr):
    return {'u1': {'vol':arr[0], 'pan':arr[1]},
            'u2': {'vol':arr[2], 'pan':arr[3]},
            'l': {'vol':arr[4], 'pan':arr[5]}
            }

def log(msg):
    with open('server.log', 'a') as logfile:
        now = datetime.datetime.now() # current date and time
        now_str = now.strftime("%m/%d/%Y %H:%M:%S")
        logfile.write(now_str + '     ' + msg + '\n')

# dev server
# if __name__ == "__main__":
#     app.run(host="localhost", port=6980, debug=True)

# prod server
serve(app, host='0.0.0.0', port=6980)

import os, json, datetime
from casio_rbk.casio_rbk import RegistrationBank, Part
from casio_rbk.patch_name import patch_name
from flask import Flask, send_from_directory, request, redirect, jsonify
THIS_FOLDER = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__)

# Path for our main Svelte page
@app.route("/", methods=['GET'])
def base():
    return send_from_directory('client/public', 'index.html')

# Path for all the static files (compiled JS/CSS, etc.)
@app.route("/<path:path>")
def home(path):
    return send_from_directory('client/public', path)

@app.route("/log", methods = ['PUT'])
def logFromPut():
    if request.method == 'PUT':
        log('::: PUTLOG   ' + request.form['line'])
        return jsonify('OK')

@app.route("/slots", methods=['GET'])
def slots():
    if request.method == 'GET':
        slots_json = os.path.join(THIS_FOLDER, 'db/slots.json')
        with open(slots_json, 'r') as f:
            dict = json.load(f)
            return jsonify(dict['slots'])

@app.route("/names", methods=['GET'])
def names():
     if request.method == 'GET':
        names_json = os.path.join(THIS_FOLDER, 'db/names.json')
        with open(names_json, 'r') as f:
            dict = json.load(f)
            return jsonify(dict['names'])

@app.route("/import", methods=['GET'])
def rbk_import():
    if request.method == 'GET':
        log("caught a GET --- in import")
        getInfoFromRBKFile(request.args.get('filename'))
        return redirect('/')

@app.route("/export", methods=['POST'])
def rbk_export():
    if request.method == 'POST':
        log("caught a POST --- in export")
        dict = request.form
        data = getArrayFromForm(dict)
        updateJSONSlots(data)
        outputToRBKFile(dict['filename'], data['slots'])
        return redirect('/')

def getInfoFromRBKFile(absFilename):
    names_json = os.path.join(THIS_FOLDER, 'db/names.json')
    with open(absFilename, "r+b") as f:
        data_names = {}
        data_names['names'] = []
        data_slots = {}
        data_slots['slots'] = []
        rb = RegistrationBank.readFile(f)
        try:
            for r in rb[0:4]:
                (patch_u1, bankmsb_u1) = r.getPatchBank(Part.U1)
                (patch_u2, bankmsb_u2) = r.getPatchBank(Part.U2)
                (patch_l, bankmsb_l) = r.getPatchBank(Part.L)

                # returns { u1, u2, l }
                vols = r.getVolumes()
                pans = r.getPans()
                slotlist = [ vols[0], pans[0], vols[1], pans[1], vols[2], pans[2] ]
                data_slots['slots'].append(formatSlotList(slotlist))
                data_names['names'].append({
                    'u1': patch_name(patch_u1, bankmsb_u1),
                    'u2': patch_name(patch_u2, bankmsb_u2),
                    'l': patch_name(patch_l, bankmsb_l)
                })
        except:
            log("fuck, that file don't exist!")
            
    updateJSONSlots(data_slots)
    with open(names_json, 'w') as outfile_names:
        json.dump(data_names, outfile_names, indent=4)

def getArrayFromForm(dict):
    curr_list = getEmptySlotList()
    arr = {}
    arr['slots'] = []
    count = 0
    for key in dict:
        if (key == 'filename'):
            continue
        parms = key.split('_')
        parm_index = getIndexFromParms(parms[1], parms[2])
        if int(dict[key]) >= 127:
            curr_list[parm_index] = 127
        elif int(dict[key]) <= 0:
            curr_list[parm_index] = 0
        else:
            curr_list[parm_index] = int(dict[key])
        # log('parm: ' + parms[0] + ' | index: ' + str(curr_index))
        count += 1
        if (count % 6 == 0):
            arr['slots'].append(formatSlotList(curr_list))
            curr_list = getEmptySlotList()
    return arr

def outputToRBKFile(filename, slots):
    absFilename = os.path.join(THIS_FOLDER, 'file/' + filename)
    # log("file name: " + absFilename)
    try:
        with open(absFilename, "r+b") as f:
            rb = RegistrationBank.readFile(f)
            i = 0
            for r in rb[0:4]:
                # returns { u1, u2, l }
                r.setVolumes(slots[i]['u1']['vol'], slots[i]['u2']['vol'], slots[i]['l']['vol'])
                r.setPans(slots[i]['u1']['pan'], slots[i]['u2']['pan'], slots[i]['l']['pan'])
                i += 1
            rb.writeFile(f)
    except:
        log("fuck, that file don't exist!")

def updateJSONSlots(slots):
    slots_json = os.path.join(THIS_FOLDER, 'db/slots.json')
    with open(slots_json, 'w') as outfile:
        json.dump(slots, outfile, indent=4)

def getIndexFromParms(parm0, parm1):
    switcher = {
        'u1': 0,
        'u2': 2,
        'l': 4
    }
    index = switcher.get(parm0, 'oof')
    if (parm1 == 'pan'):
        index += 1
    return index

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

if __name__ == "__main__":
    app.run()
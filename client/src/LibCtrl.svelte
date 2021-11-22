<script>
    import '../scripts/inputKnobs';
    import { filename, filepath, last, selected, isCool, toggleCool } from './stores';
    import { openDialog, submitForm } from '../scripts/utils';
    export let server;
    function removeSpecialChars() {
        var str = document.getElementById('filename').value;
        var start = document.getElementById('filename').selectionStart;
        var checkStr = str.replace(/[\/\\?%*:|"<>]/g, '');
        if (checkStr !== str) {
            document.getElementById('filename').value = checkStr;
            filename.set(checkStr);
            document.getElementById('filename').selectionStart = start - 1;
            document.getElementById('filename').selectionEnd = start - 1;
        }
    }
    function handleImportDialog(path, server, last) {
        openDialog(path, server, last);
    }
    function handleExport(server, last) {
        const form = document.querySelector('form');
        submitForm(form, server, last);
    }
    function updateKnob(value) {
        toggleCool(value);
        if ($isCool) {
            let elem = document.getElementById('style-knob');
            elem.refresh();
        }
    }
</script>

<div id="libctrl">
    <div>
        <h2>RBK Mixer</h2>
        <h4>CT-X700/X800/CDP-S350 RBK File Editor</h4>
    </div>
    <div style="padding-top:22px; text-align:center;">
        <div class="fileinfo">
            <input
                type="text"
                class="greyed"
                name="filepath"
                bind:value={$filepath}
                readonly="readonly"
            />
            <input
                type="text"
                style="margin-left:5px;"
                id="filename"
                name="filename"
                bind:value={$filename}
                on:input={removeSpecialChars}
            />
        </div>
        <button
            on:click|preventDefault={() => {
                handleImportDialog($filepath, server, $last);
            }}>Import...</button
        >
        <button
            type="submit"
            on:click|preventDefault={() => {
                handleExport(server, $last);
            }}>Export RBK File</button
        >
    </div>
    <div class="toggleView">
        <p>Cool</p>
        <input
            id="style-knob"
            type="checkbox"
            class="input-switch"
            data-src="assets/switch_offon.png"
            data-diameter="50"
            checked={$isCool}
            on:change={() => updateKnob($selected)}
        />
        <p>Classic</p>
    </div>
</div>

<style>
    #libctrl {
        display: flex;
        justify-content: space-evenly;
        flex-basis: 100%;
        background-image: url('../banner.jpg');
        margin-bottom: 10px;
        border: 1px solid black;
    }

    .toggleView {
        padding-top: 20px;
    }

    .toggleView p {
        color: #fff;
        margin: 0;
    }

    .toggleView input {
        margin-bottom: -8px;
    }

    .fileinfo {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
    }

    #filename {
        background-image: linear-gradient(#d7f5fe, #adedff);
        border-radius: 7px;
    }

    .greyed {
        color: dimgrey;
        background-color: lightgray;
        text-overflow: ellipsis;
        overflow: scroll;
        white-space: nowrap;
        overflow: scroll;
        border-radius: 7px;
    }

    button {
        background-color: #404040;
        color: white;
        font-weight: bold;
        border: none;
        border-radius: 7px;
        padding: 10px;
    }
</style>

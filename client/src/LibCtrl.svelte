<script>
    import { filename, filepath, updateContext } from './stores.js';
    import { openDialog, submitForm } from '../scripts/utils.js';
    // import { dispatch, requestNewNamesFromAPI, requestNewSlotsFromAPI } from "./store.js";
    export let server;
</script>
<script context="module">
    export async function handleImportDialog(path, server) {
        await openDialog(path, server);
        updateContext(server);
        // dispatch(requestNewSlotsFromAPI(server));
		// dispatch(requestNewNamesFromAPI(server));
    }
    export async function handleExport(server) {
        // const form = document.getElementById("slotsbox");
        // await form.submit();
        const form = document.querySelector('form');
        await submitForm(form, server);
        updateContext(server);
    }
</script>

<div id="libctrl">
    <div>
        <h2>RBK Mixer</h2>
        <h4>CT-X700/X800/CDP-S350 RBK File Editor</h4>
    </div>
    <div style="padding-top:22px; text-align:center;">
        <div class="fileinfo">
            <input type="text" class="greyed" name="filepath" bind:value={$filepath} readonly="readonly">
            <input type="text" style="margin-left:5px;" name="filename" bind:value={$filename} >
        </div>
        <button on:click|preventDefault={ () => {
            handleImportDialog($filepath, server);
        }}>Import...</button>
        <button type="submit" on:click|preventDefault={ () => {
            handleExport(server);
        }}>Export RBK File</button> 
    </div>
</div>

<style>
    #libctrl {
        display: flex;
        justify-content: space-evenly;
        flex-basis: 100%;
        background-image: url('../banner.jpg');
    }
    .fileinfo {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
    }
    .greyed {
        color:dimgrey;
        background-color: lightgray;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: scroll;
    }
    /* a {
        color: inherit;
        text-decoration: none;
    } */
</style>
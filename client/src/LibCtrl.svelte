<script>
    import { filename } from "./stores.js";
    import { openDialog } from "../scripts/utils.js";
    export let server;
</script>
<script context="module">
    export function handleImportDialog(serv) {
        openDialog("../../file")
            .then( data => {
                const url = serv + "/import?filename=" + data;
                fetch(url);
            });
    }
    export function handleExport() {
        const form = document.getElementById("slotsbox");
        form.submit();
    }
</script>

<div id="libctrl">
    <div>
        <h2>RBK Mixer</h2>
        <h4>CT-X700/X800/CDP-S350 RBK File Editor</h4>
    </div>
    <div style="padding-top:22px; text-align:left;">
        <input type="text" class="input-filename" name="filename" bind:value={$filename} >
        <br/>
        <!-- <button>
            <a href="{server}/import?filename={$filename}">Import RBK File</a>
        </button> -->
        <button on:click|preventDefault={ () => handleImportDialog(server)}>Import...</button>
        <button on:click|preventDefault={handleExport}>
            Export RBK File
        </button>
        
    </div>
</div>

<style>
    #libctrl {
        display: flex;
        justify-content: space-evenly;
        flex-basis: 100%;
        background-image: url('../banner.jpg');
    }
    /* a {
        color: inherit;
        text-decoration: none;
    } */
</style>
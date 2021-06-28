<script>
    import { filename } from "./stores.js";
</script>
<script context="module">
    export function handleExport() {
        var form = document.getElementById("slotsbox");
        form.submit();
    }
    export function allowDrop(e) {
        e.preventDefault();
    }
    export function drop(e) {
        e.preventDefault();
        var dropfilename = e.dataTransfer.dataTransfer.files[0].name;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", '/import', true);
        xhr.onload = function () {
            // Request finished. Do processing here.
        };
        xhr.send(dropfilename);
        filename.update(dropfilename);
    }
</script>

<div id="libctrl">
    <div>
        <h2>RBK Mixer</h2>
        <h4>CT-X700/X800/CDP-S350 RBK File Editor</h4>
    </div>
    <div class="dragdrop" ondrop="{drop}" ondragover="{allowDrop}">
        <p>Drag an RBK file here to import...</p>
    </div>
    <div style="padding-top:22px; text-align:left;">
        <input type="text" class="input-filename" name="filename" bind:value={$filename} >
        <br/>
        <button on:click={handleExport}>
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
    .dragdrop {
        margin: 15px 0 10px 100px;
        padding: 5px;
        width: 200px;
        height: 75px;
        background-color: #8b9db7b1;
        border-style: solid;
        opacity: 1;
        -webkit-transition: .2s;
        transition: opacity .2s;
    }
    .dragdrop:hover {
        opacity: 0.7;
    }
    /* a {
        color: inherit;
        text-decoration: none;
    } */
</style>
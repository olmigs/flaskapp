<script context="module">
    export function handleExport() {
        var form = document.getElementById("slotsbox");
        form.submit();
    }
</script>
<script>
    // export let filename = "test.rbk";
    import { filename } from "./stores.js";
</script>

<div id="libctrl">
    <div>
        <h2>RBK Mixer</h2>
        <h4>CT-X700/X800/CDP-S350 RBK File Editor</h4>
    </div>
    <div style="padding-top:20px;">
        <input type="text" class="input-filename" name="filename" bind:value={$filename} >
        <br/>
        <button>
            <a href="/import?filename={$filename}">Import RBK File</a>
        </button>
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
    a {
        color: inherit;
        text-decoration: none;
    }
</style>
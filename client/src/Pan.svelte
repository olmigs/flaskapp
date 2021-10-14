<script>
    import '../scripts/inputKnobs';
    import { afterUpdate } from 'svelte';
    export let name, id, pan, color;

    function validateInput(e) {
        if (pan > 127) {
            pan = 127;
        } else if (pan < 0) {
            pan = 0;
        }
    }
    afterUpdate(async () => {
        if (color === "#000") {
            let el = document.getElementById(name);
            el.setAttribute("data-fgcolor", color);
            el.refresh();
        }
    });
</script>

<div class="flexed">
    <label for={id}>PAN</label>
    <p>
    L <input type="range" id={name} class="input-knob" bind:value={pan} min="0" max="127" step="1" 
        data-fgcolor={color} data-bgcolor="#d9d9d9" data-diameter="32"> R
    </p>
    <input class="input_box" type="text" id={id} name={name} bind:value={pan} on:change|preventDefault|stopPropagation={validateInput}>
</div>

<style>
    .flexed {
        background-color: #a6a6a6;
        padding: 5px;
        justify-content: space-evenly;
        display: flex;
        flex: row;
    }

    @font-face {
        font-family: 'LCD';
        font-style: normal;
        src: url('/fonts/DS-DIGI.TTF') format('truetype');
    }
    
    .input_box {
        font-family: LCD;
        background-image: linear-gradient(#d7f5fe, #adedff);
        border-radius: 7px;
        height: 30px;
        width: 45px;
    }

    p {
        margin-top: 25px;
        margin-bottom: -5px;
    }
</style>
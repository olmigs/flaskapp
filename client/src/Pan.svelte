<script>
    import '../scripts/inputKnobs.js';
    export let name, id, pan, color;

    function validateInput(e) {
        if (vol > 127) {
            vol = 127;
        } else if (vol < 0) {
            vol = 0;
        }
    }
</script>

<div class="flexed">
    <label for={id}>PAN</label>
    <p>
    L <input type="range" class="input-knob" bind:value={pan} min="0" max="127" step="1" 
        data-fgcolor={color} data-bgcolor="#d9d9d9" data-diameter="32"> R
    </p>
    <input class="input_box" type="text" id={id} name={name} bind:value={pan} on:input|preventDefault={validateInput}>
</div>

<style>
    .flexed {
        background-color: #a6a6a6;
        padding: 5px;
        justify-content: space-evenly;
        display: flex;
        flex: row;
    }
    
    .input_box {
        height: 30px;
        width: 45px;
    }

    p {
        margin-top: 25px;
        margin-bottom: -5px;
    }
</style>
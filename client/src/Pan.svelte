<script>
    import '../scripts/inputKnobs.js';
    export let name, id, pan;
</script>

<div class="flexed">
    <label for={id}>PAN</label>
    <p>
    L <input type="range" class="input-knob" bind:value={pan} min="0" max="127" step="1" 
        data-fgcolor="black" data-bgcolor="#d9d9d9" data-diameter="32"> R
    </p>
    <input class="input_box" type="text" id={id} name={name} bind:value={pan}>
</div>

<style>
    .flexed {
        background-color: #a6a6a6;
        padding: 5px;
        justify-content: center;
        display: flex;
        flex: row;
    }
    
    .input_box {
        height: 30px;
        width: 45px;
    }
</style>
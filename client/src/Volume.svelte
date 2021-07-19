<script>
    export let name, id, vol, color;
    $: cssVarStyles = `--slot-color:${color};`;
</script>

<div class="flexed">
    <label for={id}>VOL</label>
    <input class="input_box" type="text" id={id} name={name} bind:value={vol} >
</div>
<div class="fader-container" style="{cssVarStyles}">
    <input id="fader" type="range" min="0" max="127" bind:value={vol} />
</div>

<style>

    .flexed {
        padding: 5px;
        justify-content: space-between;
        display: flex;
        flex: row;
    }

    .input_box {
        /* position: fixed; */
        height: 30px;
        width: 45px;
    }

    .fader-container {
        display: inline-block;
        width: 20px;
        height: 150px;
        padding-bottom: 7px;
    }

    #fader {
        -webkit-appearance: none;
        width: 150px;
        height: 7px;
        padding: 0;
        margin: 0;
        transform-origin: 75px 75px;
        transform: rotate(-90deg);
        background-color: dimgray;
    }

    #fader::-webkit-slider-runnable-track {
        -webkit-appearance: none;
        width: 5px;
    }

    #fader::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 30px;
        height: 20px;
        background-color: var(--slot-color, white);
        border-radius: 8px;
    }
</style>
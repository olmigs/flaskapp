<script>
    export let name, id, vol, color;
    $: cssVarStyles = `--slot-color:${color};`;

    function handleWheel(e) {
        let delta = e.deltaY > 0 ? -1 : 1;
        // migsnote: below code not working
        // if (e.keyCode == 'Shift') {
        //     delta *= 5;
        // }
        updateVolume(delta); 
    }
    // given delta, attempts to set volume, but not below 0 or above 127
    function updateVolume(delta) {
        let temp = vol;
        temp += delta;
        if (temp > 127) {
            vol = 127;
        } else if (temp < 0) {
            vol = 0;
        } else {
            vol += delta;
        }
    }
    function validateInput(e) {
        if (vol > 127) {
            vol = 127;
        } else if (vol < 0) {
            vol = 0;
        }
    }
    function highlightElem(e) {

    }
</script>

<div class="flexed">
    <label for={id}>VOL</label>
    <input class="input_box" type="text" id={id} name={name} bind:value={vol} on:change|preventDefault|stopPropagation={validateInput}>
</div>
<div class="fader-container" style="{cssVarStyles}">
    <input id="fader" type="range" min="0" max="127" bind:value={vol} 
        on:focus={highlightElem}
        on:wheel|preventDefault={handleWheel} />
</div>

<style>
    .flexed {
        padding: 5px;
        justify-content: space-between;
        display: flex;
        flex: row;
    }

    @font-face {
        font-family: 'LCD';
        font-style: normal;
        src: url('/fonts/DS-DIGI.TTF') format('truetype');
    }

    .input_box {
        /* position: fixed; */
        font-family: LCD;
        background-image: linear-gradient(#d7f5fe, #adedff);
        border-radius: 7px;
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
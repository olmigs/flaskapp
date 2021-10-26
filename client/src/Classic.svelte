<script>
    import cfg from '../public/config.json';
    export let index, u1_vol, u1_pan, u2_vol, u2_pan, l_vol, l_pan, info;
    let colors = cfg.slotcolors.B;
    function lum(hex, lum) {
        // validate hex string
        hex = String(hex).replace(/[^0-9a-f]/gi, '');
        if (hex.length < 6) {
            hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
        }
        lum = lum || 0;
        // convert to decimal and change luminosity
        var rgb = "#", c, i;
        for (i = 0; i < 3; i++) {
            c = parseInt(hex.substr(i*2,2), 16);
            c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
            rgb += ("00"+c).substr(c.length);
        }
        return rgb;
    }
</script>

<h3>Registration Slot { index+1 }</h3>
<table class="regslot" >
    <tr style="font-weight:bold; background-color: {lum(colors[index], -.3)}">
        <td>Upper 1</td>
        <td>Upper 2</td>
        <td>Lower</td>
    </tr>
    <tr style="font-size:10pt; font-style:italic; background-color: {lum(colors[index], 0.1)}">
        <td>
            {info['u1']}
            {#if !info['isMono']['u1']}
                <p class="info">FORCED STEREO</p>
            {/if}
        </td>
        <td>
            {info['u2']}
            {#if !info['isMono']['u2']}
                <p class="info">FORCED STEREO</p>
            {/if}
        </td>
        <td>
            {info['l']}
            {#if !info['isMono']['l']}
                <p class="info">FORCED STEREO</p>
            {/if}
        </td>
    </tr>
    <tr style="background-color: {lum(colors[index], 0.75)}">
        <td>
            <div class="flexed">
                <label for="u1_vol">Volume</label>
                <input class="input_sm" type="text" id="u1_vol" name="{index}_u1_vol" bind:value={u1_vol} >
            </div>
            <input type="range" class="slider" bind:value="{u1_vol}" min="0" max="127" step="1" >
        </td>
        <td>
            <div class="flexed">
                <label for="u2_vol">Volume</label>
                <input class="input_sm" type="text" id="u2_vol" name="{index}_u2_vol" bind:value={u2_vol} >
            </div>
            <input type="range" class="slider" bind:value={u2_vol} min="0" max="127" step="1" >
        </td>
        <td>
            <div class="flexed">
                <label for="l_vol">Volume</label>
                <input class="input_sm" type="text" id="l_vol" name="{index}_l_vol" bind:value={l_vol} >
            </div>
            <input type="range" class="slider" bind:value={l_vol} min="0" max="127" step="1" >
        </td>
    </tr>
    <tr style="background-color: {lum(colors[index], 0.99)}">
        <td>
            <div class="flexed">
                <label for="u1_pan">Pan</label>
                <input class="input_sm" type="text" id="u1_pan" name="{index}_u1_pan" bind:value={u1_pan}>
            </div>
            <p>
                L <input type="range" class="slider" bind:value={u1_pan} min="0" max="127" step="1" > R
            </p>
            
        </td>
        <td>
            <div class="flexed">
                <label for="u2_pan">Pan</label>
                <input class="input_sm" type="text" id="u2_pan" name="{index}_u2_pan" bind:value={u2_pan} >
            </div>
            <p>
                L <input type="range" class="slider" bind:value={u2_pan} min="0" max="127" step="1" > R
            </p>
        </td>
        <td>
            <div class="flexed">
                <label for="l_pan">Pan</label>
                <input class="input_sm" type="text" id="l_pan" name="{index}_l_pan" bind:value={l_pan} >
            </div>
            <p>
                L <input type="range" class="slider" bind:value={l_pan} min="0" max="127" step="1" > R
            </p>
        </td>
    </tr>
</table>

<style>
    .regslot {
        border-collapse: collapse;
        margin-left: auto;
        margin-right: auto;
        margin-bottom: 10px;
	}

    .info {
        position: absolute;
        margin: 0 auto;
        margin-top: -1px;
        margin-left: 40px;
        font-size: 7pt;
        font-style: italic;
        font-weight: bold;
    }

    .input_sm {
        height: 33px;
        width: 45px;
    }

    .flexed {
        padding: 5px;
        justify-content: center;
        display: flex;
        flex: row;
    }
    .slider {
        -webkit-appearance: none;
        width: 70%;
        height: 2px;
        background: #999696;
        outline: none;
        opacity: 0.6;
        -webkit-transition: .2s;
        transition: opacity .2s;
    }

    .slider:hover {
        opacity: 1;
    }

    .slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 9px;
        height: 23px;
        background: #a12a2a;
        cursor: pointer;
    }

    .slider::-moz-range-thumb {
        width: 9px;
        height: 23px;
        background: #a12a2a;
        cursor: pointer;
    }

    label {
        margin: 10px;
    }
    tr {
        height: 46px;
    }
    td {
        border: 1px solid black;
    }
</style>


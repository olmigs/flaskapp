<script>
    import cfg from "../public/config.json";
    import file from "../db/names.json";
    export let index, u1_name, u1_vol, u1_pan, u2_name, u2_vol, u2_pan, l_name, l_vol, l_pan;
    function ColorLuminance(hex, lum) {
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

<table class="regslot" >
    <tr style="background-color: {cfg.slotcolors[index]}">
        <td>{u1_name} (Main)</td>
        <td>{u2_name} (Layer)</td>
        <td>{l_name} (Split)</td>
    </tr>
    <tr style="font-size: 10pt; background-color: {ColorLuminance(cfg.slotcolors[index], 0.3)}">
        <td>{file.names[index]['u1']}</td>
        <td>{file.names[index]['u2']}</td>
        <td>{file.names[index]['l']}</td>
    </tr>
    <tr style="background-color: {ColorLuminance(cfg.slotcolors[index], 0.6)}">
        <td>
            <label for="u1_vol">Volume</label>
            <input class="input_sm" type="text" id="u1_vol" name="{index}_u1_vol" bind:value={u1_vol} >
            <input type="range" class="slider" bind:value="{u1_vol}" min="0" max="127" >
        </td>
        <td>
            <label for="u2_vol">Volume</label>
            <input class="input_sm" type="text" id="u2_vol" name="{index}_u2_vol" bind:value={u2_vol} >
            <input type="range" class="slider" bind:value={u2_vol} min="0" max="127" >
        </td>
        <td>
            <label for="l_vol">Volume</label>
            <input class="input_sm" type="text" id="l_vol" name="{index}_l_vol" bind:value={l_vol} >
            <input type="range" class="slider" bind:value={l_vol} min="0" max="127" >
        </td>
    </tr>
    <tr style="background-color: {ColorLuminance(cfg.slotcolors[index], 0.9)}">
        <td>
            <label for="u1_pan">Pan Position</label>
            <input class="input_sm" type="text" id="u1_pan" name="{index}_u1_pan" bind:value={u1_pan}>
            <input type="range" class="slider" bind:value={u1_pan} min="0" max="127" >
        </td>
        <td>
            <label for="u2_pan">Pan Position</label>
            <input class="input_sm" type="text" id="u2_pan" name="{index}_u2_pan" bind:value={u2_pan} >
            <input type="range" class="slider" bind:value={u2_pan} min="0" max="127" >
        </td>
        <td>
            <label for="l_pan">Pan Position</label>
            <input class="input_sm" type="text" id="l_pan" name="{index}_l_pan" bind:value={l_pan} >
            <input type="range" class="slider" bind:value={l_pan} min="0" max="127" >
        </td>
    </tr>
</table>

<style>
    .regslot {
        border-collapse: collapse; 

	}
    .input_sm {
        height: 36px;
        width: 64px;
    }
    .slider {
        width: 150px;
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


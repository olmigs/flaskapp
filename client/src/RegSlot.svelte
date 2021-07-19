<script>
    import cfg from '../public/config.json';
    import Volume from './Volume.svelte';
    import Pan from './Pan.svelte';
    export let index, u1_vol, u1_pan, u2_vol, u2_pan, l_vol, l_pan, names;
</script>

<h3 style="background-color: {cfg.slotcolors_B[index]};">REGISTRATION SLOT { index+1 }</h3>
<div class="regslot" >
    <div>
        <p class="layerName">UPPER 1</p>
        <p class="toneName">{names['u1']}</p>
        <Pan name="{index}_u1_pan" id="u1_pan" pan={u1_pan} color={cfg.slotcolors_B[index]}/>
        <Volume name="{index}_u1_vol" id="u1_vol" vol={u1_vol} color={cfg.slotcolors_B[index]}/>
    </div>
    <div>
        <p class="layerName">UPPER 2</p>
        <p class="toneName">{names['u2']}</p>
        <Pan name="{index}_u2_pan" id="u2_pan" pan={u2_pan} color={cfg.slotcolors_B[index]}/>
        <Volume name="{index}_u2_vol" id="u2_vol" vol={u2_vol} color={cfg.slotcolors_B[index]}/>
    </div> 
    <div>
        <p class="layerName">LOWER</p>
        <p class="toneName">{names['l']}</p>
        <Pan name="{index}_l_pan" id="l_pan" pan={l_pan} color={cfg.slotcolors_B[index]}/>
        <Volume name="{index}_l_vol" id="l_vol" vol={l_vol} color={cfg.slotcolors_B[index]}/>
    </div>
</div>

<style>
    h3 {
        margin: auto;
        margin-top: 7px;
        width: 65%;
        border-radius: 5px;
        color: white;
    }

    .regslot {
        border-collapse: collapse;
        padding: 5px;
        display: flex;
        flex: column;
        justify-content: space-between;
	}

    .layerName {
        margin-left: auto;
        margin-right: auto;
        width: 70%;
        background-color: #404040;
        border-radius: 5px;
        color: white;
    }

    .toneName {
        font-size: 9pt;
        font-style: italic;
    }
</style>


<script>
    import RangeSlider from "svelte-range-slider-pips";
    export let name, id, vol;
    // converts to array for RangeSlider
    $: volArr = [vol];
</script>

<div class="flexed">
    <label for={id}>VOL</label>
    <input class="input_box" type="text" id={id} name={name} bind:value={volArr[0]} >
</div>
<RangeSlider vertical pips disabled={false} id="fader" bind:values={volArr} min={0} max={127} pipstep={8}/>

<style>
    .flexed {
        padding: 5px;
        justify-content: center;
        display: flex;
        flex: row;
    }

    .input_box {
        /* position: fixed; */
        height: 30px;
        width: 45px;
    }

    :global(#fader) {
        transform: rotateX(180deg);
    } 
</style>
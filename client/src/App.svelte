<script>
	import { onMount } from 'svelte';
	import { slots, names, updateContext, setDownloadPath, filepath, selected } from "./stores";
	import RegSlot from './RegSlot.svelte';
	import LibCtrl from './LibCtrl.svelte';
	import Classic from './Classic.svelte';
	export let server;
	const options = [
        { page: 'cool', component: RegSlot},
		{ page: 'classic', component: Classic }
	];
	onMount(async () => {
		updateContext(server);
		if ($filepath === 'No folder chosen...') {
			setDownloadPath();
		}
	});
</script>

<main>
	<form id="slotsbox">
		<LibCtrl server={server}/>
		{#each $slots as slot, i}
			<div class="slot">
				<svelte:component this={options[$selected].component}
					index={i}
					u1_vol={slot.u1.vol} 
					u1_pan={slot.u1.pan}
					u2_vol={slot.u2.vol}
					u2_pan={slot.u2.pan}
					l_vol={slot.l.vol}
					l_pan={slot.l.pan}
					info={$names[i]}
				/>
			</div>
		{:else}
			<p class="loading">loading...</p>
		{/each}
	</form>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 100%;
		margin: 0 auto;
		overflow-x: hidden;
		/* background: linear-gradient(45deg, #ddccbb 12%, transparent 0, transparent 88%, #ddccaa 0),
    				linear-gradient(135deg, transparent 37%, #aa8855 0, #aa8855 63%, transparent 0),
    				linear-gradient(45deg, transparent 37%, #ddccaa 0, #ddccaa 63%, transparent 0) #775533;
    	background-size: 25px 25px; */
	}

	.slot {
		width: 450px;
		padding: 5px;
		flex-grow: 1;
		background-color: #d9d9d9;
		border: 1px solid black;
	}

	.loading {
		font-size: 24pt;
		margin-top: 50px;
		margin-left: auto;
		margin-right: auto;
		width: 50%;
		background-color: #ddccbbb3;
	}

	#slotsbox {
		display: flex;
		flex-flow: row wrap;
	}

	@media (min-width: 300px) {
		main {
			max-width: none;
		}
	}
</style>
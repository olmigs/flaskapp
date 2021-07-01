<script>
	import { onMount } from 'svelte';
	import { slots, names, updateSlots, updateNames } from "./stores.js";
	import RegSlot from "./RegSlot.svelte";
	import LibCtrl from "./LibCtrl.svelte";
	export let u1_label, u2_label, l_label, server;
	onMount( async () => {
		await updateSlots(server);
		await updateNames(server);
	})
</script>

<main>
	<form id="slotsbox" action="{server}/export" method="post">
		<LibCtrl server={server}/>
		{#each $slots as slot, i}
			<div class="slot">
				<h3>Registration Slot {i+1}</h3>
				<RegSlot
					index={i}
					u1_name={u1_label}
					u1_vol={slot.u1.vol} 
					u1_pan={slot.u1.pan}
					u2_name={u2_label}
					u2_vol={slot.u2.vol}
					u2_pan={slot.u2.pan}
					l_name={l_label}
					l_vol={slot.l.vol}
					l_pan={slot.l.pan}
					names={$names[i]}
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
		max-width: 420px;
		margin: 0 auto;
		background: linear-gradient(45deg, #ddccbb 12%, transparent 0, transparent 88%, #ddccaa 0),
    				linear-gradient(135deg, transparent 37%, #aa8855 0, #aa8855 63%, transparent 0),
    				linear-gradient(45deg, transparent 37%, #ddccaa 0, #ddccaa 63%, transparent 0) #775533;
    	background-size: 25px 25px;
	}

	.slot {
		width: 450px;
		padding: 5px;
		flex-grow: 1;
		background-color: #ddccbbb3;
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
<script lang="ts">
  import { base } from "$app/paths";
  import places from "$lib/Places.json";
  let selected: any;
  $: id = selected?.id;
  $: label = selected?.PlaceDescriptions[0].display_label;
  $: href = `${base}/sonified/${id}`;
</script>

<h1>What does a city's data sound like?</h1>
<p>
  Choose a city from the drop down below and find out.
</p>

<select
		bind:value={selected}
>
  <option value={undefined}>Choose a place...</option>
  {#each places.data.places as place}
    <option value={place}>
      {place.PlaceDescriptions[0].display_label}
    </option>
  {/each}
</select>
{#if selected}
  <p>Listen to <a {href}>{label}</a>.</p>
{/if}
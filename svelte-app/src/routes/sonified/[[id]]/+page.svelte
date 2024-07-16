<script lang="ts">
  import { page } from "$app/stores";
  import type { RouteParams } from "../../sonified/[[id]]/$types";
  import * as Erie from 'erie-web';
  import places from "$lib/Places.json";
  import { format } from "d3";

  // define empty and fillable variables
  let cityData: any;

  // define dynamic variables and processes
  $: pageParams = $page.params as RouteParams;
  $: place = places.data.places.find(f => f.id == pageParams.id)
  $: data = cityData?.data;
  $: if (typeof pageParams.id === "string") processDataFile(pageParams.id);

  // asynchronous function for importing city data
  async function processDataFile(id: string) {
    cityData = (await import(/* @vite-ignore */ `./cities/${id}.json`)).default;
  }

  // function to interpret the trend scalar and the trend values to human readable text
  function processTrend(scalar: number, trend: number) {
    let trendText = undefined;
    let scalarText = undefined;
    switch (trend) {
      case 2:
        trendText = "Improving Rapidly"        
        break;
      case 1: 
        trendText = "Improving Slowly"
        break;
      case 0:
        trendText = "Not Changing"
        break;
      case -1: 
        trendText = "Worsening Slowly"
        break;
      case -2:
        trendText = "Worsening Rapidly"
    }
    switch (scalar) {
      case -1:
        scalarText = "Lower"
        break;
      case 1: 
        scalarText = "Higher"
    }
    if (scalarText !== undefined && trendText !== undefined) return `${scalarText} numbers mean improvement and this metric is ${trendText}`;
  }
  // erie code goes here
  let spec = new Erie.Stream();
  console.log(spec);

</script>

{#if pageParams.id == undefined}
  <h1>Hello... whoops, no ID</h1>
{:else}
  <h1>Hello, {place?.PlaceDescriptions[0].display_label}!</h1>
{/if}

{#if data?.serieses.length > 0}
  {#each data.serieses as series}
    {#if series.SeriesValues.length > 0}
      <h2>{series.SeriesDescriptions[0].display_axis_primary}</h2>
      <p>{format(series.value_format)(+series.SeriesValues[0].value)} {series.SeriesDescriptions[0].display_axis_secondary || ""}</p>
        {#if series.Metric.trend_scalar && series.SeriesValues[0].trend}
          <p>{processTrend(+series.Metric.trend_scalar, +series.SeriesValues[0].trend)}</p>
        {/if}
    {/if}
  {/each}
{:else}
  <h2>We don't have that data yet!</h2>
{/if}
<p><a href="/">Return Home</a></p>

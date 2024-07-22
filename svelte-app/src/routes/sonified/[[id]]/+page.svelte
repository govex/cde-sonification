<script lang="ts">
  import { page } from "$app/stores";
  import type { RouteParams } from "../../sonified/[[id]]/$types";
  import * as Erie from 'erie-web';
  import places from "$lib/Places.json";
  import { format } from "d3";

  // define empty and fillable variables
  let cityData: any;
  let seriesInfo: { [ name: string ]: { tone: Erie.SampledTone, isPlaying: boolean, data: object[] } } = {};

  // define dynamic variables and processes
  $: pageParams = $page.params as RouteParams;
  $: place = places.data.places.find(f => f.id == pageParams.id)
  $: data = cityData?.data;
  $: if (typeof pageParams.id === "string") processDataFile(pageParams.id);

  // asynchronous function for importing city data
  async function processDataFile(id: string) {
    cityData = (await import(/* @vite-ignore */ `./cities/${id}.json`)).default;
    cityData?.data.serieses.forEach((series) => {
      if (series.SeriesValues.length > 0) {
        seriesInfo[series.SeriesDescriptions[0].display_axis_primary] = {
          tone: new Erie.SampledTone("sample_audio", {mono: "https://tonejs.github.io/audio/berklee/gong_1.mp3"}),
          isPlaying: false,
          data: series.SeriesValues
        }
      };
    });
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
  
  let stream = new Erie.Stream();

  async function playSound(seriesName: string) {
    let series = seriesInfo[seriesName];
    series.isPlaying = !series.isPlaying;
    if (!series.isPlaying) {
      // reset erie stream
    } else {
      stream.name(seriesName);

      // tone
      stream.sampling.add(series.tone);
      stream.tone.set(series.tone);

      // data
      stream.data.set("name", "data__1");
      stream.data.set("values", series.data);
      console.log('stream data', stream.data);

      // transform
      let bin = new Erie.Bin("value");
      bin.as("value-bin", "value-bin-end").nice(true);
      stream.transform.add(bin);

      // encoding
      stream.encoding.time.field("value-bin", "quantitative")
        .scale("timing", "absolute")
        .scale("length", 4.5)

      stream.encoding.time2.field("value-bin-end", "quantitative")

      stream.encoding.detune.field("value-bin", "quantitative")
        .scale("polarity", "positive")
        .format("0.4");

      // play sound
      let audioQueue = await Erie.compileAudioGraph(stream.get());
      console.log('stream.get():', stream.get())
      audioQueue.playQueue();
    }
  }

  


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
        
      <button id="play-button-{series.SeriesDescriptions[0].display_axis_primary}" on:click={async(e) => await playSound(series.SeriesDescriptions[0].display_axis_primary)}>
        {#if seriesInfo[series.SeriesDescriptions[0].display_axis_primary].isPlaying}
          Stop
        {:else}
          Play
        {/if}
      </button>
    {/if}
  {/each}
{:else}
  <h2>We don't have that data yet!</h2>
{/if}
<p><a href="/">Return Home</a></p>

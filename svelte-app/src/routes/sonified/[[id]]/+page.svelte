<script lang="ts">
  import { page } from "$app/stores";
  import type { RouteParams } from "../../sonified/[[id]]/$types";
  import * as Erie from 'erie-web';
  import places from "$lib/Places.json";
  import { format } from "d3";

  // define empty and fillable variables
  let cityData: any;
  let soundURL: URL;
  let seriesInfo: { 
    [ name: string ]: { 
      tone: Erie.SampledTone,
      stopped: boolean,
      data: object[],
      audioQueue: Erie.SequenceStream
    }
  } = {};

  let seriesMaxAndMin: {
    [ name: string ]: {
      min: number,
      max: number
    }
  } = {};

  let chosenSerieses: string[] = [];

  // define dynamic variables and processes
  $: pageParams = $page.params as RouteParams;
  $: place = places.data.places.find(f => f.id == pageParams.id)
  $: data = cityData?.data;
  $: if (typeof pageParams.id === "string") processDataFile(pageParams.id);

  // asynchronous function for importing city data
  async function processDataFile(id: string) {
    cityData = (await import(/* @vite-ignore */ `./cities/${id}.json`)).default;
    soundURL = new URL(`./sounds/keyboard-typing.mp3`, import.meta.url);

    cityData?.data.serieses.forEach((series) => {
      if (series.SeriesValues.length > 0) {
        seriesInfo[series.SeriesDescriptions[0].display_axis_primary] = {
          tone: new Erie.SampledTone("sample_audio", {mono: soundURL}),
          stopped: true,
          data: series.SeriesValues,
          audioQueue: undefined
        }

        seriesMaxAndMin[series.SeriesDescriptions[0].display_axis_primary] = {
          min: series.display_min_value,
          max: series.display_max_value
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

  async function playOverlay() {
    setChosenSerieses();

    let streams: Erie.Stream = [];

    chosenSerieses.forEach((seriesName) => {
      let series = seriesInfo[seriesName];
      let min = seriesMaxAndMin[seriesName].min;
      let max = seriesMaxAndMin[seriesName].max;

      let stream = new Erie.Stream();

      stream.sampling.add(series.tone);
      stream.tone.set(series.tone);

      // stream.data.set("values", series.data);

      stream.encoding.time.field("date", "nominal")
        .scale("band", 1.0);

      stream.encoding.detune.field("value", "quantitative")
        .scale("polarity", "positive")
        .scale("domain", [min, max])
        .scale("range", [100, 700])
        .format("0.4")

      streams.push(stream);
    })

    let overlay = new Erie.Overlay(streams);

    console.log('overlay.get()', overlay.get());
    let audioQueue = await Erie.compileAudioGraph(overlay.get());
    await audioQueue.playQueue();
  }

  function setChosenSerieses() {
    chosenSerieses = [];
    const container = document.getElementById('chosen-serieses');
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');

    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        chosenSerieses.push(checkbox.value);
      }
    })
    
    console.log('Chosen Serieses:', chosenSerieses);
  }

  async function playSound(seriesName: string) {
    let stream = new Erie.Stream();

    // skip narration
    stream.config.set('skipStartSpeech', true);
    stream.config.set('skipScaleSpeech', true);
    stream.config.set('skipStartPlaySpeech', true);
    stream.config.set('skipFinishSpeech', true);
    stream.config.set('skipStopSpeech', true);

    seriesInfo[seriesName].stopped = !seriesInfo[seriesName].stopped;
    let series = seriesInfo[seriesName];
    if (series.audioQueue && series.stopped) {
      series.audioQueue.stopQueue();
    } else {
      stream.name(seriesName);

      // tone
      stream.sampling.add(series.tone);
      stream.tone.set(series.tone);
      stream.tone.continued(false);

      // data
      stream.data.set("name", "data__1");
      stream.data.set("values", series.data);

      // encoding
      stream.encoding.time.field("date", "nominal")
        .scale("band", 1.0);

      stream.encoding.detune.field("value", "quantitative")
        .scale("polarity", "positive")
        .scale("range", [100, 700])
        .format("0.4")

      // play sound
      series.audioQueue = await Erie.compileAudioGraph(stream.get());
      console.log('audioQueue', series.audioQueue)
      console.log('stream.get():', stream.get())
      await series.audioQueue.playQueue();
      seriesInfo[seriesName].stopped = !seriesInfo[seriesName].stopped;
    }
  }

</script>

{#if pageParams.id == undefined}
  <h1>Hello... whoops, no ID</h1>
{:else}
  <h1>Hello, {place?.PlaceDescriptions[0].display_label}!</h1>
  {#if data?.serieses.length > 0}
    <div id="chosen-serieses">
      {#each data.serieses as series}
        {#if series.SeriesValues.length > 0}
          <div>
          <input id="checkbox-{series.SeriesDescriptions[0].display_axis_primary}" type="checkbox" value="{series.SeriesDescriptions[0].display_axis_primary}" />
          <label for="checkbox-{series.SeriesDescriptions[0].display_axis_primary}">{series.SeriesDescriptions[0].display_axis_primary}</label>
          </div>
        {/if}
      {/each}
    </div>
    <button on:click={async(e) => await playOverlay()}>
      Play
    </button>
{:else}
  <h2>We don't have that data yet!</h2>
{/if}


{/if}

{#if data?.serieses.length > 0}
  {#each data.serieses as series}
    {#if series.SeriesValues.length > 0}
      <h2>{series.SeriesDescriptions[0].display_axis_primary}</h2>
      
      <p>{format(series.value_format)(+series.SeriesValues[0].value)} {series.SeriesDescriptions[0].display_axis_secondary || ""}</p>
        {#if series.Metric.trend_scalar && series.SeriesValues[0].trend}
          <p>{processTrend(+series.Metric.trend_scalar, +series.SeriesValues[0].trend)}</p>
        {/if}
        
      <button 
        id="play-button-{series.SeriesDescriptions[0].display_axis_primary}"
        on:click={async(e) => await playSound(series.SeriesDescriptions[0].display_axis_primary)}
        >
        {#if seriesInfo[series.SeriesDescriptions[0].display_axis_primary].stopped}
          Play
        {:else}
          Stop
        {/if}
      </button>
    {/if}
  {/each}
{:else}
  <h2>We don't have that data yet!</h2>
{/if}
<p><a href="/">Return Home</a></p>

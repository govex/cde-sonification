<script lang="ts">
  import places from "$lib/Places.json";
  import seriesvalues from "$lib/SeriesesValues.json";
  import seriesDescriptions from "$lib/Serieses.json";
  import { DateTime } from "luxon";
  import { getAudioData, linearPath } from "waveform-path";
  import { format } from "d3";
  import * as Erie from 'erie-web';

  let stopped = true;
  let selected_place: any;
  let series_selection:string[] = [];

  // we can alter this so it's a better mapping of sound -> series_id
  // let sounds be an object with series_id as key and filename as value 
  // ex: { city_overview-households-totals_yearly: construction_noise.wav }
  let sounds = [
    "bells.wav",
    "birdsong.wav",
    "cardinal.mp3",
    "industrial.mp3",
    "keyboard-typing.mp3",
    "wind-chimes.mp3"
  ]

  let audios: {
    [ name: string ]: {
      audioQueue: Erie.SequenceStream,
      playing: boolean
    }
  } = {};

  $: stopped: series_selection.length === 0;
  $: place_label = selected_place?.PlaceDescriptions[0].display_label;
  $: serieses = seriesvalues.data.serieses.map((m,i) => {
    let seriesInfo = {
      id: m.id,
      min: Math.min(...m.SeriesValues.map(d => +d.value)),
      max: Math.max(...m.SeriesValues.map(d => +d.value)),
      data: m.SeriesValues.map(d => ({
          place_id: d.place_id,
          value: +d.value,
          trend: d.trend,
          date: DateTime.fromMillis(d.date, {zone: "GMT"})
      })),
      soundfile: sounds[i] // instead of an index here we can make sounds an object and use series_id as the key
      // soundfile: sounds[m.id]
    };
    return seriesInfo;
  })

  // async function to compile data from all the disparate files
  // for chosen place and serieses selected
  async function compileData(selected_place:any, series_selection:string[]) {
    let overlayData = series_selection.map(s => {
      let seriesInfo = serieses.find(f => f.id === s)
      let audioData = getAudioData(`/sounds/${seriesInfo?.soundfile}`);
      let placeData = seriesInfo?.data.find(f => f.place_id === selected_place.id)
      let seriesDescription = seriesDescriptions.data.serieses.find(f => f.id === s)
      return ({
        series_id: s,
        min: seriesInfo?.min,
        max: seriesInfo?.max,
        place_value: placeData?.value,
        place_trend: placeData?.trend,
        date: placeData?.date,
        trend_scalar: seriesDescription?.Metric.trend_scalar,
        value_format: seriesDescription?.value_format,
        display_axis_secondary: seriesDescription?.SeriesDescriptions[0].display_axis_secondary,
        sound: audioData,
        soundfile: seriesInfo?.soundfile
      })
    })
    return overlayData;
  }
  $: overlayData = compileData(selected_place, series_selection);

  // function to insure a checkbox is not clickable 
  // if there's no data to load for the selected city
  function disableCheckbox(place_id:string, series_id:string) {
    let seriesInfo = serieses.find(f => f.id === series_id)
    let placeData = seriesInfo?.data.find(f => f.place_id === place_id)
    if (placeData) {
      return false
    } else {
      return true
    }
  }
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

  async function play(soundData:any) {
    console.log('soundData', soundData)
    if (stopped === false) {
      stopped = true;

    } else {
      stopped = false;
      let overlay = new Erie.Overlay();
      overlay.config.set('skipStartSpeech', true);
      overlay.config.set('skipScaleSpeech', true);
      overlay.config.set('skipStartPlaySpeech', true);
      overlay.config.set('skipFinishSpeech', true);


      soundData.forEach((series) => {
        let stream = new Erie.Stream();

        let soundURL = new URL(`./sounds/${series.soundfile}`, import.meta.url);
        let tone = new Erie.SampledTone("sample_audio", { mono: soundURL })
        stream.sampling.add(tone);
        stream.tone.set(tone);
        stream.tone.continued(false);

        stream.encoding.time.field("series_id", "nominal")
        .scale("band", 2.0);

        stream.encoding.detune.field("place_value", "quantitative")
          .scale("polarity", "positive")
          .scale("domain", [series.min, series.max])
          .scale("range", [100, 700])
          .format("0.4")

        overlay.overlay.push(stream);
      })

      //overlay.data.set("name", "data__1");
      //overlay.data.set("values", soundData);

      let dataset = new Erie.Dataset("data__1");
      dataset.set("values", soundData);
      overlay.data.set("name", "data__1");
      
      console.log('overlay.get()', overlay.get())
      let audioQueue = await Erie.compileAudioGraph(overlay.get());
      await audioQueue.playQueue();
      audioQueue.destroy();
    }
  }

  function filterData(place_id:string, series_id:string) {
    let seriesInfo = serieses.find(s => s.id === series_id);
    if (!seriesInfo) {
      return null;
    }
    let placeInfo = seriesInfo.data.find(p => p.place_id === place_id);
    if (!placeInfo) {
      return null;
    }
    return {
      min: seriesInfo.min,
      max: seriesInfo.max,
      date: placeInfo.date.ts,
      value: placeInfo.value,
      sound: seriesInfo.soundfile
    }
  }

  async function playSound(event) {
    let series_id = event.target.value;
    let data = filterData(selected_place.id, series_id)
    console.log('data', data);

    if (event.target.checked) {
      let stream = new Erie.Stream();

      // skip narration
      stream.config.set('skipStartSpeech', true);
      stream.config.set('skipScaleSpeech', true);
      stream.config.set('skipStartPlaySpeech', true);
      stream.config.set('skipFinishSpeech', true);

      // tone
      let soundURL = new URL(`./sounds/${data.sound}`, import.meta.url);
      let tone = new Erie.SampledTone("sample_audio", { mono: soundURL })
      stream.sampling.add(tone);
      stream.tone.set(tone);
      stream.tone.continued(false);

      // data
      stream.data.set("name", "data__1");
      stream.data.set("values", [ { date: data.date, value: data.value } ]);

      // encoding
      stream.encoding.time.field("date", "nominal")
        .scale("band", 500);

      stream.encoding.detune.field("value", "quantitative")
        .scale("polarity", "positive")
        .scale("domain", [data.min, data.max])
        .scale("range", [100, 700])
        .format("0.4")

      // play sound
      let audioQueue = await Erie.compileAudioGraph(stream.get());
      audios[series_id] = {
        audioQueue: audioQueue,
        playing: true
      }
      await audios[series_id].audioQueue.playQueue();
      audios[series_id].playing = false;

    } else {
      audios[series_id].playing = false;
      audios[series_id].audioQueue.stopQueue();
    }
  }

</script>

<h1>What does a city's data sound like?</h1>
<p>
  Choose a city from the drop down below and find out.
</p>

<select
		bind:value={selected_place}
>
  <option value={undefined}>Choose a place...</option>
  {#each places.data.places as place}
    <option value={place}>
      {place.PlaceDescriptions[0].display_label}
    </option>
  {/each}
</select>
{#if selected_place}
  <p>Listen to {place_label}:</p>
  <div class="col-2">
    {#if seriesDescriptions}
    <div id="serieses">
      {#each seriesDescriptions.data.serieses as series}
        <div class={disableCheckbox(selected_place.id, series.id) 
          ? "disabled" 
          : ""}
        >
          <label>
            <input
              type="checkbox"
              bind:group={series_selection}
              value={series.id}
              disabled={disableCheckbox(selected_place.id, series.id)}
            /> 
            {series.SeriesDescriptions[0].display_axis_primary}
          </label>
        </div>
      {/each}
    </div>
    {/if}  
    <div id="waveform">
      {#if series_selection.length > 0}
      {#await overlayData}
        <div>...loading data</div>
      {:then soundData}

      <div>
        <button 
          id="play-button"
          on:click={async(e) => await play(soundData)}
          >
          {#if stopped}
            Play
          {:else}
            Stop
          {/if}
        </button>
      </div>

      <svg width=400 height=200>
        <defs>
          <linearGradient id="lgrad" x1="0%" y1="50%" x2="100%" y2="50%" >
              <stop offset="0%" style="stop-color:rgb(0,255,10);stop-opacity:1.00" />
              <stop offset="25%" style="stop-color:rgb(0,188,212);stop-opacity:0.70" />
              <stop offset="50%" style="stop-color:rgb(238,130,238);stop-opacity:1.00" />
              <stop offset="75%" style="stop-color:rgb(103,58,183);stop-opacity:0.70" />
              <stop offset="100%" style="stop-color:rgb(233,30,99);stop-opacity:1.00" />
          </linearGradient>
        </defs>
        {#each soundData as sd}
        {#await sd.sound}
          <g />
        {:then sound} 
          <path style="fill:none; stroke-width: 3;  stroke:url(#lgrad)">
            <animate
                attributeName="d"
                dur="2.54s"
                repeatCount="indefinite"
                calcMode="linear"
                values={linearPath(sound, { 
                    samples: 100, type: 'steps', top: 20, animation: true
                  }
                )}
            />
          </path>
        {/await}
        {/each}
      </svg>
      <div>
        {#each soundData as sd}
        <p>{format(sd.value_format)(sd.place_value)} {sd.display_axis_secondary || ""}</p>
        {#if sd.trend_scalar && sd.place_trend}
          <p>{processTrend(+sd.trend_scalar, +sd.place_trend)}</p>
        {/if}
        {/each}
      </div>
      {:catch error}
        <div>error generating wave</div>
      {/await}

      {/if}
    </div>
  </div>
{/if}

<style>
  .disabled {
    color: lightgray;
  }
  .col-2 {
    display: flex;
    flex-direction: row;
    gap: 20px;
  }
  #serieses {
    max-height: 75vh;
    overflow: scroll;
    padding: 10px;
  }
</style>
<script lang="ts">
  import places from "$lib/Places.json";
  import seriesvalues from "$lib/SeriesesValues.json";
  import seriesDescriptions from "$lib/Serieses.json";
  import { DateTime } from "luxon";
  import { getAudioData, linearPath } from "waveform-path";
  import { format } from "d3";
  import * as Erie from 'erie-web';

  const MAX_CHECKED = 8;
  let stopped = true;
  let selected_place: any;
  let series_selection:string[] = [];
  let skipped = [
    "city_overview-minority_population-totals_yearly",
    "city_overview-youth_population-totals_yearly",
    "education-libraries-100k_yearly",
    "health_of_the_environment-pm_2_5_pollution-max_totals_monthly",
    "safety-homicide-100k_yearly",
    "safety-motor_vehicle_theft-100k_yearly",
    "safety-property_crime-100k_yearly",
    "safety-rape_sexual_assault-100k_yearly",
    "safety-violent_crime-100k_yearly",
    "workforce_development-unemployment-percent_monthly",
    "workforce_development-federal_spending-federal_spending_totals_yearly",
    "workforce_development-wage-annualAverageUSD_yearly",
    "healthy_communities-museums-100k_yearly"
  ]
  let queue: Erie.SequenceStream;


  $: place_label = selected_place?.PlaceDescriptions[0].display_label;
  $: serieses = seriesvalues.data.serieses
      .filter(m => !skipped.includes(m.id))
      .map((m,i) => {
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
          soundfile: `${m.id}.mp3`
        };
        return seriesInfo;
      })
  $: disable_checkbox = series_selection.length >= MAX_CHECKED;

  // async function to compile data from all the disparate files
  // for chosen place and serieses selected
  async function compileData(selected_place:any, series_selection:string[]) {
    let overlayData = series_selection.map(s => {
      let seriesInfo = serieses.find(f => f.id === s)
      let audioData = getAudioData(`./sounds/${seriesInfo?.soundfile}`);
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
        display_axis_primary: seriesDescription?.SeriesDescriptions[0].display_axis_primary,
        display_axis_secondary: seriesDescription?.SeriesDescriptions[0].display_axis_secondary,
        sound: audioData,
        soundfile: seriesInfo?.soundfile
      })
    })
    return overlayData;
  }

  $: overlayData = compileData(selected_place, series_selection);
  $: spec = series_selection.length > 0 ? overlayData.then((d) => generateSpec(d)) : null;
  $: audio = spec?.then((s) => Erie.compileAudioGraph(s.get()))


  async function generateSpec(soundData:any) {
    let spec = new Erie.Overlay();

    spec.config.set('skipStartSpeech', true);
    spec.config.set('skipScaleSpeech', true);
    spec.config.set('skipStartPlaySpeech', true);
    spec.config.set('skipFinishSpeech', true);
    spec.config.set('skipTitle', true);
    spec.config.set('skipDescription', true);
    spec.config.set('skipStopSpeech', true);
    
    soundData.forEach((series) => {
      let stream = new Erie.Stream();

      let soundURL = new URL(`./sounds/${series.soundfile}`, import.meta.url);
      let sample = new Erie.SampledTone(series.soundfile, { mono: soundURL });
      stream.tone.set(sample);

      let data = [series];
      let dataset = new Erie.Dataset(`${series.series_id}`);
      dataset.set("values", data);
      stream.data.set(dataset);

      stream.encoding.time.field("series_id", "nominal")
        .scale("band", 15)
        .scale("description", "skip")

      stream.encoding.detune.field("place_value", "quantitative")
        .scale("polarity", "positive")
        .scale("domain", [series.min, series.max])
        .scale("range", [-600, 600])
        .scale("description", "skip")

      stream.encoding.timbre.field("series_id", "nominal")
        .scale("domain", [series.series_id])
        .scale("range", [series.soundfile])
        .scale("description", "skip");

      spec.overlay.push(stream);
      spec.datasets.add(dataset);
      spec.sampling.add(sample);
    })
    return spec;
  }

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

  function stopQueue(audioQueue) {
    if (!stopped && audioQueue) {
      audioQueue.stopQueue();
      stopped = true;
    }
  }


</script>

<h1>What does a city's data sound like?</h1>
<p>
  Choose a city from the drop down below and find out.
</p>

<select
		bind:value={selected_place}
    on:change={() => {
      series_selection = []
      stopQueue(queue)
    }}
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
        {#if !skipped.includes(series.id)}
          <div class={disableCheckbox(selected_place.id, series.id) || disable_checkbox
            ? "disabled" 
            : ""}
          >
            <label>
              <input
                type="checkbox"
                bind:group={series_selection}
                value={series.id}
                disabled={disableCheckbox(selected_place.id, series.id)}
                on:change={stopQueue(queue)}
              /> 
              {series.SeriesDescriptions[0].display_axis_primary}
            </label>
          </div>
        {/if}
      {/each}
    </div>
    {/if}  
    <div id="waveform">
      {#if series_selection.length > 0}
      {#await overlayData}
        <p>...loading data</p>
      {:then soundData}

      <div>
        {#await audio}
          <p>...compiling audio queue</p>
        {:then audioQueue}
        <button 
          id="play-button"
          on:click={async() => {
            queue = audioQueue
            if (audioQueue) {
              if (stopped) {
                stopped = false
                await audioQueue.playQueue()
                stopped = true
              } else {
                audioQueue.stopQueue()
                stopped = true
              }
            }
          }}
          >
          {#if stopped}
            Play
          {:else}
            Stop
          {/if}
        </button>
        {/await}
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
          <p>Loading...</p>
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
        <p>
          {format(sd.value_format)(sd.place_value)}
          {sd.display_axis_secondary || (sd.display_axis_primary.split(" ")[0] === "Total"
            ? ` is the number of ${sd.display_axis_primary.toLowerCase()}`
            : ` is the ${sd.display_axis_primary.toLowerCase()}`)}
        </p>
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
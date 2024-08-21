<script lang="ts">
  import places from "$lib/data/Places.json";
  import seriesvalues from "$lib/data/SeriesesValues.json";
  import seriesDescriptions from "$lib/data/Serieses.json";
  import { DateTime } from "luxon";
  import { getAudioData, linearPath } from "waveform-path";
  import { format } from "d3";
  import * as Erie from 'erie-web';
  import { base } from '$app/paths';

  import c_pr__sju from "$lib/data/c-pr--sju.json";
  import c_us_ar_lit from "$lib/data/c-us-ar-lit.json";
  import c_us_az_msc from "$lib/data/c-us-az-msc.json";
  import c_us_ca_bfl from "$lib/data/c-us-ca-bfl.json";
  import c_us_ca_lgb from "$lib/data/c-us-ca-lgb.json";
  import c_us_ca_sac from "$lib/data/c-us-ca-sac.json";
  import c_us_co_den from "$lib/data/c-us-co-den.json";
  import c_us_de_ilg from "$lib/data/c-us-de-ilg.json";
  import c_us_fl_jax from "$lib/data/c-us-fl-jax.json";
  import c_us_fl_mia from "$lib/data/c-us-fl-mia.json";
  import c_us_ga_atl from "$lib/data/c-us-ga-atl.json";
  import c_us_ma_bos from "$lib/data/c-us-ma-bos.json";
  import c_us_md_bal from "$lib/data/c-us-md-bal.json";
  import c_us_mn_mes from "$lib/data/c-us-mn-mes.json";
  import c_us_nc_gbo from "$lib/data/c-us-nc-gbo.json";
  import c_us_ne_oma from "$lib/data/c-us-ne-oma.json";
  import c_us_nj_jec from "$lib/data/c-us-nj-jec.json";
  import c_us_nv_hnz from "$lib/data/c-us-nv-hnz.json";
  import c_us_nv_las from "$lib/data/c-us-nv-las.json";
  import c_us_oh_tol from "$lib/data/c-us-oh-tol.json";
  import c_us_ok_okc from "$lib/data/c-us-ok-okc.json";
  import c_us_or_pdx from "$lib/data/c-us-or-pdx.json";
  import c_us_pa_pit from "$lib/data/c-us-pa-pit.json";
  import c_us_ri_pvd from "$lib/data/c-us-ri-pvd.json";
  import c_us_sc_chs from "$lib/data/c-us-sc-chs.json";
  import c_us_sd_fsd from "$lib/data/c-us-sd-fsd.json";
  import c_us_tn_bna from "$lib/data/c-us-tn-bna.json";
  import c_us_tx_aus from "$lib/data/c-us-tx-aus.json";
  import c_us_tx_dal from "$lib/data/c-us-tx-dal.json";
  import c_us_tx_lrd from "$lib/data/c-us-tx-lrd.json";
  import c_us_ut_slc from "$lib/data/c-us-ut-slc.json";
  import c_us_va_orf from "$lib/data/c-us-va-orf.json";
  import c_us_wa_geg from "$lib/data/c-us-wa-geg.json";
  import c_us_wa_sea from "$lib/data/c-us-wa-sea.json";
  import c_us_wi_mke from "$lib/data/c-us-wi-mke.json";
  import c_us_wy_cys from "$lib/data/c-us-wy-cys.json";

  const placeMap = {
    "c-pr--sju": c_pr__sju,
    "c-us-ar-lit": c_us_ar_lit,
    "c-us-az-msc": c_us_az_msc,
    "c-us-ca-bfl": c_us_ca_bfl,
    "c-us-ca-lgb": c_us_ca_lgb,
    "c-us-ca-sac": c_us_ca_sac,
    "c-us-co-den": c_us_co_den,
    "c-us-de-ilg": c_us_de_ilg,
    "c-us-fl-jax": c_us_fl_jax, 
    "c-us-fl-mia": c_us_fl_mia, 
    "c-us-ga-atl": c_us_ga_atl,
    "c-us-ma-bos": c_us_ma_bos,
    "c-us-md-bal": c_us_md_bal,
    "c-us-mn-mes": c_us_mn_mes,
    "c-us-nc-gbo": c_us_nc_gbo,
    "c-us-ne-oma": c_us_ne_oma,
    "c-us-nj-jec": c_us_nj_jec,
    "c-us-nv-hnz": c_us_nv_hnz,
    "c-us-nv-las": c_us_nv_las,
    "c-us-oh-tol": c_us_oh_tol,
    "c-us-ok-okc": c_us_ok_okc,
    "c-us-or-pdx": c_us_or_pdx,
    "c-us-pa-pit": c_us_pa_pit,
    "c-us-ri-pvd": c_us_ri_pvd,
    "c-us-sc-chs": c_us_sc_chs,
    "c-us-sd-fsd": c_us_sd_fsd,
    "c-us-tn-bna": c_us_tn_bna,
    "c-us-tx-aus": c_us_tx_aus,
    "c-us-tx-dal": c_us_tx_dal,
    "c-us-tx-lrd": c_us_tx_lrd,
    "c-us-ut-slc": c_us_ut_slc,
    "c-us-va-orf": c_us_va_orf,
    "c-us-wa-geg": c_us_wa_geg,
    "c-us-wa-sea": c_us_wa_sea,
    "c-us-wi-mke": c_us_wi_mke,
    "c-us-wy-cys": c_us_wy_cys,
  }

  // $: cityData = async() selected_place ? placeMap[selected_place.id] : null;

  const MAX_CHECKED = 8;
  let stopped = true;
  let selected_place: any;
  let series_selection:string[] = [];
  let data_type = 'recent';
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
  ]
  let queue: Erie.SequenceStream;
  let series_is_stopped: {
    string: boolean
  } = {};
  let current_series_playing: string = null;
  
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
  $: limit_reached = series_selection.length >= MAX_CHECKED;

  // async function to compile data from all the disparate files
  // for chosen place and serieses selected
  async function compileOverlayData(selected_place:any, series_selection:string[]) {
    let overlayData = series_selection.map(s => {
      let seriesInfo = serieses.find(f => f.id === s)
      let audioData = getAudioData(`${base}/sounds/${seriesInfo?.soundfile}`);
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

  async function getTrendData(selected_place) {
    await new Promise(resolve => setTimeout(resolve, 0));
    if (selected_place) {
      let data = placeMap[selected_place.id];
      return data;
    } else {
      return null;
    }
  }

  function setStoppedMap(trendData) {
    trendData.data.serieses.forEach((series) => {
      series_is_stopped[series.SeriesDescriptions[0].display_axis_primary] = true;
    })
  }

  function compileTrendData(cityData:any, selected_series:string) {
    let values = cityData.data.serieses.find(s => s.SeriesDescriptions[0].display_axis_primary === selected_series);
    return values.SeriesValues;
  }

  $: overlayData = compileOverlayData(selected_place, series_selection);
  $: spec = series_selection.length > 0 ? overlayData.then((d) => generateOverlaySpec(d)) : null;
  $: audio = spec?.then((s) => Erie.compileAudioGraph(s.get()))

  async function generateOverlaySpec(soundData:any) {
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

      let soundURL = new URL(`../lib/sounds/${series.soundfile}`, import.meta.url);
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

  async function generateTrendSpec(soundData:any, min:number, max:number) {
    let stream = new Erie.Stream();

    stream.config.set('skipStartSpeech', true);
    stream.config.set('skipScaleSpeech', true);
    stream.config.set('skipStartPlaySpeech', true);
    stream.config.set('skipFinishSpeech', true);
    stream.config.set('skipStopSpeech', true);
    stream.config.set('skipStopSpeech', true);

    let soundURL = new URL(`../lib/sounds/bell.mp3`, import.meta.url);
    let sample = new Erie.SampledTone("sample_audio", { mono: soundURL });
    stream.tone.set(sample);
    stream.sampling.add(sample);
    stream.tone.continued(false);

    stream.data.set("name", "data__1");
    stream.data.set("values", soundData);

    stream.encoding.time.field("date", "nominal")
      .scale("band", 0.5);

    stream.encoding.detune.field("value", "quantitative")
      .scale("polarity", "positive")
      .scale("domain", [min, max])
      .scale("range", [-600, 600])
      .format("0.4")

    return stream;
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
    if (scalarText !== undefined && trendText !== undefined) return `${scalarText} numbers mean improvement and this metric is ${trendText.toLowerCase()}`;
  }

  // function to stop the currently-playing audio queue
  function stopQueue(audioQueue) {
    if (!stopped && audioQueue) {
      audioQueue.stopQueue();
      stopped = true;
    }
  }

  function displayYears(data:any) {
    let years = document.getElementById("years");
    years.innerHTML = "";
    if (data.length === 1) {
      let date = new Date(data[0].date)
      let year = date.getFullYear()
      years.innerHTML = `Year of data collection for this sonification:\n${year}`
    } else {
      let date1 = new Date(data[data.length - 1].date)
      let date2 = new Date(data[0].date)
      let year1 = date1.getFullYear()
      let year2 = date2.getFullYear()
      years.innerHTML = `Years of data collection for this sonification:\n${year1} - ${year2}`
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
    series_is_stopped = {}
    current_series_playing = null;
  }}
>
  <option value={undefined}>Choose a place...</option>
  {#each places.data.places as place}
    <option value={place}>
      {place.PlaceDescriptions[0].display_label}
    </option>
  {/each}
</select>

<select bind:value={data_type} on:change={() => {
  series_selection = []
  stopQueue(queue)
  series_is_stopped = {}
  current_series_playing = null;
}}>
  <option value="recent">Most Recent Data</option>
  <option value="trend">Trend Data</option>
</select>

{#if data_type === 'recent'}
  {#if selected_place}
    <p>Select up to {MAX_CHECKED} metrics to include in the sonification.</p>
    <div class="col-2">
      {#if seriesDescriptions}
        <div class="serieses">
          {#each seriesDescriptions.data.serieses as series}
            {#if !skipped.includes(series.id)}
              <div class={(disableCheckbox(selected_place.id, series.id) || limit_reached) && !series_selection.includes(series.id)
                ? "disabled" 
                : ""}
              >
                <label>
                  <input
                    type="checkbox"
                    bind:group={series_selection}
                    value={series.id}
                    disabled={(disableCheckbox(selected_place.id, series.id) || limit_reached) && !series_selection.includes(series.id)}
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
            <div>Loading...</div>
          {:then soundData}
        
          <div class="sound">
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
                {stopped ? 'Play' : 'Stop'}
                
              </button>
              {/await}
            </div>

            <svg width=440 height=300>
              <defs>
                {#each soundData as sd, i}
                  <linearGradient id="lgrad_{i}" x1="0%" y1="50%" x2="100%" y2="50%">
                    <stop offset=0% style="stop-color:rgb({(105 * (i + 1)) % 256}, {(150 * (i + 1)) % 256}, {(80 * (i + 1)) % 256});stop-opacity:1.00" />
                    <stop offset=25% style="stop-color:rgb({(105 * (i + 1)) % 256}, {(150 * (i + 1)) % 256}, {(80 * (i + 1)) % 256});stop-opacity:0.70" />
                    <stop offset=50% style="stop-color:rgb({(105 * (i + 1)) % 256}, {(150 * (i + 1)) % 256}, {(80 * (i + 1)) % 256});stop-opacity:1.00" />
                    <stop offset=75% style="stop-color:rgb({(105 * (i + 1)) % 256}, {(150 * (i + 1)) % 256}, {(80 * (i + 1)) % 256});stop-opacity:0.70" />
                    <stop offset=100% style="stop-color:rgb({(105 * (i + 1)) % 256}, {(150 * (i + 1)) % 256}, {(80 * (i + 1)) % 256});stop-opacity:1.00" />
                  </linearGradient>
                {/each}
              </defs>
              {#each soundData as sd, i}
                {#await sd.sound}
                  <p>Loading...</p>
                {:then sound} 
                  <path style="fill:none; stroke-width: 3;  stroke:url(#lgrad_{i})" transform="translate(0, {i * 28})">
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
          </div>
          <div>
            {#each soundData as sd}
              <p class="data-text">
                {format(sd.value_format)(sd.place_value)}
                {#if sd.display_axis_secondary}
                  {`${sd.display_axis_secondary} (${new Date(sd.date.ts).getFullYear()})`}
                {:else}
                  {(sd.display_axis_primary.split(" ")[0] === "Total"
                    ? ` is the number of ${sd.display_axis_primary.toLowerCase()} (${new Date(sd.date.ts).getFullYear()})`
                    : ` is the ${sd.display_axis_primary.toLowerCase()} (${new Date(sd.date.ts).getFullYear()})`)}
                {/if}
              </p>
              
              <ul class="trend-text">
                <li>The maximum across all cities is {format(sd.value_format)(sd.max)}</li>
                <li>The minimum across all cities is {format(sd.value_format)(sd.min)}</li>
              {#if sd.trend_scalar && sd.place_trend}
                <li>{processTrend(+sd.trend_scalar, +sd.place_trend)}</li>
              {/if}
              </ul>
              
            {/each}
          </div>
          {:catch error}
            <div>error generating wave</div>
          {/await}

        {/if}
      </div>
    </div>
  {/if}
{:else}
  {#await getTrendData(selected_place)}
    <div>Loading...</div>
  {:then cityData}
    {#if cityData}
      {#if setStoppedMap(cityData)}{/if}
      <p>Select a metric to hear its trend data.</p>
      <div class="col-2">
        <div class="serieses">
          {#each cityData.data.serieses as series}
          {#if series.SeriesValues.length > 0}
            <div>
              <label>
                {series.SeriesDescriptions[0].display_axis_primary}
              </label>
              <button 
                id="play-button2"
                on:click={async() => {
                  if (current_series_playing && current_series_playing !== series.SeriesDescriptions[0].display_axis_primary) {
                    series_is_stopped[current_series_playing] = true;
                    stopQueue(queue);
                  }

                  if (stopped) {
                    stopped = false
                    let data = compileTrendData(cityData, series.SeriesDescriptions[0].display_axis_primary)
                    let spec = await generateTrendSpec(data, series.display_min_value, series.display_max_value)
                    let audioQueue = await Erie.compileAudioGraph(spec.get())
                    queue = audioQueue
                    current_series_playing = series.SeriesDescriptions[0].display_axis_primary;
                    series_is_stopped[series.SeriesDescriptions[0].display_axis_primary] = false;
                    displayYears(data);
                    await audioQueue.playQueue()
                    series_is_stopped[series.SeriesDescriptions[0].display_axis_primary] = true;
                    stopped = true
                  } else {
                    if (queue) {
                      series_is_stopped[series.SeriesDescriptions[0].display_axis_primary] = true;
                      stopQueue(queue)
                    }
                  }
                  
                }}
              >
                {series_is_stopped[series.SeriesDescriptions[0].display_axis_primary] ? `Play` : `Stop`}
              </button>
            </div>
          {/if}
          {/each}
        </div>
        <div id="years"></div>
      </div>
    {:else}
      <div style="font-size:20px; margin-top:40px; font-weight:bold">We don't have that data yet!</div>
    {/if}
  {/await}
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

  .serieses {
    max-height: 75vh;
    overflow: scroll;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 5px; 
  }

  .sound {
    display: flex;
    align-items: center;
    gap: 80px;
  }

  .data-text {
    font-weight: bold;
  }

  .trend-text li {
    color: #4f4f4f;
    font-weight: normal;
  }

  #play-button {
    width: 60px;
    padding: 5px;
    border: 1px solid black;
    position: absolute;
    margin-top: -95px;
    background: none;
    font-size: 16px;
    font-weight: bold;
    font-family: 'Times New Roman';
    cursor: pointer;
    align-items: center;
    justify-content: center;
    border-radius: 30%;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.5);
  }

  #play-button:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  #play-button2 {
    padding: 5px;
    border: 1px solid black;
    background: none;
    font-size: 14px;
    font-weight: bold;
    font-family: 'Times New Roman';
    cursor: pointer;
    align-items: center;
    justify-content: center;
    border-radius: 30%;
    box-shadow: 2px 2px 3px rgba(0, 0, 0, 0.5);
  }

  #play-button2:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  #waveform {
    margin-top: -120px;
  }

  #years {
    width: 400px;
    height: 200px;
    align-content: center;
    justify-content: center;
    text-align: center;
    font-weight: bold;
    font-size: 20px;
  }

</style>
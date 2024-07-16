const MIN_PITCH = -12;
const MAX_PITCH = 12;

let spec = new Erie.Stream();

document.addEventListener("DOMContentLoaded", async () => {
    init();
});

async function init() {
    const container = document.getElementById("container");

    const pitchShift = new Tone.PitchShift().toDestination();
    const player = await new Promise((resolve, reject) => {
        const player = new Tone.Player({
            loop: true,
            onerror: (err) => reject(err),
            onload: () => resolve(player),
            url: "https://tonejs.github.io/audio/drum-samples/Bongos/snare.mp3"
        });
    });
    player.connect(pitchShift)
    try {
        const metricData = await loadMetrics();

        metricData.forEach((metric) => {
            // console.log(metric);
            const metricValues = getMetricValues(metric);
            // console.log(metricValues);

            const text = document.createElement("p");
            text.textContent = metric.SeriesDescriptions[0].display_axis_primary;

            const playButton = document.createElement("button");
            playButton.textContent = "Play";

            const pitchSlider = document.createElement("input");
            pitchSlider.type = "range";
            pitchSlider.min = MIN_PITCH;
            pitchSlider.max = MAX_PITCH;
            pitchSlider.step = 1;
            pitchSlider.value = 0;

            playButton.addEventListener("click", () => {
                if (player.state === "started") {
                    player.stop()
                    playButton.textContent = "Play";
                } else {
                    player.start()
                    playButton.textContent = "Stop";
                }
            });

            pitchSlider.addEventListener("input", (event) => {
                const pitchValue = event.target.value;
                pitchShift.pitch = pitchValue;
            });

            container.appendChild(text);
            container.appendChild(playButton);
            container.appendChild(pitchSlider);
        });

    } catch (error) {
        console.error("Error:", error);
    }
}

async function loadMetrics() {
    const response = await fetch("data/json/c-us-az-msc.json");
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();
    return json.data.serieses;
}

function getMetricValues(metric) {
    const values = [];
    metric.SeriesValues.forEach((dataPoint) => {
        values.push(dataPoint.value)
    });
    values.reverse(); // sort values from oldest to newest
    return values;
}

function getPitchValues(metricValues) {
    
}
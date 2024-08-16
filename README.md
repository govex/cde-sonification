# cde-sonification

A data sonification project to build an interactive sounds of the city feature using data accessible from the City Data Explorer API.

### Description:

Choose from the list of available cities to listen to sonifications that represent the most recent or trend-based data for that city.

Sonification of the city's most recent data is created as an overlay of audio tracks that each represent one specific metric, with each track's pitch adjusted according to the data value, where higher data values correspond to higher pitches. The pitch is scaled relative to the minimum and maximum value across all cities, so that the city having the highest value for a particular metric will have the highest pitch for that metric's sonified sound. Up to 8 metrics can be included in a sonification. Some metrics are excluded if data for that metric is not available for the chosen city. The audio files for each metric are designed to reflect the 'essence' of that specific metric (e.g., the Number of Libraries metric is mapped to the sound of flipping through book pages). All audio files were obtained from https://pixabay.com.

Sonification of the city's trend data is created as a bell tone that varies in pitch according to changes in data values over time. The pitch is again scaled relative to the combined minimum and maximum values all cities. Only a limited number of cities have available trend data.

### Resources and Tools:

[Erie.js](https://see-mike-out.github.io/erie-documentation/)

[d3.js](https://d3js.org/)

### Examples and Inspiration:

[Sonification Workshop](https://ccrma.stanford.edu/~cc/sonify/index.html)

[Data Sonification Archive](https://sonification.design/)

[London Under the Microscope](https://blog.duncangeere.com/london-under-the-microscope/)

[Data Sonification for Beginners](https://mlaetsc.hcommons.org/2023/01/18/data-sonification-for-beginners/)

[Exploring Dataset Sonification with Web Audio](https://aleksati.net/posts/exploring-dataset-sonification-with-web-audio)

### Documentation:

[Query Documentation for JSON files](queryDocumentation.md)

[Query and Processing Documentation for CSV file](csvDocumentation.md)

[SvelteKit App Documentation](svelte-app/README.md)
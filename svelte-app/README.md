# Svelte-kit app for CDE Sonification Project

## Instructions for development

### Getting started

1. CD into the svelte-app folder in the repo
2. use `npm install` to generate a local node_modules folder and instantiate the app
3. use `npm run dev` to load the localhost version of the site at port 5174.

### Making changes

Work to integrate erie.js can occur on this page: `svelte-app/src/routes/sonified/[[id]]/+page.svelte`. The `[[id]]` indicates that's a dynamic route that will be determined by the city id in the url. The Erie.js library is loaded and there's functionality to get the correct city JSON file based on the parameters in the dynamic link, load it, and once loaded display all the metrics, their most recent value using the stored d3 format string associated with the series, and an explanation in text of the trend and trend_scalar values.

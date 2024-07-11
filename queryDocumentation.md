## Places.json

query:

```javascript
query Places($displayOnWebsite: Boolean, $level: String, $language: String) {
  places(display_on_website: $displayOnWebsite, level: $level) {
    level
    id
    population_bin
    PlaceDescriptions(language: $language) {
      display_details
      display_label
      display_sublabel
    }
  }
}
```

variables:

```javascript
{
  "displayOnWebsite": true,
  "language": "EN",
  "level": "city"
}
```

## Topics.json

query:

```javascript
query Topics($language: String, $displayOnWebsite: Boolean, $metricDescriptionsLanguage2: String) {
  topics {
    id
    TopicDescriptions(language: $language) {
      display_details
      display_label
      display_sublabel
    }
    Metrics(display_on_website: $displayOnWebsite) {
      MetricDescriptions(language: $metricDescriptionsLanguage2) {
        display_details
        display_label
        display_sublabel
      }
    }
  }
}
```

variables:

```javascript
{
  "language": "EN",
  "displayOnWebsite": true,
  "metricDescriptionsLanguage2": "EN",
  "seriesDisplayOnWebsite2": true,
  "chartType": "timeline",
  "seriesDescriptionsLanguage2": "EN"
}
```

## Metrics.json

query:

```javascript
query Metrics($displayOnWebsite: Boolean, $chartType: String, $seriesDisplayOnWebsite2: Boolean, $language: String) {
  metrics(display_on_website: $displayOnWebsite) {
    Series(chart_type: $chartType, display_on_website: $seriesDisplayOnWebsite2) {
      SeriesDescriptions(language: $language) {
        display_axis_primary
        display_axis_secondary
        display_details
        display_label
        display_methodology
      }
    }
  }
}
```

variables:

```javascript
{
  "displayOnWebsite": true,
  "chartType": "timeline",
  "seriesDisplayOnWebsite2": true,
  "language": "EN"
}
```

## Individual City JSON

query:

```javascript
query citySeriesesValues($displayOnWebsite: Boolean, $chartType: String, $placeId: String) {
  serieses(display_on_website: $displayOnWebsite, chart_type: $chartType) {
    SeriesDescriptions {
      display_axis_primary
      display_axis_secondary
      display_details
      display_label
      display_methodology
    }
    Metric {
      trend_scalar
    }
    display_max_value
    display_min_value
    frequency
    value_format
    value_type
    SeriesValues(place_id: $placeId) {
      date
      trend
      value
    }
  }
}
```

variables:

```javascript
{
  "displayOnWebsite": true,
  "chartType": "timeline",
  "placeId": "c-pr--sju", /// specific place_id is also file name
}
```

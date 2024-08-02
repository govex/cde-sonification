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

## Serieses.json

query:

```javascript
query Serieses($chartType: String, $displayOnWebsite: Boolean, $language: String) {
  serieses(chart_type: $chartType, display_on_website: $displayOnWebsite) {
    id
    value_format
    display_min_value
    display_max_value
    Metric {
      trend_scalar
    }
    SeriesDescriptions(language: $language) {
      display_axis_primary
      display_axis_secondary
      display_details
      display_label
      display_methodology
    }
  }
}
```

variables:

```javascript
{
  "chartType": "timeline",
  "displayOnWebsite": true,
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

## SeriesesValues.json

query:

```javascript
query Serieses($chartType: String, $displayOnWebsite: Boolean, $placeIds: [String!], $take: Int, $oldestFirst: Boolean) {
  serieses(chart_type: $chartType, display_on_website: $displayOnWebsite) {
    id
    SeriesValues(place_ids: $placeIds, take: $take, oldestFirst: $oldestFirst) {
      date
      place_id
      series_id
      trend
      value
    }
  }
}
```

variables: 

```javascript
{
  "chartType": "timeline",
  "displayOnWebsite": true,
  "placeIds": ["c-pr--sju",
"c-us-ak-anc",
"c-us-al-hsv",
"c-us-ar-lit",
"c-us-az-chd",
"c-us-az-gbe",
"c-us-az-gda",
"c-us-az-msc",
"c-us-az-phx",
"c-us-az-stz",
"c-us-az-tuz",
"c-us-ca-ana",
"c-us-ca-bfl",
"c-us-ca-cuv",
"c-us-ca-fat",
"c-us-ca-fnc",
"c-us-ca-ivn",
"c-us-ca-lax",
"c-us-ca-lgb",
"c-us-ca-oak",
"c-us-ca-ral",
"c-us-ca-sac",
"c-us-ca-sam",
"c-us-ca-san",
"c-us-ca-sbt",
"c-us-ca-sck",
"c-us-ca-sfo",
"c-us-ca-sjc",
"c-us-ca-sna",
"c-us-co-auc",
"c-us-co-cos",
"c-us-co-den",
"c-us-ct-bdr",
"c-us-dc-was",
"c-us-de-ilg",
"c-us-fl-hlf",
"c-us-fl-jax",
"c-us-fl-mia",
"c-us-fl-orl",
"c-us-fl-pie",
"c-us-fl-tpa",
"c-us-ga-atl",
"c-us-hi-hnl",
"c-us-ia-dsm",
"c-us-id-boi",
"c-us-il-chi",
"c-us-in-fwa",
"c-us-in-ind",
"c-us-ks-ict",
"c-us-ky-lex",
"c-us-ky-lui",
"c-us-la-btr",
"c-us-la-msy",
"c-us-ma-bos",
"c-us-md-bal",
"c-us-me-pwm",
"c-us-mi-det",
"c-us-mn-mes",
"c-us-mn-stp",
"c-us-mo-mkc",
"c-us-mo-stl",
"c-us-ms-jan",
"c-us-mt-bil",
"c-us-nc-clt",
"c-us-nc-dur",
"c-us-nc-gbo",
"c-us-nc-int",
"c-us-nc-rag",
"c-us-nd-far",
"c-us-ne-lnk",
"c-us-ne-oma",
"c-us-nh-mht",
"c-us-nj-ewr",
"c-us-nj-jec",
"c-us-nm-abq",
"c-us-nv-hnz",
"c-us-nv-las",
"c-us-nv-nvs",
"c-us-nv-rno",
"c-us-ny-buf",
"c-us-ny-nyc",
"c-us-oh-cle",
"c-us-oh-cmh",
"c-us-oh-cvg",
"c-us-oh-tol",
"c-us-ok-okc",
"c-us-ok-tul",
"c-us-or-pdx",
"c-us-pa-phl",
"c-us-pa-pit",
"c-us-ri-pvd",
"c-us-sc-chs",
"c-us-sd-fsd",
"c-us-tn-bna",
"c-us-tn-mem",
"c-us-tx-arj",
"c-us-tx-aus",
"c-us-tx-crp",
"c-us-tx-dal",
"c-us-tx-elp",
"c-us-tx-fwt",
"c-us-tx-grx",
"c-us-tx-hou",
"c-us-tx-irt",
"c-us-tx-lbb",
"c-us-tx-lrd",
"c-us-tx-plz",
"c-us-tx-sat",
"c-us-ut-slc",
"c-us-va-arp",
"c-us-va-orf",
"c-us-va-ric",
"c-us-va-ufg",
"c-us-va-vab",
"c-us-wa-geg",
"c-us-wa-sea",
"c-us-wa-tiw",
"c-us-wi-mke",
"c-us-wi-msn",
"c-us-wy-cys"
],
"take": 1,
"oldestFirst": false,
}
```
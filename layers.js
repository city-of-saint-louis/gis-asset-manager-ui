export const layers = [
  {
    id: "1",
    url: "https://services6.arcgis.com/HZXbCkpCSqbGd0vK/ArcGIS/rest/services/Parcels/FeatureServer/0",
    name: "cityParcels",
    required: true,
    limit: 100,
    labelMask: "{SITEADDR}",
  },
  {
    id: "2",
    url: "https://services6.arcgis.com/HZXbCkpCSqbGd0vK/ArcGIS/rest/services/CITY_TREES/FeatureServer/0",
    name: "cityTrees",
    required: true,
    limit: 200,
    labelMask: "{STREET_NUM}, {STREET}, {ADDRESS}",
  },
];
layers = JSON.stringify(layers);

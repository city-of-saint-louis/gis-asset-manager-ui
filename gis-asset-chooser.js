class GISAssetChooserComponent extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    const div = document.createElement("div");
    div.id = "viewDiv";
    div.style.width = "60%";
    div.style.height = "60vh";
    this.appendChild(div);
    require(["esri/config", "esri/Map", "esri/views/MapView"], function (
      esriConfig,
      Map,
      MapView
    ) {
      esriConfig.apiKey =
        "AAPK1af1e90a1ee2405a912eb235152854062ll-5gN7QQk-TSyXgKTR7HoKrqRAcw7RseJvj4d6jlHhucrqvv-yD6mJFYA5iSO9";
      const map = new Map({
        basemap: "arcgis/topographic",
      });
      const view = new MapView({
        map: map,
        center: [-90.25, 38.64], // Longitude, latitude
        zoom: 14, // Zoom level
        container: this.querySelector("#viewDiv"), // Div element
      });
      const featureLayer = new FeatureLayer({
        url: "https://services6.arcgis.com/HZXbCkpCSqbGd0vK/ArcGIS/rest/services/2020_Census_in_2011_Wards/FeatureServer/0",
      });
      map.add(featureLayer);
    }.bind(this));
  }
}

customElements.define("gis-asset-chooser", GISAssetChooserComponent);

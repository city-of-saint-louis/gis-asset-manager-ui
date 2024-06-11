class GISAssetChooserComponent extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    try {
      const title = this.getAttribute("title") || "";
      const hint = this.getAttribute("hint") || "";
      const layers = JSON.parse(this.getAttribute("layers") || "[]");
      // console.log(layers);
      const zoom = this.getAttribute("zoom") || 12;
      const baseMap = this.getAttribute("baseMap") || "streets"; // topo-vector
      const centerX = this.getAttribute("centerX") || -90.25;
      const centerY = this.getAttribute("centerY") || 38.64;
      // const showSearch = this.getAttribute("showSearch") || false;
      // const allowPoints = this.getAttribute("allowPoints") || false;

      this.innerHTML = `
        <p>${title}</p>
        <p>${hint}</p>
        <div id="viewDiv" style="width: 45%; height: 40vh;"></div>
        <slot name="map-layers"></slot>
      `;
      require([
        "esri/Map",
        "esri/views/MapView",
        "esri/layers/FeatureLayer",
      ], function (Map, MapView, FeatureLayer) {
        const map = new Map({
          basemap: baseMap,
        });

        const view = new MapView({
          map: map,
          center: [centerX, centerY], // Longitude, latitude
          zoom: zoom, // Zoom level
          container: this.querySelector("#viewDiv"),
        });

        const layerOptions = [
          {
            layerName: "parcel-layer",
            url: "https://services6.arcgis.com/HZXbCkpCSqbGd0vK/ArcGIS/rest/services/Parcels/FeatureServer/0",
          },
          {
            layerName: "street-tree-layer",
            url: "https://services6.arcgis.com/HZXbCkpCSqbGd0vK/ArcGIS/rest/services/Street_Trees_Read_Only/FeatureServer/0",
          },
        ];

        layerOptions.forEach((layerProperties) => {
          const { layerName, url } = layerProperties;
          const layer = new FeatureLayer({ url, layerName });
          console.log(layer.layerName, layer);
          map.add(layer);
        });
      }.bind(this));
    } catch (e) {
      console.error(e);
      document.getElementById(
        "viewDiv"
      ).innerHTML = `<p>There was a problem loading the map. Please try again later.</p>`;
    }
  }
}

customElements.define("gis-asset-chooser", GISAssetChooserComponent);

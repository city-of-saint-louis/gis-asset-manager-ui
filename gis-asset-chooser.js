class GISAssetChooserComponent extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    try {
      const title = this.getAttribute("title") || "";
      const hint = this.getAttribute("hint") || "";
      const layers = this.getAttribute("layers") || [];
      const zoom = this.getAttribute("zoom") || 12;
      const baseMap = this.getAttribute("baseMap") || "streets-vector"; // topo-vector
      const showSearch = this.getAttribute("showSearch") || false;
      const centerX = this.getAttribute("centerX") || -90.25;
      const centerY = this.getAttribute("centerY") || 38.64;
      const allowPoints = this.getAttribute("allowPoints") || false;

      this.innerHTML = `
        <p>${title}</p>
        <p>${hint}</p>
        <div id="viewDiv" style="width: 30%; height: 50vh;"></div>
      `;

      require([
        "esri/config",
        "esri/Map",
        "esri/views/MapView",
        "esri/layers/GraphicsLayer",
        "esri/layers/FeatureLayer",
      ], function (
        esriConfig,
        Map,
        MapView,
        Graphic,
        GraphicsLayer,
        FeatureLayer
      ) {
        // esriConfig.apiKey="AAPK1af1e90a1ee2405a912eb235152854062ll-5gN7QQk-TSyXgKTR7HoKrqRAcw7RseJvj4d6jlHhucrqvv-yD6mJFYA5iSO9"

        const map = new Map({
          basemap: baseMap,
        });

        const view = new MapView({
          map: map,
          center: [centerX, centerY], // Longitude, latitude
          zoom: zoom, // Zoom level
          container: this.querySelector("#viewDiv"),
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

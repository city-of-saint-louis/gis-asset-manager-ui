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
      const baseMapURL = this.getAttribute("baseMap") || "streets-navigation-vector";
      const showSearch = this.getAttribute("showSearch") || false;
      const centerX = this.getAttribute("centerX") || -90.25;
      const centerY = this.getAttribute("centerY") || 38.64;
      const allowPoints = this.getAttribute("allowPoints") || false;

      this.innerHTML = `
        <p>${title}</p>
        <p>${hint}</p>
        <div id="viewDiv" style="width: 40%; height: 35vh;"></div>
      `;

      require(["esri/Map", "esri/views/MapView"], function (
        Map,
        MapView
      ) {
        const map = new Map({
          // basemap: "arcgis/topographic",
          basemap: baseMapURL,
        });
        const view = new MapView({
          map: map,
          center: [centerX, centerY], // Longitude, latitude
          zoom: zoom, // Zoom level
          container: this.querySelector("#viewDiv")
        });
      }.bind(this));
    } catch (e) {
      console.error(e);
      document.getElementById("viewDiv").innerHTML = `<p>There was a problem loading the map. Please try again later.</p>`;
    }
  }
}

customElements.define("gis-asset-chooser", GISAssetChooserComponent);

class GISAssetChooserComponent extends HTMLElement {
  constructor() {
    super();
    this._items = []; // Initialize the items array
  }

  static get observedAttributes() {
    return ["items"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "items") {
      this.items = JSON.parse(newValue);
    }
  }

  set items(value) {
    this._items = value;
    this.render();
  }

  get items() {
    return this._items;
  }

  connectedCallback() {
    this.render();
    try {
      const title = this.getAttribute("title") || "";
      const hint = this.getAttribute("hint") || "";
      const layers = JSON.parse(this.getAttribute("layers")) || [];
      const zoom = this.getAttribute("zoom") || 12;
      const baseMap = this.getAttribute("baseMap") || "streets-vector"; // topo-vector
      const showSearch = this.getAttribute("showSearch") || false;
      const centerX = this.getAttribute("centerX") || -90.25;
      const centerY = this.getAttribute("centerY") || 38.64;
      const allowPoints = this.getAttribute("allowPoints") || false;
      console.log(layers);
      this.innerHTML = `
        <p>${title}</p>
        <p>${hint}</p>
        <div id="viewDiv" style="width: 30%; height: 50vh;"></div>
      `;

      require([
        "esri/Map",
        "esri/views/MapView",
        "esri/layers/FeatureLayer",
      ], function (Map, MapView, FeatureLayer) {
        const map = new Map({
          basemap: "streets",
        });

        const view = new MapView({
          map: map,
          center: [centerX, centerY], // Longitude, latitude
          zoom: zoom, // Zoom level
          container: this.querySelector("#viewDiv"),
        });
        // if layers includes 'parcel-layer' then add 'parcelLayer'
        const parcelLayer = new FeatureLayer({
          url: "https://services6.arcgis.com/HZXbCkpCSqbGd0vK/ArcGIS/rest/services/Parcels/FeatureServer/0",
        });
        map.add(parcelLayer);

        const streetTreeLayer = new FeatureLayer({
          url: "https://services6.arcgis.com/HZXbCkpCSqbGd0vK/ArcGIS/rest/services/Street_Trees_Read_Only/FeatureServer/0",
        });

        map.add(streetTreeLayer);
      }.bind(this));
    } catch (e) {
      console.error(e);
      document.getElementById(
        "viewDiv"
      ).innerHTML = `<p>There was a problem loading the map. Please try again later.</p>`;
    }
  }
  render() {}
}

customElements.define("gis-asset-chooser", GISAssetChooserComponent);

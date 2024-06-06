class GISAssetChooserComponent extends HTMLElement {
  connectedCallback() {
    const div = document.createElement("div");
    div.id = "viewDiv";
    div.style.width = "60%";
    div.style.height = "60vh";
    this.appendChild(div);
    require([
      "esri/config",
      "esri/portal/PortalItem",
      "esri/Basemap",
      "esri/layers/MapImageLayer",
      "esri/layers/support/TileInfo",
      "esri/Map",
      "esri/views/MapView",
    ], function (
      esriConfig,
      PortalItem,
      Basemap,
      MapImageLayer,
      TileInfo,
      Map,
      MapView
    ) {
      esriConfig.apiKey =
        "AAPK1af1e90a1ee2405a912eb235152854062ll-5gN7QQk-TSyXgKTR7HoKrqRAcw7RseJvj4d6jlHhucrqvv-yD6mJFYA5iSO9";
      //use own basemap templage
      const basemap = new Basemap({
        baseLayers: [
          new MapImageLayer({
            url: "https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer",
            title: "World Street Map",
          }),
        ],
        title: "World Street Map",
        id: "de26a3cf4cc9451298ea173c4b324736",
      });
      const map = new Map({
        basemap: "streets",
      });

      const view = new MapView({
        map: map,
        center: [-90.25, 38.64], // Longitude, latitude
        zoom: 14, // Zoom level
        // constraints: {
        //   lods: TileInfo.create().lods,
        //  },
        container: this.querySelector("#viewDiv"),
      });
    }.bind(this));
  }
}

customElements.define("gis-asset-chooser", GISAssetChooserComponent);

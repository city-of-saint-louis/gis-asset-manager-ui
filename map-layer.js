class MapLayer extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    console.log("map-layer initialized")
   
    try {
      const layerId = this.getAttribute("layer-id") || "";
      const name = this.getAttribute("name") || "";
      const serverUrl = this.getAttribute("server-url") || "";

      const layerDetails = {
        layerId,
        name,
        serverUrl,
      };
      console.log('layerDetails', layerDetails);
      this.dispatchEvent(new CustomEvent("layerDetailsProvided", { 
        detail: layerDetails,
        bubbles: true,
      }));
    }
    catch (error) {
      console.error(error);
    }
  }
}
document.addEventListener("DOMContentLoaded", () => {
  customElements.define("map-layer", MapLayer);
});
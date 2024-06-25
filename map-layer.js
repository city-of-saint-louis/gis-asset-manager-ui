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
      const required = this.getAttribute("required") || false;
      const limit = this.getAttribute("limit") || 0;
      const labelMask = this.getAttribute("label-mask") || "";
      const layerAssetIDFieldName = this.getAttribute("layer-asset-id-field-name") || "";
      const layerClassUrl = this.getAttribute("layer-class-url") || "";

      const layerDetails = {
        layerId,
        name,
        serverUrl,
        required,
        limit,
        labelMask,
        layerAssetIDFieldName
      };
      // console.log('layerDetails', layerDetails);
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
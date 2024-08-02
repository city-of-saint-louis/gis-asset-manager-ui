class MapLayer extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    console.log("map-layer initialized")
   
    try {
      const name = (this.getAttribute("name") || "").replace(/\s/g, "-");
      const layerClassUrl = this.getAttribute("layer-class-url") || ""; 
      // save below for future use
      // const layerId = this.getAttribute("layer-id") || "";
      // const serverUrl = this.getAttribute("server-url") || "";
      const minimumSelections = this.getAttribute("minimum") || 0;
      const maximumSelections = this.getAttribute("maximum") || 0;
      const labelMask = this.getAttribute("label-mask") || "";
      const layerAssetIDFieldName = this.getAttribute("layer-asset-id-field-name") || "GUID";
      const minScale = this.getAttribute("min-scale") || "";
      const maxScale = this.getAttribute("max-scale") || "";
      
      const layerDetails = {
        name,
        layerClassUrl,
        // save below for future use
        // serverUrl,
        // layerId,
        minimumSelections,
        maximumSelections,
        labelMask,
        layerAssetIDFieldName,
        minScale,
        maxScale,
      };
      
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
  customElements.define("asset-chooser-map-layer", MapLayer);
});
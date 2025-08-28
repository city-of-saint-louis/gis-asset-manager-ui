class MapLayer extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    try {
      const name = (this.getAttribute("name") || "").replace(/\s/g, "-");
      const layerClassUrl = this.getAttribute("layer-class-url") || ""; 
      const minimumSelections = this.getAttribute("minimum") || 0;
      const maximumSelections = this.getAttribute("maximum") || 0;
      const labelMask = this.getAttribute("label-mask") || "";
      const layerAssetIDFieldName = this.getAttribute("layer-asset-id-field-name") || "GUID";
      const minScale = this.getAttribute("min-scale") || "";
      const maxScale = this.getAttribute("max-scale") || "";
      const assetLabel = this.getAttribute("asset-label") || "";

      const layerDetails = {
        name,
        layerClassUrl,
        minimumSelections,
        maximumSelections,
        labelMask,
        layerAssetIDFieldName,
        minScale,
        maxScale,
        assetLabel
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
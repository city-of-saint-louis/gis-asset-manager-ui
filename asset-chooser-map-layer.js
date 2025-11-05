class MapLayer extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    try {
      const name = (this.getAttribute("name") || "").replace(/\s/g, "-");
      const displayName = this.getAttribute("display-name") || "";
      const layerClassUrl = this.getAttribute("layer-class-url") || ""; 
      const minimumSelections = this.getAttribute("minimum") || 0;
      const maximumSelections = this.getAttribute("maximum") || 0;
      const labelMask = this.getAttribute("label-mask") || "";
      const layerAssetIDFieldName = this.getAttribute("layer-asset-id-field-name") || "GUID";
      const minScale = this.getAttribute("min-scale") || "";
      const maxScale = this.getAttribute("max-scale") || "";
      const isWritable = this.getAttribute("is-writable") || "false";
      const availableCreateTools = this.getAttribute("available-create-tools") || "";
      // const assetLabel = this.getAttribute("asset-label") || "";
      const layerDetails = {
        name,
        displayName,
        layerClassUrl,
        minimumSelections,
        maximumSelections,
        labelMask,
        layerAssetIDFieldName,
        minScale,
        maxScale,
        isWritable,
        availableCreateTools,
        // assetLabel
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

export { MapLayer };
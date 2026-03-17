class AssetManagerMapLayer extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    try {
      const name = (this.getAttribute("name") || "").replace(/\s/g, "-");
      const displayName = this.getAttribute("display-name") || "";
      const layerClassUrl = this.getAttribute("layer-class-url") || ""; 
      const minimumSelectionsRequired = this.getAttribute("minimum") || 0;
      const maximumSelectionsAllowed = this.getAttribute("maximum") || 10;
      const labelMask = this.getAttribute("label-mask") || "";
      const layerAssetIDFieldName = this.getAttribute("layer-asset-id-field-name") || "GUID";
      const minScale = this.getAttribute("min-scale") || "";
      const maxScale = this.getAttribute("max-scale") || "";
      const isSelectBySearchEnabled = this.getAttribute("is-select-by-search-enabled") || "false";
      // const assetLabel = this.getAttribute("asset-label") || "";
      const layerDetails = {
        name,
        displayName,
        layerClassUrl,
        minimumSelectionsRequired,
        maximumSelectionsAllowed,
        labelMask,
        layerAssetIDFieldName,
        minScale,
        maxScale,
        isSelectBySearchEnabled,
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

export { AssetManagerMapLayer };
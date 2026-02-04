class AssetChooserSketchableMapLayer extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    try {
      const name = (this.getAttribute("name") || "").replace(/\s/g, "-");
      const minimum = this.getAttribute("minimum") || 0;
      const maximum = this.getAttribute("maximum") || 10;
      const minScale = this.getAttribute("min-scale") || "0";
      const maxScale = this.getAttribute("max-scale") || "0";
      const sketchTypeAttr = this.getAttribute("sketch-type") || "point";
      const sketchType = sketchTypeAttr.split(",").map(s => s.trim());
      const layerDetails = {
        name,
        minimum,
        maximum,
        minScale,
        maxScale,
        sketchType,
      };
      this.dispatchEvent(new CustomEvent("sketchableLayerDetailsProvided", { 
        detail: layerDetails,
        bubbles: true,
      }));
    }
    catch (error) {
      console.error(error);
    }
  }
}
export { AssetChooserSketchableMapLayer };
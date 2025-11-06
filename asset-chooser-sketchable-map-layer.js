class SketchableMapLayer extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    try {
      const name = (this.getAttribute("name") || "").replace(/\s/g, "-");
      const minimum = this.getAttribute("minimum") || 0;
      const maximum = this.getAttribute("maximum") || 0;
      const sketchType = this.getAttribute("sketch-type") || "point";
      const layerDetails = {
        name,
        minimum,
        maximum,
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
export { SketchableMapLayer };
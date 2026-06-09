class AssetManagerSketchableMapLayer extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    try {
      const name = (this.getAttribute("name") || "").replace(/\s/g, "-");
      // const minimum = this.getAttribute("minimum") || 0;
      // const maximum = this.getAttribute("maximum") || 10;
      const parseNonNegativeIntAttr = (attrValue, fallback) => {
        if (attrValue === null) return fallback;

        const normalized = String(attrValue).trim().toLowerCase();
        if (
          normalized === "" ||
          normalized === "null" ||
          normalized === "undefined"
        ) {
          return fallback;
        }

        const parsed = Number.parseInt(normalized, 10);
        return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
      };

      const minimum = parseNonNegativeIntAttr(this.getAttribute("minimum"), 0);

      const maximum = Math.max(
        parseNonNegativeIntAttr(this.getAttribute("maximum"), 10),
        minimum,
      );
      const minScale = this.getAttribute("min-scale") || "0";
      const maxScale = this.getAttribute("max-scale") || "0";
      const sketchTypeAttr = this.getAttribute("sketch-type") || "point";
      const sketchType = sketchTypeAttr.split(",").map((s) => s.trim());
      const layerDetails = {
        name,
        minimum,
        maximum,
        minScale,
        maxScale,
        sketchType,
      };
      this.dispatchEvent(
        new CustomEvent("sketchableLayerDetailsProvided", {
          detail: layerDetails,
          bubbles: true,
        }),
      );
    } catch (error) {
      console.error(error);
    }
  }
}
export { AssetManagerSketchableMapLayer };

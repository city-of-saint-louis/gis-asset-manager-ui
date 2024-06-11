class MapLayer extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    try {
      const layerId = this.getAttribute("layerId") || "";
      const url = this.getAttribute("url") || "";
      const serverUrl = this.getAttribute("serverUrl") || "";
      const name = this.getAttribute("name") || "";
      const required = this.getAttribute("required") || false;
      const limit = this.getAttribute("limit") || 1000;
      const labelMask = this.getAttribute("labelMask") || "";

      this.innerHTML = `
        <div id="${name}-layer" style="width: 45%; height: 40vh;"></div>
      `;
    }
    catch (error) {
      console.error(error);
    }
  }
}
customElements.define("map-layer", MapLayer);
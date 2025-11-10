class AssetChooserMapLayerDataDisplay extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }); // Use shadow DOM for style/DOM encapsulation
  }

  set data(layerData) {
    this.render(layerData);
  }

  render(layerData) {
    const {
      name,
      minAssetsRequired,
      maxAssetsAllowed,
      enableSketchHandler,
      hideLayerHandler,
    } = layerData;

    // Sanitize name for IDs
    const safeName = name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-_]/g, "");

    this.shadowRoot.innerHTML = `
      <style>
        /* Add your styles here */
      </style>
      <div class="sketchable-map-layer-data-container stat-container stat-medium">
        <div class="stat-title" id="${safeName}-layer-selected-asset-container"
          aria-label="${name} Layer" title="${name} Layer">
          <div>
            <span><strong>${name} Layer</strong></span>
          </div>
          <div>
            <button type="button" id="enable-sketch-btn" class="toggleLayerVisibilityButton"
              aria-label="" title="Enable sketch for ${name} layer">
              <span>Add Assets</span>
            </button>
            <button type="button" id="show-hide-layer-btn" class="toggleLayerVisibilityButton"
              aria-label="" title="Hide ${name} layer">
              <span>Hide</span>
            </button>
          </div>
        </div>
        <div aria-live="polite" aria-atomic="true" class="asset-selection-requirements">
          <span class="sr-only">Asset addition requirements and status for ${name} layer</span>
          ${
            minAssetsRequired === 0
              ? `<span class="label label-success">No additions required</span>`
              : minAssetsRequired === 1
              ? `<span class="label label-error">${minAssetsRequired} required</span>`
              : `<span class="label label-error">At least ${minAssetsRequired} required</span>`
          }
          ${
            maxAssetsAllowed > 0
              ? `<span class="label label-default">Add a maximum of ${maxAssetsAllowed}</span>`
              : ``
          }
        </div>
        <ul data-layer-name="${safeName}" class="list-group highlighted-asset-data-list"
          id="asset-list" aria-live="polite" aria-atomic="true">
          <li title="No assets added for ${name} layer">None added</li>
        </ul>
      </div>
    `;

    // Attach event listeners
    this.shadowRoot.getElementById("enable-sketch-btn")
      .addEventListener("click", () => enableSketchHandler && enableSketchHandler(name));
    this.shadowRoot.getElementById("show-hide-layer-btn")
      .addEventListener("click", () => hideLayerHandler && hideLayerHandler(name));
  }
}

export { AssetChooserMapLayerDataDisplay };
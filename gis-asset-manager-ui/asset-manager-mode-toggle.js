import { setAssetMode } from "./asset-manager-state.js";

import { handleSelectEnabled, handleSketchEnabled } from "./asset-manager-functions.js";

class AssetManagerModeToggle extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    try {
      this.innerHTML = `
        <div id="asset-manager-mode-toggle-container" style="">
          <span id="mode-toggle-label">Asset Mode:</span>
          <div class="mode-toggle-buttons" style="display: flex; gap: 8px;">
        <button
          id="select-mode-button" 
          class="mode-button"
          title="Enable Select Mode"
        >
          <span class="mode-button-icon"><calcite-icon icon="cursor" /></span>
          <span class="mode-button-text">Select</span>
        </button>
        <button
          id="sketch-mode-button" 
          class="mode-button"
          title="Enable Sketch Mode"
        >
          <span class="mode-button-icon"><calcite-icon icon="pencil" /></span>
          <span class="mode-button-text">Sketch</span>
        </button>
          </div>
        </div>`;
      this.querySelector("#select-mode-button").addEventListener("click", () => {
        setAssetMode("select");
        handleSelectEnabled();
      });
      this.querySelector("#sketch-mode-button").addEventListener("click", () => {
        setAssetMode("sketch");
        handleSketchEnabled();
      });
    } catch (error) {
      console.error(
        "Error in AssetManagerModeToggle connectedCallback:",
        error
      );
    }
  }
}

export { AssetManagerModeToggle };

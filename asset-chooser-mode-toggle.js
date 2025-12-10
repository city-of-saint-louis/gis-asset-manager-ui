import { setAssetMode } from "./asset-chooser-state.js";

import { handleSelectEnabled, handleSketchEnabled } from "./asset-chooser-functions.js";

class AssetChooserModeToggle extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    try {
      // this.innerHTML = `
      //   <div id="asset-chooser-mode-toggle-container">
      //     <label class="switch">
      //       <input type="checkbox">
      //         <span class="slider round"></span>
      //     </label>
      //   </div>`;
      this.innerHTML = `
        <div id="asset-chooser-mode-toggle-container" style="">
          <span id="mode-toggle-label">Asset Mode:</span>
          <div class="mode-toggle-buttons" style="display: flex; gap: 8px;">
        <button
          id="select-mode-button" 
          class="mode-button"
        >
          <span class="glyphicons-svg glyphicons-svg-cursor"></span>
          <span class="mode-button-text">Select</span>
        </button>
        <button
          id="sketch-mode-button" 
          class="mode-button"
        >
          <span class="glyphicons-svg glyphicons-svg-pencil"></span>
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
        "Error in AssetChooserModeToggle connectedCallback:",
        error
      );
    }
  }
}

export { AssetChooserModeToggle };

import { assetMode, setAssetMode } from "./asset-chooser-state.js";

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
        <div id="asset-chooser-mode-toggle-container">
          <button
            id="select-mode-button" 
            class="mode-button"
          >
            <span class="glyphicons-svg glyphicons-svg-cursor"></span>
          </button>
          <button
            id="sketch-mode-button" 
            class="mode-button"
          >
            <span class="glyphicons-svg glyphicons-svg-pencil"></span>
          </button>
        </div>`;
      this.querySelector("#select-mode-button")
      .addEventListener("click", () => setAssetMode("select"));
      this.querySelector("#sketch-mode-button")
      .addEventListener("click", () => setAssetMode("sketch"));
    } catch (error) {
      console.error(
        "Error in AssetChooserModeToggle connectedCallback:",
        error
      );
    }
  }
}

export { AssetChooserModeToggle };

// import from asset-chooser-container-functions.js
import { handleAccomodationButtonClick } from "./asset-chooser-container-functions.js";
import { enableSketchMode, enableSelectMode } from "./asset-chooser-container-functions.js";
import {
  // isSelectBySearchEnabled,
  setIsSelectBySearchEnabled,
} from "./asset-chooser-state.js";

class AssetChooserContainer extends HTMLElement {
  constructor() {
    super(); // always call super() first in the constructor for a custom web component
    this.title = this.getAttribute("title") || "";
    this.hint = this.getAttribute("hint") || "";
    this.isSelectEnabled = this.getAttribute("is-select-enabled") === "true";
    this.isSketchEnabled = this.getAttribute("is-sketch-enabled") === "true";
    this.isSelectBySearchEnabled = this.getAttribute("is-select-by-search-enabled") === "false";
    this.titleHeadingLevel = this.getAttribute("title-heading-level") || "2";
  }
  connectedCallback() {
    enableSketchMode(this.isSketchEnabled);
    enableSelectMode(this.isSelectEnabled);
    if (this.isSelectBySearchEnabled) {
      setIsSelectBySearchEnabled(true);
      // console.log("Select by search is enabled in AssetChooserContainer");
    }
    const accomodationButtonMessage =
      "Click this button to enter assets if you are using assistive technology and are unable to select assets on the map.";
    try {
      this.innerHTML = `
        <section id="asset-chooser-interface">
          <h${this.titleHeadingLevel} id="asset-chooser-title">${this.title}</h${this.titleHeadingLevel}>
          <div id="asset-chooser-button-and-map-wrapper">
            <div id="asset-chooser-button-container">
              <p id="asset-chooser-hint" data-original-hint="${this.hint}">${this.hint}</p>
            </div>
            <div id="viewDiv" aria-label="Interactive map for selecting and adding 
            assets">
             <span id="mode-status-banner"></span>
            </div>
          </div>
          <div class="row" id="layer-data-container">
          </div>
        </section>
      `;
      
      const buttonContainer = this.querySelector("#asset-chooser-button-container");
      
      if (this.isSelectEnabled && this.isSketchEnabled) {
        const modeToggleSwitch = document.createElement("asset-chooser-mode-toggle");
        buttonContainer.appendChild(modeToggleSwitch);
      }

      const accomodationButton = document.createElement("button");
      accomodationButton.type = "button";
      accomodationButton.id = "accomodation-button";
      accomodationButton.className = "link-button inverse-button";
      accomodationButton.setAttribute("aria-label", accomodationButtonMessage);
      accomodationButton.setAttribute("title", accomodationButtonMessage);
      buttonContainer.appendChild(accomodationButton);
      accomodationButton.innerHTML = `
        <span id="accessibility-icon">
        <calcite-icon icon="person-2" />
        </span>
        
        Accessible Accommodation
      `;
      const accomodationButtonHint = document.createElement("p");
      accomodationButtonHint.id = "accomodation-button-hint";
      accomodationButtonHint.textContent = "Please note that the accessible accommodation should only be used if you are unable to enter assets on the map.";
      buttonContainer.appendChild(accomodationButtonHint);
      if (accomodationButton) {
        accomodationButton.addEventListener(
          "click",
          handleAccomodationButtonClick
        );
      }
      
    } catch (e) {
      console.error(e);
      document.getElementById(
        "viewDiv"
      ).innerHTML = `<p>There was a problem loading the map. Please try again later.</p>`;
    }
  }
}

export { AssetChooserContainer };
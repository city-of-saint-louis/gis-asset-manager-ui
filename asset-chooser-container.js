// import from asset-chooser-container-functions.js
import { handleAccomodationButtonClick } from "./asset-chooser-container-functions.js";
import { enableSketchMode, enableSelectMode } from "./asset-chooser-container-functions.js";
import {
  // isSelectBySearchEnabled,
  setIsSelectBySearchEnabled,
} from "./asset-chooser-state.js";

class AssetChooserContainerComponent extends HTMLElement {
  constructor() {
    super(); // always call super() first in the constructor for a custom web component
    this.title = this.getAttribute("title") || "";
    this.hint = this.getAttribute("hint") || "";
    this.isSelectEnabled = this.getAttribute("is-select-enabled") === "true";
    this.isSketchEnabled = this.getAttribute("is-sketch-enabled") === "true";
    this.isSelectBySearchEnabled = this.getAttribute("is-select-by-search-enabled") === "true";
  }
  connectedCallback() {
    enableSketchMode(this.isSketchEnabled);
    enableSelectMode(this.isSelectEnabled);
    if (this.isSelectBySearchEnabled) {
      setIsSelectBySearchEnabled(true);
      // console.log("Select by search is enabled in AssetChooserContainerComponent");
    }
    const accomodationButtonMessage =
      "Click this button to enter assets if you are using assistive technology and are unable to select assets on the map.";
    try {
      this.innerHTML = `
        <section id="asset-chooser-interface">
          <h2 id="asset-chooser-title">${this.title}</h2>
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
      // this.innerHTML = `
      //   <section id="asset-chooser-interface">
      //     <h2 id="asset-chooser-title">${this.title}</h2>
      //     <p id="asset-chooser-hint" data-original-hint="${this.hint}">${this.hint}</p>
      //     <div id="asset-chooser-map-and-layer-data-wrapper">
      //       <div id="viewDiv" aria-label="Interactive map for selecting and adding assets">
      //       </div>
      //       <div class="row" id="layer-data-container">
      //       </div>
      //     </div>
      //      <div id="accomodation-button-container">
      //       <button
      //         type="button"
      //         id="accomodation-button"
      //         class="link-button inverse-button"
      //         aria-label="${accomodationButtonMessage}"
      //         title="${accomodationButtonMessage}"
      //       >
      //         <span id="accessibility-icon" class="glyphicons-svg glyphicons-svg-white glyphicons-svg-outstretched">
      //         </span>
      //         Accessible Accommodation
      //       </button>
      //     </div>
      //   </section>
      // `;
      // Add event listener for the accomodation button click
      // const accomodationButton = this.querySelector("#accomodation-button");
      const buttonContainer = this.querySelector("#asset-chooser-button-container");
      // buttonContainer.style.display = "flex";
      
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
        <span id="accessibility-icon" class="glyphicons-svg glyphicons-svg-white glyphicons-svg-outstretched">
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

export { AssetChooserContainerComponent };


//  <p id="validity-message" title="Selection requirements"></p>

//  <div class="row" id="asset-chooser-map-and-layer-data-wrapper">
//             <div class="col-md-7">
//               <div id="viewDiv" style="width: 100%; height: 500px;" aria-label="Interactive map for selecting and adding assets">
//             </div>
//             </div>
//             <div class="col-md-5" id="layer-data-container">
//               <div id="layer-data-div" class="stat-group"></div>
//               <div id="sketchable-layer-data-div" class="stat-group"></div>
//             </div>
//           </div>






{/* <button
              type="button"
              id="accomodation-button"
              class="link-button inverse-button"
              aria-label="${accomodationButtonMessage}"
              title="${accomodationButtonMessage}"
            >
              <span id="accessibility-icon" class="glyphicons-svg glyphicons-svg-white glyphicons-svg-outstretched">
              </span>
              Accessible Accommodation
            </button> */}
// import from asset-chooser-container-functions.js
import { handleAccomodationButtonClick } from "./asset-chooser-container-functions.js";

class AssetChooserContainerComponent extends HTMLElement {
  constructor() {
    super(); // always call super() first in the constructor for a custom web component
    this.title = this.getAttribute("title") || "";
    this.hint = this.getAttribute("hint") || "";
  }
  connectedCallback() {
    try {
      this.innerHTML = `
      <section id="asset-chooser-section">
        <div id="asset-chooser-interface">
          <h2>${this.title}</h2>
          <h3>${this.hint}</h3>
          <div id="accomodation-button-container">
            <button
              type="button"
              id="accomodation-button"
              class="link-button inverse-button"
              aria-label="Click this button to enter assets if you are using assistive technology and are unable to select assets on the map."
              title="Click this button to enter assets only if you are using assistive technology and are unable to select assets on the map."
            >
              <span id="accessibility-icon" class="glyphicons-svg glyphicons-svg-white glyphicons-svg-outstretched">
              </span>
              Accessible Accommodation
            </button>
          </div>
          <p id="validity-message" title="Selection requirements"></p>
          <div class="row">
            <div class="col-md-7">
              <div id="viewDiv" style="width: 100%; height: 500px;" aria-label="interactive map for selecting assets" >
            </div>
          </div>
            <div class="col-md-5">
              <div id="layer-data-div" class="stat-group"></div>
            </div>
          </div>
        </div>
      </section>
      `;
      // Add event listener for the accomodation button click
      const accomodationButton = this.querySelector("#accomodation-button");
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

// define the custom element after the page has loaded
document.addEventListener("DOMContentLoaded", () => {
  customElements.define(
    "asset-chooser-container",
    AssetChooserContainerComponent
  );
});
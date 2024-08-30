class AssetChooserContainerComponent extends HTMLElement {
  constructor() {
    super(); // always call super() first in the constructor for a custom web component
    this.isOriginalState = true; // flag to track the state of the interface
  }
  connectedCallback() {
    console.log("asset-chooser-container initialized");

    const handleAccomodationButtonClick = () => {
      console.log("accomodation button clicked");
      const assetChooserInterface = document.getElementById(
        "asset-chooser-interface"
      );
      const accomodationButton = document.getElementById("accomodation-button");
      if (this.isOriginalState) {
        console.log("featureLayers", featureLayers);
        // Generate the HTML content
        const htmlContent = featureLayers
          .map((layer) => {
            return `<span>${layer.layerProperties.layerName}</span>`;
          })
          .join("");

          document.getElementById("asset-chooser-interface").innerHTML = htmlContent; 


      } else {
        location.reload(); // reload the page
      }
      this.isOriginalState = !this.isOriginalState; // toggle the state
    };

    try {
      const title = this.getAttribute("title") || "";
      const hint = this.getAttribute("hint") || "";
      this.innerHTML = `
      <section class="stat-container">
        <div id="accomodation-button-container">
          <button 
            id="accomodation-button"
          >
            Accomodation
          </button>
        </div>
        <div id="asset-chooser-interface">
          <h3>
            <strong>${title}</strong>
          </h3>
          <h4>
            ${hint}
          </h4>
        <p 
          id="validity-message"
        >
        </p>
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

      // Add event listener for the button click
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

// define the custom component after the page has loaded
document.addEventListener("DOMContentLoaded", () => {
  customElements.define(
    "asset-chooser-container",
    AssetChooserContainerComponent
  );
});

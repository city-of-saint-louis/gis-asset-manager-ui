class AssetChooserContainerComponent extends HTMLElement {
  constructor() {
    super(); // always call super() first in the constructor for a custom web component
    this.isOriginalState = true; // flag to track the state of the interface
  }
  connectedCallback() {
    console.log("asset-chooser-container initialized");

    const handleAccomodationButtonClick = () => {
      const assetChooserInterface = document.getElementById(
        "asset-chooser-interface"
      );
      const accomodationButton = document.getElementById("accomodation-button");
      if (this.isOriginalState) {
        // Generate the HTML content for inputs
        const inputsContent = featureLayers
          .map((layer) => {
            console.log("layer", layer);
            const isRequired =
              layer.layerProperties.minimumAssetsRequired >= 1
                ? "required"
                : "";
            return `
             <div>
              <label>${layer.layerProperties.layerName}</label>
              <br>
              <input
                size="60"
                type="text"
                name="${layer.layerProperties.layerName}"
                id="${layer.layerProperties.layerName}"
                value=""
                placeholder="Enter any ${layer.layerProperties.layerName} assets required for your request."
                ${isRequired}
              />
             </div>
            `;
          })
          .join("");

        // Combine inputs with a single form and submit button
        const htmlContent = `
         <h2>Enter the assets you require for your request</h2>
         <h3>Please provide as much information as you can.</h3>
         <form id="submit-asset-form">
           ${inputsContent}
           <button 
             id="accomodation-asset-submission-button" 
             type="submit" 
             class="link-button">
               Submit
           </button>
         </form>
        `;

        assetChooserInterface.innerHTML = htmlContent;

        // Add event listener for the form submission
        const submitAssetForm = document.getElementById("submit-asset-form");
        submitAssetForm.addEventListener("submit", handleAssetFormSubmit);

        accomodationButton.textContent = "Switch Back To Map";
      } else {
        location.reload(); // reload the page
      }
      this.isOriginalState = !this.isOriginalState; // toggle the state
    };

    const handleAssetFormSubmit = (event) => {
      event.preventDefault();
      console.log("form submitted");
      const formData = new FormData(event.target);
      formData.forEach((value, key) => {
        // console.log(`${key}: ${value}`);
        chosenAssetFormData.push({ key, value });
        console.log("chosenAssetFormDta", chosenAssetFormData);
      });
      // isValid = true;
      // console.log("isValid", isValid);
    };

    try {
      const title = this.getAttribute("title") || "";
      const hint = this.getAttribute("hint") || "";
      this.innerHTML = `
      <section class="stat-container">
       
        <div id="asset-chooser-interface">
          <h2>
            <strong>${title}</strong>
          </h2>
          <h3>
            ${hint}
          </h3>
          
          <p id="validity-message"></p>
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
         <div id="accomodation-button-container">
         <h4>Please click the button below if you are unable to use the map.</h4>
          <button 
            id="accomodation-button"
            class="link-button"
            aria-label="Click here to select assets if you are using a screen reader and are unable to select assets on the map."
          >
            Accessible Option
          </button>
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

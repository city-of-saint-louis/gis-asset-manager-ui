class AssetChooserContainerComponent extends HTMLElement {
  constructor() {
    super(); // always call super() first in the constructor for a custom web component
    this.isOriginalState = true; // flag to track the state of the interface
  }
  connectedCallback() {
    const generateInputsContent = () => {
      return featureLayers
        .map((layer) => {
          const isRequired =
            layer.layerProperties.minimumAssetsRequired >= 1
              ? "required"
              : "";
          return `
           <div>
            <label>${layer.layerProperties.layerName}</label>
            <br>
            <input
              style="margin: 5px;"
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
    };
    const handleAccomodationButtonClick = () => {
      if (chosenAssets.length > 0) {
        // remove assets from chosenAssets array
        chosenAssets.splice(0, chosenAssets.length);
      }
      if (chosenAssetFormData.length > 0) {
        // remove assets from chosenAssetFormData array
        chosenAssetFormData.splice(0, chosenAssetFormData.length);
      }
      const assetChooserInterface = document.getElementById(
        "asset-chooser-interface"
      );
      const accomodationButton = document.getElementById("accomodation-button");
      const buttonHint = document.getElementById("button-hint");
      if (this.isOriginalState) {
        buttonHint.textContent = "Please click the button below to switch back to the map.";
        // Generate the HTML content for inputs
        const inputsContent = generateInputsContent();
        // Combine inputs with a single form and submit button
        const htmlContent = `
        <div id="asset-form-container">
         <h2>Enter the assets you require for your request</h2>
         <h3>Please provide as much information as you can.</h3>
         <form id="submit-asset-form">
           ${inputsContent}
           <button
             style="margin-top: 5px;" 
             id="accomodation-asset-submission-button" 
             type="submit" 
             class="link-button">
               Confirm Asset Information
           </button>
         </form>
         </div>
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

    const handleCancelSelectionsClick = () => {
      chosenAssetFormData.splice(0, chosenAssetFormData.length);
      const inputsContent = generateInputsContent();
      document.getElementById("asset-form-container").innerHTML = `
      <h2>Enter the assets you require for your request</h2>
         <h3>Please provide as much information as you can.</h3>
         <form id="submit-asset-form">
           ${inputsContent}
           <button
             style="margin-top: 5px;" 
             id="accomodation-asset-submission-button" 
             type="submit" 
             class="link-button">
               Confirm Asset Information
           </button>
         </form>
         `;
      isValid = false;
      const customEvent = new CustomEvent("isValidFalse", {
        detail: { chosenAssets: [], chosenAssetFormData },
        bubbles: true,
      });
      document.dispatchEvent(customEvent);
       // Re-add event listener for the form submission
       const submitAssetForm = document.getElementById("submit-asset-form");
       submitAssetForm.addEventListener("submit", handleAssetFormSubmit);
    };

    const handleAssetFormSubmit = (event) => {
      event.preventDefault();
      const formData = new FormData(event.target);
      formData.forEach((value, key) => {
        chosenAssetFormData.push({ key, value });
      });
      isValid = true;
      // Dispatch custom event when isValid becomes true
      if (isValid) {
      const customEvent = new CustomEvent("isValidTrue", {
        detail: { chosenAssets: [], chosenAssetFormData },
        bubbles: true,
      });
      document.dispatchEvent(customEvent);
      }
      // Clear the form
      event.target.reset();
      document.getElementById("asset-form-container").innerHTML = `
      <h2>Thank you</h2>
      <h3>The asset information has been added to your case. Please continue.</h3>
      <button
        id="cancel-asset-selection-button"
        class="link-button"
      >
       Cancel Selections
      </button>
      `;
      // Add event listener for the dynamically created cancel button
      const cancelSelectionsButton = this.querySelector("#cancel-asset-selection-button");
      if (cancelSelectionsButton) {
        cancelSelectionsButton.addEventListener(
          "click",
          handleCancelSelectionsClick
        );
      }
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
         <h4 id="button-hint">Please click the button below if you are unable to use the map.</h4>
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

// define the custom component after the page has loaded
document.addEventListener("DOMContentLoaded", () => {
  customElements.define(
    "asset-chooser-container",
    AssetChooserContainerComponent
  );
});

class AssetChooserContainerComponent extends HTMLElement {
  constructor() {
    super(); // always call super() first in the constructor for a custom web component
    this.isOriginalState = true; // flag to track the state of the interface
    this.title = this.getAttribute("title") || "";
    this.hint = this.getAttribute("hint") || "";
  }
  connectedCallback() {
    const generateInputsContent = (prefillData = {}) => {
      return featureLayers
        .map((layer) => {
          const isRequired =
            layer.layerProperties.minimumAssetsRequired >= 1 ? "required" : "";
          const prefillValue =
            prefillData[layer.layerProperties.layerName] || "";
          return `
           <div>
            <label
              for="${layer.layerProperties.layerName}"
            >Enter any ${layer.layerProperties.layerName}s required for your request.</label>
            <p>
            <input
              size="60"
              type="text"
              name="${layer.layerProperties.layerName}"
              id="${layer.layerProperties.layerName}"
              value="${prefillValue}"
              ${isRequired}
            >
            <p/>
           </div>
          `;
        })
        .join("");
    };

    const generateModalHTML = (inputsContent) => {
      return `
        <dialog id="asset-modal" class="modal">
          <div class="modal-content">
            <div class="modal-header">
              <button class="close" type="button" aria-label="Close">&times;</button>
              <h2 id="accomodation-title">Enter the assets required for your request.</h2>
              <p id="accomodation-subtitle">Please provide as much information as you can such as name, address, ID, description, etc.</p>
            </div>
            <div class="modal-body">
              <form id="modal-asset-form">
                ${inputsContent}
                <button
                  id="accomodation-asset-submission-button" 
                  type="submit" 
                  class="link-button"
                >
                  Confirm Asset Information
                </button>
              </form>
            </div>  
             <p>Please note that this form should only be used if you are unable to select and submit assets through the map. If you are able to use the map, please close this window and return to the map to make your selections.</p>
          </div>
        </dialog>
      `;
    };

    const openModal = (prefillData = {}) => {
      const existingModal = document.getElementById("asset-modal");
      if (existingModal) {
        existingModal.remove();
      }

      const inputsContent = generateInputsContent(prefillData);
      const modalHTML = generateModalHTML(inputsContent);
      document.body.insertAdjacentHTML("beforeend", modalHTML);
      const modal = document.getElementById("asset-modal");
      modal.showModal();
      document.body.classList.add("no-scroll");
      // Add event listener for the modal form submission
      const modalForm = document.getElementById("modal-asset-form");
      if (modalForm) {
        modalForm.addEventListener("submit", handleModalAssetFormSubmit);
      }
      // Add event listener for closing the modal
      const modalCloseButton = document.querySelector(".modal .close");
      if (modalCloseButton) {
        modalCloseButton.addEventListener("click", closeModal);
      }
    };

    const closeModal = () => {
      const modal = document.getElementById("asset-modal");
      if (modal) {
        modal.close();
        document.body.classList.remove("no-scroll");
      }
    };

    const clearStoredModalFormAssetData = () => {
      console.log("clearing - chosenAssetFormData", chosenAssetFormData);
      chosenAssetFormData.splice(0, chosenAssetFormData.length);
      isValid = false;
      const customEvent = new CustomEvent("isValidFalse", {
        detail: { chosenAssets: [], chosenAssetFormData },
        bubbles: true,
      });
      document.dispatchEvent(customEvent);
      console.log("cleared - chosenAssetFormData", chosenAssetFormData);
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
      openModal();
    };

    const handleCancelSelectionsClick = () => {
      // Clear stored data
      clearStoredModalFormAssetData();
      const existingModal = document.getElementById("asset-modal");
      if (existingModal) {
        existingModal.close();
      }
      // empty the stored featureLayers array
      featureLayers.splice(0, featureLayers.length);
      // empty the stored allMapLayerIds array
      allMapLayerIds.splice(0, allMapLayerIds.length);
      // re-render the component
      this.connectedCallback(); // Re-render the component
      initializeMap();
      console.log("chosenAssets after cancel", chosenAssets);
      console.log("chosenAssetFormData after cancel", chosenAssetFormData);
      document
        .getElementById("submit-chosen-assets-button")
        .setAttribute("disabled", true);
      document
        .getElementById("submit-chosen-assets-button")
        .classList.add("disabled-button");
    };

    const handleAssetEditButtonClick = () => {
      // Create a prefill data object from chosenAssetFormData
      const prefillData = chosenAssetFormData.reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
      }, {});
      // Remove the existing modal if it exists
      const existingModal = document.getElementById("asset-modal");
      if (existingModal) {
        existingModal.remove();
      }
      // Call openModal with prefilled data
      openModal(prefillData);
      // clearStoredModalFormAssetData();
    };

    const handleModalAssetFormSubmit = (event) => {
      event.preventDefault();
      const formData = new FormData(event.target);
      if (chosenAssetFormData.length > 0) {
        chosenAssetFormData.splice(0, chosenAssetFormData.length);
      }
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
      // event.target.reset();
      document.getElementById("asset-chooser-interface").innerHTML = `
        <h2 id="asset-chooser-title">${this.title}</h2>
        <h3>The asset information has been added to your case.</h3>
        <p>You entered:</p>
        <ul>
          ${chosenAssetFormData
            .map(
              (asset) =>
                `<li><strong>${asset.key}</strong>: ${
                  asset.value
                    ? asset.value
                    : `Nothing entered for ${asset.key} layer`
                }</li>`
            )
            .join("")}
        </ul>
        <button
          id="edit-asset-selection-button"
          class="link-button"
        >
          Edit Entry
        </button>
        <button
          id="cancel-asset-selection-button"
          class="link-button"
        >
          Cancel Entry and Return to Map
        </button>
        <p>Please note that this form should only be used if you are unable to select and submit assets through the map. If you are able to use the map, please cancel your entry and return to the map to make your selections.</p>
      `;
      closeModal();
      document
        .getElementById("asset-chooser-interface")
        .scrollIntoView({ behavior: "smooth", block: "start" });
      // Add event listener for the dynamically created cancel button
      const cancelSelectionsButton = this.querySelector(
        "#cancel-asset-selection-button"
      );
      if (cancelSelectionsButton) {
        cancelSelectionsButton.addEventListener(
          "click",
          handleCancelSelectionsClick
        );
      }
      const editSelectionsButton = this.querySelector(
        "#edit-asset-selection-button"
      );
      if (editSelectionsButton) {
        editSelectionsButton.addEventListener(
          "click",
          handleAssetEditButtonClick
        );
      }
    };

    try {
      // const title = this.getAttribute("title") || "";
      // const hint = this.getAttribute("hint") || "";
      this.innerHTML = `
      <section id="asset-chooser-section">
        <div id="asset-chooser-interface">
          <h2>${this.title}</h2>
          <h3>${this.hint}</h3>
           <div id="accomodation-button-container">
          <p id="button-hint">Please click below if you are using assistive technology and are unable to select assets on the map.</p>
          <button
            id="accomodation-button"
            class="link-button inverse-button"
            aria-label="Click here to enter assets if you are using assistive technology and are unable to select assets on the map."
          >
            <span id="accessibility-icon" class="glyphicons-svg glyphicons-svg-white glyphicons-svg-outstretched"></span>
            Click for Accessible Accommodation
          </button>
        </div>
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

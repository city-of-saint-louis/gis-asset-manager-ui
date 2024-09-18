class AssetChooserContainerComponent extends HTMLElement {
  constructor() {
    super(); // always call super() first in the constructor for a custom web component
    this.isOriginalState = true; // flag to track the state of the interface
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
            <br>
            <input
              style="margin: 5px 0 5px 0;"
              size="60"
              type="text"
              name="${layer.layerProperties.layerName}"
              id="${layer.layerProperties.layerName}"
              value="${prefillValue}"
              ${isRequired}
            >
            <br>
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
              <button class="close" type="buttonaria-label="Close">&times;</button>
              <h2 id="accomodation-title">Enter the assets required for your request.</h2>
              <h3 id="accomodation-subtitle">Please provide as much information as you can.</h3>
              <p class="modal-header-hint">Helpful information includes name, address, ID (if applicable), description, etc.</p>
            </div>
            <div class="modal-body">
              <form id="modal-asset-form">
                ${inputsContent}
                <button
                  style="margin-top: 5px;" 
                  id="accomodation-asset-submission-button" 
                  type="submit" 
                  class="link-button"
                >
                  Confirm Asset Information
                </button>
              </form>
            </div>  
          </div>
        </dialog>
      `;
    };

    const openModal = (prefillData = {}) => {
      const inputsContent = generateInputsContent(prefillData);
      const modalHTML = generateModalHTML(inputsContent);
      document.body.insertAdjacentHTML("beforeend", modalHTML);
      const modal = document.getElementById("asset-modal");
      modal.showModal();
      // modal.style.display = "block";
      modal.setAttribute("aria-hidden", "false");
      // modal.querySelector(".modal-content").focus();
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
        // modal.style.display = "none";
        modal.setAttribute("aria-hidden", "true");
        modal.close();
        document.body.classList.remove("no-scroll");
        // document.getElementById("accomodation-button").focus();
      }
    };

    const clearStoredModalFormAssetData = () => {
      chosenAssetFormData.splice(0, chosenAssetFormData.length);
      isValid = false;
      const customEvent = new CustomEvent("isValidFalse", {
        detail: { chosenAssets: [], chosenAssetFormData },
        bubbles: true,
      });
      document.dispatchEvent(customEvent);
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
      clearStoredModalFormAssetData();
      // Reload the page
      location.reload();
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
      clearStoredModalFormAssetData();
    };

    const handleModalAssetFormSubmit = (event) => {
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
      document.getElementById("asset-chooser-interface").innerHTML = `
        <h2>Thank you</h2>
        <h3>The asset information has been added to your case.</h3>
        <p>You entered:</p>
        <ul>
          ${chosenAssetFormData
            .map(
              (asset) =>
                `<li><strong>${asset.key}</strong>: ${asset.value}</li>`
            )
            .join("")}
        </ul>
        <button
          id="cancel-asset-selection-button"
          class="link-button"
        >
          Cancel
        </button>
         <button
          id="edit-asset-selection-button"
          class="link-button"
        >
          Edit
        </button>
      `;
      closeModal();
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
           <div id="accomodation-button-container">
         <span id="button-hint">Please click below if you need assistance.</span>
         <br>
          <button
            style="margin-top: 5px; margin-bottom: 5px;" 
            id="accomodation-button"
            class="link-button"
            aria-label="Click here to select assets if you are using a screen reader and are unable to select assets on the map."
          >
            <span class="glyphicons-svg glyphicons-svg-outstretched "></span>
            Accessiblity Options
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

// define the custom component after the page has loaded
document.addEventListener("DOMContentLoaded", () => {
  customElements.define(
    "asset-chooser-container",
    AssetChooserContainerComponent
  );
});

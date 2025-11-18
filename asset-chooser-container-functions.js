 // import required state variables from asset-chooser-state.js
import {
  featureLayers,
  chosenAssets,
  chosenAssetFormData,
  isValid,
  setIsValid,
  isSketchEnabled,
  setIsSketchEnabled,
  isSelectEnabled,
  setIsSelectEnabled,
} from "./asset-chooser-state.js";
// import required functions from asset-chooser-functions.js
import { secureChosenAssets } from "./asset-chooser-functions.js";
// import initializeMap function from map-initialization.js
import { initializeMap } from "./asset-chooser-initialize-map.js";
const generateInputsContent = (prefillData = {}) => {
  return featureLayers
    .map((layer) => {
      const isRequired =
        layer.layerProperties.minimumAssetsRequired >= 1 ? "required" : "";
      const layerName = layer.layerProperties.layerName;
      const formattedLayerName = layer.layerProperties.formattedLayerName;
      const prefillValue = prefillData[formattedLayerName] || "";
      return `
        <div>
          <label for="${layer.layerProperties.layerName}">
            Enter information on any ${formattedLayerName} related to your request.
          </label>
          <p>
            <input
              size="60"
              type="text"
              name="${formattedLayerName}"
              id="${layerName}"
              value="${prefillValue}"
              ${isRequired}
            >
          </p>
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
          <h2 id="accomodation-title">
            Enter the assets required for your request.
          </h2>
          <p>
            <em>
              Please note that this form should only be used if you are unable to select and submit assets through the map. If you are able to use the map, please close this window and return to the map to make your selections.
            </em>
          </p>
          <p id="accomodation-subtitle">
            Please be as detailed as possible.
          </p>
        </div>
        <div class="modal-body">
          <form id="modal-asset-form">
            ${inputsContent}
            <button
              id="accomodation-asset-submission-button"
              type="submit"
              class="link-button"
              aria-label="Click this button to submit the asset information you entered."
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
  modal.addEventListener("close", () => {
    document.body.classList.remove("no-scroll");
  });
};

const closeModal = () => {
  const modal = document.getElementById("asset-modal");
  if (modal) {
    modal.close();
  }
};

const clearStoredModalFormAssetData = () => {
  chosenAssetFormData.splice(0, chosenAssetFormData.length);
  setIsValid(false);
  secureChosenAssets();
};

const handleCancelSelectionsClick = () => {
  const existingModal = document.getElementById("asset-modal");
  if (existingModal) {
    existingModal.close();
  }
  const container = document.querySelector("asset-chooser-container");
  if (container && typeof container.connectedCallback === "function") {
    container.connectedCallback(); // Re-render the component
  }
  initializeMap();
  // Clear stored data
  clearStoredModalFormAssetData();
};

const handleAssetEditButtonClick = () => {
  // Create a prefill data object from chosenAssetFormData
  const prefillData = chosenAssetFormData.reduce((acc, { key, value }) => {
    acc[key] = value;
    return acc;
  }, {});
  // console.log("Prefill Data:", prefillData);
  // Remove the existing modal if it exists
  const existingModal = document.getElementById("asset-modal");
  if (existingModal) {
    existingModal.remove();
  }
  // Call openModal with prefilled data
  openModal(prefillData);
};

const handleModalAssetFormSubmit = (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  if (chosenAssets.length > 0) {
    // remove assets from chosenAssets array
    chosenAssets.splice(0, chosenAssets.length);
  }
  if (chosenAssetFormData.length > 0) {
    chosenAssetFormData.splice(0, chosenAssetFormData.length);
  }
  formData.forEach((value, key) => {
    chosenAssetFormData.push({ key, value });
  });
  setIsValid(true);
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
  const container = document.querySelector("asset-chooser-container");
  const title = container?.getAttribute("title") || "";
  const assetChooserInterface = document.getElementById("asset-chooser-interface")
  assetChooserInterface.innerHTML = `
    <h2 id="asset-chooser-title">${title}</h2>
    <h3>The asset information has been added to your case.</h3>
    <p>You entered:</p>
    <ul>
      ${chosenAssetFormData
        .map(
          (asset) =>
            `<li><strong>${asset.key}</strong>: ${
              asset.value
                ? asset.value
                : `Nothing entered for ${asset.key} layer`}
              </li>`
          )
        .join("")}
     </ul>
     <button
       type="button"
       id="edit-asset-selection-button"
       class="link-button"
     >
       Edit Entry
     </button>
     <button
       type="button"
       id="cancel-asset-selection-button"
       class="link-button"
     >
       Cancel Entry and Return to Map
     </button>
     <em>
       <p>
         Please note that this form should only be used if you are unable to select and submit assets through the map. If you are able to use the map, please cancel your entry and return to the map to make your selections.
       </p>
     </em>
  `;
  closeModal();
  document
    .getElementById("asset-chooser-interface")
    .scrollIntoView({ behavior: "smooth", block: "start" });
  // Add event listener for the dynamically created cancel button
  const cancelSelectionsButton = document.querySelector(
    "#cancel-asset-selection-button"
  );
  if (cancelSelectionsButton) {
    cancelSelectionsButton.addEventListener(
      "click",
      handleCancelSelectionsClick
    );
  }
  const editSelectionsButton = document.querySelector(
    "#edit-asset-selection-button"
  );
  if (editSelectionsButton) {
    editSelectionsButton.addEventListener("click", handleAssetEditButtonClick);
  }
};
// export for use in asset-chooser-container.js
export const handleAccomodationButtonClick = () => {
  if (chosenAssetFormData.length > 0) {
    // remove assets from chosenAssetFormData array
    chosenAssetFormData.splice(0, chosenAssetFormData.length);
  }
  openModal();
};

export const enableSketchMode = (isSketchEnabled) => {
  if (isSketchEnabled) {
  setIsSketchEnabled(true);
  // console.log("Sketch mode enabled");
  } else {
    setIsSketchEnabled(false);
    // console.log("Sketch mode disabled");
  }
}

export const enableSelectMode = (isSelectEnabled) => {
  if (isSelectEnabled) {
    setIsSelectEnabled(true);
    // console.log("Select mode enabled");
  } else {
    setIsSelectEnabled(false);
    // console.log("Select mode disabled");
  }
}
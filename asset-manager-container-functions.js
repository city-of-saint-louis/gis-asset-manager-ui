// import required state variables from asset-manager-state.js
import {
  featureLayers,
  graphicLayers,
  chosenAssets,
  // createdAssets,
  chosenAssetFormData,
  createdAssetFormData,
  isValid,
  setIsValid,
  setCreatedAssetsAreValid,
  getCreatedAssetsAreValid,
  // isSketchEnabled,
  setIsSketchEnabled,
  // isSelectEnabled,
  setIsSelectEnabled,
} from "./asset-manager-state.js";
// import required functions from asset-manager-functions.js
import { secureChosenAssets } from "./asset-manager-functions.js";
// import initializeMap function from map-initialization.js
import { initializeMap } from "./asset-manager-initialize-map.js";

const handleAddAssetInputButtonClick = (event) => {
  if (event.target.classList.contains("add-asset-input-button")) {
    const layerName = event.target.dataset.layer;
    const assetType = event.target.dataset.type;
    console.log('dataset', event.target);
    const allMapLayers = [...featureLayers, ...graphicLayers];
    console.log('allMapLayers', allMapLayers);
    const currentLayer = allMapLayers.find(
      (layer) => layer.layerProperties.layerName === layerName
    );
    console.log('currentLayer', currentLayer);
    const maxInputs = currentLayer ? currentLayer.maxAssetsAllowed : 0;
    console.log('maxInputs', maxInputs);
    const minInputsRequired = currentLayer ? currentLayer.minAssetsRequired : 0;
    console.log('minInputsRequired', minInputsRequired);
    // let currentNumOfInputs = minInputsRequired;
    // currentNumOfInputs ++;
    // console.log('currentNumOfInputs', currentNumOfInputs);
   
    let layer;
    if (assetType === "selected") {
      layer = featureLayers.find(
        (layer) => layer.layerProperties.layerName === layerName,
      );
    } else if (assetType === "sketched") {
      layer = graphicLayers.find(
        (layer) => layer.layerProperties.layerName === layerName,
      );
    }
    // console.log("Found layer:", layer);
    if (layer != null) {
      const inputContainer = document.getElementById(
        `${layerName}-input-container`,
      );
      let numOfAddedInputs = document.querySelectorAll(`.${layerName}-added-input`).length;
      let currentNumOfInputs = numOfAddedInputs + minInputsRequired;
      console.log('currentNumOfInputs', currentNumOfInputs);
      if (currentNumOfInputs < maxInputs) {
      const newInput = document.createElement("input");
      newInput.type = "text";
      newInput.name = layer.layerProperties.formattedLayerName;
      newInput.id = `${layerName}-${inputContainer.querySelectorAll("input").length}`;
      newInput.size = 60;
      newInput.classList.add(`accessible-accommodation-input`, `${layerName}-added-input`);
      inputContainer.appendChild(newInput);
      }
      else {
        alert(`Maximum number of inputs (${maxInputs}) reached for ${layerName}`);
      }
    }
  }
};

document.addEventListener("click", handleAddAssetInputButtonClick);

const generateInputsContent = (prefillData = {}) => {
  // console.log("featureLayers:", featureLayers);
  return featureLayers
    .map((layer) => {
      // console.log("Processing layer:", layer);
      const isRequired =
        layer.layerProperties.minimumAssetsRequired >= 1 ? "required" : "";
      const numRequired = layer.layerProperties.minAssetsRequired;
      const layerName = layer.layerProperties.layerName;
      const formattedLayerName = layer.layerProperties.formattedLayerName;
      const prefillValue = prefillData[formattedLayerName] || "";
      const numOfInputs = numRequired > 0 ? numRequired : 1;
      // console.log(`Layer ${layerName} requires ${numRequired} assets.`);
      return `
        <div>
          <label for="${layerName}">
            Enter information on any ${formattedLayerName} related to your request.
          </label>
          <p>
            <p class="accessible-accommodation-num-assets-required">
              ${numRequired} required for ${formattedLayerName}
            </p>
            <div class="accessible-accommodation-input-container" id="${layerName}-input-container">
            ${Array.from({ length: numOfInputs })
              .map(
                (_, index) => `
              <input
                class="accessible-accommodation-input"
                size="60"
                type="text"
                name="${formattedLayerName}"
                id="${layerName}-${index}"
                value="${prefillValue}"
                ${isRequired}
              >
            `,
              )
              .join("")}
            </div>
          </p>
          <button type="button" class="add-asset-input-button" data-layer="${layerName}" data-type="selected" aria-label="Add ${formattedLayerName} input"
          >
            Add input for ${formattedLayerName}
          </button>
        </div>
      `;
    })
    .join("");
};

// const generateSketchLayerInputsContent = (prefillData = {}) => {
//   console.log("graphicLayers:", graphicLayers);
//   return graphicLayers
//     .map((layer) => {
//       console.log("Processing sketch layer:", layer);
//       const isRequired =
//         layer.layerProperties.minimumAssetsRequired >= 1 ? "required" : "";
//       const numRequired = layer.layerProperties.minAssetsRequired;
//       const layerName = layer.layerProperties.layerName;
//       const formattedLayerName = layer.layerProperties.formattedLayerName;
//       const prefillValue = prefillData[formattedLayerName] || "";
//       console.log(`Sketch layer ${layerName} requires ${numRequired} assets.`);
//       return `
//         <div>
//           <label for="${layerName}">
//             Enter information on any ${formattedLayerName} related to your request.
//           </label>
//           <p>
//             ${Array.from({ length: numRequired })
//               .map(
//                 (_, index) => `
//               <input
//                 size="60"
//                 type="text"
//                 name="${formattedLayerName}"
//                 id="${layerName}-${index}"
//                 value="${prefillValue}"
//                 ${isRequired}
//               >
//             `
//               )
//               .join("")}
//           </p>
//         </div>
//       `;
//     })
//     .join("");
// };

const generateSketchLayerInputsContent = (prefillData = {}) => {
  console.log("graphicLayers:", graphicLayers);
  return graphicLayers
    .map((layer) => {
      const isRequired =
        layer.layerProperties.minimumAssetsRequired >= 1 ? "required" : "";
      const numRequired = layer.layerProperties.minAssetsRequired;
      const layerName = layer.layerProperties.layerName;
      const formattedLayerName = layer.layerProperties.formattedLayerName;
      const prefillValue = prefillData[formattedLayerName] || "";
      const numOfInputs = numRequired > 0 ? numRequired : 1;
      return `
        <div>
          <label for="${layerName}">
            Enter information on any ${formattedLayerName} related to your request.
          </label>
          <p>
            <p class="accessible-accommodation-num-assets-required">
              ${numRequired} required for ${formattedLayerName}
            </p>
            <div class="accessible-accommodation-input-container" id="${layerName}-input-container">
            ${Array.from({ length: numOfInputs })
              .map(
                (_, index) => `
              <input
                class="accessible-accommodation-input"
                size="60"
                type="text"
                name="${formattedLayerName}"
                id="${layerName}-${index}"
                value="${prefillValue}"
                ${isRequired}
              >
            `,
              )
              .join("")}
            </div>
          </p>
          <button type="button" class="add-asset-input-button" data-layer="${layerName}" data-type="sketched" aria-label="Add ${formattedLayerName} input"
          >
            Add input for ${formattedLayerName}
          </button>
        </div>
      `;
    })
    .join("");
};

const generateModalHTML = (inputsContent, sketchInputsContent) => {
  return `
    <dialog id="asset-modal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <button class="close" type="button" aria-label="Close">&times;</button>
          <h1 id="accomodation-title">
            Enter the assets required for your request.
          </h1>
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
            ${sketchInputsContent}
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
  const sketchInputsContent = generateSketchLayerInputsContent(prefillData);
  const modalHTML = generateModalHTML(inputsContent, sketchInputsContent);
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
  createdAssetFormData.splice(0, createdAssetFormData.length);
  setIsValid(false);
  setCreatedAssetsAreValid(false);
  secureChosenAssets();
};

const handleCancelSelectionsClick = () => {
  const existingModal = document.getElementById("asset-modal");
  if (existingModal) {
    existingModal.close();
  }
  const container = document.querySelector("asset-manager-container");
  if (container && typeof container.connectedCallback === "function") {
    container.connectedCallback(); // Re-render the component
  }
  initializeMap();
  // Clear stored data
  clearStoredModalFormAssetData();
};

const handleAssetEditButtonClick = () => {
  // Create a prefill data object from both chosenAssetFormData and createdAssetFormData
  const prefillData = {};
  chosenAssetFormData.forEach(({ key, value }) => {
    prefillData[key] = value;
  });
  createdAssetFormData.forEach(({ key, value }) => {
    prefillData[key] = value;
  });
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
  if (createdAssetFormData.length > 0) {
    createdAssetFormData.splice(0, createdAssetFormData.length);
  }
  formData.forEach((value, key) => {
    chosenAssetFormData.push({ key, value });
  });
  setIsValid(true);
  setCreatedAssetsAreValid(true);
  // Dispatch custom event when isValid becomes true
  const createdAssetsAreValid = getCreatedAssetsAreValid();
  // console.log(
  //   "isValid:",
  //   isValid,
  //   "createdAssetsAreValid:",
  //   createdAssetsAreValid,
  // );
  if (isValid && createdAssetsAreValid) {
    const customEvent = new CustomEvent("isValidTrue", {
      detail: { chosenAssets: [], chosenAssetFormData },
      bubbles: true,
    });
    const createdAssetsAreValidEvent = new CustomEvent(
      "createdAssetsAreValidIsTrue",
      {
        detail: { createdAssets: createdAssetFormData },
        bubbles: true,
      },
    );
    document.dispatchEvent(customEvent);
    document.dispatchEvent(createdAssetsAreValidEvent);
  }
  // Clear the form
  event.target.reset();
  const container = document.querySelector("asset-manager-container");
  const title = container?.getAttribute("title") || "";
  const titleHeadingLevel =
    container?.getAttribute("title-heading-level") || "2";
  const subHeadingLevel = (() => {
    const level = parseInt(titleHeadingLevel, 10);
    if (isNaN(level) || level < 2) return "3";
    if (level >= 6) return "6";
    return (level + 1).toString();
  })();
  const assetManagerInterface = document.getElementById(
    "asset-manager-interface",
  );
  assetManagerInterface.innerHTML = `
    <h${titleHeadingLevel} id="asset-manager-title">${title}</h${titleHeadingLevel}>
    <h${subHeadingLevel}>The asset information has been added to your case.</h${subHeadingLevel}>
    <p>You entered:</p>
    <ul>
      ${[...chosenAssetFormData, ...createdAssetFormData]
        .map(
          (asset) =>
            `<li><strong>${asset.key}</strong>: ${asset.value ? asset.value : `Nothing entered for ${asset.key} layer`}
         </li>`,
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
    .getElementById("asset-manager-interface")
    .scrollIntoView({ behavior: "smooth", block: "start" });
  // Add event listener for the dynamically created cancel button
  const cancelSelectionsButton = document.querySelector(
    "#cancel-asset-selection-button",
  );
  if (cancelSelectionsButton) {
    cancelSelectionsButton.addEventListener(
      "click",
      handleCancelSelectionsClick,
    );
  }
  const editSelectionsButton = document.querySelector(
    "#edit-asset-selection-button",
  );
  if (editSelectionsButton) {
    editSelectionsButton.addEventListener("click", handleAssetEditButtonClick);
  }
};
// export for use in asset-manager-container.js
export const handleAccomodationButtonClick = () => {
  if (chosenAssetFormData.length > 0) {
    // remove assets from chosenAssetFormData array
    chosenAssetFormData.splice(0, chosenAssetFormData.length);
  }
  if (createdAssetFormData.length > 0) {
    createdAssetFormData.splice(0, createdAssetFormData.length);
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
};

export const enableSelectMode = (isSelectEnabled) => {
  if (isSelectEnabled) {
    setIsSelectEnabled(true);
    // console.log("Select mode enabled");
  } else {
    setIsSelectEnabled(false);
    // console.log("Select mode disabled");
  }
};

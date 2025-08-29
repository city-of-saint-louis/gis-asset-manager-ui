// UI related functions
// import needed state variables
import { 
  validLayers, 
  isValid,
  setIsValid,
  featureLayers, 
  chosenAssets,
  allMapLayerIds 
} from "./asset-chooser-state.js";
// function to render information about the assets that have been selected
const renderSelectedAssetLabels = () => {
  const selectedLayerAssetListArray = document.querySelectorAll(
    ".highlighted-asset-data-list"
  );
  // Clear existing list items before appending new ones
  selectedLayerAssetListArray.forEach((list) => {
    list.innerHTML = "";
  });
  chosenAssets.forEach((asset) => {
    selectedLayerAssetListArray.forEach((selectedLayerAssetList) => {
      if (asset.layerId === selectedLayerAssetList.id) {
        let assetLabel = asset.assetLabel;
        if (
          asset.assetAttributes.Road_Type &&
          asset.assetAttributes.Road_Type === "Alley"
        ) {
          assetLabel = `Alley`;
        }
        if (assetLabel.includes("null")) {
          assetLabel = "Asset data unavailable";
        }
        const assetLabelListItem = document.createElement("li");
        assetLabelListItem.setAttribute("id", asset.internalAssetId);
        assetLabelListItem.innerHTML = `
          <span
            title="You have selected ${assetLabel}"
          >
            ${assetLabel}
          </span>
          <button
            type="button"
            id="remove-${asset.internalAssetId}-btn"
            class="pull-right link-button small-button red-button transparent-button remove-asset-btn"
            title="Remove ${assetLabel}"
          >
            <span class="glyphicons glyphicons-remove"></span>
            Remove
            <span class="sr-only">${assetLabel}</span>
          </button>
        `;
        selectedLayerAssetList.appendChild(assetLabelListItem);

        const removeAssetBtn = document.getElementById(
          `remove-${asset.internalAssetId}-btn`
        );

        removeAssetBtn.addEventListener("click", () => {
          chosenAssets.forEach((asset) => {
            if (asset.internalAssetId === assetLabelListItem.id) {
              asset.highlightSelect.remove();
              const listItemToRemove = document.getElementById(
                asset.internalAssetId
              );
              if (listItemToRemove) listItemToRemove.remove();
              const hightlightToRemove = chosenAssets.findIndex(
                (a) => a.internalAssetId === asset.internalAssetId
              );
              chosenAssets.splice(hightlightToRemove, 1);
              validateLayerSelections();
              selectedLayerAssetListArray.forEach((list) => {
                if (list.innerHTML === "") {
                  list.innerHTML = `<li>None selected</li>`;
                }
              });
            }
          });
        });
      }
    });
  });
  selectedLayerAssetListArray.forEach((list) => {
    if (list.innerHTML === "") {
      list.innerHTML = `<li>None selected</li>`;
    }
  });
};

// function to render the validity message for asset selection based on assets selected
export const renderValidityMessage = () => {
  const validityMessage = document.getElementById("validity-message");
  let makeMinimunRequireMessage = `Select `;
  if (isValid) {
    validityMessage.innerHTML = `Asset selection is <span class="label label-success">valid for submission</span>`;
    validityMessage.setAttribute("aria-live", "assertive");
  } else {
    // validityMessage.classList.remove("label", "label-success");
    validityMessage.removeAttribute("aria-live");
    featureLayers.forEach((mapLayer) => {
      const layerAssetMin = parseInt(
        mapLayer.layerProperties.minimumAssetsRequired
      );
      const totalLayerAssetsSelected = chosenAssets.filter(
        (asset) =>
          asset.layerId ===
          `${mapLayer.layerProperties.layerName}-${mapLayer.id}`
      ).length;
      // Replace underscores and dashes with spaces in layerName
      const layerName = mapLayer.layerProperties.layerName.replace(
        /[_-]/g,
        " "
      );
      if (layerAssetMin === 1 && totalLayerAssetsSelected < layerAssetMin) {
        makeMinimunRequireMessage += `<span class="label label-error"><strong>${layerAssetMin} from ${layerName} Layer</strong></span>, `;
      }
      if (layerAssetMin > 1 && totalLayerAssetsSelected < layerAssetMin) {
        makeMinimunRequireMessage += `at least <span class="label label-error"><strong>${layerAssetMin} from ${layerName} Layer</strong></span>, `;
      }
      if (layerAssetMin === 1 && totalLayerAssetsSelected === layerAssetMin) {
        makeMinimunRequireMessage += `<span class="label label-success"><strong>${layerAssetMin} from ${layerName} Layer</strong></span>, `;
      }
      if (layerAssetMin > 1 && totalLayerAssetsSelected >= layerAssetMin) {
        makeMinimunRequireMessage += `at least <span class="label label-success"><strong>${layerAssetMin} from $layerName} Layer</strong></span>, `;
      }
    });

    // Remove the last comma and space if present
    if (makeMinimunRequireMessage.endsWith(", ")) {
      makeMinimunRequireMessage = makeMinimunRequireMessage.slice(0, -2);
    }
    // Replace the last comma with ', and '
    const lastCommaIndex = makeMinimunRequireMessage.lastIndexOf(", ");
    if (lastCommaIndex !== -1) {
      makeMinimunRequireMessage = `${makeMinimunRequireMessage.substring(
        0,
        lastCommaIndex
      )}, and ${makeMinimunRequireMessage.substring(lastCommaIndex + 2)}`;
    }
    makeMinimunRequireMessage = makeMinimunRequireMessage.replace(
      /at least (\d+ \w+)/g,
      "at least <strong>$1</strong>"
    );
    validityMessage.innerHTML = `${makeMinimunRequireMessage}`;
  }
};

// validation functions
// function to validate asset selection for each layer
const validateLayerSelections = () => {
  featureLayers.forEach((mapLayer) => {
    const layerId = `${mapLayer.layerProperties.layerName}-${mapLayer.id}`;
    const layerAssetMin = parseInt(
      mapLayer.layerProperties.minimumAssetsRequired
    );
    const layerAssetMax = parseInt(
      mapLayer.layerProperties.maximumAssetsRequired
    );
    const totalLayerAssetsSelected = chosenAssets.filter(
      (asset) =>
        asset.layerId === `${mapLayer.layerProperties.layerName}-${mapLayer.id}`
    ).length;
    const minAssetMessageElement = document.getElementById(
      `${layerId}-min-asset-required-message`
    );
    const maxAssetMessageElement = document.getElementById(
      `${layerId}-max-asset-required-message`
    );
    if (layerAssetMin === 0 && totalLayerAssetsSelected === 0) {
      minAssetMessageElement.innerHTML = `No selection required.`;
      minAssetMessageElement.classList.add("label", "label-success");
      if (!validLayers.includes(layerId)) validLayers.push(layerId);
    }
    if (layerAssetMin === 0 && totalLayerAssetsSelected > 0) {
      minAssetMessageElement.innerHTML = `${totalLayerAssetsSelected} selected. None required`;
      minAssetMessageElement.classList.add("label", "label-success");
      if (!validLayers.includes(layerId)) validLayers.push(layerId);
    }
    if (layerAssetMin > 0 && totalLayerAssetsSelected >= layerAssetMin) {
      minAssetMessageElement.innerHTML = `${totalLayerAssetsSelected} selected. At least ${layerAssetMin} required.`;
      minAssetMessageElement.classList.add("label", "label-success");
      minAssetMessageElement.classList.remove("label-error");
      if (!validLayers.includes(layerId)) validLayers.push(layerId);
    }
    if (layerAssetMin === 1 && totalLayerAssetsSelected === layerAssetMin) {
      minAssetMessageElement.innerHTML = `${totalLayerAssetsSelected} selected. ${layerAssetMin} required.`;
      minAssetMessageElement.classList.add("label", "label-success");
      minAssetMessageElement.classList.remove("label-error");
      if (!validLayers.includes(layerId)) validLayers.push(layerId);
    }
    if (layerAssetMin === 1 && totalLayerAssetsSelected < layerAssetMin) {
      minAssetMessageElement.innerHTML = `${layerAssetMin} required.`;
      minAssetMessageElement.classList.remove("label", "label-success");
      minAssetMessageElement.classList.add("label", "label-error");
      const layerToRemove = validLayers.findIndex((l) => l === layerId);
      if (layerToRemove !== -1) validLayers.splice(layerToRemove, 1);
    }
    if (layerAssetMin > 1 && totalLayerAssetsSelected < layerAssetMin) {
      minAssetMessageElement.innerHTML = `At least ${layerAssetMin} required.`;
      minAssetMessageElement.classList.remove("label", "label-success");
      minAssetMessageElement.classList.add("label", "label-error");
      const layerToRemove = validLayers.findIndex((l) => l === layerId);
      if (layerToRemove !== -1) validLayers.splice(layerToRemove, 1);
    }
    if (layerAssetMax > 0 && totalLayerAssetsSelected === layerAssetMax) {
      maxAssetMessageElement.innerHTML = `Maximum of ${layerAssetMax} reached.`;
      maxAssetMessageElement.classList.add("label", "label-default");
    }
    if (layerAssetMax > 0 && totalLayerAssetsSelected < layerAssetMax) {
      maxAssetMessageElement.classList.add("label", "label-default");
      maxAssetMessageElement.innerHTML = `Select a maximum of ${layerAssetMax}.`;
    }
  });
  validateAssetSelection();
};

// function to validate asset selection for all layers
const validateAssetSelection = () => {
  if (validLayers.length !== allMapLayerIds.length) {
    // isValid = false;
    setIsValid(false);
  }
  const sortedValidLayers = [...validLayers].sort();
  const sortedAllMapLayerIds = [...allMapLayerIds].sort();
  const stringifyValidLayers = JSON.stringify(sortedValidLayers);
  const stringifyAllMapLayerIds = JSON.stringify(sortedAllMapLayerIds);
  if (stringifyValidLayers === stringifyAllMapLayerIds) {
    // isValid = true;
    setIsValid(true);
    // Dispatch the chosenAssets to the parent application when isValid is true
    dispatchChosenAssets(chosenAssets);
  } else {
    setIsValid(false);
    // Secure the chosenAssets from parent application when isValid is false
    secureChosenAssets();
  }
  renderValidityMessage();
};


// Dispatch the chosenAssets to the parent application
export const dispatchChosenAssets = (chosenAssets) => {
  const event = new CustomEvent("isValidTrue", {
    detail: { chosenAssets, chosenAssetFormData: [] },
  });
  document.dispatchEvent(event);
};

// custom event listener to signal when chosenAssets are not valid
export const secureChosenAssets = () => {
  const event = new CustomEvent("isValidFalse", { detail: { isValid } });
  document.dispatchEvent(event);
};

// Function to highlight and handle a selected asset
export const highlightSelectedAsset = (response, view, highlightedSelection) => {
  const graphic = response.results[0].graphic;
  const layerProperties = response.results[0].layer.layerProperties;
  const layerAssetIDFieldName = layerProperties.layerAssetIDFieldName;
  const layerName = graphic.layer.layerProperties.layerName;
  const layerNameToDisplay = layerName.replace(/_/g, " ");
  const labelMaskValue = eval(
    `"${graphic.layer.layerProperties.labelMask.replace(
      /\{([^}]+)\}/g,
      (match, p1) => `" + graphic.attributes.${p1} + "`
    )}"`
  );
  const layerId = graphic.layer.id;
  if (
    !chosenAssets.find(
      (a) =>
        a.internalAssetId ===
        `${graphic.layer.layerProperties.layerName}-${graphic.attributes[layerAssetIDFieldName]}`
    )
  ) {
    view.whenLayerView(graphic.layer).then((layerView) => {
      const mapDataLayerId = `${graphic.layer.layerProperties.layerName}-${graphic.layer.id}`;
      const layerAssetMax = layerProperties.maximumAssetsRequired;
      const totalLayerAssetsSelected = chosenAssets.filter(
        (h) =>
          h.layerId ===
          `${graphic.layer.layerProperties.layerName}-${graphic.layer.id}`
      ).length;
      if (layerAssetMax > 0 && totalLayerAssetsSelected >= layerAssetMax) {
        document
          .getElementById(`${mapDataLayerId}-max-asset-required-message`)
          .classList.remove("label-default");
        document
          .getElementById(`${mapDataLayerId}-max-asset-required-message`)
          .classList.add("label-error");
        setTimeout(() => {
          alert(
            `You have already selected the maximum of ${layerAssetMax} asset(s) from the ${layerNameToDisplay} layer.`
          );
          document
            .getElementById(`${mapDataLayerId}-max-asset-required-message`)
            .classList.remove("label-error");
          document
            .getElementById(`${mapDataLayerId}-max-asset-required-message`)
            .classList.add("label-default");
        }, 500);
        return;
      }
      highlightedSelection = layerView.highlight(graphic);
      const chosenAsset = {
        assetAttributes: graphic.attributes,
        internalAssetId: `${graphic.layer.layerProperties.layerName}-${graphic.attributes[layerAssetIDFieldName]}`,
        assetId: `${graphic.attributes[layerAssetIDFieldName]}`,
        objectId: graphic.attributes.OBJECTID,
        assetIdType: layerAssetIDFieldName,
        assetLabel: labelMaskValue,
        assetType: graphic.layer.layerProperties.layerName,
        layerData: graphic.layer,
        layerId: `${graphic.layer.layerProperties.layerName}-${layerId}`,
        layerName: graphic.layer.layerProperties.layerName,
        layerTitle: graphic.layer.title,
        layerClassUrl: graphic.layer.layerProperties.layerClassUrl,
        layerAssetMax: graphic.layer.layerProperties.maximumAssetsRequired,
        highlightSelect: highlightedSelection,
      };
      chosenAssets.push(chosenAsset);
      renderSelectedAssetLabels();
      validateLayerSelections();
    });
  } else {
    chosenAssets.forEach((asset) => {
      if (
        asset.internalAssetId ===
        `${graphic.layer.layerProperties.layerName}-${graphic.attributes[layerAssetIDFieldName]}`
      ) {
        asset.highlightSelect.remove();
      }
    });
    const hightlightToRemove = chosenAssets.findIndex(
      (a) =>
        a.internalAssetId ===
        `${graphic.layer.layerProperties.layerName}-${graphic.attributes[layerAssetIDFieldName]}`
    );
    chosenAssets.splice(hightlightToRemove, 1);
    renderSelectedAssetLabels();
    validateLayerSelections();
  }
};
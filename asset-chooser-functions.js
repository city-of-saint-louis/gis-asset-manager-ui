// import state variables from asset-chooser-state.js
import {
  chosenAssets,
  allMapLayerIds,
  mapLayersToAdd,
  featureLayers,
  chosenAssetFormData,
  layersWithNoSelectionRequired,
  validLayers,
  currentView,
  setCurrentView,
  isValid,
  setIsValid,
} from "./asset-chooser-state.js";

// *** begin map related functions *** //
// destroy the previous map view
export const destroyPreviousMapView = () => {
  if (currentView) {
    currentView.destroy();
    setCurrentView(null);
  }
  // Remove any existing <arcgis-map> from #viewDiv
  const viewDiv = document.querySelector("#viewDiv");
  if (viewDiv) {
    const oldArcgisMap = viewDiv.querySelector("arcgis-map");
    if (oldArcgisMap) {
      viewDiv.removeChild(oldArcgisMap);
    }
    viewDiv.innerHTML = ""; 
  }
};

// clear the map data
export const clearMapData = () => {
  // empty the stored featureLayers array
  featureLayers.splice(0, featureLayers.length);
  // empty the stored chosenAssets array
  chosenAssets.splice(0, chosenAssets.length);
  // empty the stored chosenAssetFormData array
  chosenAssetFormData.splice(0, chosenAssetFormData.length);
  // empty the stored allMapLayerIds array
  allMapLayerIds.splice(0, allMapLayerIds.length);
  // empty the stored layersWithNoSelectionRequired array
  layersWithNoSelectionRequired.splice(0, layersWithNoSelectionRequired.length);
  // empty the stored validLayers array
  validLayers.splice(0, validLayers.length);
};

// event listener to capture layer data from map-layer.js
export const captureMapLayers = () => {
  document.addEventListener("layerDetailsProvided", (event) => {
    const mapLayer = event.detail;
    mapLayersToAdd.push(mapLayer);
  });
};

// hide or show layers on the map
export const hideOrShowLayer = () => {
  featureLayers.forEach((outerLayer) => {
    const formattedLayerName = outerLayer.layerProperties.formattedLayerName;
    const toggleLayerVisibilityButtons = document.querySelectorAll(
      ".toggleLayerVisibilityButton"
    );
    toggleLayerVisibilityButtons.forEach((toggleLayerVisibilityButton) => {
      toggleLayerVisibilityButton.addEventListener("click", () => {
        const layerId =
          toggleLayerVisibilityButton.getAttribute("att-layer-id");
        const spanElement = toggleLayerVisibilityButton.querySelector("span");
        if (
          `${outerLayer.layerProperties.layerName}-${outerLayer.id}` === layerId
        ) {
          if (outerLayer.visible) {
            outerLayer.visible = false;
            spanElement.innerHTML = `<span>Show</span>`;
            toggleLayerVisibilityButton.setAttribute(
              "aria-label",
              `Show ${formattedLayerName} layer`
            );
            toggleLayerVisibilityButton.setAttribute(
              "title",
              `Show ${formattedLayerName} layer`
            );
          } else {
            outerLayer.visible = true;
            spanElement.innerHTML = `<span>Hide</span>`;
            toggleLayerVisibilityButton.setAttribute(
              "aria-label",
              `Hide ${formattedLayerName} layer`
            );
            toggleLayerVisibilityButton.setAttribute(
              "title",
              `Hide ${formattedLayerName} layer`
            );
          }
        }
      });
    });
  });
};

// add map layers to the map
export const addMapLayer = ({
  mapLayer,
  FeatureLayer,
  reactiveUtils,
  map,
  view,
  allMapLayerIds,
  featureLayers,
  layersWithNoSelectionRequired,
}) => {
  const mapDataLayer = new FeatureLayer({
    url: mapLayer.layerClassUrl,
    minScale: mapLayer.minScale,
    maxScale: mapLayer.maxScale,
    layerProperties: {
      layerName: mapLayer.name,
      formattedLayerName: mapLayer.name.replace(/[-]/g, " "),
      layerClassUrl: mapLayer.layerClassUrl,
      layerAssetIDFieldName: mapLayer.layerAssetIDFieldName,
      labelMask: mapLayer.labelMask,
      minimumAssetsRequired: mapLayer.minimumSelections,
      maximumAssetsRequired: mapLayer.maximumSelections,
      minScale: mapLayer.minScale,
      maxScale: mapLayer.maxScale,
    },
    // labelingInfo: [
    //   {
    //     labelExpressionInfo: {
    //       expression: `$feature.${mapLayer.assetLabel}`,
    //     },
    //     symbol: {
    //       type: "text",
    //       color: "#1e526b",
    //       haloColor: "white",
    //       haloSize: "1px",
    //       font: {
    //         family: "Arial Unicode MS",
    //         size: 12,
    //         weight: "bold",
    //       },
    //     },
    //     placement:
    //       mapLayer.geometryType === "polyline"
    //         ? "center-along"
    //         : mapLayer.geometryType === "polygon"
    //         ? "always-horizontal"
    //         : mapLayer.geometryType === "point"
    //         ? "center-center"
    //         : "always-horizontal", // Fallback
    //   },
    // ],
  });
  mapDataLayer.outFields = ["*"];
  mapDataLayer.popupEnabled = false;
  const mapDataLayerId = `${mapDataLayer.layerProperties.layerName}-${mapDataLayer.id}`;
  allMapLayerIds.push(mapDataLayerId);
  featureLayers.push(mapDataLayer);
  map.add(mapDataLayer);
  const minAssetsRequired = parseInt(
    mapDataLayer.layerProperties.minimumAssetsRequired
  );
  const maxAssetsRequired = parseInt(
    mapDataLayer.layerProperties.maximumAssetsRequired
  );
  const layerName = mapDataLayer.layerProperties.layerName;
  const formattedLayerName = mapDataLayer.layerProperties.formattedLayerName;
  const layerDataDiv = document.getElementById("layer-data-div");
  const layerMinScale = mapDataLayer.minScale;
  const layerMaxScale = mapDataLayer.maxScale;
  if (minAssetsRequired === 0) {
    layersWithNoSelectionRequired.push(mapDataLayerId);
  }

  view.on("layerview-create", function (event) {
    if (event.layer === mapDataLayer) {
      monitorLayerVisibility(
        reactiveUtils,
        event.layerView,
        mapDataLayer,
        layerName,
        formattedLayerName,
        layerMinScale,
        layerMaxScale
      );
    }
  });

  layerDataDiv.innerHTML += `
    <div
      class="map-layer-data-container stat-container stat-medium"
    >
      <div 
        class="stat-title" 
        id="${layerName}-layer-selected-asset-container"
        aria-label="${formattedLayerName} Layer"
        title="${formattedLayerName} Layer"
      >
       <div>
         <span>
           <strong>
             ${formattedLayerName} Layer
           </strong>
         </span>
         <br>
         <span class="zoom-alert-span" id="${layerName}-zoom-alert-span" style="height: 14px; display: inline-block">
          ${layerMinScale > 0 ? `Zoom in to see this layer.` : ""}
         </span>
       </div>
        <button
          type="button"
          id="${layerName}-show-hide-layer-btn"
          class="toggleLayerVisibilityButton"
          att-layer-id="${layerName}-${mapDataLayer.id}"
          aria-label="Hide ${formattedLayerName} Layer" ${
    layerMinScale > 0 ? "disabled hidden" : ""
  } 
          title="Hide ${formattedLayerName} layer"
        >
          <span id="${layerName}-toggle-visibility-btn-text-span">
            ${layerMinScale > 0 ? `Show` : `Hide`}
          </span>
        </button>
      </div>
      <div 
        aria-live="polite"
        aria-atomic="true"
        class="asset-selection-requirements"
      >
        <span class="sr-only">Asset selection requirements and status for ${layerName} layer</span>
        ${
          minAssetsRequired === 0
            ? `
            <span id="${mapDataLayerId}-min-asset-required-message" title="No selection required">
              <span class="label label-success">
                No selection required
              </span>
            </span>
            `
            : minAssetsRequired === 1
            ? `
            <span id="${mapDataLayerId}-min-asset-required-message" title="${minAssetsRequired} selection required from ${formattedLayerName} layer">
              <span class="label label-error">
               ${minAssetsRequired} required
              </span>
            </span>
            `
            : `
            <span id="${mapDataLayerId}-min-asset-required-message" title="At least ${minAssetsRequired} selections required from ${formattedLayerName} layer">
              <span class="label label-error">
                At least ${minAssetsRequired} required
              </span>
            </span>
            `
        }
        ${
          maxAssetsRequired > 0
            ? `
            <span id="${mapDataLayerId}-max-asset-required-message" title="Select a maximum of ${maxAssetsRequired} from ${formattedLayerName} layer">
              <span class="label label-default">Select a maximum of ${maxAssetsRequired}
              </span>
            </span>`
            : ``
        }
      </div>
      <ul
        data-layer-name=${layerName}
        class="list-group highlighted-asset-data-list"
        id="${layerName}-${mapDataLayer.id}"
        aria-live="polite"
        aria-atomic="true"
      >
        <li 
          title="No assets selected from ${formattedLayerName} layer"
        >
          None selected
        </li>
      </ul>
    </div>
  `;
};

// monitor layer visibility based on scale and adjust ui accordingly, used in addMapLayer function no need to export
const monitorLayerVisibility = (
  reactiveUtils,
  layerView,
  mapDataLayer,
  layerName,
  formattedLayerName,
  layerMinScale,
  layerMaxScale
) => {
  reactiveUtils.watch(
    () => layerView.visibleAtCurrentScale,
    (visibleAtCurrentScale) => {
      const toggleLayerVisibilityButton = document.getElementById(
        `${layerName}-show-hide-layer-btn`
      );
      const toggleVisibilityBtnTextSpan = document.getElementById(
        `${layerName}-toggle-visibility-btn-text-span`
      );
      const zoomAlertSpan = document.getElementById(
        `${layerName}-zoom-alert-span`
      );

      if (zoomAlertSpan) {
        if (visibleAtCurrentScale) {
          zoomAlertSpan.textContent = ``;
          toggleLayerVisibilityButton.removeAttribute("disabled");
          toggleLayerVisibilityButton.removeAttribute("hidden");
          if (mapDataLayer.visible) {
            toggleVisibilityBtnTextSpan.textContent = `Hide`;
            toggleLayerVisibilityButton.setAttribute(
              "title",
              `Hide ${formattedLayerName} layer`
            );
          } else {
            toggleVisibilityBtnTextSpan.textContent = `Show`;
            toggleLayerVisibilityButton.setAttribute(
              "title",
              `Show ${formattedLayerName} layer`
            );
          }
        } else {
          zoomAlertSpan.textContent = `${
            layerMinScale > 0 ? `Zoom in to see this layer.` : ""
          } ${layerMaxScale > 0 ? `Zoom out to see this layer.` : ""}`;
          toggleLayerVisibilityButton.setAttribute("disabled", true);
          toggleLayerVisibilityButton.setAttribute("hidden", true);
        }
      }
    }
  );
};
// *** end map related functions *** //

// *** begin asset related functions *** //
// exported functions
// render the validity message for asset selection based on assets selected
export const renderValidityMessage = () => {
  const validityMessage = document.getElementById("validity-message");
  let makeMinimunRequireMessage = `Select `;
  if (isValid) {
    validityMessage.innerHTML = `Asset selection is <span class="label label-success">valid for submission</span>`;
    validityMessage.setAttribute("aria-live", "assertive");
  } else {
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
      const formattedLayerName = mapLayer.layerProperties.formattedLayerName;
      if (layerAssetMin === 1 && totalLayerAssetsSelected < layerAssetMin) {
        makeMinimunRequireMessage += `<span class="label label-error"><strong>${layerAssetMin} from ${formattedLayerName} layer</strong></span>, `;
      }
      if (layerAssetMin > 1 && totalLayerAssetsSelected < layerAssetMin) {
        makeMinimunRequireMessage += `at least <span class="label label-error"><strong>${layerAssetMin} from ${formattedLayerName} Layer</strong></span>, `;
      }
      if (layerAssetMin === 1 && totalLayerAssetsSelected === layerAssetMin) {
        makeMinimunRequireMessage += `<span class="label label-success"><strong>${layerAssetMin} from ${formattedLayerName} Layer</strong></span>, `;
      }
      if (layerAssetMin === 1 && totalLayerAssetsSelected > layerAssetMin) {
        makeMinimunRequireMessage += `<span class="label label-success"><strong>${layerAssetMin} from ${formattedLayerName} Layer</strong></span>, `;
      }
      if (layerAssetMin > 1 && totalLayerAssetsSelected >= layerAssetMin) {
        makeMinimunRequireMessage += `at least <span class="label label-success"><strong>${layerAssetMin} from ${formattedLayerName} Layer</strong></span>, `;
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

// dispatch the chosenAssets to the parent application
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

// highlight and handle a selected asset
export const highlightSelectedAsset = (
  response,
  view,
  highlightedSelection
) => {
  const graphic = response.results[0].graphic;
  const layerProperties = response.results[0].layer.layerProperties;
  const layerAssetIDFieldName = layerProperties.layerAssetIDFieldName;
  const layerName = graphic.layer.layerProperties.layerName;
  const formattedLayerName = graphic.layer.layerProperties.formattedLayerName;
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
        `${layerName}-${graphic.attributes[layerAssetIDFieldName]}`
    )
  ) {
    view.whenLayerView(graphic.layer).then((layerView) => {
      const mapDataLayerId = `${layerName}-${graphic.layer.id}`;
      const layerAssetMax = layerProperties.maximumAssetsRequired;
      const totalLayerAssetsSelected = chosenAssets.filter(
        (h) => h.layerId === `${layerName}-${graphic.layer.id}`
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
            `You have already selected the maximum of ${layerAssetMax} asset(s) from the ${formattedLayerName} layer.`
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
        internalAssetId: `${layerName}-${graphic.attributes[layerAssetIDFieldName]}`,
        assetId: `${graphic.attributes[layerAssetIDFieldName]}`,
        objectId: graphic.attributes.OBJECTID,
        assetIdType: layerAssetIDFieldName,
        assetLabel: labelMaskValue,
        assetType: graphic.layer.layerProperties.layerName,
        layerData: graphic.layer,
        layerId: `${layerName}-${layerId}`,
        layerName: layerName,
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

// non-exported functions
// render information about the assets that have been selected
// used in highlightSelectedAsset function, no need to export
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
            const formattedLayerName = asset.layerData.layerProperties.formattedLayerName;
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
                  list.innerHTML = `<li title="No assets selected from ${formattedLayerName} layer">None selected</li>`;
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
      list.innerHTML = `<li title="No assets selected from ${list.dataset.layerName.replace(/-/g, " ")} layer">None selected</li>`;
    }
  });
};

// validation functions / not exported
// validate asset selection for each individual layer, used in highlightSelectedAsset function
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

// validate total asset selection for all layers, used in validateLayerSelection function
const validateAssetSelection = () => {
  if (validLayers.length !== allMapLayerIds.length) {
    setIsValid(false);
  }
  const sortedValidLayers = [...validLayers].sort();
  const sortedAllMapLayerIds = [...allMapLayerIds].sort();
  const stringifyValidLayers = JSON.stringify(sortedValidLayers);
  const stringifyAllMapLayerIds = JSON.stringify(sortedAllMapLayerIds);
  if (stringifyValidLayers === stringifyAllMapLayerIds) {
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
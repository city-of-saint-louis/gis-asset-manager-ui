// This file holds the logic that provides functionality for the GIS Asset Chooser.
const defaultZoom = 12;
const defaultCenterX = -90.25;
const defaultCenterY = 38.64;
const defaultBaseMap = "topo-vector";
const defaultShowSearch = true;
const mapLayersToAdd = [];
const featureLayers = [];
const chosenAssets = [];
const chosenAssetFormData = [];
const allMapLayerIds = [];
const layersWithNoSelectionRequired = [];
const validLayers = [];
let isValid = false;

// functions to provide functionality for the GIS Asset Chooser
const hideOrShowLayer = () => {
  featureLayers.forEach((outerLayer) => {
    const layerName = outerLayer.layerProperties.layerName;
    const selectLayersElements = document.querySelectorAll(".selectLayers");
    selectLayersElements.forEach((selectLayer) => {
      selectLayer.addEventListener("click", () => {
        const layerId = selectLayer.getAttribute("att-layer-id");
        const spanElement = selectLayer.querySelector("span");
        if (
          `${outerLayer.layerProperties.layerName}-${outerLayer.id}` === layerId
        ) {
          if (outerLayer.visible) {
            outerLayer.visible = false;
            spanElement.classList.remove("glyphicons-eye-close");
            spanElement.classList.add("glyphicons-eye-open");
            spanElement.innerHTML = `<span class="sr-only">show ${layerName} layer</span>`;
            selectLayer.setAttribute("aria-label", `show ${layerName} layer`);
          } else {
            outerLayer.visible = true;
            spanElement.classList.remove("glyphicons-eye-open");
            spanElement.classList.add("glyphicons-eye-close");
            spanElement.innerHTML = `<span class="sr-only">hide ${layerName} layer</span>`;
            selectLayer.setAttribute("aria-label", `hide ${layerName} layer`);
          }
        }
      });
    });
  });
};

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
        const assetLabel = asset.assetLabel;
        const assetLabelListItem = document.createElement("li");
        assetLabelListItem.setAttribute("id", asset.internalAssetId);
        assetLabelListItem.innerHTML = `
          <span>
            ${assetLabel}
          </span>
          <button
            id="remove-${asset.internalAssetId}-btn"
            class="pull-right link-button small-button red-button transparent-button remove-asset-btn"
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
              validateNumberofAssetsSelected();
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

const validateNumberofAssetsSelected = () => {
  featureLayers.forEach((mapLayer) => {
    let isLayerValid = false;
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
      isLayerValid = true;
      if (!validLayers.includes(layerId)) validLayers.push(layerId);
    }

    if (layerAssetMin === 0 && totalLayerAssetsSelected > 0) {
      minAssetMessageElement.innerHTML = `${totalLayerAssetsSelected} selected. None required`;
      minAssetMessageElement.classList.add("label", "label-success");
      isLayerValid = true;
      if (!validLayers.includes(layerId)) validLayers.push(layerId);
    }

    if (layerAssetMin > 0 && totalLayerAssetsSelected >= layerAssetMin) {
      minAssetMessageElement.innerHTML = `${totalLayerAssetsSelected} selected. At least ${layerAssetMin} required.`;
      minAssetMessageElement.classList.add("label", "label-success");
      minAssetMessageElement.classList.remove("label-error");
      isLayerValid = true;
      if (!validLayers.includes(layerId)) validLayers.push(layerId);
    }

    if (layerAssetMin >= 0 && totalLayerAssetsSelected < layerAssetMin) {
      minAssetMessageElement.innerHTML = `At least ${layerAssetMin} required.`;
      minAssetMessageElement.classList.remove("label", "label-success");
      minAssetMessageElement.classList.add("label", "label-error");
      isLayerValid = false;
      const layerToRemove = validLayers.findIndex((l) => l === layerId);
      if (layerToRemove !== -1) validLayers.splice(layerToRemove, 1);
    }

    if (layerAssetMax > 0 && totalLayerAssetsSelected === layerAssetMax) {
      maxAssetMessageElement.innerHTML = `Maximum of ${layerAssetMax} reached.`;
    }

    if (layerAssetMax > 0 && totalLayerAssetsSelected < layerAssetMax) {
      maxAssetMessageElement.classList.add("label", "label-default");
      maxAssetMessageElement.innerHTML = `Select a maximum of ${layerAssetMax}.`;
    }
  });

  validateAssetSelection();
  renderValidityMessage();
};

const validateAssetSelection = () => {
  if (validLayers.length !== allMapLayerIds.length) {
    isValid = false;
  }
  const sortedValidLayers = [...validLayers].sort();
  const sortedAllMapLayerIds = [...allMapLayerIds].sort();
  const stringifyValidLayers = JSON.stringify(sortedValidLayers);
  const stringifyAllMapLayerIds = JSON.stringify(sortedAllMapLayerIds);
  if (stringifyValidLayers === stringifyAllMapLayerIds) {
    isValid = true;
    // Dispatch the chosenAssets to the parent application when isValid is true
    dispatchChosenAssets(chosenAssets);
  } else {
    isValid = false;
    // Secure the chosenAssets from parent application when isValid is false
    secureChosenAssets();
  }
};

const renderValidityMessage = () => {
  const validityMessage = document.getElementById("validity-message");
  let makeMinimunRequireMessage = `Select `;

  if (isValid) {
    validityMessage.innerHTML = "Asset selection is valid for submission";
    validityMessage.classList.add("label", "label-success");
    validityMessage.setAttribute("aria-live", "assertive");
  } else {
    validityMessage.classList.remove("label", "label-success");
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

      if (layerAssetMin >= 0 && totalLayerAssetsSelected < layerAssetMin) {
        makeMinimunRequireMessage += `at least <span class="label label-error"><strong>${layerAssetMin} from ${mapLayer.layerProperties.layerName} Layer</strong></span>, `;
      }

      if (layerAssetMin >= 0 && totalLayerAssetsSelected >= layerAssetMin) {
        makeMinimunRequireMessage += `at least <span class="label label-success"><strong>${layerAssetMin} from ${mapLayer.layerProperties.layerName} Layer</strong></span>, `;
      }
    });

    // Remove the last comma and space if present
    if (makeMinimunRequireMessage.endsWith(", ")) {
      makeMinimunRequireMessage = makeMinimunRequireMessage.slice(0, -2);
    }

    // Replace the last comma with ' and '
    const lastCommaIndex = makeMinimunRequireMessage.lastIndexOf(", ");
    if (lastCommaIndex !== -1) {
      makeMinimunRequireMessage = `${makeMinimunRequireMessage.substring(
        0,
        lastCommaIndex
      )} and ${makeMinimunRequireMessage.substring(lastCommaIndex + 2)}`;
    }

    makeMinimunRequireMessage = makeMinimunRequireMessage.replace(
      /at least (\d+ \w+)/g,
      "at least <strong>$1</strong>"
    );

    validityMessage.innerHTML = `${makeMinimunRequireMessage}`;
  }
};

// Dispatch the chosenAssets to the parent application
const dispatchChosenAssets = (chosenAssets) => {
  const event = new CustomEvent("isValidTrue", {
    detail: { chosenAssets, chosenAssetFormData: [] },
  });
  document.dispatchEvent(event);
};

// custom event listener to signal when chosenAssets are not valid
const secureChosenAssets = () => {
  const event = new CustomEvent("isValidFalse", { detail: { isValid } });
  document.dispatchEvent(event);
};

// event listener to capture layer data from map-layer.js
const captureMapLayers = () => {
  document.addEventListener("layerDetailsProvided", (event) => {
    const mapLayer = event.detail;
    mapLayersToAdd.push(mapLayer);
  });
};
captureMapLayers();

// initilize the map using the map layers provided
const initializeMap = () => {
  try {
    const zoom =
      document.querySelector("asset-chooser-container").getAttribute("zoom") ||
      defaultZoom;
    const baseMap =
      document
        .querySelector("asset-chooser-container")
        .getAttribute("base-map") || defaultBaseMap;
    const centerX =
      document
        .querySelector("asset-chooser-container")
        .getAttribute("center-x") || defaultCenterX;
    const centerY =
      document
        .querySelector("asset-chooser-container")
        .getAttribute("center-y") || defaultCenterY;
    const showSearch =
      document
        .querySelector("asset-chooser-container")
        .getAttribute("show-search") || defaultShowSearch;
    require([
      "esri/Map",
      "esri/views/MapView",
      "esri/layers/FeatureLayer",
      "esri/widgets/Search",
    ], (Map, MapView, FeatureLayer, Search) => {
      const map = new Map({ basemap: baseMap });

      const view = new MapView({
        map: map,
        center: [centerX, centerY],
        zoom: zoom,
        container: document.querySelector("#viewDiv"),
      });

      // const searchWidget1 = new Search({ view: view });

      // if (showSearch === "true" || showSearch === true) {
      //   view.ui.add(searchWidget1, { position: "top-right" });
      // } else {
      //   view.ui.remove(searchWidget1);
      // }

      mapLayersToAdd.forEach((mapLayer) => {
        const mapDataLayer = new FeatureLayer({
          url: mapLayer.layerClassUrl,
          minScale: mapLayer.minScale,
          maxScale: mapLayer.maxScale,
          layerProperties: {
            layerName: mapLayer.name,
            layerClassUrl: mapLayer.layerClassUrl,
            layerAssetIDFieldName: mapLayer.layerAssetIDFieldName,
            labelMask: mapLayer.labelMask,
            minimumAssetsRequired: mapLayer.minimumSelections,
            maximumAssetsRequired: mapLayer.maximumSelections,
            minScale: mapLayer.minScale,
            maxScale: mapLayer.maxScale,
            searchFields: [mapLayer.labelMask],
            displayField: mapLayer.labelMask,
          },
        });
        console.log("mapDataLayer", mapDataLayer);
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

        if (minAssetsRequired === 0) {
          layersWithNoSelectionRequired.push(mapDataLayerId);
        }
        if (layersWithNoSelectionRequired.length === allMapLayerIds.length) {
          isValid = true;
          dispatchChosenAssets(chosenAssets);
        } else {
          isValid = false;
          secureChosenAssets();
        }
        renderValidityMessage();
        const layerName = mapDataLayer.layerProperties.layerName;
        const layerDataDiv = document.getElementById("layer-data-div");
        const layerMinScale = mapDataLayer.minScale;
        const layerMaxScale = mapDataLayer.maxScale;

        //   const searchWidget = new Search({
        //     view: view,
        //     allPlaceholder: `Search for ${layerName}s`,
        //     sources: searchSources,
        //   });

        //   if (showSearch === "true" || showSearch === true) {
        //   view.ui.add(searchWidget, { position: "top-right" });
        // } else {
        //   view.ui.remove(searchWidget);
        // }

        // Listen for the layerview-create event
        view.on("layerview-create", function (event) {
          if (event.layer === mapDataLayer) {
            // Watch for changes in the visibleAtCurrentScale property
            event.layerView.watch(
              "visibleAtCurrentScale",
              function (visibleAtCurrentScale) {
                const showHideLayerBtn = document.getElementById(
                  `${layerName}-show-hide-layer-btn`
                );
                const layerEyeBtnSpan = document.getElementById(
                  `${layerName}-eye-btn-span`
                );
                const zoomAlertSpan = document.getElementById(
                  `${layerName}-zoom-alert-span`
                );
                if (zoomAlertSpan) {
                  if (visibleAtCurrentScale) {
                    // if layer is visible at current scale
                    zoomAlertSpan.textContent = ``;
                    showHideLayerBtn.style.backgroundColor = "#f8f8f8";
                    layerEyeBtnSpan.classList.add("glyphicons-eye-close");
                    layerEyeBtnSpan.classList.remove("glyphicons-eye-open");
                    showHideLayerBtn.removeAttribute("disabled");
                  } else {
                    // if layer is not visible at current scale
                    zoomAlertSpan.textContent = `${
                      layerMinScale > 0 ? `Zoom in to see this layer.` : ""
                    } ${
                      layerMaxScale > 0 ? `Zoom out to see this layer.` : ""
                    }`;
                    showHideLayerBtn.style.backgroundColor = "#dfdfdf";
                    layerEyeBtnSpan.classList.add("glyphicons-eye-open");
                    layerEyeBtnSpan.classList.remove("glyphicons-eye-close");
                    showHideLayerBtn.setAttribute("disabled", true);
                  }
                }
              }
            );
          }
        });

        layerDataDiv.innerHTML += `
          <div 
            class="map-layer-data-container stat-container stat-medium"
          >
            <div class="stat-title" id="${layerName}-layer-selected-asset-container">
             <div>
               <span> <strong>${layerName} Layer</strong></span>
               <br><br/>
               <span id="${layerName}-zoom-alert-span" style="height: 14px; display: inline-block">
                ${layerMinScale > 0 ? `Zoom in to see this layer.` : ""}
               </span>
             </div>
              <button 
                id="${layerName}-show-hide-layer-btn" 
                class="selectLayers" 
                att-layer-id="${layerName}-${mapDataLayer.id}"
                aria-label="hide ${layerName} layer" ${
          layerMinScale > 0 ? "disabled" : ""
        } style="background-color: ${layerMinScale > 0 ? "#dfdfdf" : ""}"
              >
                <span class="${
                  layerMinScale > 0
                    ? "glyphicons glyphicons-eye-open"
                    : "glyphicons glyphicons-eye-close"
                }" id="${layerName}-eye-btn-span">
                </span>
              </button>
            </div>
            <div
            aria-live="polite"
              aria-atomic="true"
            >
              <span class="sr-only">Asset selection requirements and status for ${layerName} layer</span>
              ${
                minAssetsRequired === 0
                  ? `
                  <span id="${mapDataLayerId}-min-asset-required-message">
                    <span class="label label-success">
                      No selection required
                    </span>
                  </span>   
                  `
                  : `
                  <span id="${mapDataLayerId}-min-asset-required-message">
                    <span class="label label-error">
                      At least ${minAssetsRequired} required
                    </span>
                  </span>
                  `
              }
              ${
                maxAssetsRequired > 0
                  ? `
                  <span id="${mapDataLayerId}-max-asset-required-message">
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
              <li>
                None selected
              </li>
            </ul>
          </div>
        `;
      });

      // Create an array of sources based on the feature layers
      const searchSources = featureLayers.map((layer) => {
        console.log("layer", layer);

        // Extract field names from the search fields
        const searchFields = layer.layerProperties.searchFields.map((field) =>
          field.replace(/\{|\}/g, "")
        );

        // Extract the display field name
        const displayField = layer.layerProperties.displayField
          .match(/\{(.*?)\}/)[1] // Match text within curly braces and get the first match
          .replace(/\{|\}/g, ""); // Remove curly braces

        return {
          layer: layer,
          searchFields: searchFields, // Use the extracted search fields as an array
          displayField: displayField, // Use the first field name as the display field
          exactMatch: false,
          outFields: ["*"],
          name: layer.layerProperties.layerName,
          placeholder: `Search ${layer.layerProperties.layerName}`,
        };
      });

      console.log("searchSources", searchSources);

      const searchWidget = new Search({
        view: view,
        sources: searchSources,
        includeDefaultSources: false,
        allPlaceholder: "Search for assets",
      });

      // Listen to the search-complete event
      searchWidget.on("search-complete", (event) => {
        console.log("search-complete", event);
        const searchResults = event.results;
        const searchResult = searchResults[0];
        console.log("searchResult", searchResult);
      });

      if (showSearch === "true" || showSearch === true) {
        view.ui.add(searchWidget, { position: "top-right" });
      } else {
        view.ui.remove(searchWidget);
      }

      hideOrShowLayer();
      view.on("click", (event) => {
        view.hitTest(event).then((response) => {
          console.log("response", response);
          if (!response.results[0].layer.layerProperties) {
            alert(
              "Please try again. There are no assets to select at that location."
            );
            return;
          }
          let highlightedSelection;
          if (response.results.length) {
            const graphic = response.results[0].graphic;
            const layerProperties = response.results[0].layer.layerProperties;
            const layerAssetIDFieldName = layerProperties.layerAssetIDFieldName;
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
                if (
                  layerAssetMax > 0 &&
                  totalLayerAssetsSelected >= layerAssetMax
                ) {
                  document
                    .getElementById(
                      `${mapDataLayerId}-max-asset-required-message`
                    )
                    .classList.remove("label-default");
                  document
                    .getElementById(
                      `${mapDataLayerId}-max-asset-required-message`
                    )
                    .classList.add("label-error");
                  setTimeout(() => {
                    alert(
                      `You have already selected the maximum of ${layerAssetMax} assets from the ${graphic.layer.layerProperties.layerName} layer.`
                    );
                    document
                      .getElementById(
                        `${mapDataLayerId}-max-asset-required-message`
                      )
                      .classList.remove("label-error");
                    document
                      .getElementById(
                        `${mapDataLayerId}-max-asset-required-message`
                      )
                      .classList.add("label-default");
                  }, 500);
                  return;
                }
                highlightedSelection = layerView.highlight(graphic);
                const chosenAsset = {
                  assetAttributes: graphic.attributes,
                  internalAssetId: `${graphic.layer.layerProperties.layerName}-${graphic.attributes[layerAssetIDFieldName]}`,
                  assetId: `${graphic.attributes[layerAssetIDFieldName]}`,
                  assetIdType: layerAssetIDFieldName,
                  assetLabel: labelMaskValue,
                  layerData: graphic.layer,
                  layerId: `${graphic.layer.layerProperties.layerName}-${layerId}`,
                  layerName: graphic.layer.title,
                  layerClassUrl: graphic.layer.layerProperties.layerClassUrl,
                  layerAssetMax:
                    graphic.layer.layerProperties.maximumAssetsRequired,
                  highlightSelect: highlightedSelection,
                };
                chosenAssets.push(chosenAsset);
                renderSelectedAssetLabels();
                validateNumberofAssetsSelected();
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
              validateNumberofAssetsSelected();
            }
          }
        });
      });
    });
  } catch (e) {
    console.error(e);
  }
};

initializeMap();

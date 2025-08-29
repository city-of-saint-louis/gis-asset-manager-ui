import { 
  chosenAssets,
  allMapLayerIds,
  mapLayersToAdd,
  featureLayers,
  chosenAssetFormData,
  layersWithNoSelectionRequired,
  validLayers,
  currentView
} from "./asset-chooser-state.js"

// function to destroy the previous map view
export const destroyPreviousMapView = () => {
  if (currentView) {
    console.log("Destroying previous view:", currentView);
    currentView.destroy();
    currentView = null;
    // Clear the container
    const viewDiv = document.querySelector("#viewDiv");
    if (viewDiv) viewDiv.innerHTML = "";
  }
};

// function to clear the map data
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

// function to hide or show layers on the map
export const hideOrShowLayer = () => {
  featureLayers.forEach((outerLayer) => {
    const layerName = outerLayer.layerProperties.layerName;
    const layerNameToDisplay = layerName
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
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
              `Show ${layerNameToDisplay} layer`
            );
            toggleLayerVisibilityButton.setAttribute(
              "title",
              `Show ${layerNameToDisplay} layer`
            );
          } else {
            outerLayer.visible = true;
            spanElement.innerHTML = `<span>Hide</span>`;
            toggleLayerVisibilityButton.setAttribute(
              "aria-label",
              `Hide ${layerNameToDisplay} layer`
            );
            toggleLayerVisibilityButton.setAttribute(
              "title",
              `Hide ${layerNameToDisplay} layer`
            );
          }
        }
      });
    });
  });
};

// Function to monitor layer visibility based on scale and adjust ui accordingly
const monitorLayerVisibility = (
  reactiveUtils,
  layerView,
  mapDataLayer,
  layerName,
  layerNameToDisplay,
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
              `Hide ${layerNameToDisplay} layer`
            );
          } else {
            toggleVisibilityBtnTextSpan.textContent = `Show`;
            toggleLayerVisibilityButton.setAttribute(
              "title",
              `Show ${layerNameToDisplay} layer`
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

// function to add map layers to the map
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
      layerClassUrl: mapLayer.layerClassUrl,
      layerAssetIDFieldName: mapLayer.layerAssetIDFieldName,
      labelMask: mapLayer.labelMask,
      minimumAssetsRequired: mapLayer.minimumSelections,
      maximumAssetsRequired: mapLayer.maximumSelections,
      minScale: mapLayer.minScale,
      maxScale: mapLayer.maxScale,
    },
    labelingInfo: [
      {
        labelExpressionInfo: {
          expression: `$feature.${mapLayer.assetLabel}`,
        },
        symbol: {
          type: "text", // autocasts as new TextSymbol()
          color: "#1e526b",
          haloColor: "white",
          haloSize: "1px",
          font: {
            family: "Arial Unicode MS",
            size: 12,
            weight: "bold",
          },
        },
        placement:
          mapLayer.geometryType === "polyline"
            ? "center-along"
            : mapLayer.geometryType === "polygon"
            ? "always-horizontal"
            : mapLayer.geometryType === "point"
            ? "center-center"
            : "always-horizontal", // Fallback
      },
    ],
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
  const layerNameToDisplay = mapDataLayer.layerProperties.layerName
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
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
        layerNameToDisplay,
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
        aria-label="${layerNameToDisplay} Layer"
        title="${layerNameToDisplay} Layer"
      >
       <div>
         <span>
           <strong>
             ${layerNameToDisplay} Layer
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
          aria-label="Hide ${layerNameToDisplay} Layer" ${
    layerMinScale > 0 ? "disabled hidden" : ""
  } 
          title="Hide ${layerNameToDisplay} Layer"
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
            <span id="${mapDataLayerId}-min-asset-required-message">
              <span class="label label-success">
                No selection required
              </span>
            </span>
            `
            : minAssetsRequired === 1
            ? `
            <span id="${mapDataLayerId}-min-asset-required-message">
              <span class="label label-error">
               ${minAssetsRequired} required
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
};
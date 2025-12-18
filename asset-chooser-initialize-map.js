// import state variables from asset-chooser-state.js
import {
  defaultZoom,
  defaultCenterX,
  defaultCenterY,
  defaultBaseMap,
  defaultShowSearch,
  mapLayersToAdd,
  sketchableMapLayersToAdd,
  featureLayers,
  graphicLayers,
  chosenAssets,
  createdAssets,
  allMapLayerIds,
  allSketchableLayerIds,
  layersWithNoSelectionRequired,
  sketchableLayersWithNoAdditionRequired,
  setIsValid,
  setCurrentView,
  isSketchEnabled,
  setIsSketchEnabled,
  isSelectEnabled,
  setIsSelectEnabled,
  createdAssetsAreValid,
  setCreatedAssetsAreValid,
} from "./asset-chooser-state.js";

// import from asset-chooser-functions.js
import {
  destroyPreviousMapView,
  clearMapData,
  hideOrShowLayer,
  addMapLayer,
  renderValidityMessage,
  dispatchChosenAssets,
  secureChosenAssets,
  highlightSelectedAsset,
} from "./asset-chooser-functions.js";

import {
  addSketchableMapLayer,
  sketchAsset,
  dispatchCreatedAssets,
  secureCreatedAssets,
} from "./asset-chooser-sketchable-map-layer-functions.js";

export const initializeMap = async () => {
  destroyPreviousMapView();
  clearMapData();
  try {
    const FeatureLayer = await $arcgis.import(
      "@arcgis/core/layers/FeatureLayer.js"
    );
    const Extent = await $arcgis.import("@arcgis/core/geometry/Extent.js");
    const reactiveUtils = await $arcgis.import(
      "@arcgis/core/core/reactiveUtils.js"
    );
    // LocatorSearchSource is a widget. All widgets are being converted to components. Update will be required at some point.
    // More info: https://developers.arcgis.com/javascript/latest/components-transition-plan/
    // https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Search-LocatorSearchSource.html
    const LocatorSearchSource = await $arcgis.import(
      "@arcgis/core/widgets/Search/LocatorSearchSource.js"
    );
    const assetChooserContainer = document.querySelector(
      "asset-chooser-container"
    );
    const zoom = assetChooserContainer.getAttribute("zoom") || defaultZoom;
    const baseMap =
      assetChooserContainer.getAttribute("base-map") || defaultBaseMap;
    const centerX =
      assetChooserContainer.getAttribute("center-x") || defaultCenterX;
    const centerY =
      assetChooserContainer.getAttribute("center-y") || defaultCenterY;
    const showSearch =
      assetChooserContainer.getAttribute("show-search") || defaultShowSearch;
    const stLouisExtent = new Extent({
      xmin: -10054448.855908303,
      ymin: 4654966.477336443,
      xmax: -10038240.32627997,
      ymax: 4689440.938430255,
      spatialReference: { wkid: 102100 }, // or 3857
    });
    // Dynamically create the <arcgis-map> component
    const mapContainer = document.querySelector("#viewDiv");
    const arcGisMap = document.createElement("arcgis-map");
    arcGisMap.setAttribute("basemap", baseMap);
    arcGisMap.setAttribute("zoom", zoom);
    arcGisMap.setAttribute("center", `${centerX},${centerY}`);
    arcGisMap.setAttribute("extent", JSON.stringify(stLouisExtent.toJSON()));
    mapContainer.appendChild(arcGisMap);
    const zoomControl = document.createElement("arcgis-zoom");
    zoomControl.setAttribute("position", "bottom-left");
    arcGisMap.appendChild(zoomControl);
    // Add a LocatorSearchSource for local search suggestions
    const locatorSearchSource = new LocatorSearchSource({
      url: "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer",
      filter: {
        geometry: stLouisExtent,
      },
      outFields: ["*"],
      singleLineFieldName: "SingleLine",
      name: "ArcGIS World Geocoding Service",
      placeholder: "Search for places or addresses",
      maxSuggestions: 4,
      suggestionsEnabled: true,
    });
    if (showSearch === "true" || showSearch === true) {
      const searchComponent = document.createElement("arcgis-search");
      // searchComponent.setAttribute("position", "bottom-right");
      searchComponent.setAttribute("position", "top-right");
      searchComponent.setAttribute("popup-disabled", "true");
      searchComponent.setAttribute("include-default-sources-disabled", "true");
      searchComponent.setAttribute("id", "asset-chooser-arcgis-search");
      searchComponent.sources = [locatorSearchSource];
      arcGisMap.appendChild(searchComponent);
      
    } else {
      // Check if the search component exists and remove it
      const existingSearchComponent = arcGisMap.querySelector("arcgis-search");
      if (existingSearchComponent) {
        arcGisMap.removeChild(existingSearchComponent);
      }
    }
    arcGisMap.addEventListener("arcgisViewReadyChange", () => {
      const map = arcGisMap.map; // access the map object
      const view = arcGisMap.view; // Access the mapView object
      setCurrentView(view);
      view.constraints = {
        geometry: stLouisExtent,
      };

      if (isSelectEnabled === "true" || isSelectEnabled === true) {
        mapLayersToAdd.forEach((mapLayer) => {
          addMapLayer({
            mapLayer,
            FeatureLayer,
            reactiveUtils,
            map,
            view,
            allMapLayerIds,
            featureLayers,
            layersWithNoSelectionRequired,
          });
        });
        // const selectableLayerDataDivHeading = document.createElement("h3");
        // selectableLayerDataDivHeading.textContent = "Selectable Layers";
        // const layerDataDiv = document.getElementById(
        //   "layer-data-div"
        // );
        // layerDataDiv.insertBefore(selectableLayerDataDivHeading, layerDataDiv.firstChild);
      }

      if (isSketchEnabled === "true" || isSketchEnabled === true) {
        const sketch = document.createElement("arcgis-sketch");
        sketch.view = view;
        sketch.setAttribute("id", "asset-chooser-sketch");
        sketch.setAttribute("slot", "top-left");
        sketch.setAttribute("hide-selection-tools-lasso-selection", "true");
        sketch.setAttribute("hide-selection-tools-rectangle-selection", "true");
        // sketch.setAttribute("layout", "vertical");
        // sketch.setAttribute("hide-settings-menu", "true");
        sketch.setAttribute("hidden", "true");
        arcGisMap.appendChild(sketch);
        sketch.componentOnReady().then(() => {
          console.log(document.querySelectorAll("arcgis-sketch").length);
          sketchAsset(sketch);
        });

        // Add sketchable map layers
        sketchableMapLayersToAdd.forEach((sketchableMapLayer) => {
          addSketchableMapLayer({
            sketchableMapLayer,
            map,
            view,
            reactiveUtils,
          });
        });
      }

      if (!isSelectEnabled && !isSketchEnabled) {
        alert(
          "Please enable either Select Mode or Sketch Mode to choose assets on the map."
        );
      }

      if (layersWithNoSelectionRequired.length === allMapLayerIds.length) {
        setIsValid(true);
        dispatchChosenAssets(chosenAssets);
      } else {
        setIsValid(false);
        secureChosenAssets();
      }
      // renderValidityMessage();
      hideOrShowLayer();

      if (
        sketchableLayersWithNoAdditionRequired.length > 0 &&
        allSketchableLayerIds.length > 0 &&
        sketchableLayersWithNoAdditionRequired.length ===
          allSketchableLayerIds.length
      ) {
        console.log(
          "sketchableLayersWithNoAdditionRequired.length:",
          sketchableLayersWithNoAdditionRequired.length
        );
        console.log(
          "allSketchableLayerIds.length:",
          allSketchableLayerIds.length
        );
        setCreatedAssetsAreValid(true);
        dispatchCreatedAssets(createdAssets);
      } else {
        setCreatedAssetsAreValid(false);
        secureCreatedAssets();
      }

      view.on("click", (event) => {
        view.hitTest(event).then((response) => {
          if (!response.results[0].layer.layerProperties) {
            alert(
              "Please try again. There are no assets to select at that location."
            );
            return;
          }
          let highlightedSelection;
          if (response.results.length) {
            highlightSelectedAsset(response, view, highlightedSelection);
          }
        });
      });

      // Assuming you have a MapView instance called 'view'
      view.when(() => {
        const basemap = view.map.basemap;
        // basemap.baseLayers is a Collection of layers
        basemap.baseLayers.forEach((layer) => {
          if (layer.tileInfo) {
            console.log("This basemap layer has tileInfo:", layer);
          } else {
            console.log("This basemap layer does NOT have tileInfo:", layer);
          }
        });
      });
    });
    const modeStatusBanner = document.createElement("div");
    modeStatusBanner.id = "mode-status-banner";
    modeStatusBanner.hidden = true;
    mapContainer.appendChild(modeStatusBanner);
    const modeStatusIconSpan = document.createElement("span");
    modeStatusIconSpan.id = "mode-status-icon-span";
    modeStatusIconSpan.classList.add("mode-status-icon", "glyphicons-svg");
    modeStatusBanner.appendChild(modeStatusIconSpan);
    const modeStatusTextSpan = document.createElement("span"); 
    modeStatusTextSpan.id = "mode-status-text-span";
    modeStatusBanner.appendChild(modeStatusTextSpan);

  } catch (e) {
    console.error(e);
  }
};

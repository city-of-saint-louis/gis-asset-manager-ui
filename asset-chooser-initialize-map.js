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
  // graphicLayers,
  chosenAssets,
  createdAssets,
  allMapLayerIds,
  allSketchableLayerIds,
  layersWithNoSelectionRequired,
  sketchableLayersWithNoAdditionRequired,
  setIsValid,
  setCurrentView,
  isSketchEnabled,
  // setIsSketchEnabled,
  isSelectEnabled,
  // setIsSelectEnabled,
  // createdAssetsAreValid,
  setCreatedAssetsAreValid,
} from "./asset-chooser-state.js";

import { getCreatedAssetsAreValid } from "./asset-chooser-state.js";

// import from asset-chooser-functions.js
import {
  destroyPreviousMapView,
  clearMapData,
  hideOrShowLayer,
  addMapLayer,
  // renderValidityMessage,
  dispatchChosenAssets,
  secureChosenAssets,
  highlightSelectedAsset,
  // handleSelectEnabled,
  handleSketchEnabled,
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
      "@arcgis/core/layers/FeatureLayer.js",
    );
    const Extent = await $arcgis.import("@arcgis/core/geometry/Extent.js");
    const reactiveUtils = await $arcgis.import(
      "@arcgis/core/core/reactiveUtils.js",
    );
    // LocatorSearchSource is a widget. All widgets are being converted to components. Update will be required at some point.
    // More info: https://developers.arcgis.com/javascript/latest/components-transition-plan/
    // https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Search-LocatorSearchSource.html
    const LocatorSearchSource = await $arcgis.import(
      "@arcgis/core/widgets/Search/LocatorSearchSource.js",
    );
    // const LayerSearchSource = await $arcgis.import(
    //   "@arcgis/core/widgets/Search/LayerSearchSource.js"
    // );
    // console.log("LayerSearchSource:", LayerSearchSource);
    const assetChooserContainer = document.querySelector(
      "asset-chooser-container",
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
    // const locatorSearchSource = new LocatorSearchSource({
    //   url: "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer",
    //   filter: {
    //     geometry: stLouisExtent,
    //   },
    //   outFields: ["*"],
    //   singleLineFieldName: "SingleLine",
    //   name: "ArcGIS World Geocoding Service",
    //   placeholder: "Search for places or addresses",
    //   maxSuggestions: 4,
    //   suggestionsEnabled: true,
    // });
    const locatorSourceObj = {
      url: "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer",
      filter: { geometry: stLouisExtent },
      outFields: ["*"],
      singleLineFieldName: "SingleLine",
      name: "ArcGIS World Geocoding Service",
      placeholder: "Search for places or addresses",
      maxSuggestions: 4,
      suggestionsEnabled: true,
    };

    if (showSearch === "true" || showSearch === true) {
      const searchComponent = document.createElement("arcgis-search");
      // searchComponent.setAttribute("position", "bottom-right");
      searchComponent.setAttribute("position", "top-right");
      searchComponent.setAttribute("popup-disabled", "true");
      searchComponent.setAttribute("include-default-sources-disabled", "true");
      searchComponent.setAttribute("id", "asset-chooser-arcgis-search");
      searchComponent.sources = [locatorSourceObj];
      arcGisMap.appendChild(searchComponent);

      searchComponent.addEventListener("arcgisSearchComplete", (event) => {
        console.log("Search complete event:", event);
        const results = event.detail.results;
        console.log("Search results:", results);
        if (results.length > 0 && results[0].results.length > 0) {
          const firstResult = results[0].results[0];
          console.log("First result:", firstResult);
          chosenAssets.push(firstResult);
          console.log("chosenAssets array:", chosenAssets);
        }
      });

      function updateSearchPosition() {
        const searchComponent = document.getElementById(
          "asset-chooser-arcgis-search",
        );
        if (!searchComponent) return;
        if (window.innerWidth <= 500) {
          searchComponent.setAttribute("position", "top-left");
        } else {
          searchComponent.setAttribute("position", "top-right");
        }
      }
      // Run on load
      updateSearchPosition();
      // Run on resize
      window.addEventListener("resize", updateSearchPosition);
    } else {
      // Check if the search component exists and remove it
      const existingSearchComponent = arcGisMap.querySelector("arcgis-search");
      if (existingSearchComponent) {
        arcGisMap.removeChild(existingSearchComponent);
      }
    }
    arcGisMap.addEventListener("arcgisViewReadyChange", async () => {
      const map = arcGisMap.map; // access the map object
      const view = arcGisMap.view; // Access the mapView object
      setCurrentView(view);
      view.constraints = {
        geometry: stLouisExtent,
      };

      if (isSelectEnabled === "true" || isSelectEnabled === true) {
        mapLayersToAdd.forEach((mapLayer) => {
          console.log("Adding map layer:", mapLayer);
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
        console.log("featureLayers:", featureLayers);
        const searchSources = featureLayers.map((featureLayer) => {
          const labelMask = featureLayer.layerProperties.labelMask;
          const fieldMatches = labelMask.match(/\{([^}]+)\}/g) || [];
          const fieldNames = fieldMatches.map((f) => f.replace(/\{|\}/g, ""));
          return {
            layer: featureLayer,
            searchFields: fieldNames,
            displayField: fieldNames[0] || "",
            name: featureLayer.layerProperties.layerName,
            placeholder: `Search ${featureLayer.layerProperties.layerName}`,
            suggestionsEnabled: true,
            maxSuggestions: 10,
            searchTemplate: featureLayer.layerProperties.labelMask,
            suggestionTemplate: featureLayer.layerProperties.labelMask,
          };
        });
        console.log("searchSources:", searchSources);
        const searchComponent = document.getElementById(
          "asset-chooser-arcgis-search",
        );
        const allSources = [locatorSourceObj, ...searchSources];
        searchComponent.sources = allSources;
      }

      if (isSketchEnabled === "true" || isSketchEnabled === true) {
        const viewDiv = document.getElementById("viewDiv");
        viewDiv.classList.add("pointer-events-none");

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
          // console.log(document.querySelectorAll("arcgis-sketch").length);
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

        if (
          sketchableLayersWithNoAdditionRequired.length > 0 &&
          allSketchableLayerIds.length > 0 &&
          sketchableLayersWithNoAdditionRequired.length ===
            allSketchableLayerIds.length
        ) {
          setCreatedAssetsAreValid(true);
          dispatchCreatedAssets(createdAssets);
        } else {
          setCreatedAssetsAreValid(false);
          secureCreatedAssets();
        }
      }

      if (isSelectEnabled && !isSketchEnabled) {
        console.log("Select Mode only enabled.");
        setCreatedAssetsAreValid(true);
        const createdAssetsAreValid = getCreatedAssetsAreValid();
        console.log("createdAssetsAreValid", createdAssetsAreValid);
        dispatchCreatedAssets(createdAssets);
      }

      if (!isSelectEnabled && isSketchEnabled) {
        setIsValid(true);
        console.log("Sketch Mode only enabled.");
        handleSketchEnabled();
        const modeStatusTextSpan = document.getElementById(
          "mode-status-text-span",
        );
        // const modeStatusIconSpan = document.getElementById(
        // "mode-status-icon-span"
        // );
        modeStatusTextSpan.textContent =
          "Click a sketch button below to begin.";
      }

      if (!isSelectEnabled && !isSketchEnabled) {
        alert(
          "Please enable either Select Mode or Sketch Mode to choose or enter assets on the map.",
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

      // if (isSketchEnabled === "true" || isSketchEnabled === true) {
      //   if (
      //     sketchableLayersWithNoAdditionRequired.length > 0 &&
      //     allSketchableLayerIds.length > 0 &&
      //     sketchableLayersWithNoAdditionRequired.length ===
      //       allSketchableLayerIds.length
      //   ) {
      //     setCreatedAssetsAreValid(true);
      //     dispatchCreatedAssets(createdAssets);
      //   } else {
      //     setCreatedAssetsAreValid(false);
      //     secureCreatedAssets();
      //   }
      // }

      view.on("click", (event) => {
        view.hitTest(event).then((response) => {
          if (!response.results[0].layer.layerProperties) {
            alert(
              "Please try again. There are no assets to select at that location.",
            );
            return;
          }
          let highlightedSelection;
          if (response.results.length) {
            highlightSelectedAsset(response, view, highlightedSelection);
          }
        });
      });

      view.when(() => {
        const basemap = view.map.basemap;
        // basemap.baseLayers is a Collection of layers
        basemap.baseLayers.forEach((layer) => {
          if (layer.tileInfo) {
            // console.log("This basemap layer has tileInfo:", layer);
          } else {
            // console.log("This basemap layer does NOT have tileInfo:", layer);
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

// import { addMapLayer } from "./asset-chooser-helpers";
// This file holds the logic that provides functionality for the GIS Asset Chooser

// event listener to caputre x,y coordinates from address validation
document.addEventListener("coordinatesAvailable", (event) => {
  addressMarkerX = event.detail.centerX;
  addressMarkerY = event.detail.centerY;
  const assetChooserContainer = document.querySelector(
    "asset-chooser-container"
  );
  // reset zoom level, reset x,y based on address entered, and reinitialize the map
  assetChooserContainer.removeAttribute("zoom");
  assetChooserContainer.setAttribute("zoom", 18);
  assetChooserContainer.removeAttribute("center-x");
  assetChooserContainer.setAttribute("center-x", addressMarkerX);
  assetChooserContainer.removeAttribute("center-y");
  assetChooserContainer.setAttribute("center-y", addressMarkerY);
  const layerDataDiv = document.getElementById("layer-data-div");
  layerDataDiv.innerHTML = "";
  initializeMap();
});

// function to capture the map layers added to the asset-chooser-container component
captureMapLayers();

// function to initialize the map using the map layers provided
const initializeMap = async () => {
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
    const arcgisMap = document.createElement("arcgis-map");
    arcgisMap.setAttribute("basemap", baseMap);
    arcgisMap.setAttribute("zoom", zoom);
    arcgisMap.setAttribute("center", `${centerX},${centerY}`);
    arcgisMap.setAttribute("extent", JSON.stringify(stLouisExtent.toJSON()));
    mapContainer.appendChild(arcgisMap);
    const zoomControl = document.createElement("arcgis-zoom");
    zoomControl.setAttribute("position", "top-left");
    arcgisMap.appendChild(zoomControl);
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
      maxSuggestions: 6,
      suggestionsEnabled: true,
    });
    if (showSearch === "true" || showSearch === true) {
      const searchComponent = document.createElement("arcgis-search");
      searchComponent.setAttribute("position", "top-right");
      searchComponent.setAttribute("popup-disabled", "true");
      searchComponent.setAttribute("include-default-sources-disabled", "true");
      searchComponent.sources = [locatorSearchSource];
      arcgisMap.appendChild(searchComponent);
    } else {
      // Check if the search component exists and remove it
      const existingSearchComponent = arcgisMap.querySelector("arcgis-search");
      if (existingSearchComponent) {
        arcgisMap.removeChild(existingSearchComponent);
      }
    }

    arcgisMap.addEventListener("arcgisViewReadyChange", () => {
      const map = arcgisMap.map; // access the map object
      const view = arcgisMap.view; // Access the mapView object
      currentView = view;
      view.constraints = {
        geometry: stLouisExtent,
      };

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

      if (layersWithNoSelectionRequired.length === allMapLayerIds.length) {
        isValid = true;
        dispatchChosenAssets(chosenAssets);
      } else {
        isValid = false;
        secureChosenAssets();
      }
      renderValidityMessage();
      hideOrShowLayer();

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
    });
  } catch (e) {
    console.error(e);
  }
};
initializeMap();
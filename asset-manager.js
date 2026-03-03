// import AssetManagerContainer from asset-manager-container.js
import { AssetManagerContainer } from "./asset-manager-container.js";
// import AssetManagerMapLayer from asset-manager-map-layer.js
import { AssetManagerMapLayer } from "./asset-manager-map-layer.js";
// import AssetManagerSketchableMapLayer from asset-manager-sketchable-map-layer.js
import { AssetManagerSketchableMapLayer } from "./asset-manager-sketchable-map-layer.js";
// import AssetManagerMapLayerDataDisplay from asset-manager-map-layer-data-display.js
import { AssetManagerMapLayerDataDisplay } from "./asset-manager-map-layer-data-display.js";
// import AssetManagerModeToggle from asset-manager-mode-toggle.js
import { AssetManagerModeToggle } from "./asset-manager-mode-toggle.js";
// import state variables from asset-manager-state.js
import { addressMarkerX, setAddressMarkerX, addressMarkerY, setAddressMarkerY } from "./asset-manager-state.js"
// import from asset-manager-functions.js
import { captureMapLayers } from "./asset-manager-functions.js"
// import from asset-manager-sketchable-map-layer-functions.js
import { captureSketachableMapLayers } from "./asset-manager-sketchable-map-layer-functions.js"
// import initializeMap function from map-initialization.js
import { initializeMap } from "./asset-manager-initialize-map.js";
// event listener to caputre x,y coordinates from address validation
document.addEventListener("coordinatesAvailable", (event) => {
  setAddressMarkerX(event.detail.centerX);
  setAddressMarkerY(event.detail.centerY);
  const assetManagerContainer = document.querySelector("asset-manager-container");
  // reset zoom level, reset x,y based on address entered, and reinitialize the map
  assetManagerContainer.setAttribute("zoom", 18);
  assetManagerContainer.setAttribute("center-x", addressMarkerX);
  assetManagerContainer.setAttribute("center-y", addressMarkerY);
  const layerDataDiv = document.getElementById("layer-data-div");
  layerDataDiv.innerHTML = "";
  initializeMap();
});
// capture the map layers added to the asset-manager-container component
captureMapLayers();
// capture the sketchable map layers added to the asset-manager-container component
captureSketachableMapLayers();
// initialize the map after the DOM content has loaded and the MapLayer and AssetManagerContainer components are defined
document.addEventListener("DOMContentLoaded", () => {
  customElements.define("asset-manager-mode-toggle", AssetManagerModeToggle);
  customElements.define("asset-manager-map-layer", AssetManagerMapLayer);
  customElements.define("asset-manager-sketchable-map-layer", AssetManagerSketchableMapLayer);
  customElements.define("asset-manager-map-layer-data-display", AssetManagerMapLayerDataDisplay);
  customElements.define("asset-manager-container", AssetManagerContainer);
  // Wait for the AssetManagerContainer to be defined and rendered before initializing the map
  customElements.whenDefined('asset-manager-container').then(() => {
    // Wait a tick for rendering
    setTimeout(() => {
      initializeMap();
    }, 0);
  });
});
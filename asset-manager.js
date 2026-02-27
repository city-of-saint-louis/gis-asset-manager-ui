// import AssetManagerContainer from asset-manager-container.js
import { AssetManagerContainer } from "./asset-manager-container.js";
// import AssetChooserMapLayer from asset-chooser-map-layer.js
import { AssetChooserMapLayer } from "./asset-chooser-map-layer.js";
// import AssetChooserSketchableMapLayer from asset-chooser-sketchable-map-layer.js
import { AssetChooserSketchableMapLayer } from "./asset-chooser-sketchable-map-layer.js";
// import AssetChooserMapLayerDataDisplay from asset-chooser-map-layer-data-display.js
import { AssetChooserMapLayerDataDisplay } from "./asset-chooser-map-layer-data-display.js";
// import AssetChooserModeToggle from asset-chooser-mode-toggle.js
import { AssetChooserModeToggle } from "./asset-chooser-mode-toggle.js";
// import state variables from asset-chooser-state.js
import { addressMarkerX, setAddressMarkerX, addressMarkerY, setAddressMarkerY } from "./asset-chooser-state.js"
// import from asset-chooser-functions.js
import { captureMapLayers } from "./asset-chooser-functions.js"
// import from asset-chooser-sketchable-map-layer-functions.js
import { captureSketachableMapLayers } from "./asset-chooser-sketchable-map-layer-functions.js"
// import initializeMap function from map-initialization.js
import { initializeMap } from "./asset-chooser-initialize-map.js";
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
  customElements.define("asset-chooser-mode-toggle", AssetChooserModeToggle);
  customElements.define("asset-chooser-map-layer", AssetChooserMapLayer);
  customElements.define("asset-chooser-sketchable-map-layer", AssetChooserSketchableMapLayer);
  customElements.define("asset-chooser-map-layer-data-display", AssetChooserMapLayerDataDisplay);
  customElements.define("asset-manager-container", AssetManagerContainer);
  // Wait for the AssetManagerContainer to be defined and rendered before initializing the map
  customElements.whenDefined('asset-manager-container').then(() => {
    // Wait a tick for rendering
    setTimeout(() => {
      initializeMap();
    }, 0);
  });
});
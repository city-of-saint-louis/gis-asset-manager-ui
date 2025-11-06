// import AssetChooserContainerComponent from asset-chooser-container.js
import { AssetChooserContainerComponent } from "./asset-chooser-container.js";
// import MapLayer from asset-chooser-map-layer.js
import { MapLayer } from "./asset-chooser-map-layer.js";
// import SketchableMapLayer from asset-chooser-sketchable-map-layer.js
import { SketchableMapLayer } from "./asset-chooser-sketchable-map-layer.js";
// import state variables from asset-chooser-state.js
import { addressMarkerX, setAddressMarkerX, addressMarkerY, setAddressMarkerY } from "./asset-chooser-state.js"
// import from asset-chooser-functions.js
import { captureMapLayers } from "./asset-chooser-functions.js"
import { captureSketachableMapLayers } from "./asset-chooser-functions.js"
// import initializeMap function from map-initialization.js
import { initializeMap } from "./asset-chooser-initialize-map.js";
// event listener to caputre x,y coordinates from address validation
document.addEventListener("coordinatesAvailable", (event) => {
  setAddressMarkerX(event.detail.centerX);
  setAddressMarkerY(event.detail.centerY);
  const assetChooserContainer = document.querySelector("asset-chooser-container");
  // reset zoom level, reset x,y based on address entered, and reinitialize the map
  assetChooserContainer.setAttribute("zoom", 18);
  assetChooserContainer.setAttribute("center-x", addressMarkerX);
  assetChooserContainer.setAttribute("center-y", addressMarkerY);
  const layerDataDiv = document.getElementById("layer-data-div");
  layerDataDiv.innerHTML = "";
  initializeMap();
});
// capture the map layers added to the asset-chooser-container component
captureMapLayers();
// capture the sketchable map layers added to the asset-chooser-container component
captureSketachableMapLayers();
// initialize the map after the DOM content has loaded and the MapLayer and AssetChooserContainerComponent components are defined
document.addEventListener("DOMContentLoaded", () => {
  customElements.define("asset-chooser-map-layer", MapLayer);
  customElements.define("asset-chooser-sketchable-map-layer", SketchableMapLayer);
  customElements.define("asset-chooser-container", AssetChooserContainerComponent);
  // Wait for the AssetChooserContainerComponent to be defined and rendered before initializing the map
  customElements.whenDefined('asset-chooser-container').then(() => {
    // Wait a tick for rendering
    setTimeout(() => {
      initializeMap();
    }, 0);
  });
});
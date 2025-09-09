// import state variables from asset-chooser-state.js
import { addressMarkerX, setAddressMarkerX, addressMarkerY, setAddressMarkerY } from "./asset-chooser-state.js"
// import from asset-chooser-functions.js
import { captureMapLayers } from "./asset-chooser-functions.js"
// import initializeMap function from map-initialization.js
import { initializeMap } from "./asset-chooser-initialize-map.js";
// event listener to caputre x,y coordinates from address validation
document.addEventListener("coordinatesAvailable", (event) => {
  setAddressMarkerX(event.detail.centerX);
  setAddressMarkerY(event.detail.centerY);
  const assetChooserContainer = document.querySelector("asset-chooser-container");
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
// capture the map layers added to the asset-chooser-container component
captureMapLayers();
// initialize the map after the DOM content has loaded and the asset-chooser-container component is defined
document.addEventListener("DOMContentLoaded", () => {
  // Wait for the custom element to be defined and rendered
  customElements.whenDefined('asset-chooser-container').then(() => {
    // Wait a tick for rendering
    setTimeout(() => {
      initializeMap();
    }, 0);
  });
});
// import state variables from asset-chooser-state.js
import {
  sketchableMapLayersToAdd,
  createdAssets,
  isSketchEnabled
} from "./asset-chooser-state.js"

// event listener to capture sketchable layer data from sketchable-map-layer.js
export const captureSketachableMapLayers = () => {
  document.addEventListener("sketchableLayerDetailsProvided", (event) => {
    const sketchableLayer = event.detail;
    sketchableMapLayersToAdd.push(sketchableLayer);
    console.log("Sketchable layer added:", sketchableLayer);
    console.log("Current sketchableMapLayersToAdd array:", sketchableMapLayersToAdd);
  });
};

export const addSketchableMapLayer = ({

}) => {
  
};
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
    console.log("Sketchable layer details captured:", sketchableLayer);
    console.log("Current sketchableMapLayersToAdd array:", sketchableMapLayersToAdd);
  });
};

export const addSketchableMapLayer = ({
  sketchableMapLayer,
  GraphicsLayer,
  
  allSketcahableLayerIds,
  sketchableLayersWithNoSketchRequired
}) => {
  console.log("Adding sketchable map layer:", sketchableMapLayer);
  // const layer = new GraphicsLayer({
  //   id: sketchableMapLayer.id,
  //   title: sketchableMapLayer.title,
  //   visible: sketchableMapLayer.visible,
  // });
  // map.add(layer);
 
  const sketch = document.createElement("arcgis-sketch");
    sketch.setAttribute("position", "bottom-right");

    // sketch.setAttribute("creation-mode", "continuous");
    sketch.availableCreateTools = [sketchableMapLayer.sketchType];
    const arcGisMap = document.querySelector("arcgis-map");
    arcGisMap.appendChild(sketch);
    console.log(sketch);
};


// import state variables from asset-chooser-state.js
import {
  sketchableMapLayersToAdd,
  createdAssets,
  isSketchEnabled,
} from "./asset-chooser-state.js";

// event listener to capture sketchable layer data from sketchable-map-layer.js
export const captureSketachableMapLayers = () => {
  document.addEventListener("sketchableLayerDetailsProvided", (event) => {
    const sketchableLayer = event.detail;
    sketchableMapLayersToAdd.push(sketchableLayer);
    console.log("Sketchable layer details captured:", sketchableLayer);
    console.log(
      "Current sketchableMapLayersToAdd array:",
      sketchableMapLayersToAdd
    );
  });
};

export const addSketchableMapLayer = async ({ sketchableMapLayer, map }) => {
  console.log("Adding sketchable map layer:", sketchableMapLayer);
  // const arcGisMap = document.querySelector("arcgis-map");

  const GraphicsLayer = await $arcgis.import(
    "@arcgis/core/layers/GraphicsLayer.js"
  );
  const sketchableGraphicLayer = new GraphicsLayer({
    title: sketchableMapLayer.name,
  });
  map.add(sketchableGraphicLayer);

  // const sketch = document.createElement("arcgis-sketch");
  // sketch.setAttribute("position", "bottom-right");
  // sketch.setAttribute("hide-selection-tools-lasso-selection", "true");
  // sketch.setAttribute("hide-selection-tools-rectangle-selection", "true");
  // sketch.setAttribute("id", `sketch-component-${sketchableMapLayer.name}`);
  // // sketch.setAttribute("layer", sketchableMapLayer.name);
  // // sketch.setAttribute("creation-mode", "continuous");
  // // sketch.availableCreateTools = sketchableMapLayer.sketchType;
  // // sketch.layer = sketchableGraphicLayer;
  // arcGisMap.appendChild(sketch);
  // // console.log(sketch);
  // // connect a graphic layer to the sketch widget
  // sketch.componentOnReady().then(() => {
  //   sketch.layer = sketchableGraphicLayer; // <-- This is the key step!
  //   sketch.availableCreateTools = sketchableMapLayer.sketchType;
  //   console.log("Sketch widget is ready and configured:", sketch);
  //   // console.log(sketchableGraphicLayer.graphics.toArray());
  //   console.log(map.layers);
  // });
  


  //  let createEventCount = 0;
  //   sketch.addEventListener("arcgisCreate", (event) => {
  //     createEventCount++;
  //     console.log("arcgisCreate event fired:", createEventCount);
  //     const graphic = event.detail.graphic;
  //     // Attach custom data
  //     graphic.attributes.customKey = "customValue";
      

  //     // Prevent duplicates by checking for a unique property (e.g., OBJECTID or geometry)
  //     const alreadyExists = createdAssets.some(
  //       (g) =>
  //         g.attributes.OBJECTID === graphic.attributes.OBJECTID &&
  //         JSON.stringify(g.geometry) === JSON.stringify(graphic.geometry)
  //     );

  //     if (!alreadyExists) {
  //       createdAssets.push(graphic);
  //       console.log("Added graphic to createdAssets:", graphic);
  //     } else {
  //       console.log("Duplicate graphic skipped:", graphic);
  //     }
  //     console.log("Created assets array:", createdAssets);
  //   });
  
};

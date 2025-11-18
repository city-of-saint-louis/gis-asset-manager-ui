// import state variables from asset-chooser-state.js
import {
  sketchableMapLayersToAdd,
  allSketchableLayerIds,
  sketchableLayersWithNoAdditionRequired,
  graphicLayers,
  createdAssets,
  // isSketchEnabled,
} from "./asset-chooser-state.js";
// import from asset-chooser-functions.js
import { monitorLayerVisibility } from "./asset-chooser-functions.js";
// import asset-chooser-map-layer-data-display component
import "./asset-chooser-map-layer-data-display.js";

// event listener to capture sketchable layer data from sketchable-map-layer.js
export const captureSketachableMapLayers = () => {
  document.addEventListener("sketchableLayerDetailsProvided", (event) => {
    const sketchableLayer = event.detail;
    sketchableMapLayersToAdd.push(sketchableLayer);
    // console.log("Sketchable layer details captured:", sketchableLayer);
    // console.log(
    //   "Current sketchableMapLayersToAdd array:",
    //   sketchableMapLayersToAdd
    // );
  });
};

const enableSketchForLayer = (layer) => {
  // console.log("Enabling sketch for layer:", layer);
  // Logic to enable sketching for the specified layer
  // This could involve activating a sketch widget or similar functionality
  const sketch = document.getElementById("asset-chooser-sketch");
  sketch.availableCreateTools = layer.sketchType;
  sketch.removeAttribute("hidden");
  // sketch.layer = layer;????
  // how do i set the layer?
  // Set the sketch widget's layer to the correct GraphicsLayer
  if (layer.graphicsLayer) {
    sketch.layer = layer.graphicsLayer;
  } else {
    console.warn("No graphicsLayer found on layer object!");
  }
};

const hideOrShowSketchableLayer = (layerName) => {
  console.log("graphicLayers:", graphicLayers);
  const layer = graphicLayers.find(
    (lyr) => lyr.layerProperties.layerName === layerName
  );
  if (layer) {
    layer.visible = !layer.visible;
    console.log(`Layer ${layerName} visibility toggled to:`, layer.visible);
  } else {
    console.warn(`Layer ${layerName} not found in graphicLayers array!`);
  }
};

// const hideLayerHandler = (layerName) => {
//   console.log("Hiding layer:", layerName);
//   hideOrShowSketchableLayer(layerName);
// };

export const addSketchableMapLayer = async ({
  sketchableMapLayer,
  map,
  view,
  reactiveUtils,
}) => {
  console.log("Adding sketchable map layer:", sketchableMapLayer);

  const GraphicsLayer = await $arcgis.import(
    "@arcgis/core/layers/GraphicsLayer.js"
  );
  const sketchableGraphicLayer = new GraphicsLayer({
    title: sketchableMapLayer.name,
    maxAssetsAllowed: parseInt(sketchableMapLayer.maximum),
    minAssetsRequired: parseInt(sketchableMapLayer.minimum),
    visible: true,
    minScale: sketchableMapLayer.minScale,
    maxScale: sketchableMapLayer.maxScale,
    sketchType: sketchableMapLayer.sketchType,
    layerProperties: {
      layerName: sketchableMapLayer.name,
      formattedLayerName: sketchableMapLayer.name.replace(/[-]/g, " "),
      minAssetsRequired: parseInt(sketchableMapLayer.minimum),
      maxAssetsAllowed: parseInt(sketchableMapLayer.maximum),
      isSketchable: true,
      minScale: sketchableMapLayer.minScale,
      maxScale: sketchableMapLayer.maxScale,
      sketchType: sketchableMapLayer.sketchType,
    },
  });

  const sketchableGraphicLayerId = `${sketchableGraphicLayer.layerProperties.layerName}-${sketchableGraphicLayer.id}`;
  allSketchableLayerIds.push(sketchableGraphicLayerId);
  graphicLayers.push(sketchableGraphicLayer);
  // Attach the GraphicsLayer instance to the layer object
  sketchableMapLayer.graphicsLayer = sketchableGraphicLayer;
  console.log("sketchableMapLayer with graphicsLayer:", sketchableMapLayer);
  sketchableGraphicLayer.id = sketchableGraphicLayerId;

  map.add(sketchableGraphicLayer);
  const layerName = sketchableGraphicLayer.layerProperties.layerName;
  console.log("layerName", layerName);
  const formattedLayerName =
    sketchableGraphicLayer.layerProperties.formattedLayerName;
  const minAssetsRequired = parseInt(
    sketchableGraphicLayer.layerProperties.minAssetsRequired
  );
  console.log("minAssetsRequired", minAssetsRequired);
  if (minAssetsRequired === 0) {
    sketchableLayersWithNoAdditionRequired.push(layerName);
  }
  const maxAssetsAllowed = parseInt(
    sketchableGraphicLayer.layerProperties.maxAssetsAllowed
  );
  const layerMinScale = parseInt(
    sketchableGraphicLayer.layerProperties.minScale
  );
  const layerMaxScale = parseInt(
    sketchableGraphicLayer.layerProperties.maxScale
  );
  const sketchableLayerDataDiv = document.getElementById(
    "sketchable-layer-data-div"
  );

  view.on("layerview-create", function (event) {
    if (event.layer === sketchableGraphicLayer) {
      monitorLayerVisibility(
        reactiveUtils,
        event.layerView,
        sketchableGraphicLayer,
        layerName,
        formattedLayerName,
        layerMinScale,
        layerMaxScale
      );
    }
  });

  const mapLayerDataDisplay = document.createElement(
    "asset-chooser-map-layer-data-display"
  );
  mapLayerDataDisplay.data = {
    layerName: layerName,
    formattedLayerName: formattedLayerName,
    minAssetsRequired: minAssetsRequired,
    maxAssetsAllowed: maxAssetsAllowed,
    enableSketchHandler: enableSketchForLayer,
    showHideHandler: hideOrShowSketchableLayer,
    isSketchable: true,
    layerMinScale: layerMinScale,
    layerMaxScale: layerMaxScale,
    availableCreateTools: sketchableMapLayer.sketchType,
    layer: sketchableMapLayer,
  };
  sketchableLayerDataDiv.appendChild(mapLayerDataDisplay);
  // console.log("Appended mapLayerDataDisplay for sketchable layer:", sketchableLayerName, mapLayerDataDisplay.data);
};

export const sketchAsset = (sketchComponent) => {
  console.log("sketchComponent:", sketchComponent);
  if (sketchComponent._arcgisCreateListenerAttached) return; // Prevent duplicate listeners
  sketchComponent.addEventListener("arcgisCreate", (event) => {
    if (event.detail.state !== "complete") return; // Only handle completed graphics
    const graphic = event.detail.graphic;
    graphic.attributes = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: "proposed",
      layerName: sketchComponent.layer.title,
      layerId: sketchComponent.layer.id,
      // point, line, or polygon
      geometryType: graphic.geometry.type,
    };
    console.log("New graphic created via sketch widget:", graphic);
    // Additional logic here
    if (!sketchComponent.availableCreateTools.includes(graphic.geometry.type)) {
      console.warn(
        `Created graphic type ${graphic.geometry.type} is not allowed in this layer!`
      );
      if (sketchComponent.layer && sketchComponent.layer.graphics) {
        sketchComponent.layer.graphics.remove(graphic);
      }
      return;
    }
    createdAssets.push(graphic);
    console.log("Updated createdAssets array:", createdAssets);
  });
};

//   const sketchableLayerDataDivElement = document.createElement("div");

//   sketchableLayerDataDiv.innerHTML += `
//     <div class="sketchable-map-layer-data-container stat-container stat-medium">
//       <div
//         class="stat-title"
//         id="${sketchableLayerName}-layer-selected-asset-container"
//         aria-label="${sketchableLayerName} Layer"
//         title="${sketchableLayerName} Layer"
//       >
//         <div>
//           <span>
//             <strong>
//               ${sketchableLayerName} Layer
//             </strong>
//           </span>
//         </div>
//         <div>
//         <button
//           type="button"
//           id="${sketchableLayerName}-enable-sketch-btn"
//           class="toggleLayerVisibilityButton"
//           att-layer-id="${sketchableLayerName}"
//           aria-label=""
//           title="Enable sketch for ${sketchableLayerName} layer"
//         >
//           <span id="${sketchableLayerName}-toggle-visibility-btn-text-span">
//             Add Assets
//           </span>
//         </button>
//         <button
//           type="button"
//           id="${sketchableLayerName}-show-hide-layer-btn"
//           class="toggleLayerVisibilityButton"
//           att-layer-id="${sketchableLayerName}"
//           aria-label=""
//           title="Hide ${sketchableLayerName} layer"
//         >
//           <span id="${sketchableLayerName}-toggle-visibility-btn-text-span">
//             Hide
//           </span>
//         </button>
//         </div>
//       </div>
//       <div
//         aria-live="polite"
//         aria-atomic="true"
//         class="asset-selection-requirements"
//       >
//         <span class="sr-only">Asset addition requirements and status for ${sketchableLayerName} layer</span>

//         ${
//           minAssetsRequired === 0
//             ? `
//             <span id="${sketchableLayerName}-min-asset-required-message" title="No additions required">
//               <span class="label label-success">
//                 No additions required
//               </span>
//             </span>
//             `
//             : minAssetsRequired === 1
//             ? `
//             <span id="${sketchableLayerName}-min-asset-required-message" title="${minAssetsRequired} additions required from ${sketchableLayerName} layer">
//               <span class="label label-error">
//                ${minAssetsRequired} required
//               </span>
//             </span>
//             `
//             : `
//             <span id="${sketchableLayerName}-min-asset-required-message" title="At least ${minAssetsRequired} additions required from ${sketchableLayerName} layer">
//               <span class="label label-error">
//                 At least ${minAssetsRequired} required
//               </span>
//             </span>
//             `
//         }
//         ${
//           maxAssetsAllowed > 0
//             ? `
//             <span id="${sketchableLayerName}-max-asset-required-message" title="Add a maximum of ${maxAssetsAllowed} for ${sketchableLayerName} layer">
//               <span class="label label-default">Add a maximum of ${maxAssetsAllowed}
//               </span>
//             </span>`
//             : ``
//         }
//       </div>
//       <ul
//         data-layer-name=${sketchableLayerName}
//         class="list-group highlighted-asset-data-list"
//         id="${sketchableLayerName}"
//         aria-live="polite"
//         aria-atomic="true"
//       >
//         <li
//           title="No assets added for ${sketchableLayerName} layer"
//         >
//           None added
//         </li>
//       </ul>
//     </div>
//   `;
// // After you add the HTML to the DOM:
// const btn = document.getElementById(`${sketchableLayerName}-enable-sketch-btn`);
// if (btn) {
//   btn.addEventListener("click", () => enableSketchForLayer(sketchableLayerName));
// }

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

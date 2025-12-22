// import state variables from asset-chooser-state.js
import {
  sketchableMapLayersToAdd,
  allSketchableLayerIds,
  sketchableLayersWithNoAdditionRequired,
  graphicLayers,
  createdAssets,
  validSketchableLayers,
  setCreatedAssetsAreValid,
  createdAssetsAreValid,
  // isSketchEnabled,
} from "./asset-chooser-state.js";
// import from asset-chooser-functions.js
import {
  monitorLayerVisibility,
  renderValidityMessage,
} from "./asset-chooser-functions.js";
// import asset-chooser-map-layer-data-display component
import "./asset-chooser-map-layer-data-display.js";

export const dispatchCreatedAssets = (createdAssets) => {
  const event = new CustomEvent("createdAssetsAreValidIsTrue", {
    detail: { createdAssets },
  });
  document.dispatchEvent(event);
  console.log("Dispatched createdAssetsAreValidIsTrue event:", event);
};

// export const dispatchCreatedAssets = (createdAssets) => {
//   // Only include serializable fields: attributes (without 'layer') and geometry as JSON
//   const serializableAssets = createdAssets.map(asset => {
//     // Clone attributes, omitting any non-serializable fields (like 'layer')
//     const { layer, ...safeAttributes } = asset.attributes || {};
//     return {
//       attributes: safeAttributes,
//       geometry: asset.geometry && asset.geometry.toJSON ? asset.geometry.toJSON() : asset.geometry
//     };
//   });
//   const event = new CustomEvent("createdAssetsAreValidIsTrue", {
//     detail: { createdAssets: serializableAssets },
//   });
//   document.dispatchEvent(event);
//   console.log("Dispatched createdAssetsAreValidIsTrue event:", event);
// };

// custom event listener to signal when createdAssets are not valid
export const secureCreatedAssets = () => {
  const event = new CustomEvent("createdAssetsAreValidIsFalse", {
    detail: { createdAssetsAreValid },
  });
  document.dispatchEvent(event);
  console.log("Dispatched createdAssetsAreValidIsFalse event:", event);
};

// event listener to capture sketchable layer data from sketchable-map-layer.js
export const captureSketachableMapLayers = () => {
  document.addEventListener("sketchableLayerDetailsProvided", (event) => {
    const sketchableLayer = event.detail;
    sketchableMapLayersToAdd.push(sketchableLayer);
  });
};

const enableSketchForLayer = (layer) => {
  console.log("Enabling sketch for layer:", layer);
  const modeStatusTextSpan = document.getElementById("mode-status-text-span");
  modeStatusTextSpan.innerText = `Sketch Mode Enabled for ${layer.graphicsLayer.formattedLayerName}.`;
  const enableSketchButtons = document.querySelectorAll(
    ".enable-sketch-button"
  );
  enableSketchButtons.forEach((element) => {
    element.classList.remove("sketch-button-shadow", "pointer-events-none");
    element.disabled = false;
  });
  // Sanitize the layer title the same way as in asset-chooser-map-layer-data-display.js
  const sanitizedLayerName = layer.name
    .replace(/[-, _]/g, " ")
    .replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    )
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "");
  const layerEnableSketchButton = document.getElementById(
    `enable-sketch-btn-${sanitizedLayerName}`
  );
  layerEnableSketchButton.classList.add(
    "sketch-button-shadow",
    "pointer-events-none"
  );
  layerEnableSketchButton.disabled = true;
  const sketch = document.getElementById("asset-chooser-sketch");
  if (sketch && sketch.shadowRoot) {
    const style = document.createElement("style");
    style.textContent = `
    .esri-sketch > div:first-of-type {
      border: 2px solid #174054 !important;
      box-sizing: border-box;
    }
  `;
    sketch.shadowRoot.appendChild(style);
  }
  const sketchType = layer.sketchType;
  sketch.availableCreateTools = layer.sketchType;
  sketch.removeAttribute("hidden");
  const mapContainer = document.getElementById("viewDiv");
  mapContainer.style.pointerEvents = "auto";
  // Set the sketch widget's layer to the correct GraphicsLayer
  if (layer.graphicsLayer) {
    // sketch.layer = layer;
    sketch.layer = layer.graphicsLayer;
  } else {
    console.warn("No graphicsLayer found on layer object!");
  }
  setTimeout(() => {
    // Collect all shadow DOM buttons into an array
    const shadowButtons = [];
    const collectShadowButtons = (node) => {
      if (!node) return;
      if (node.querySelectorAll) {
        const btns = node.querySelectorAll("button");
        // console.log("Found buttons in shadow DOM:", btns);
        if (btns.length) {
          shadowButtons.push(...btns);
          // console.log("Current shadowButtons array:", shadowButtons);
        }
      }
      if (node.shadowRoot) {
        collectShadowButtons(node.shadowRoot);
      }
      if (node.children) {
        Array.from(node.children).forEach((child) =>
          collectShadowButtons(child)
        );
      }
    };

    collectShadowButtons(sketch);
    // console.log("All shadow DOM buttons:", shadowButtons);
    const targetButton = shadowButtons.find(
      (b) =>
        b.getAttribute("aria-label") &&
        b.getAttribute("aria-label").toLowerCase().includes(sketchType)
    );
    if (targetButton) {
      targetButton.click();
      console.log(`Clicked sketch tool button for type: ${sketchType}`);
    } else {
      console.warn(
        `Could not find the sketch tool button for type: ${sketchType}`
      );
    }
    const selectButton = shadowButtons.find(
      (b) =>
        b.getAttribute("aria-label") &&
        b.getAttribute("aria-label").toLowerCase().includes("select")
    );
    if (selectButton) {
      selectButton.setAttribute("hidden", "true");
      console.log(`Hidden select tool button`);
    } else {
      console.warn(`Could not find the select tool button`);
    }
  }, 0);
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

export const addSketchableMapLayer = async ({
  sketchableMapLayer,
  map,
  view,
  reactiveUtils,
}) => {
  const GraphicsLayer = await $arcgis.import(
    "@arcgis/core/layers/GraphicsLayer.js"
  );

  const layerMinScale = parseInt(sketchableMapLayer.minScale, 10) || 0;
  const layerMaxScale = parseInt(sketchableMapLayer.maxScale, 10) || 0;

  const sketchableGraphicLayer = new GraphicsLayer({
    title: sketchableMapLayer.name,
    maxAssetsAllowed: parseInt(sketchableMapLayer.maximum),
    minAssetsRequired: parseInt(sketchableMapLayer.minimum),
    visible: true,
    layerName: sketchableMapLayer.name,
    formattedLayerName: sketchableMapLayer.name.replace(/[-]/g, " "),
    minScale: sketchableMapLayer.minScale,
    maxScale: sketchableMapLayer.maxScale,
    sketchType: sketchableMapLayer.sketchType,
    layerProperties: {
      layerId: sketchableMapLayer.id,
      layerName: sketchableMapLayer.name,
      formattedLayerName: sketchableMapLayer.name.replace(/[-]/g, " "),
      minAssetsRequired: parseInt(sketchableMapLayer.minimum),
      maxAssetsAllowed: parseInt(sketchableMapLayer.maximum),
      isSketchable: true,
      minScale: layerMinScale,
      maxScale: layerMaxScale,
      sketchType: sketchableMapLayer.sketchType,
    },
  });
  // After creating the GraphicsLayer:
  sketchableGraphicLayer.config = sketchableMapLayer;
  console.log("sketchableGraphicLayer created:", sketchableGraphicLayer);
  const sketchableGraphicLayerId = `${sketchableGraphicLayer.layerProperties.layerName}-${sketchableGraphicLayer.id}`;
  allSketchableLayerIds.push(sketchableGraphicLayerId);
  graphicLayers.push(sketchableGraphicLayer);
  // Attach the GraphicsLayer instance to the layer object
  sketchableMapLayer.graphicsLayer = sketchableGraphicLayer;
  // console.log("sketchableMapLayer with graphicsLayer:", sketchableMapLayer);
  sketchableGraphicLayer.id = sketchableGraphicLayerId;

  map.add(sketchableGraphicLayer);
  const layerName = sketchableGraphicLayer.layerProperties.layerName;
  console.log("layerName", layerName);
  const formattedLayerName =
    sketchableGraphicLayer.layerProperties.formattedLayerName;
  console.log("formattedLayerName", formattedLayerName);
  const minAssetsRequired = parseInt(
    sketchableGraphicLayer.layerProperties.minAssetsRequired
  );
  console.log("minAssetsRequired", minAssetsRequired);
  if (minAssetsRequired === 0) {
    sketchableLayersWithNoAdditionRequired.push(sketchableGraphicLayerId);
    validSketchableLayers.push(sketchableGraphicLayerId);
    console.log(
      "sketchableLayersWithNoAdditionRequired:",
      sketchableLayersWithNoAdditionRequired
    );
    console.log("validSketchableLayers:", validSketchableLayers);
  }
  if (validSketchableLayers.length === allSketchableLayerIds.length) {
    setCreatedAssetsAreValid(true);
  }
  console.log("createdAssetsAreValid:", createdAssetsAreValid);
  const maxAssetsAllowed = parseInt(
    sketchableGraphicLayer.layerProperties.maxAssetsAllowed
  );
  // const layerMinScale = parseInt(
  //   sketchableGraphicLayer.layerProperties.minScale
  // );
  // const layerMaxScale = parseInt(
  //   sketchableGraphicLayer.layerProperties.maxScale
  // );
  // const sketchableLayerDataDiv = document.getElementById(
  //   "sketchable-layer-data-div"
  // );
  const layerDataContainer = document.getElementById("layer-data-container");
  layerDataContainer.classList.add("stat-group");

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
  mapLayerDataDisplay.setAttribute("data-layer-id", sketchableGraphicLayerId);
  // mapLayerDataDisplay.classList.add("col-sm-6", "col-lg-4");
  mapLayerDataDisplay.data = {
    layerName: layerName,
    formattedLayerName: formattedLayerName,
    mapDataLayerId: sketchableGraphicLayerId,
    minAssetsRequired: minAssetsRequired,
    maxAssetsAllowed: maxAssetsAllowed,
    enableSketchHandler: enableSketchForLayer,
    showHideHandler: hideOrShowSketchableLayer,
    isSketchable: true,
    layerMinScale: layerMinScale,
    layerMaxScale: layerMaxScale,
    availableCreateTools: sketchableMapLayer.sketchType,
    layer: sketchableMapLayer, // <-- your config object (for sketching logic)
    arcgisLayer: sketchableGraphicLayer, // <-- the real ArcGIS layer (for zoom alert)
    view: view,
  };
  console.log(
    "mapLayerDataDisplay for sketchable layer:",
    mapLayerDataDisplay.data
  );
  // sketchableLayerDataDiv.appendChild(mapLayerDataDisplay);
  layerDataContainer.appendChild(mapLayerDataDisplay);
};

export const validateCreatedAssets = () => {
  console.log("Validating created assets...");
  if (validSketchableLayers.length === allSketchableLayerIds.length) {
    setCreatedAssetsAreValid(true);
    dispatchCreatedAssets(createdAssets);
  } else {
    setCreatedAssetsAreValid(false);
    secureCreatedAssets();
  }
  console.log("createdAssetsAreValid:", createdAssetsAreValid);
  renderValidityMessage();
};

export const updateLayerRequirementDisplay = (asset) => {
  const layerId = asset.attributes.layerId;
  const layer = graphicLayers.find(
    (graphicLayer) => graphicLayer.id === layerId
  );
  if (!layer) {
    console.warn(`Layer with ID ${layerId} not found in graphicLayers array!`);
    return;
  }
  const layerAssetMin = parseInt(layer.layerProperties.minAssetsRequired);
  // const layerAssetMax = parseInt(layer.layerProperties.maxAssetsAllowed);
  // console.log("layerAssetMax", layerAssetMax);
  const totalLayerAssetsCreated = createdAssets.filter(
    (createdAsset) => createdAsset.attributes.layerId === `${layerId}`
  ).length;
  console.log("totalLayerAssetsCreated", totalLayerAssetsCreated);

  const minAssetMessageElement = document.getElementById(
    `${layerId}-min-asset-required-message`
  );
  // const maxAssetMessageElement = document.getElementById(
  //   `${layerId}-max-asset-allowed-message`
  // );
  if (totalLayerAssetsCreated >= layerAssetMin) {
    minAssetMessageElement.classList.remove("label-error");
    minAssetMessageElement.classList.add("label-success");
    minAssetMessageElement.title = `Minimum requirements met for ${asset.attributes.formattedLayerName} layer`;
    if (!validSketchableLayers.includes(layerId)) {
      validSketchableLayers.push(layerId);
    }
    validateCreatedAssets();
    console.log("createdAssetsAreValid:", createdAssetsAreValid);
  } else {
    minAssetMessageElement.classList.remove("label-success");
    minAssetMessageElement.classList.add("label-error");
    minAssetMessageElement.title = `Minimum requirements not met for ${asset.attributes.formattedLayerName} layer`;
    const layerIndex = validSketchableLayers.indexOf(layerId);
    if (layerIndex !== -1) {
      validSketchableLayers.splice(layerIndex, 1);
    }
    validateCreatedAssets();
  }
  const assetCountDisplay = document.querySelector(
    `asset-chooser-map-layer-data-display[data-layer-id="${layerId}"]`
  );
  if (assetCountDisplay) {
    assetCountDisplay.assetCount = totalLayerAssetsCreated;
  }
};

function removeLabelForAsset(assetId) {
  // Find the asset in createdAssets to get its layer
  const asset = createdAssets.find((a) => a.attributes.id === assetId);
  if (!asset || !asset.layer || !asset.layer.graphics) return;
  // Find the label graphic by relatedAssetId
  const label = asset.layer.graphics.find(
    (g) => g.attributes && g.attributes.relatedAssetId === assetId
  );
  if (label) {
    asset.layer.graphics.remove(label);
  }
}


const handleRemoveSketchedAsset = (assetId) => {
  removeLabelForAsset(assetId);
  console.log("Current createdAssets array (snapshot):", [...createdAssets]);
  console.log("Removing sketched asset with ID:", assetId);

  const asset = createdAssets.find((asset) => asset.attributes.id === assetId);
  console.log("!!!!!!!!!!!!!Asset found for removal:", asset);

  const assetIndex = createdAssets.findIndex(
    (asset) => asset.attributes.id === assetId
  );
  if (assetIndex !== -1) {
    const asset = createdAssets[assetIndex];
    // Remove from the graphics layer
    console.log("Asset to remove:", asset);
    const layer = asset.layer;
    if (layer && layer.graphics) {
      layer.graphics.remove(asset);
    }
    // Remove from createdAssets array
    createdAssets.splice(assetIndex, 1);
    // Remove the list item from the DOM
    const listItem = document.getElementById(assetId);
    if (listItem) listItem.remove();
    // If the list is now empty, add back the "None added" item
    const layerAssetList = document.getElementById(asset.attributes.layerId);
    if (layerAssetList && layerAssetList.children.length === 0) {
      const noneAddedItem = document.createElement("li");
      noneAddedItem.title = `No assets added for ${asset.attributes.formattedLayerName} layer`;
      noneAddedItem.textContent = "None added";
      layerAssetList.appendChild(noneAddedItem);
    }
    updateLayerRequirementDisplay(asset);
  }
  console.log("Updated createdAssets array after removal:", createdAssets);
  validateCreatedAssets();
};

const renderCreatedAssetLabel = (graphic) => {
  console.log("asset created", graphic);
  // Use getElementById for the container, then querySelector for the child
  const layerAssetList = document.getElementById(graphic.attributes.layerId);
  if (layerAssetList) {
    const formattedLayerName = graphic.layer.formattedLayerName || "Unknown";
    const firstLi = layerAssetList.querySelector("li");
    if (
      firstLi &&
      firstLi.textContent.trim().toLowerCase().startsWith("none")
    ) {
      firstLi.remove();
    }
    const listItem = document.createElement("li");
    listItem.id = graphic.attributes.id;
    listItem.title = `Proposed ${formattedLayerName} added with ID: ${graphic.attributes.id}`;
    const listItemIndex = Array.from(layerAssetList.children).length;
    const listItemPosition = listItemIndex + 1;
    console.log("listItemIndex", listItemIndex);
    const listItemContentSpan = document.createElement("span");
    listItemContentSpan.classList.add("asset-list-item-content-span");
    listItemContentSpan.textContent = `${formattedLayerName} ${listItemPosition}`;
    const listItemRemoveButton = document.createElement("button");
    listItemRemoveButton.setAttribute("type", "button");
    listItemRemoveButton.setAttribute(
      "aria-label",
      `Remove asset ${graphic.attributes.id}`
    );
    listItemRemoveButton.setAttribute(
      "title",
      `Remove asset ${graphic.attributes.id}`
    );
    listItemRemoveButton.setAttribute(
      "id",
      `remove-${graphic.attributes.id}-btn`
    );
    listItemRemoveButton.classList.add(
      "pull-right",
      "link-button",
      "small-button",
      "red-button",
      "transparent-button",
      "remove-asset-btn"
    );
    const removeIconSpan = document.createElement("span");
    removeIconSpan.classList.add("glyphicons", "glyphicons-remove");
    listItemRemoveButton.appendChild(removeIconSpan);
    listItemRemoveButton.appendChild(document.createTextNode(" Remove"));
    listItemRemoveButton.addEventListener("click", () => {
      handleRemoveSketchedAsset(graphic.attributes.id);
      renderValidityMessage();
    });
    // --- Make the list item clickable to zoom to asset ---
    listItemContentSpan.style.cursor = "pointer";
    listItemContentSpan.addEventListener("click", () => {
      // Try to get the view from the graphicsLayer or pass it in as needed
      // const view = graphic.layer.graphicsLayer?.view || window.assetChooserMapView;
      const arcGisMap = document.querySelector("arcgis-map");
      const view = arcGisMap.view;
      if (view && graphic.geometry) {
        if (graphic.geometry.type === "point") {
          view.goTo(
            {
              center: [graphic.geometry.longitude, graphic.geometry.latitude],
              zoom: 17,
            },
            { duration: 800 }
          );
        } else if (graphic.geometry.extent) {
          // For polygons/lines, zoom to centroid
          view.goTo(
            {
              target: graphic.geometry.extent.center,
              zoom: 17,
            },
            { duration: 800 }
          );
        } else {
          view.goTo(graphic.geometry, { duration: 800 });
        }
      }
      if (!view) {
        console.warn("Map view not available for zooming to asset.");
      }
    });
    // -----------------------------------------------------

    listItem.appendChild(listItemContentSpan);
    listItem.appendChild(listItemRemoveButton);
    layerAssetList.appendChild(listItem);
  }
};

export const sketchAsset = (sketchComponent) => {
  // console.log("!!!!!!!!!!!!!!!!!!sketchComponent received:", sketchComponent.layer);
  // if (sketchComponent._arcgisCreateListenerAttached) return; // Prevent duplicate listeners
  sketchComponent.addEventListener("arcgisCreate", async (event) => {
    if (event.detail.state !== "complete") return; // Only handle completed graphics
    const graphic = event.detail.graphic;
    // console.log("Graphic created event received:", graphic);
    const config = sketchComponent.layer.config;
    console.log("Sketch component layer config:", config);
    const layerAssetMax =
      sketchComponent.layer.maxAssetsAllowed ??
      (sketchComponent.layer.layerProperties &&
        sketchComponent.layer.layerProperties.maxAssetsAllowed);
    // console.log("layerAssetMax", layerAssetMax);
    const totalLayerAssetsCreated = createdAssets.filter(
      (createdAsset) =>
        createdAsset.attributes.layerId === `${sketchComponent.layer.id}`
    ).length;
    if (totalLayerAssetsCreated >= layerAssetMax) {
      alert(
        `Maximum assets allowed for ${sketchComponent.layer.layerProperties.formattedLayerName} layer reached!`
      );
      console.warn(
        `Cannot add more assets to ${sketchComponent.layer.layerProperties.formattedLayerName} layer. Maximum of ${layerAssetMax} reached.`
      );
      return;
    }
    graphic.attributes = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: "Proposed",
      layerName: config.name,
      formattedLayerName: config.graphicsLayer.formattedLayerName,
      // (sketchComponent.layer.graphicsLayer &&
      //   sketchComponent.layer.graphicsLayer.formattedLayerName) ||
      // sketchComponent.layer.name ||
      // "Unknown",
      layerId: sketchComponent.layer.id,
      // layer: sketchComponent.layer,
      geometryType: graphic.geometry.type,
      geometryString: JSON.stringify(graphic.geometry),
    };

    // Add the graphic to the ArcGIS GraphicsLayer so it appears on the map
    if (
      sketchComponent.layer.graphicsLayer &&
      sketchComponent.layer.graphicsLayer.graphics
    ) {
      sketchComponent.layer.graphicsLayer.graphics.add(graphic);
    }

    const Graphic = await $arcgis.import("@arcgis/core/Graphic.js");

    // Create the label text
    const labelText = config.labelPrefix
      ? `${config.labelPrefix} ${totalLayerAssetsCreated + 1}`
      : `${graphic.attributes.formattedLayerName} ${
          totalLayerAssetsCreated + 1
        }`;

    const labelSymbol = {
      type: "text",
      color: "black",
      haloColor: "white",
      haloSize: "1px",
      text: labelText,
      xoffset: 0,
      yoffset: 12,
      font: {
        size: 12,
        family: "sans-serif",
        weight: "bold",
      },
    };

    // For points, use the geometry directly; for lines/polygons, use centroid
    let labelGeometry = graphic.geometry;
    if (graphic.geometry.type !== "point" && graphic.geometry.extent) {
      labelGeometry = graphic.geometry.extent.center;
    }

    // Only store the asset's ID in the label's attributes
    const labelGraphic = new Graphic({
      geometry: labelGeometry,
      symbol: labelSymbol,
      attributes: {
        relatedAssetId: graphic.attributes.id, // Only the ID, not the full object!
      },
    });

    sketchComponent.layer.graphics.add(labelGraphic);

    // (Optional) If you want to keep a reference to the label for UI logic (not for serialization), you can do:
    graphic.attributes.labelGraphicId = labelGraphic.uid; // This is safe, as it's just a string/number

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
    renderCreatedAssetLabel(graphic);
    console.log("sketched graphic", graphic);
    updateLayerRequirementDisplay(graphic);
  });
};

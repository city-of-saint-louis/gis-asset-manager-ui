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
import { monitorLayerVisibility, renderValidityMessage } from "./asset-chooser-functions.js";
// import asset-chooser-map-layer-data-display component
import "./asset-chooser-map-layer-data-display.js";

export const dispatchCreatedAssets = (createdAssets) => {
  const event = new CustomEvent("createdAssetsAreValidIsTrue", {
    detail: { createdAssets },
  });
  document.dispatchEvent(event);  
  console.log("Dispatched createdAssetsAreValidIsTrue event:", event);
}; 

// custom event listener to signal when createdAssets are not valid
export const secureCreatedAssets = () => {
  const event = new CustomEvent("createdAssetsAreValidIsFalse", { detail: { createdAssetsAreValid } });
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
  const sketch = document.getElementById("asset-chooser-sketch");
  const sketchType = layer.sketchType;
  sketch.availableCreateTools = layer.sketchType;
  sketch.removeAttribute("hidden");
  // Set the sketch widget's layer to the correct GraphicsLayer
  if (layer.graphicsLayer) {
    sketch.layer = layer.graphicsLayer;
  } else {
    console.warn("No graphicsLayer found on layer object!");
  }
  setTimeout(() => {
    // Collect all shadow DOM buttons into an array
    const shadowButtons = [];
    function collectShadowButtons(node) {
      if (!node) return;
      if (node.querySelectorAll) {
        const btns = node.querySelectorAll("button");
        if (btns.length) {
          shadowButtons.push(...btns);
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
    }

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
  const sketchableGraphicLayer = new GraphicsLayer({
    title: sketchableMapLayer.name,
    maxAssetsAllowed: parseInt(sketchableMapLayer.maximum),
    minAssetsRequired: parseInt(sketchableMapLayer.minimum),
    visible: true,
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
  // console.log("sketchableMapLayer with graphicsLayer:", sketchableMapLayer);
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
    sketchableLayersWithNoAdditionRequired.push(sketchableGraphicLayerId);
    validSketchableLayers.push(sketchableGraphicLayerId);
    console.log("sketchableLayersWithNoAdditionRequired:", sketchableLayersWithNoAdditionRequired);
    console.log("validSketchableLayers:", validSketchableLayers);
  }
  if (validSketchableLayers.length === allSketchableLayerIds.length) {
    setCreatedAssetsAreValid(true);
  }
  console.log("createdAssetsAreValid:", createdAssetsAreValid);
  const maxAssetsAllowed = parseInt(
    sketchableGraphicLayer.layerProperties.maxAssetsAllowed
  );
  const layerMinScale = parseInt(
    sketchableGraphicLayer.layerProperties.minScale
  );
  const layerMaxScale = parseInt(
    sketchableGraphicLayer.layerProperties.maxScale
  );
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
  mapLayerDataDisplay.classList.add("col-md-6", "col-lg-4");
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
    layer: sketchableMapLayer,
  };
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
}

export const updateLayerRequirementDisplay = (asset) => {
  const layerId = asset.attributes.layerId;
  const layer = graphicLayers.find((graphicLayer) => graphicLayer.id === layerId);
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

const handleRemoveSketchedAsset = (assetId) => {
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
  // see if the ul has a "None added" li and remove it
  const noneAddedLi = document.querySelector(
    `#${graphic.attributes.layerId} li[title="No assets added for ${graphic.attributes.formattedLayerName} layer"]`
  );
  if (noneAddedLi) {
    noneAddedLi.remove();
  }
  const layerAssetList = document.getElementById(
    `${graphic.attributes.layerId}`
  );
  // layerAssetList.textContent = "Proposed Additions:";
  const listItem = document.createElement("li");
  listItem.id = graphic.attributes.id;
  listItem.title = `Proposed ${graphic.attributes.formattedLayerName} added with ID: ${graphic.attributes.id}`;
  // listItem.textContent = `ID: ${graphic.attributes.id}`;
  const listItemContentSpan = document.createElement("span");
  listItemContentSpan.textContent = `ID: ${graphic.attributes.id}`;
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
  listItem.appendChild(listItemContentSpan);
  listItem.appendChild(listItemRemoveButton);
  layerAssetList.appendChild(listItem);
};

export const sketchAsset = (sketchComponent) => {
  // if (sketchComponent._arcgisCreateListenerAttached) return; // Prevent duplicate listeners
  sketchComponent.addEventListener("arcgisCreate", (event) => {
    if (event.detail.state !== "complete") return; // Only handle completed graphics
    const graphic = event.detail.graphic;
    console.log("Graphic created event received:", graphic);
    const layerAssetMax = parseInt(
      sketchComponent.layer.layerProperties.maxAssetsAllowed
    );
    console.log("layerAssetMax", layerAssetMax);
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
      layerName: sketchComponent.layer.title,
      formattedLayerName:
        sketchComponent.layer.layerProperties.formattedLayerName,
      layerId: sketchComponent.layer.id,
      layer: sketchComponent.layer,
      geometryType: graphic.geometry.type,
      geometryString: JSON.stringify(graphic.geometry),
    };
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
    // console.log("Updated createdAssets array:", createdAssets);
    renderCreatedAssetLabel(graphic);
    console.log("sketched graphic", graphic);
    updateLayerRequirementDisplay(graphic);
  });
};


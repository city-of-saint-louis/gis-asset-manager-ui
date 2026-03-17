class AssetManagerMapLayerDataDisplay extends HTMLElement {
  constructor() {
    super();
    this._data = null;
    this._rendered = false;
    this._assetCount = 0;
  }

  set assetCount(count) {
    this._assetCount = count;
    this.updateAssetCountDisplay();
  }

  get assetCount() {
    return this._assetCount;
  }

  updateAssetCountDisplay() {
    // Update the UI wherever you want to show the count
    const countSpan = this.querySelector(".asset-count-span");
    if (countSpan) {
      countSpan.textContent = this._assetCount;
    }
    // Also update the min-asset-required-message if it exists
    const minAssetMsg = this.querySelector(
      '[id$="-min-asset-required-message"]'
    );
    if (
      minAssetMsg &&
      this._data &&
      typeof this._data.minAssetsRequired === "number"
    ) {
      if (this._assetCount === 0) {
        minAssetMsg.textContent = `${this._data.minAssetsRequired} required.`;
      } else {
        minAssetMsg.textContent = `${this._assetCount} added. ${this._data.minAssetsRequired} required.`;
      }
    }
  }

  set data(layerData) {
    this._data = layerData;
    this.render(layerData);
  }

  get data() {
    return this._data;
  }

  connectedCallback() {
    // If data was set before the element was connected, render it now
    if (this._data) {
      this.render(this._data);
    }
  }

  // --- updateVisibility method ---
  updateVisibility({
    visibleAtCurrentScale,
    visible,
    formattedLayerName,
    layerMinScale,
    layerMaxScale,
  }) {
    // Use the same logic as before, but scoped to this component's DOM
    const displayNameRaw =
      this._data.formattedLayerName || this._data.layerName;
    const displayName = displayNameRaw
      .replace(/[-, _]/g, " ")
      .replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      );
    const sanitizedLayerName = displayName
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-_]/g, "");

    const toggleLayerVisibilityButton = this.querySelector(
      `#${sanitizedLayerName}-show-hide-layer-btn`
    );
    const toggleVisibilityBtnTextSpan = this.querySelector(
      `#${this._data.layerName}-toggle-visibility-btn-text-span`
    );
    const zoomAlertButton = this.querySelector(
      `#${sanitizedLayerName}-zoom-alert-button`
    );

    if (
      zoomAlertButton &&
      toggleLayerVisibilityButton &&
      toggleVisibilityBtnTextSpan
    ) {
      if (visibleAtCurrentScale) {
        zoomAlertButton.textContent = ``;
        zoomAlertButton.classList.add("invisible-button");
        toggleLayerVisibilityButton.removeAttribute("disabled");
        // toggleLayerVisibilityButton.removeAttribute("hidden");
        toggleLayerVisibilityButton.classList.remove("invisible-button");
        if (visible) {
          toggleVisibilityBtnTextSpan.textContent = `Hide`;
          toggleLayerVisibilityButton.setAttribute(
            "title",
            `Hide ${formattedLayerName} layer`
          );
        } else {
          toggleVisibilityBtnTextSpan.textContent = `Show`;
          toggleLayerVisibilityButton.setAttribute(
            "title",
            `Show ${formattedLayerName} layer`
          );
        }
      } else {
        zoomAlertButton.classList.remove("invisible-button");
        zoomAlertButton.textContent = `${layerMinScale > 0 ? `Zoom In` : ""} ${
          layerMaxScale > 0 ? `Zoom Out` : ""
        }`;
        toggleLayerVisibilityButton.setAttribute("disabled", true);
        toggleLayerVisibilityButton.classList.add("invisible-button");
      }
    }
  }
  // --- END updateVisibility method ---

  render(layerData) {
    this.innerHTML = ""; // Clear previous content
    const {
      layerName,
      mapDataLayerId,
      minAssetsRequired,
      maxAssetsAllowed,
      enableSketchHandler,
      isSketchable = false, // <-- flag to distinguish layer type
      // formattedLayerName, // for regular layers
      showHideHandler,
      layerMinScale = 0, // for zoom alert
      // layerMaxScale = 0, // for zoom alert
      // availableCreateTools, // for sketchable layers
    } = layerData;
    const sketchType = layerData.layer?.sketchType?.[0] || "unknown";
    // Map sketchType to display name
    let sketchTypeDisplay;
    if (sketchType === "polyline") {
      sketchTypeDisplay = "Line";
    } else {
      sketchTypeDisplay =
        sketchType.charAt(0).toUpperCase() + sketchType.slice(1);
    }
    const displayNameRaw = layerName.replace(/[-, _]/g, " ");
    const displayName = displayNameRaw.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
    const sanitizedLayerName = displayName
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-_]/g, "");
    const assetListClass = isSketchable
      ? "created-asset-data-list"
      : "chosen-asset-data-list";

    const componentContainer = document.createElement("div");
    componentContainer.classList.add(
      "map-layer-data-container",
      "stat-container",
      "stat-medium"
    );

    this.innerHTML = `
      <div class="map-layer-data-container stat-container stat-medium ${
        isSketchable ? "sketch-border" : "select-border"
      }">
        <div
          class="stat-title"
          id="${sanitizedLayerName}-layer-selected-asset-container"
          aria-label="${displayName} Layer"
          title="${displayName} Layer"
        >
          <div class="layer-data-display-title-div">
            <span class="layer-data-display-asset-type-icon-span-${isSketchable ? "sketch" : "select"}" id="${sanitizedLayerName}-layer-asset-type-icon"> ${
              isSketchable ? `<calcite-icon icon="pencil" />` : `<calcite-icon icon="cursor" />`
            }</span>
            <span>${displayName}</span>
          </div>
          <button
            class="zoom-alert-button"
            id="${sanitizedLayerName}-zoom-alert-button"
            title="Zoom In"
          >
            ${layerMinScale > 0 ? `Zoom In` : ""}
          </button>
          <button
            type="button"
            id="${sanitizedLayerName}-show-hide-layer-btn"
            class="toggleLayerVisibilityButton${
              layerMinScale > 0 ? " invisible-button" : ""
            }"
            att-layer-id="${mapDataLayerId}"
            aria-label=""
            title="Hide ${displayName} layer" ${
      layerMinScale > 0 ? "disabled" : ""
    }
          >
            <span id="${layerName}-toggle-visibility-btn-text-span">
              ${layerMinScale > 0 ? `Show` : `Hide`}
            </span>
          </button>
        </div>
        
        <div class="layer-data-display-row">
          <div
            aria-live="polite"
            aria-atomic="true"
            class="asset-selection-requirements"
          >
            <span class="sr-only">
              Asset requirements and status for ${displayName} layer
            </span>
            ${
              minAssetsRequired === 0
                ? `
              <span
                id="${mapDataLayerId}-min-asset-required-message"
                title="No selection required"
                class="label label-success"
              >
                0 required
              </span>
              <br>
            `
                : minAssetsRequired === 1
                ? `
              <span
                id="${mapDataLayerId}-min-asset-required-message"
                title="${minAssetsRequired} selection required from ${displayName} layer"
                class="label label-error"
              >
                ${minAssetsRequired} required
              </span>
              <br>
            `
                : `
              <span
                id="${mapDataLayerId}-min-asset-required-message"
                title="At least ${minAssetsRequired} selections required from ${displayName} layer"
                class="label label-error"
              >
                ${minAssetsRequired} required
              </span>
              <br>
            `
            }
            ${
              maxAssetsAllowed > 0
                ? `
              <span
                id="${mapDataLayerId}-max-asset-allowed-message"
                title="${
                  isSketchable
                    ? `Add a maximum of ${maxAssetsAllowed} to ${displayName} layer`
                    : `Select a maximum of ${maxAssetsAllowed} from ${displayName} layer`
                }"
                class="label label-default max-asset-allowed-message"
              >
                ${maxAssetsAllowed} maximum
              </span>`
                : ""
            }
          </div>
          <div class="layer-data-display-button-row">
            ${
              isSketchable
                ? `
              <button
                type="button"
                id="enable-sketch-btn-${sanitizedLayerName}"
                class="enable-sketch-button"
                aria-label="enable sketch for ${displayName} layer"
                title="Enable sketch for ${displayName} layer"
              >
                <span class="enable-sketch-icon" id="enable-sketch-icon-${sanitizedLayerName}"><calcite-icon icon="pencil" scale="s" /></span>Sketch</button>
            `
                : ""
            }
              
          </div>
        </div> 
        <div class="asset-list-wrapper">
          <ul
            data-layer-name="${sanitizedLayerName}"
            class="list-group ${assetListClass}"
            id="${mapDataLayerId}"
            aria-live="polite"
            aria-atomic="true"
            title="Asset display for ${displayName} layer"
          >
            <li title="No assets ${
              isSketchable ? "added" : "selected"
            } for ${displayName} layer">
              None ${isSketchable ? "added" : "selected"}
            </li>
          </ul>
        </div>
      </div>
   `;

    function getLodAtOrBelow(view, targetScale) {
      const tileInfo = view.map.basemap.baseLayers.items[0].tileInfo;
      if (!tileInfo || !tileInfo.lods) return targetScale;
      // Find the LOD with the largest scale <= targetScale (i.e., most detailed that is still valid)
      const lods = tileInfo.lods
        .filter((lod) => lod.scale <= targetScale)
        .sort((a, b) => b.scale - a.scale);
      if (lods.length > 0) return lods[0].scale;
      // If none found, use the most detailed LOD
      return tileInfo.lods[tileInfo.lods.length - 1].scale;
    }

    function getLodAtOrAbove(view, targetScale) {
      const tileInfo = view.map.basemap.baseLayers.items[0].tileInfo;
      if (!tileInfo || !tileInfo.lods) return targetScale;
      // Find the LOD with the smallest scale >= targetScale (i.e., least detailed that is still valid)
      const lods = tileInfo.lods
        .filter((lod) => lod.scale >= targetScale)
        .sort((a, b) => a.scale - b.scale);
      if (lods.length > 0) return lods[0].scale;
      // If none found, use the least detailed LOD
      return tileInfo.lods[0].scale;
    }

    const zoomAlertBtn = this.querySelector(
      `#${sanitizedLayerName}-zoom-alert-button`
    );

    if (zoomAlertBtn && this._data.view && this._data.layer) {
      zoomAlertBtn.onclick = (e) => {
        e.preventDefault();
        const view = this._data.view;
        const layer = this._data.layer;
        const minScale = layer.minScale || layer.layerMinScale || 0;
        const maxScale = layer.maxScale || layer.layerMaxScale || 0;
        // Snap to nearest LOD
        if (minScale > 0 && view.scale > minScale) {
          const snapScale = getLodAtOrBelow(view, minScale);
          view.goTo({ scale: snapScale });
        } else if (maxScale > 0 && view.scale < maxScale) {
          const snapScale = getLodAtOrAbove(view, maxScale);
          view.goTo({ scale: snapScale });
        } 
        // else {
        //   // console.log("[Zoom Alert] No zoom action taken.");
        // }
      };
    }

    // Attach event listeners
    if (
      isSketchable &&
      this.querySelector(`#enable-sketch-btn-${sanitizedLayerName}`)
    ) {
      this.querySelector(
        `#enable-sketch-btn-${sanitizedLayerName}`
      ).addEventListener(
        "click",
        () => enableSketchHandler && enableSketchHandler(layerData.layer)
      );
    }
    const hideBtn = this.querySelector(
      `#${sanitizedLayerName}-show-hide-layer-btn`
    );
    if (hideBtn) {
      hideBtn.onclick = () => {
        showHideHandler(layerName);
      };
    }
  }
}

export { AssetManagerMapLayerDataDisplay };
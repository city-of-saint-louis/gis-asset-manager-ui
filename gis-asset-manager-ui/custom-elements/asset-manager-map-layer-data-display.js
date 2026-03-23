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
      showHideHandler,
      layerMinScale = 0, // for zoom alert
      layerMaxScale = 0, // for zoom alert
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
    const view = layerData.view;

    function getLodAtOrBelow(view, targetScale) {
      const tileInfo = view.map.basemap.baseLayers.items[0].tileInfo;
      if (!tileInfo || !tileInfo.lods) return targetScale;
      // Find the Level of Detail (LOD) with the largest scale <= targetScale (i.e., most detailed that is still valid)
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












// class AssetManagerMapLayerDataDisplay extends HTMLElement {
//   // Static template created once
//   static #templateElement = null;

//   static getTemplate() {
//     if (!this.#templateElement) {
//       const template = document.createElement('template');
//       template.innerHTML = `
//         <div class="map-layer-data-container stat-container stat-medium">
//           <div class="stat-title" aria-label="Layer">
//             <div class="layer-data-display-title-div">
//               <span class="layer-data-display-asset-type-icon-span">
//                 <calcite-icon></calcite-icon>
//               </span>
//               <span class="layer-display-name"></span>
//             </div>
//             <button
//               class="zoom-alert-button"
//               title="Zoom In"
//             ></button>
//             <button
//               type="button"
//               class="toggleLayerVisibilityButton"
//               title="Hide layer"
//             >
//               <span class="toggle-visibility-text">Hide</span>
//             </button>
//           </div>

//           <div class="layer-data-display-row">
//             <div class="asset-selection-requirements" aria-live="polite" aria-atomic="true">
//               <span class="sr-only">Asset requirements and status</span>
//               <span class="min-asset-required-message"></span>
//               <span class="max-asset-allowed-message"></span>
//             </div>
//             <div class="layer-data-display-button-row">
//               <button 
//                 type="button"
//                 class="enable-sketch-button"
//                 style="display: none;"
//               >
//                 <span class="enable-sketch-icon"><calcite-icon icon="pencil" scale="s"></calcite-icon></span>
//                 Sketch
//               </button>
//             </div>
//           </div>

//           <div class="asset-list-wrapper">
//             <ul class="list-group asset-list">
//               <li>None selected</li>
//             </ul>
//           </div>
//         </div>
//       `;
//       this.#templateElement = template;
//     }
//     return this.#templateElement;
//   }

//   constructor() {
//     super();
//     this._data = null;
//     this._assetCount = 0;
//   }

//   set assetCount(count) {
//     this._assetCount = count;
//     this.updateAssetCountDisplay();
//   }

//   get assetCount() {
//     return this._assetCount;
//   }

//   updateAssetCountDisplay() {
//     const countSpan = this.querySelector(".asset-count-span");
//     if (countSpan) {
//       countSpan.textContent = this._assetCount;
//     }
//     const minAssetMsg = this.querySelector('[id$="-min-asset-required-message"]');
//     if (minAssetMsg && this._data && typeof this._data.minAssetsRequired === "number") {
//       if (this._assetCount === 0) {
//         minAssetMsg.textContent = `${this._data.minAssetsRequired} required.`;
//       } else {
//         minAssetMsg.textContent = `${this._assetCount} added. ${this._data.minAssetsRequired} required.`;
//       }
//     }
//   }

//   set data(layerData) {
//     this._data = layerData;
//     this.render(layerData);
//   }

//   get data() {
//     return this._data;
//   }

//   connectedCallback() {
//     if (this._data) {
//       this.render(this._data);
//     }
//   }

//   updateVisibility({
//     visibleAtCurrentScale,
//     visible,
//     formattedLayerName,
//     layerMinScale,
//     layerMaxScale,
//   }) {
//     const displayNameRaw = this._data.formattedLayerName || this._data.layerName;
//     const displayName = this._formatDisplayName(displayNameRaw);
//     const sanitizedLayerName = this._sanitizeLayerName(displayName);

//     const toggleLayerVisibilityButton = this.querySelector(
//       `#${sanitizedLayerName}-show-hide-layer-btn`
//     );
//     const toggleVisibilityBtnTextSpan = this.querySelector(
//       `#${this._data.layerName}-toggle-visibility-btn-text-span`
//     );
//     const zoomAlertButton = this.querySelector(
//       `#${sanitizedLayerName}-zoom-alert-button`
//     );

//     if (zoomAlertButton && toggleLayerVisibilityButton && toggleVisibilityBtnTextSpan) {
//       if (visibleAtCurrentScale) {
//         zoomAlertButton.textContent = ``;
//         zoomAlertButton.classList.add("invisible-button");
//         toggleLayerVisibilityButton.removeAttribute("disabled");
//         toggleLayerVisibilityButton.classList.remove("invisible-button");
//         if (visible) {
//           toggleVisibilityBtnTextSpan.textContent = `Hide`;
//           toggleLayerVisibilityButton.setAttribute("title", `Hide ${formattedLayerName} layer`);
//         } else {
//           toggleVisibilityBtnTextSpan.textContent = `Show`;
//           toggleLayerVisibilityButton.setAttribute("title", `Show ${formattedLayerName} layer`);
//         }
//       } else {
//         zoomAlertButton.classList.remove("invisible-button");
//         zoomAlertButton.textContent = `${layerMinScale > 0 ? `Zoom In` : ""} ${
//           layerMaxScale > 0 ? `Zoom Out` : ""
//         }`;
//         toggleLayerVisibilityButton.setAttribute("disabled", true);
//         toggleLayerVisibilityButton.classList.add("invisible-button");
//       }
//     }
//   }

//   render(layerData) {
//   const {
//     layerName,
//     mapDataLayerId,
//     minAssetsRequired,
//     maxAssetsAllowed,
//     enableSketchHandler,
//     isSketchable = false,
//     showHideHandler,
//     layerMinScale = 0,
//     layerMaxScale = 0,
//     view,
//     layer,
//   } = layerData;

//   const displayNameRaw = layerName.replace(/[-, _]/g, " ");
//   const displayName = this._formatDisplayName(displayNameRaw);
//   const sanitizedLayerName = this._sanitizeLayerName(displayName);
//   const assetListClass = isSketchable ? "created-asset-data-list" : "chosen-asset-data-list";

//   // Clone template
//   const template = AssetManagerMapLayerDataDisplay.getTemplate();
//   const fragment = template.content.cloneNode(true);

//   // Update container
//   const container = fragment.querySelector(".map-layer-data-container");
//   container.classList.add(isSketchable ? "sketch-border" : "select-border");

//   // Update title section
//   const statTitle = fragment.querySelector(".stat-title");
//   statTitle.id = `${sanitizedLayerName}-layer-selected-asset-container`;
//   statTitle.setAttribute("aria-label", `${displayName} Layer`);
//   statTitle.setAttribute("title", `${displayName} Layer`);

//   // Update display name
//   fragment.querySelector(".layer-display-name").textContent = displayName;

//   // Update icon
//   const icon = fragment.querySelector(".layer-data-display-asset-type-icon-span calcite-icon");
//   icon.setAttribute("icon", isSketchable ? "pencil" : "cursor");

//   // Update zoom button
//   const zoomBtn = fragment.querySelector(".zoom-alert-button");
//   zoomBtn.id = `${sanitizedLayerName}-zoom-alert-button`;
//   zoomBtn.textContent = layerMinScale > 0 ? "Zoom In" : "";
//   if (layerMinScale === 0) {
//     zoomBtn.style.display = "none";
//   }

//   // Update hide/show button
//   const toggleBtn = fragment.querySelector(".toggleLayerVisibilityButton");
//   toggleBtn.id = `${sanitizedLayerName}-show-hide-layer-btn`;
//   toggleBtn.setAttribute("att-layer-id", mapDataLayerId);
//   toggleBtn.setAttribute("aria-label", "");
//   toggleBtn.setAttribute("title", `Hide ${displayName} layer`);
//   if (layerMinScale > 0) {
//     toggleBtn.setAttribute("disabled", "");
//     toggleBtn.classList.add("invisible-button");
//   }

//   const toggleVisibilityTextSpan = fragment.querySelector(".toggle-visibility-text");
//   toggleVisibilityTextSpan.id = `${layerName}-toggle-visibility-btn-text-span`;
//   toggleVisibilityTextSpan.textContent = layerMinScale > 0 ? "Show" : "Hide";

//   // Update min assets required
//   const minAssetMsg = fragment.querySelector(".min-asset-required-message");
//   minAssetMsg.id = `${mapDataLayerId}-min-asset-required-message`;
//   this._updateMinAssetsDisplay(minAssetMsg, minAssetsRequired, displayName, isSketchable);

//   // Update max assets allowed
//   const maxAssetMsg = fragment.querySelector(".max-asset-allowed-message");
//   if (maxAssetsAllowed > 0) {
//     maxAssetMsg.id = `${mapDataLayerId}-max-asset-allowed-message`;
//     maxAssetMsg.className = "label label-default max-asset-allowed-message";
//     maxAssetMsg.textContent = `${maxAssetsAllowed} maximum`;
//     maxAssetMsg.title = `${isSketchable ? "Add" : "Select"} a maximum of ${maxAssetsAllowed} to ${displayName} layer`;
//   } else {
//     maxAssetMsg.style.display = "none";
//   }

//   // Update sketch button container
// const buttonRow = fragment.querySelector(".layer-data-display-button-row");
// buttonRow.innerHTML = isSketchable ? `
//   <button
//     type="button"
//     id="enable-sketch-btn-${sanitizedLayerName}"
//     class="enable-sketch-button"
//     aria-label="enable sketch for ${displayName} layer"
//     title="Enable sketch for ${displayName} layer"
//   >
//     <span class="enable-sketch-icon" id="enable-sketch-icon-${sanitizedLayerName}"><calcite-icon icon="pencil" scale="s"></calcite-icon></span>Sketch
//   </button>
// ` : '';

// // Get the fresh button reference if it exists
// const sketchBtn = fragment.querySelector(".enable-sketch-button");

//   // Update asset list
//   const assetList = fragment.querySelector(".asset-list");
//   assetList.id = mapDataLayerId;
//   assetList.setAttribute("data-layer-name", sanitizedLayerName);
//   assetList.className = `list-group ${assetListClass}`;
//   assetList.setAttribute("title", `Asset display for ${displayName} layer`);
//   const listItem = assetList.querySelector("li");
//   listItem.textContent = `None ${isSketchable ? "added" : "selected"}`;
//   listItem.title = `No assets ${isSketchable ? "added" : "selected"} for ${displayName} layer`;

//   // Update sr-only span
//   const srOnly = fragment.querySelector(".sr-only");
//   srOnly.textContent = `Asset requirements and status for ${displayName} layer`;

//   // Clear and append
//   this.innerHTML = "";
//   this.appendChild(fragment);

//   // Zoom alert functionality
//   if (zoomBtn && view && layer) {
//     zoomBtn.onclick = (e) => {
//       e.preventDefault();
//       const minScale = layer.minScale || layer.layerMinScale || 0;
//       const maxScale = layer.maxScale || layer.layerMaxScale || 0;
//       if (minScale > 0 && view.scale > minScale) {
//         const snapScale = this._getLodAtOrBelow(view, minScale);
//         view.goTo({ scale: snapScale });
//       } else if (maxScale > 0 && view.scale < maxScale) {
//         const snapScale = this._getLodAtOrAbove(view, maxScale);
//         view.goTo({ scale: snapScale });
//       }
//     };
//   }

//   // Hide/show button event listener
//   if (toggleBtn) {
//     toggleBtn.onclick = () => {
//       showHideHandler && showHideHandler(layerName);
//     };
//   }

//   // Sketch button event listener
//   if (isSketchable && sketchBtn) {
//     sketchBtn.addEventListener("click", () => {
//       enableSketchHandler && enableSketchHandler(layer);
//     });
//   }
// }

//   _formatDisplayName(layerName) {
//     return layerName
//       .replace(/[-, _]/g, " ")
//       .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
//   }

//   _sanitizeLayerName(displayName) {
//     return displayName
//       .replace(/\s+/g, "-")
//       .replace(/[^a-zA-Z0-9-_]/g, "");
//   }

//   _updateMinAssetsDisplay(element, minRequired, displayName, isSketchable) {
//     if (minRequired === 0) {
//       element.className = "label label-success";
//       element.textContent = "0 required";
//       element.title = "No selection required";
//     } else if (minRequired === 1) {
//       element.className = "label label-error";
//       element.textContent = `${minRequired} required`;
//       element.title = `${minRequired} selection required from ${displayName} layer`;
//     } else {
//       element.className = "label label-error";
//       element.textContent = `${minRequired} required`;
//       element.title = `At least ${minRequired} selections required from ${displayName} layer`;
//     }
//   }

//   _getLodAtOrBelow(view, targetScale) {
//     const tileInfo = view.map.basemap.baseLayers.items[0].tileInfo;
//     if (!tileInfo || !tileInfo.lods) return targetScale;
//     const lods = tileInfo.lods
//       .filter((lod) => lod.scale <= targetScale)
//       .sort((a, b) => b.scale - a.scale);
//     if (lods.length > 0) return lods[0].scale;
//     return tileInfo.lods[tileInfo.lods.length - 1].scale;
//   }

//   _getLodAtOrAbove(view, targetScale) {
//     const tileInfo = view.map.basemap.baseLayers.items[0].tileInfo;
//     if (!tileInfo || !tileInfo.lods) return targetScale;
//     const lods = tileInfo.lods
//       .filter((lod) => lod.scale >= targetScale)
//       .sort((a, b) => a.scale - b.scale);
//     if (lods.length > 0) return lods[0].scale;
//     return tileInfo.lods[0].scale;
//   }
// }

// export { AssetManagerMapLayerDataDisplay };
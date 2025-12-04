class AssetChooserMapLayerDataDisplay extends HTMLElement {
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

  // --- new updateVisibility method ---
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
    const zoomAlertSpan = this.querySelector(
      `#${sanitizedLayerName}-zoom-alert-span`
    );

    if (
      zoomAlertSpan &&
      toggleLayerVisibilityButton &&
      toggleVisibilityBtnTextSpan
    ) {
      if (visibleAtCurrentScale) {
        zoomAlertSpan.textContent = ``;
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
        zoomAlertSpan.textContent = `${
          layerMinScale > 0 ? `Zoom in to see this layer.` : ""
        } ${layerMaxScale > 0 ? `Zoom out to see this layer.` : ""}`;
        toggleLayerVisibilityButton.setAttribute("disabled", true);
        // toggleLayerVisibilityButton.setAttribute("hidden", true);
        toggleLayerVisibilityButton.classList.add("invisible-button");
      }
    }
  }
  // --- END new updateVisibility method ---

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
    console.log("layerData", layerData);
    const displayNameRaw = layerName.replace(/[-, _]/g, " ");
    console.log("displayNameRaw", displayNameRaw);
    const displayName = displayNameRaw.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
    console.log("displayName", displayName);
    const sanitizedLayerName = displayName
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-_]/g, "");
    console.log("sanitizedLayerName", sanitizedLayerName);
    const assetListClass = isSketchable
      ? "created-asset-data-list"
      : "chosen-asset-data-list";

    const componentContainer = document.createElement("div");
    componentContainer.classList.add(
      "map-layer-data-container",
      "stat-container",
      "stat-medium"
    );

    // const layerTitleDiv = document.createElement("div");
    // layerTitleDiv.classList.add("stat-title");
    // layerTitleDiv.setAttribute(
    //   "id",
    //   `${sanitizedLayerName}-layer-selected-asset-container`
    // );
    // layerTitleDiv.setAttribute("aria-label", `${displayName} Layer`);
    // layerTitleDiv.setAttribute("title", `${displayName} Layer`);

    // const layerTitleSpan = document.createElement("span");
    // layerTitleSpan.textContent = `${displayName} Layer `;

    // const assetCountSpan = document.createElement("span");
    // assetCountSpan.classList.add("asset-count-span");
    // assetCountSpan.textContent = `(${this._assetCount})`;

    // // Zoom alert
    // const zoomAlertSpan = document.createElement("span");
    // zoomAlertSpan.className = "zoom-alert-span";
    // zoomAlertSpan.id = `${sanitizedLayerName}-zoom-alert-span`;
    // zoomAlertSpan.style.height = "14px";
    // zoomAlertSpan.style.display = "inline-block";
    // zoomAlertSpan.textContent =
    //   layerMinScale > 0 ? `Zoom in to see this layer.` : "";

    // const enableSketchButton = isSketchable
    //   ? document.createElement("button")
    //   : null;
    // if (enableSketchButton) {
    //   enableSketchButton.type = "button";
    //   enableSketchButton.id = `enable-sketch-btn-${sanitizedLayerName}`;
    //   enableSketchButton.classList.add("toggleLayerVisibilityButton");
    //   enableSketchButton.setAttribute("aria-label", "");
    //   enableSketchButton.setAttribute(
    //     "title",
    //     `Enable sketch for ${displayName} layer`
    //   );
    //   const buttonSpan = document.createElement("span");
    //   buttonSpan.textContent = "Add Assets";
    //   enableSketchButton.appendChild(buttonSpan);
    //   layerTitleDiv.appendChild(enableSketchButton);
    // }

    // layerTitleSpan.appendChild(assetCountSpan); // <span>Layer Name <span>(0)</span></span>
    // layerTitleDiv.appendChild(layerTitleSpan); // Add the title+count
    // layerTitleDiv.appendChild(document.createElement("br")); // Add line break
    // layerTitleDiv.appendChild(zoomAlertSpan); // Add zoom alert
    // if (enableSketchButton) {
    //   layerTitleDiv.appendChild(enableSketchButton); // Add button last
    // }
    // componentContainer.appendChild(layerTitleDiv); // Add title section to container
    // this.appendChild(componentContainer); // Add container to custom element

    // <span class="asset-count-span">(${this._assetCount})</span>


    this.innerHTML = `
      <div class="map-layer-data-container stat-container stat-medium">
        <div
          class="zoom-alert-span"
          id="${sanitizedLayerName}-zoom-alert-span"
          style=" display: inline-block; margin-top: -2em; margin-bottom: -1em;"
        >
          ${layerMinScale > 0 ? `Zoom in to see this layer.` : ""}
        </div>
        <div
          class="stat-title"
          id="${sanitizedLayerName}-layer-selected-asset-container"
          aria-label="${displayName} Layer"
          title="${displayName} Layer"
        >
          <div>
            ${displayName}
          </div>
          <div>
            ${ isSketchable ? 
            `
              <button
                type="button"
                id="enable-sketch-btn-${sanitizedLayerName}"
                class="toggleLayerVisibilityButton"
                aria-label=""
                title="Enable sketch for ${displayName} layer"
              >
                Add Assets
              </button>
            `
              : ""
            }
            <button
              type="button"
              id="${sanitizedLayerName}-show-hide-layer-btn"
              class="toggleLayerVisibilityButton${layerMinScale > 0 ? " invisible-button" : ""}"
              att-layer-id="${mapDataLayerId}"
              aria-label=""
              title="Hide ${displayName} layer"
              ${layerMinScale > 0 ? "disabled" : ""}
            >
              <span id="${layerName}-toggle-visibility-btn-text-span">
                ${layerMinScale > 0 ? `Show` : `Hide`}
              </span>
            </button>
          </div>
        </div>
        <div
          aria-live="polite"
          aria-atomic="true"
          class="asset-selection-requirements"
        >
          <span class="sr-only">
            Asset requirements and status for ${displayName} layer
          </span>
            ${ minAssetsRequired === 0 ? `
          <span
            id="${mapDataLayerId}-min-asset-required-message"
            title="No selection required"
            class="label label-success"
          >
            0 required
          </span>`
          : minAssetsRequired === 1 ? `
          <span
            id="${mapDataLayerId}-min-asset-required-message"
            title="${minAssetsRequired} selection required from ${displayName} layer"
            class="label label-error"
          >
            ${minAssetsRequired} required
          </span>`
          : `
          <span
            id="${mapDataLayerId}-min-asset-required-message"
            title="At least ${minAssetsRequired} selections required from ${displayName} layer"
            class="label label-error"
          >
            ${minAssetsRequired} required
          </span>`}
          ${maxAssetsAllowed > 0 ? `
          <span
            id="${mapDataLayerId}-max-asset-allowed-message"
            title="Select a maximum of ${maxAssetsAllowed} from ${displayName} layer"
            class="label label-default"
          >
            ${maxAssetsAllowed} maximum
          </span>`
          : ""}
        </div>
        <div class="asset-list-wrapper">
          <ul
            data-layer-name="${sanitizedLayerName}"
            class="list-group ${assetListClass}"
            id="${mapDataLayerId}"
            aria-live="polite"
            aria-atomic="true"
          >
            <li title="No assets ${isSketchable ? "added" : "selected"} for ${displayName} layer">
              None ${isSketchable ? "added" : "selected"}
            </li>
          </ul>
        </div>
      </div>
   `;

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

export { AssetChooserMapLayerDataDisplay };

// class AssetChooserMapLayerDataDisplay extends HTMLElement {
//   constructor() {
//     super();
//     this._data = null;
//     this._rendered = false;
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
//     const countSpan = this.querySelector('.asset-count-span');
//     if (countSpan) {
//       countSpan.textContent = `(${this._assetCount})`;
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
//     const displayNameRaw =
//       this._data.formattedLayerName || this._data.layerName;
//     const displayName = displayNameRaw
//       .replace(/[-, _]/g, " ")
//       .replace(
//         /\w\S*/g,
//         (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
//       );
//     const sanitizedLayerName = displayName
//       .replace(/\s+/g, "-")
//       .replace(/[^a-zA-Z0-9-_]/g, "");

//     const toggleLayerVisibilityButton = this.querySelector(
//       `#${sanitizedLayerName}-show-hide-layer-btn`
//     );
//     const toggleVisibilityBtnTextSpan = this.querySelector(
//       `#${this._data.layerName}-toggle-visibility-btn-text-span`
//     );
//     const zoomAlertSpan = this.querySelector(
//       `#${sanitizedLayerName}-zoom-alert-span`
//     );

//     if (
//       zoomAlertSpan &&
//       toggleLayerVisibilityButton &&
//       toggleVisibilityBtnTextSpan
//     ) {
//       if (visibleAtCurrentScale) {
//         zoomAlertSpan.textContent = ``;
//         toggleLayerVisibilityButton.removeAttribute("disabled");
//         toggleLayerVisibilityButton.removeAttribute("hidden");
//         if (visible) {
//           toggleVisibilityBtnTextSpan.textContent = `Hide`;
//           toggleLayerVisibilityButton.setAttribute(
//             "title",
//             `Hide ${formattedLayerName} layer`
//           );
//         } else {
//           toggleVisibilityBtnTextSpan.textContent = `Show`;
//           toggleLayerVisibilityButton.setAttribute(
//             "title",
//             `Show ${formattedLayerName} layer`
//           );
//         }
//       } else {
//         zoomAlertSpan.textContent = `${
//           layerMinScale > 0 ? `Zoom in to see this layer.` : ""
//         } ${layerMaxScale > 0 ? `Zoom out to see this layer.` : ""}`;
//         toggleLayerVisibilityButton.setAttribute("disabled", true);
//         toggleLayerVisibilityButton.setAttribute("hidden", true);
//       }
//     }
//   }

//   // --- DOM manipulation version of render ---
//   render(layerData) {
//     // Clear previous content
//     this.innerHTML = "";

//     const {
//       layerName,
//       mapDataLayerId,
//       minAssetsRequired,
//       maxAssetsAllowed,
//       enableSketchHandler,
//       isSketchable = false,
//       showHideHandler,
//       layerMinScale = 0,
//     } = layerData;

//     const displayNameRaw = layerName.replace(/[-, _]/g, " ");
//     const displayName = displayNameRaw.replace(
//       /\w\S*/g,
//       (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
//     );
//     const sanitizedLayerName = displayName
//       .replace(/\s+/g, "-")
//       .replace(/[^a-zA-Z0-9-_]/g, "");
//     const assetListClass = isSketchable
//       ? "created-asset-data-list"
//       : "chosen-asset-data-list";

//     // Main container
//     const container = document.createElement("div");
//     container.className = "map-layer-data-container stat-container stat-medium";

//     // Stat title section
//     const statTitle = document.createElement("div");
//     statTitle.className = "stat-title";
//     statTitle.id = `${sanitizedLayerName}-layer-selected-asset-container`;
//     statTitle.setAttribute("aria-label", `${displayName} Layer`);
//     statTitle.setAttribute("title", `${displayName} Layer`);

//     // Layer name and count
//     const layerNameDiv = document.createElement("div");
//     const layerNameSpan = document.createElement("span");
//     layerNameSpan.textContent = `${displayName} Layer `;

//     const countSpan = document.createElement("span");
//     countSpan.className = "asset-count-span";
//     countSpan.textContent = `(${this._assetCount})`;
//     layerNameSpan.appendChild(countSpan);

//     layerNameDiv.appendChild(layerNameSpan);
//     layerNameDiv.appendChild(document.createElement("br"));

//     // Zoom alert
//     const zoomAlertSpan = document.createElement("span");
//     zoomAlertSpan.className = "zoom-alert-span";
//     zoomAlertSpan.id = `${sanitizedLayerName}-zoom-alert-span`;
//     zoomAlertSpan.style.height = "14px";
//     zoomAlertSpan.style.display = "inline-block";
//     zoomAlertSpan.textContent = layerMinScale > 0 ? `Zoom in to see this layer.` : "";
//     layerNameDiv.appendChild(zoomAlertSpan);

//     statTitle.appendChild(layerNameDiv);

//     // Buttons row
//     const buttonsDiv = document.createElement("div");
//     if (isSketchable) {
//       const enableSketchBtn = document.createElement("button");
//       enableSketchBtn.type = "button";
//       enableSketchBtn.id = `enable-sketch-btn-${sanitizedLayerName}`;
//       enableSketchBtn.className = "toggleLayerVisibilityButton";
//       enableSketchBtn.setAttribute("aria-label", "");
//       enableSketchBtn.setAttribute("title", `Enable sketch for ${displayName} layer`);
//       const enableSketchBtnSpan = document.createElement("span");
//       enableSketchBtnSpan.textContent = "Add Assets";
//       enableSketchBtn.appendChild(enableSketchBtnSpan);
//       buttonsDiv.appendChild(enableSketchBtn);
//     }

//     const showHideBtn = document.createElement("button");
//     showHideBtn.type = "button";
//     showHideBtn.id = `${sanitizedLayerName}-show-hide-layer-btn`;
//     showHideBtn.className = "toggleLayerVisibilityButton";
//     showHideBtn.setAttribute("att-layer-id", mapDataLayerId);
//     showHideBtn.setAttribute("aria-label", "");
//     showHideBtn.setAttribute("title", `Hide ${displayName} layer`);
//     if (layerMinScale > 0) {
//       showHideBtn.setAttribute("disabled", true);
//       showHideBtn.setAttribute("hidden", true);
//     }
//     const showHideBtnSpan = document.createElement("span");
//     showHideBtnSpan.id = `${layerName}-toggle-visibility-btn-text-span`;
//     showHideBtnSpan.textContent = layerMinScale > 0 ? "Show" : "Hide";
//     showHideBtn.appendChild(showHideBtnSpan);

//     buttonsDiv.appendChild(showHideBtn);
//     statTitle.appendChild(buttonsDiv);

//     container.appendChild(statTitle);

//     // Asset selection requirements
//     const requirementsDiv = document.createElement("div");
//     requirementsDiv.setAttribute("aria-live", "polite");
//     requirementsDiv.setAttribute("aria-atomic", "true");
//     requirementsDiv.className = "asset-selection-requirements";

//     const srOnlySpan = document.createElement("span");
//     srOnlySpan.className = "sr-only";
//     srOnlySpan.textContent = `Asset requirements and status for ${displayName} layer`;
//     requirementsDiv.appendChild(srOnlySpan);

//     // Min assets required
//     let minAssetsSpan = document.createElement("span");
//     minAssetsSpan.id = `${mapDataLayerId}-min-asset-required-message`;
//     if (minAssetsRequired === 0) {
//       minAssetsSpan.title = "No selection required";
//       minAssetsSpan.className = "label label-success";
//       minAssetsSpan.textContent = `No ${isSketchable ? "additions" : "selection"} required`;
//     } else if (minAssetsRequired === 1) {
//       minAssetsSpan.title = `${minAssetsRequired} selection required from ${displayName} layer`;
//       minAssetsSpan.className = "label label-error";
//       minAssetsSpan.textContent = `${minAssetsRequired} required`;
//     } else {
//       minAssetsSpan.title = `At least ${minAssetsRequired} selections required from ${displayName} layer`;
//       minAssetsSpan.className = "label label-error";
//       minAssetsSpan.textContent = `At least ${minAssetsRequired} required`;
//     }
//     requirementsDiv.appendChild(minAssetsSpan);

//     // Max assets allowed
//     if (maxAssetsAllowed > 0) {
//       const maxAssetsSpan = document.createElement("span");
//       maxAssetsSpan.id = `${mapDataLayerId}-max-asset-allowed-message`;
//       maxAssetsSpan.title = `Select a maximum of ${maxAssetsAllowed} from ${displayName} layer`;
//       maxAssetsSpan.className = "label label-default";
//       maxAssetsSpan.textContent = `${isSketchable ? "Add" : "Select"} a maximum of ${maxAssetsAllowed}`;
//       requirementsDiv.appendChild(maxAssetsSpan);
//     }

//     container.appendChild(requirementsDiv);

//     // Asset list
//     const assetList = document.createElement("ul");
//     assetList.setAttribute("data-layer-name", sanitizedLayerName);
//     assetList.className = `list-group ${assetListClass}`;
//     assetList.id = mapDataLayerId;
//     assetList.setAttribute("aria-live", "polite");
//     assetList.setAttribute("aria-atomic", "true");

//     const noneLi = document.createElement("li");
//     noneLi.title = `No assets ${isSketchable ? "added" : "selected"} for ${displayName} layer`;
//     noneLi.textContent = `None ${isSketchable ? "added" : "selected"}`;
//     assetList.appendChild(noneLi);

//     container.appendChild(assetList);

//     // Replace content
//     this.appendChild(container);

//     // Attach event listeners
//     if (
//       isSketchable &&
//       this.querySelector(`#enable-sketch-btn-${sanitizedLayerName}`)
//     ) {
//       this.querySelector(
//         `#enable-sketch-btn-${sanitizedLayerName}`
//       ).addEventListener(
//         "click",
//         () => enableSketchHandler && enableSketchHandler(layerData.layer)
//       );
//     }
//     const hideBtn = this.querySelector(
//       `#${sanitizedLayerName}-show-hide-layer-btn`
//     );
//     if (hideBtn) {
//       hideBtn.onclick = () => {
//         showHideHandler(layerName);
//       };
//     }
//   }
//   // --- END DOM manipulation version of render ---
// }

// export { AssetChooserMapLayerDataDisplay };

// class AssetChooserMapLayerDataDisplay extends HTMLElement {
//   constructor() {
//     super();
//     this.attachShadow({ mode: "open" }); // Use shadow DOM for style/DOM encapsulation
//   }

//   set data(layerData) {
//     this.render(layerData);
//   }

//   render(layerData) {
//     const {
//       name,
//       minAssetsRequired,
//       maxAssetsAllowed,
//       enableSketchHandler,
//       hideLayerHandler,
//     } = layerData;

//     // Sanitize name for IDs
//     const safeName = name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-_]/g, "");

//     this.shadowRoot.innerHTML = `
//       <style>
//         /* Add your styles here */
//       </style>
//       <div class="sketchable-map-layer-data-container stat-container stat-medium">
//         <div class="stat-title" id="${safeName}-layer-selected-asset-container"
//           aria-label="${name} Layer" title="${name} Layer">
//           <div>
//             <span><strong>${name} Layer</strong></span>
//           </div>
//           <div>
//             <button type="button" id="enable-sketch-btn" class="toggleLayerVisibilityButton"
//               aria-label="" title="Enable sketch for ${name} layer">
//               <span>Add Assets</span>
//             </button>
//             <button type="button" id="show-hide-layer-btn" class="toggleLayerVisibilityButton"
//               aria-label="" title="Hide ${name} layer">
//               <span>Hide</span>
//             </button>
//           </div>
//         </div>
//         <div aria-live="polite" aria-atomic="true" class="asset-selection-requirements">
//           <span class="sr-only">Asset addition requirements and status for ${name} layer</span>
//           ${
//             minAssetsRequired === 0
//               ? `<span class="label label-success">No additions required</span>`
//               : minAssetsRequired === 1
//               ? `<span class="label label-error">${minAssetsRequired} required</span>`
//               : `<span class="label label-error">At least ${minAssetsRequired} required</span>`
//           }
//           ${
//             maxAssetsAllowed > 0
//               ? `<span class="label label-default">Add a maximum of ${maxAssetsAllowed}</span>`
//               : ``
//           }
//         </div>
//         <ul data-layer-name="${safeName}" class="list-group highlighted-asset-data-list"
//           id="asset-list" aria-live="polite" aria-atomic="true">
//           <li title="No assets added for ${name} layer">None added</li>
//         </ul>
//       </div>
//     `;

//     // Attach event listeners
//     this.shadowRoot.getElementById("enable-sketch-btn")
//       .addEventListener("click", () => enableSketchHandler && enableSketchHandler(name));
//     this.shadowRoot.getElementById("show-hide-layer-btn")
//       .addEventListener("click", () => hideLayerHandler && hideLayerHandler(name));
//   }
// }

// export { AssetChooserMapLayerDataDisplay };

// class AssetChooserMapLayerDataDisplay extends HTMLElement {
//   constructor() {
//     super();
//     // Remove Shadow DOM
//     // this.attachShadow({ mode: "open" });
//   }

//   set data(layerData) {
//     this.render(layerData);
//   }

//   render(layerData) {
//     const {
//       name,
//       minAssetsRequired,
//       maxAssetsAllowed,
//       enableSketchHandler,
//       hideLayerHandler,
//     } = layerData;

//     // Sanitize name for IDs
//     const sanitizedLayerName = name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-_]/g, "");
//     console.log("sanitizedLayerName", sanitizedLayerName);

//     this.innerHTML = `
//       <div class="sketchable-map-layer-data-container stat-container stat-medium">
//         <div class="stat-title" id="${sanitizedLayerName}-layer-selected-asset-container"
//           aria-label="${name} Layer" title="${name} Layer">
//           <div>
//             <span><strong>${name} Layer</strong></span>
//           </div>
//           <div>
//             <button type="button" id="enable-sketch-btn-${sanitizedLayerName}" class="toggleLayerVisibilityButton"
//               aria-label="" title="Enable sketch for ${name} layer">
//               <span>Add Assets</span>
//             </button>
//             <button type="button" id="show-hide-layer-btn-${sanitizedLayerName}" class="toggleLayerVisibilityButton"
//               aria-label="" title="Hide ${name} layer">
//               <span>Hide</span>
//             </button>
//           </div>
//         </div>
//         <div aria-live="polite" aria-atomic="true" class="asset-selection-requirements">
//           <span class="sr-only">Asset addition requirements and status for ${name} layer</span>
//           ${
//             minAssetsRequired === 0
//               ? `<span class="label label-success">No additions required</span>`
//               : minAssetsRequired === 1
//               ? `<span class="label label-error">${minAssetsRequired} required</span>`
//               : `<span class="label label-error">At least ${minAssetsRequired} required</span>`
//           }
//           ${
//             maxAssetsAllowed > 0
//               ? `<span class="label label-default">Add a maximum of ${maxAssetsAllowed}</span>`
//               : ``
//           }
//         </div>
//         <ul data-layer-name="${sanitizedLayerName}" class="list-group highlighted-asset-data-list"
//           id="asset-list" aria-live="polite" aria-atomic="true">
//           <li title="No assets added for ${name} layer">None added</li>
//         </ul>
//       </div>
//     `;

//     // Attach event listeners (now on `this`, not shadowRoot)
//     this.querySelector(`#enable-sketch-btn-${sanitizedLayerName}`)
//       .addEventListener("click", () => enableSketchHandler && enableSketchHandler(name));
//     this.querySelector(`#show-hide-layer-btn-${sanitizedLayerName}`)
//       .addEventListener("click", () => hideLayerHandler && hideLayerHandler(name));
//   }
// }
// export { AssetChooserMapLayerDataDisplay };

class AssetChooserMapLayerDataDisplay extends HTMLElement {
  constructor() {
    super();
  }

  set data(layerData) {
    this.render(layerData);
  }

  render(layerData) {
    const {
      layerName,
      minAssetsRequired,
      maxAssetsAllowed,
      enableSketchHandler,
      hideLayerHandler,
      isSketchable = false, // <-- flag to distinguish layer type
      // formattedLayerName, // for regular layers
      showHideHandler, // for regular layers
      layerMinScale = 0, // for zoom alert
      
    } = layerData;
    console.log("layerData", layerData);
    // Use formattedLayerName if provided, else fallback to name
    const displayNameRaw = layerName.replace(/[-, _]/g, " ");
    const displayName = displayNameRaw.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
    const sanitizedLayerName = displayName
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-_]/g, "");

    this.innerHTML = `
      <div 
      class="map-layer-data-container stat-container stat-medium"
      >
      <div 
        class="stat-title" 
        id="${sanitizedLayerName}-layer-selected-asset-container"
        aria-label="${displayName} Layer" 
        title="${displayName} Layer"
      >
        <div>
        <span>
          <strong>
          ${displayName} Layer
          </strong>
        </span>
        <br>
       <span class="zoom-alert-span" id="${sanitizedLayerName}-zoom-alert-span" style="height: 14px; display: inline-block">
        ${layerMinScale > 0 ? `Zoom in to see this layer.` : ""}
       </span>
        </div>
        <div>
        ${
          isSketchable
          ? `
          <button type="button" id="enable-sketch-btn-${sanitizedLayerName}" class="toggleLayerVisibilityButton"
          aria-label="" title="Enable sketch for ${displayName} layer">
          <span>Add Assets</span>
          </button>
        `
          : ""
        }
        <button type="button" id="${sanitizedLayerName}-show-hide-layer-btn" class="toggleLayerVisibilityButton"
          aria-label="" title="Hide ${displayName} layer">
          <span>Hide</span>
        </button>
        </div>
      </div>
      <div aria-live="polite" aria-atomic="true" class="asset-selection-requirements">
        <span class="sr-only">Asset addition requirements and status for ${displayName} layer</span>
        ${
        minAssetsRequired === 0
          ? `<span class="label label-success">No ${
            isSketchable ? "additions" : "selection"
          } required</span>`
          : minAssetsRequired === 1
          ? `<span class="label label-error">${minAssetsRequired} required</span>`
          : `<span class="label label-error">At least ${minAssetsRequired} required</span>`
        }
        ${
        maxAssetsAllowed > 0
          ? `<span class="label label-default">${isSketchable ? "Add" : "Select"} a maximum of ${maxAssetsAllowed}</span>`
          : ``
        }
      </div>
      <ul data-layer-name="${sanitizedLayerName}" class="list-group highlighted-asset-data-list"
        id="asset-list" aria-live="polite" aria-atomic="true">
        <li title="No assets ${
        isSketchable ? "added" : "selected"
        } for ${displayName} layer">None ${
      isSketchable ? "added" : "selected"
    }</li>
      </ul>
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
        () => enableSketchHandler && enableSketchHandler(name)
      );
    }
    // Use hideLayerHandler for sketchable, showHideHandler for regular
    const hideBtn = this.querySelector(
      `#show-hide-layer-btn-${sanitizedLayerName}`
    );
    if (hideBtn) {
      hideBtn.addEventListener("click", () => {
        if (isSketchable && hideLayerHandler) {
          hideLayerHandler(name);
        } else if (showHideHandler) {
          showHideHandler(name);
        }
      });
    }
  }
}

export { AssetChooserMapLayerDataDisplay };

// this file contains utility functions for the ArcGIS Asset Chooser application
console.log('utils');

// function selectFeatureLayer() {
//   featureLayers.forEach((outerLayer) => {
//     const selectLayersElements = document.querySelectorAll(".selectLayers");
//     selectLayersElements.forEach((selectLayer) => {
//       selectLayer.addEventListener("click", () => {
//         const layerId = selectLayer.getAttribute("att-layer-id");
//         const spanElement = selectLayer.querySelector("span");
//         if (
//           `${outerLayer.layerProperties.layerName}-${outerLayer.id}` === layerId
//         ) {
//           if (outerLayer.visible) {
//             outerLayer.visible = false;
//             spanElement.classList.remove("glyphicons-eye-close");
//             spanElement.classList.add("glyphicons-eye-open");
//             spanElement.innerHTML = `<span class="sr-only">show layer</span>`;
//           } else {
//             outerLayer.visible = true;
//             spanElement.classList.remove("glyphicons-eye-open");
//             spanElement.classList.add("glyphicons-eye-close");
//             spanElement.innerHTML = `<span class="sr-only">hide layer</span>`;
//           }
//         }
//       });
//     });
//   });
// }

// function renderSelectedAssetLabels() {
//   const selectedLayerAssetListArray = document.querySelectorAll(
//     ".highlighted-asset-data-list"
//   );
//   // Clear existing list items before appending new ones
//   selectedLayerAssetListArray.forEach((list) => {
//     list.innerHTML = ""; // This clears the list
//   });
//   chosenAssets.forEach((asset) => {
//     selectedLayerAssetListArray.forEach((selectedLayerAssetList) => {
//       if (asset.layerId === selectedLayerAssetList.id) {
//         const assetLabel = asset.assetLabel;
//         const assetLabelListItem = document.createElement("li");

//         assetLabelListItem.setAttribute("id", asset.assetId);
//         assetLabelListItem.innerHTML = `
//           ${assetLabel}
//           <button
//             class="pull-right link-button small-button red-button transparent-button remove-asset-btn"
//           >
//             <span class="glyphicons glyphicons-remove"></span>
//             Remove
//           </button>
//         `;
//         selectedLayerAssetList.appendChild(assetLabelListItem);
//         assetLabelListItem.addEventListener("click", function () {
//           chosenAssets.forEach((asset) => {
//             if (asset.assetId === assetLabelListItem.id) {
//               asset.highlightSelect.remove();
//               const listItemToRemove = document.getElementById(asset.assetId);
//               if (listItemToRemove) listItemToRemove.remove();
//               const hightlightToRemove = chosenAssets.findIndex(
//                 (a) => a.assetId === asset.assetId
//               );
//               chosenAssets.splice(hightlightToRemove, 1);
//               validateNumberofAssetsSelected();
//               console.log("chosenAssets", chosenAssets);
//               selectedLayerAssetListArray.forEach((list) => {
//                 if (list.innerHTML === "") {
//                   list.innerHTML = `<li>None selected.</li>`;
//                 }
//               });
//             }
//           });
//         });
//       }
//     });
//   });
//   selectedLayerAssetListArray.forEach((list) => {
//     if (list.innerHTML === "") {
//       list.innerHTML = `<li>None selected.</li>`;
//     }
//   });
// }

// function validateNumberofAssetsSelected() {
//   featureLayers.forEach((mapLayer) => {
//     let isLayerValid = false;
//     const layerId = `${mapLayer.layerProperties.layerName}-${mapLayer.id}`;
//     const layerAssetMin = parseInt(
//       mapLayer.layerProperties.minimumAssetsRequired
//     );
//     const layerAssetMax = parseInt(
//       mapLayer.layerProperties.maximumAssetsRequired
//     );

//     const totalLayerAssetsSelected = chosenAssets.filter(
//       (asset) =>
//         asset.layerId === `${mapLayer.layerProperties.layerName}-${mapLayer.id}`
//     ).length;

//     if (layerAssetMin === 0 && totalLayerAssetsSelected === 0) {
//       document.getElementById(
//         `${layerId}-min-asset-required-message`
//       ).innerHTML = `No selection required.`;
//       document
//         .getElementById(`${layerId}-min-asset-required-message`)
//         .classList.add("label", "label-success");
//       isLayerValid = true;
//       if (!validLayers.includes(layerId)) {
//         validLayers.push(layerId);
//       }
//     }

//     if (layerAssetMin === 0 && totalLayerAssetsSelected > 0) {
//       document.getElementById(
//         `${layerId}-min-asset-required-message`
//       ).innerHTML = `${totalLayerAssetsSelected} selected. None required.`;
//       document
//         .getElementById(`${layerId}-min-asset-required-message`)
//         .classList.add("label", "label-success");
//       isLayerValid = true;
//       if (!validLayers.includes(layerId)) {
//         validLayers.push(layerId);
//       }
//     }

//     if (layerAssetMin > 0 && totalLayerAssetsSelected >= layerAssetMin) {
//       document.getElementById(
//         `${layerId}-min-asset-required-message`
//       ).innerHTML = `${totalLayerAssetsSelected} selected. At least ${layerAssetMin} required.`;
//       document
//         .getElementById(`${layerId}-min-asset-required-message`)
//         .classList.add("label", "label-success");
//       document
//         .getElementById(`${layerId}-min-asset-required-message`)
//         .classList.remove("label-error");
//       isLayerValid = true;
//       if (!validLayers.includes(layerId)) {
//         validLayers.push(layerId);
//       }
//     }
//     if (layerAssetMin >= 0 && totalLayerAssetsSelected < layerAssetMin) {
//       document.getElementById(
//         `${layerId}-min-asset-required-message`
//       ).innerHTML = `At least ${layerAssetMin} required.`;
//       document
//         .getElementById(`${layerId}-min-asset-required-message`)
//         .classList.remove("label", "label-success");
//       document
//         .getElementById(`${layerId}-min-asset-required-message`)
//         .classList.add("label", "label-error");
//       isLayerValid = false;
//       const layerToRemove = validLayers.findIndex((l) => l === layerId);
//       if (layerToRemove !== -1) {
//         validLayers.splice(layerToRemove, 1);
//       }
//     }
//     if (layerAssetMax > 0 && totalLayerAssetsSelected === layerAssetMax) {
//       document.getElementById(
//         `${layerId}-max-asset-required-message`
//       ).innerHTML = `Maximum of ${layerAssetMax} reached.`;
//     }
//     if (layerAssetMax > 0 && totalLayerAssetsSelected < layerAssetMax) {
//       document
//         .getElementById(`${layerId}-max-asset-required-message`)
//         .classList.add("label", "label-default");
//       document.getElementById(
//         `${layerId}-max-asset-required-message`
//       ).innerHTML = `Select a maximum of ${layerAssetMax}.`;
//     }
//   });
//   validateAssetSelection();
//   renderValidityMessage();
// }

// function validateAssetSelection() {
//   if (validLayers.length !== allMapLayerIds.length) {
//     isValid = false;
//   }
//   const sortedValidLayers = validLayers.sort();
//   const sortedAllMapLayerIds = allMapLayerIds.sort();
//   const stringifyValidLayers = JSON.stringify(sortedValidLayers);
//   const stringifyAllMapLayerIds = JSON.stringify(sortedAllMapLayerIds);
//   if (stringifyValidLayers === stringifyAllMapLayerIds) {
//     isValid = true;
//     // Dispatch the chosenAssets to the parent application when isValid is true
//     dispatchChosenAssets(chosenAssets);
//   } else {
//     isValid = false;
//     // Secure the chosenAssets from parent application when isValid is false
//     secureChosenAssets();
//   }
//   console.log("isValid", isValid);
// }

// function renderValidityMessage() {
//   const validityMessage = document.getElementById("validity-message");
//   let makeMinimunRequireMessage = `Please select `;
//   if (isValid) {
//     validityMessage.innerHTML = "Asset selection is valid for submission";
//     // validityMessage.style.color = "green";
//     validityMessage.classList.add("label", "label-success");
//   } else {
//     validityMessage.classList.remove("label", "label-success");
//     featureLayers.forEach((mapLayer) => {
//       // const layerId = `${mapLayer.layerProperties.layerName}-${mapLayer.id}`;
//       const layerAssetMin = parseInt(
//         mapLayer.layerProperties.minimumAssetsRequired
//       );
//       const totalLayerAssetsSelected = chosenAssets.filter(
//         (asset) =>
//           asset.layerId ===
//           `${mapLayer.layerProperties.layerName}-${mapLayer.id}`
//       ).length;
//       if (layerAssetMin >= 0 && totalLayerAssetsSelected < layerAssetMin) {
//         makeMinimunRequireMessage += `at least <span class="label label-error"><strong>${layerAssetMin} from ${mapLayer.layerProperties.layerName}</strong></span>, `;
//       }
//       if (layerAssetMin >= 0 && totalLayerAssetsSelected >= layerAssetMin) {
//         makeMinimunRequireMessage += `at least <span class="label label-success"><strong>${layerAssetMin} from ${mapLayer.layerProperties.layerName}</strong></span>, `;
//       }
//     });
//     // Remove the last comma and space if present
//     if (makeMinimunRequireMessage.endsWith(", ")) {
//       makeMinimunRequireMessage = makeMinimunRequireMessage.slice(0, -2);
//     }
//     // Replace the last comma with ' and '
//     const lastCommaIndex = makeMinimunRequireMessage.lastIndexOf(", ");
//     if (lastCommaIndex !== -1) {
//       makeMinimunRequireMessage =
//         makeMinimunRequireMessage.substring(0, lastCommaIndex) +
//         " and " +
//         makeMinimunRequireMessage.substring(lastCommaIndex + 2);
//     }
//     makeMinimunRequireMessage = makeMinimunRequireMessage.replace(
//       /at least (\d+ \w+)/g,
//       "at least <strong>$1</strong>"
//     );
//     validityMessage.innerHTML = `${makeMinimunRequireMessage}.`;
//   }
// }

// // Dispatch the chosenAssets to the parent application
// function dispatchChosenAssets(chosenAssets) {
//   const event = new CustomEvent("isValidTrue", { detail: { chosenAssets } });
//   document.dispatchEvent(event);
// }

// // custom event listener to disable the submit button if the chosenAssets are not valid
// function secureChosenAssets() {
//   const event = new CustomEvent("isValidFalse", { detail: { isValid } });
//   document.dispatchEvent(event);
// }
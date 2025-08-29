// This file is simulating the parent application that will receive the chosenAssets from the child application
// import { chosenAssets } from "./asset-chooser-state.js"; 
let chosenAssets;

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("submit-chosen-assets-button");
  if (btn) {
    btn.addEventListener("click", () => {
      // Always get the latest chosenAssets from localStorage
      // const chosenAssets = JSON.parse(localStorage.getItem("chosenAssets") || "[]");
      submitChosenAssets(chosenAssets);
    });
  }
});
// array for storing case assets for use within parent application
const caseAssets = [];
const submitChosenAssetsButton = document.getElementById("submit-chosen-assets-button");
const chosenAssetsDisplayContainer = document.getElementById("chosen-assets-display-div");
// Custom event listener to receive chosenAssets from the asset chooser when isValid is true
// recommended for integration with gis aset chooser - customize as needed
document.addEventListener("isValidTrue", (event) => {
  chosenAssets = event.detail.chosenAssets;
  const chosenAssetFormData = event.detail.chosenAssetFormData;
  // possible integration strategy using local storage
  localStorage.setItem("chosenAssets", JSON.stringify(chosenAssets));
  localStorage.setItem(
    "chosenAssetFormData",
    JSON.stringify(chosenAssetFormData)
  );
  // possible integration strategy with a submit button
  submitChosenAssetsButton.removeAttribute("disabled");
  submitChosenAssetsButton.classList.remove("disabled-button");
  submitChosenAssetsButton.textContent = "Submit assets";
});

// Custom event listener for when isValid is false
// recommended for integration with gis aset chooser - customize as needed
// example of possible integration strategy with a submit button
document.addEventListener("isValidFalse", (event) => {
  submitChosenAssetsButton.textContent = "Submit Selected Assets";
  submitChosenAssetsButton.setAttribute("disabled", true);
  submitChosenAssetsButton.classList.add("disabled-button");
  localStorage.removeItem("chosenAssets");
  localStorage.removeItem("chosenAssetFormData");
});

// below is an example of how the chosenAssets could be submitted to the parent application using the custom events and custom event listeners
// function to submit chosen assets
const submitChosenAssets = (chosenAssets) => {
  console.log("submitting chosenAssets:", chosenAssets);
  localStorage.removeItem("chosenAssets");
  localStorage.setItem("chosenAssets", JSON.stringify(chosenAssets));
  document.location.href = "results.html";
};

// Function to display chosen assets
const displayChosenAssets = () => {
  const chosenAssets = JSON.parse(localStorage.getItem("chosenAssets") || "[]");
  console.log("chosenAssets:", chosenAssets);
  if (chosenAssets.length === 0) {
    const chosenAssetFormData = JSON.parse(
      localStorage.getItem("chosenAssetFormData") || "[]"
    );
    console.log("chosenAssetFormData:", chosenAssetFormData);
    if (chosenAssetFormData) {
      chosenAssetFormData.map((data) => {
        const chosenAssetData = document.createElement("p");
        chosenAssetData.textContent = `${data.key}: ${
          data.value ? data.value : "No asset data provided"
        }`;
        chosenAssetsDisplayContainer.appendChild(chosenAssetData);
      });
    }
  }
  chosenAssets.map((asset) => {
    const chosenAssetLabel = document.createElement("p");
    chosenAssetLabel.textContent = asset.assetLabel;
    chosenAssetsDisplayContainer.appendChild(chosenAssetLabel);
  });
};

// Function to manipulate 'chosenAssets' data for use within parent application
const convertChosenAssets = () => {
  const chosenAssets = JSON.parse(localStorage.getItem("chosenAssets") || "[]");
  chosenAssets.forEach((asset) => {
    const caseAsset = {
      AssetEsriAttributes: asset.assetAttributes,
      AssetId: asset.assetId,
      AssetIdType: asset.assetIdType,
      AssetType: asset.layerName,
      FeatureAssetId: asset.assetId,
      FeatureClass: asset.layerName,
      Location: asset.assetLabel,
    };
    caseAssets.push(caseAsset);
    console.log("caseAssets:", caseAssets);
  });
};

// Event listener to display chosen assets on the results page
document.addEventListener("DOMContentLoaded", () => {
  if (document.location.href.includes("results.html")) {
    displayChosenAssets();
    convertChosenAssets();
  }
});

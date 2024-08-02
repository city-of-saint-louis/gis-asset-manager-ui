// This file is simulating the parent application that will receive the chosenAssets from the child application

// array for storing case assets for use within parent application
const caseAssets = [];

// Custom event listener to receive chosenAssets from the asset chooser when isValid is true
// recommended for integration with gis aset chooser - customize as needed
document.addEventListener("isValidTrue", (event) => {
  console.log("isValidTrue event received by parent application.", event);
  const chosenAssets = event.detail.chosenAssets;
  console.log("isValidTrue event, chosenAssets received:", chosenAssets);
  // possible integration strategy using local storage
  localStorage.setItem("chosenAssets", JSON.stringify(chosenAssets));
  // possible integration strategy with a submit button
  document.getElementById("submit-chosen-assets-button").removeAttribute("disabled");
  document.getElementById("submit-chosen-assets-button").style.boxShadow = "0px 0px 10px 5px #538400";
});

// Custom event listener for when isValid is false
// recommended for integration with gis aset chooser - customize as needed
// example of possible integration strategy with a submit button
document.addEventListener("isValidFalse", (event) => {
  document.getElementById("submit-chosen-assets-button").setAttribute("disabled", true);
  document.getElementById("submit-chosen-assets-button").style.boxShadow = "0px 0px 0px 0px ";
  localStorage.removeItem("chosenAssets");
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
  const chosenAssets = JSON.parse(localStorage.getItem("chosenAssets") || '[]');
  chosenAssets.map((asset) => {
    const chosenAssetLabel = document.createElement("p");
    chosenAssetLabel.textContent = asset.assetLabel;
    document.getElementById("chosen-assets-display-div").appendChild(chosenAssetLabel);
  });
};

// Function to manipulate 'chosenAssets' data for use within parent application
const convertChosenAssets = () => {
  const chosenAssets = JSON.parse(localStorage.getItem("chosenAssets") || '[]');
  chosenAssets.forEach((asset) => {
    const caseAsset = {
      AssetEsriAttributes: asset.assetAttributes,
      AssetId: asset.assetId,
      AssetIdType: asset.assetIdType,
      AssetType: asset.layerName,
      FeatureAssetId: asset.assetAttributes.GUID,
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
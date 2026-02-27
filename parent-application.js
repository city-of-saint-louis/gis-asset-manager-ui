// This file is simulating the parent application that will receive the chosenAssets from the child application
// import { chosenAssets } from "./asset-manager-state.js"; 
let chosenAssets;
let createdAssets;
let isChosenAssetsValid = false;
let isCreatedAssetsValid = false;

const updateSubmitButtonState = () => {
  if (isChosenAssetsValid && isCreatedAssetsValid) {
    submitAssetsButton.removeAttribute("disabled");
    submitAssetsButton.classList.remove("disabled-button");
  } else {
    submitAssetsButton.setAttribute("disabled", true);
    submitAssetsButton.classList.add("disabled-button");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("submit-assets-button");
  if (btn) {
    btn.addEventListener("click", () => {
      // Always get the latest chosenAssets from localStorage
      // const chosenAssets = JSON.parse(localStorage.getItem("chosenAssets") || "[]");
      submitChosenAssets(chosenAssets);
      submitCreatedAssets(createdAssets);
    });
  }
});
// array for storing case assets for use within parent application
const caseAssets = [];
const submitAssetsButton = document.getElementById("submit-assets-button");
const assetsDisplayContainer = document.getElementById("asset-display-div");
const submittedAssetList = document.getElementById("submitted-asset-list");
// Custom event listener to receive chosenAssets from the asset chooser when isValid is true
// recommended for integration with gis aset chooser - customize as needed
document.addEventListener("isValidTrue", (event) => {
  isChosenAssetsValid = true;
  chosenAssets = event.detail.chosenAssets;
  const chosenAssetFormData = event.detail.chosenAssetFormData;
  // possible integration strategy using local storage
  localStorage.setItem("chosenAssets", JSON.stringify(chosenAssets));
  localStorage.setItem(
    "chosenAssetFormData",
    JSON.stringify(chosenAssetFormData)
  );
  updateSubmitButtonState();
  // possible integration strategy with a submit button
  // submitChosenAssetsButton.removeAttribute("disabled");
  // submitChosenAssetsButton.classList.remove("disabled-button");
  // submitChosenAssetsButton.textContent = "Submit assets";
});

document.addEventListener("createdAssetsAreValidIsTrue", (event) => {
  createdAssets = event.detail.createdAssets;
  isCreatedAssetsValid = true;
  localStorage.setItem("createdAssets", JSON.stringify(createdAssets));
  updateSubmitButtonState();
});

// Custom event listener for when isValid is false
// recommended for integration with gis aset chooser - customize as needed
// example of possible integration strategy with a submit button
document.addEventListener("isValidFalse", () => {
  isChosenAssetsValid = false;
  chosenAssets = [];
  updateSubmitButtonState();
  // submitChosenAssetsButton.textContent = "Submit Assets";
  submitAssetsButton.setAttribute("disabled", true);
  submitAssetsButton.classList.add("disabled-button");
  localStorage.removeItem("chosenAssets");
  localStorage.removeItem("chosenAssetFormData");
});

document.addEventListener("createdAssetsAreValidIsFalse", () => {
  isCreatedAssetsValid = false;
  createdAssets = [];
  updateSubmitButtonState();
  localStorage.removeItem("createdAssets");
});

// below is an example of how the chosenAssets could be submitted to the parent application using the custom events and custom event listeners
// function to submit chosen assets
const submitChosenAssets = (chosenAssets) => {
  // console.log("submitting chosenAssets:", chosenAssets);
  localStorage.removeItem("chosenAssets");
  localStorage.setItem("chosenAssets", JSON.stringify(chosenAssets));
  document.location.href = "results.html";
};

const submitCreatedAssets = (createdAssets) => {
  // console.log("submitting createdAssets:", createdAssets);
  localStorage.removeItem("createdAssets");
  localStorage.setItem("createdAssets", JSON.stringify(createdAssets));
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
    // console.log("chosenAssetFormData:", chosenAssetFormData);
    if (chosenAssetFormData) {
      chosenAssetFormData.map((data) => {
        const chosenAssetData = document.createElement("li");
        chosenAssetData.textContent = `${data.key}: ${
          data.value ? data.value : "No asset data provided"
        }`;
        // assetsDisplayContainer.appendChild(chosenAssetData);
        submittedAssetList.appendChild(chosenAssetData);
      });
    }
  }
  chosenAssets.map((asset) => {
    const chosenAssetLabel = document.createElement("li");
    chosenAssetLabel.textContent = asset.assetLabel;
    // assetsDisplayContainer.appendChild(chosenAssetLabel);
    submittedAssetList.appendChild(chosenAssetLabel);
  });
};

// Function to display created assets
const displayCreatedAssets = () => {
  const createdAssets = JSON.parse(localStorage.getItem("createdAssets") || "[]");
  console.log("createdAssets:", createdAssets);
  if (createdAssets.length === 0) {
    return;
  }
  createdAssets.map((asset) => {
    const createdAssetLabel = document.createElement("li");
    createdAssetLabel.textContent = asset.attributes.assetLabel;
    // assetsDisplayContainer.appendChild(createdAssetLabel);
    submittedAssetList.appendChild(createdAssetLabel);
  });
};

// Event listener to display chosen assets on the results page
document.addEventListener("DOMContentLoaded", () => {
  if (document.location.href.includes("results.html")) {
    displayChosenAssets();
    displayCreatedAssets();
  }
});

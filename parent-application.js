// This is the parent application that will receive the chosenAssets from the child application

// Custom event listener to receive chosenAssets from the asset chooser when isValid is true
document.addEventListener("isValidTrue", function (event) {
  const chosenAssets = event.detail.chosenAssets;
  // log chosenAssets to the console to verify that it was received
  console.log("chosenAssets received:", chosenAssets);
  // your logic here to handle chosenAssets within the parent application
});

// Custom event listener for when isValid is false
document.addEventListener("isValidFalse", function (event) {
  // your logic here to handle when isValid is false 
});

// function to submit chosen assets
function submitChosenAssets(chosenAssets) {
  console.log("submitting chosenAssets:", chosenAssets);
  localStorage.removeItem("chosenAssets");
  localStorage.setItem("chosenAssets", JSON.stringify(chosenAssets));
  document.location.href = "results.html";
}

// Function to display chosen assets
function displayChosenAssets() {
  const chosenAssets = JSON.parse(localStorage.getItem("chosenAssets") || '[]');
  console.log("chosenAssets:", chosenAssets);
  chosenAssets.map((asset) => {
    console.log(asset);
    const chosenAssetLabel = document.createElement("p");
    chosenAssetLabel.textContent = asset.assetLabel;
    document.getElementById("chosen-assets-display-div").appendChild(chosenAssetLabel);
  });
}

// Event listener to display chosen assets on the results page
document.addEventListener("DOMContentLoaded", () => {
  if (document.location.href.includes("results.html")) {
    displayChosenAssets();
  }
});
// This is the parent application that will receive the chosenAssets from the child application


document.addEventListener("chosenAssetsSelectionValidated", function (event) {
  const chosenAssets = event.detail.chosenAssets;
  console.log("chosenAssets received:", chosenAssets);
  // possible integration strategy using local storage
  localStorage.setItem("chosenAssets", JSON.stringify(chosenAssets));
  // possible integration strategy with a submit button
  document.getElementById("submit-chosen-assets-button").removeAttribute("disabled");
  document.getElementById("submit-chosen-assets-button").style.boxShadow = "0px 0px 10px 5px #008000";
});

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

document.addEventListener("DOMContentLoaded", () => {
  if (document.location.href.includes("results.html")) {
    displayChosenAssets();
  }
});
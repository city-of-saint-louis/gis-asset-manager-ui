// This is the parent application that will receive the chosenAssets from the child application

document.addEventListener('chosenAssetsSelectionValidated', function(chosenAssetsReceived) {
  // Update the parent application's state with the new chosenAssets
  const chosenAssets = chosenAssetsReceived.detail.chosenAssets;
  console.log('chosenAssets received:', chosenAssets);
  // Perform further actions as needed
});
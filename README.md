# GIS Asset Chooser Development

## The asset chooser is made of two reusable custom web components

1. GIS Asset Chooser component
2. Map Layer component

The GIS Asset Chooser Component is a parent to the Map Layer component. It contains the base map.

The Map Layer component is a child to the GIS Asset Chooser component.
An instance of the Map Layer component is used for each layer placed on the map. For example to put 3 different graphic layers on the map, you would use 3 seperate instances of the Map Layer component, one for each layer.

## Use the custom event listener below in the parent application to receive 'chosenAssets' from the GIS Asset Chooser when asset eselection is valid (isValid = true)

```javascript
// Custom event listener to receive chosenAssets from the asset chooser when asset eselection is valid (isValid = true)
document.addEventListener("isValidTrue", function (event) {
  const chosenAssets = event.detail.chosenAssets;
  // log chosenAssets to the console to verify that it was received
  console.log("chosenAssets received:", chosenAssets);
  // your logic here to handle chosenAssets within the parent application when isValid is true
});
```

## Once received 'chosenAssets' can be used as needed within the parent application

### Possible integration strategies include

1. store in a new variable scoped for the parent application  
2. using local storage to save 'chosenAssets'
3. using a submit button to send or store 'chosenAssets' to desired location
4. storing to database
5. using in an API call
<!-- Other Ideas? -->

```javascript
// Custom event listener to receive chosenAssets from the asset chooser when isValid is true
document.addEventListener("isValidTrue", function (event) {
  const chosenAssets = event.detail.chosenAssets;
  console.log("chosenAssets received:", chosenAssets);
  // example of a possible integration strategy using local storage and a submit button
  localStorage.setItem("chosenAssets", JSON.stringify(chosenAssets));
  document.getElementById("submit-chosen-assets-button").removeAttribute("disabled");
  document.getElementById("submit-chosen-assets-button").style.boxShadow = "0px 0px 10px 5px #008000";
});
```

## Use the custom event listener below to handle when asset selection is not valid (isValid = false)

```javascript
// Custom event listener for when isValid is false
// recommended for integration with gis aset chooser - customize as needed
document.addEventListener("isValidFalse", function (event) {
  // your logic here to handle when isValid is false 
});

```

### Example

```javascript
// Custom event listener for when isValid is false
// recommended for integration with gis aset chooser - customize as needed
// example of possible integration strategy with a submit button and local storage
document.addEventListener("isValidFalse", function (event) {
  document.getElementById("submit-chosen-assets-button").setAttribute("disabled", true);
  document.getElementById("submit-chosen-assets-button").style.boxShadow = "0px 0px 0px 0px ";
  localStorage.removeItem("chosenAssets");
});
```

## When you receive 'chosenAssets' in the parent application you may want to manipulate the data for use within the parent application

```javascript
// Custom event listener to receive chosenAssets from the asset chooser when isValid is true
// recommended for integration with gis aset chooser - customize as needed
document.addEventListener("isValidTrue", function (event) {
  const chosenAssets = event.detail.chosenAssets;
  console.log("chosenAssets received:", chosenAssets);
  // possible integration strategy - manipulate 'chosenAssets' as needed for use within the parent app
  // change properties to names used within the parent application
  chosenAssets.forEach((asset) => {
    const caseAsset = {
      attributes: asset.assetAttributes,
      id: asset.assetId,
      sourceLayer: asset.layerName,
      title: asset.assetLabel, 
    }
    caseAssets.push(caseAsset);
    console.log("caseAssets:", caseAssets);
   });
});
```

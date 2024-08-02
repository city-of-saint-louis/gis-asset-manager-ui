# **ArcGIS Asset Chooser Module**

## **Description**

The ArcGIS Asset Chooser Module utilizes the [ArcGIS Maps SDK for JavaScript](https://developers.arcgis.com/javascript/latest) to create an interactive map that can be configured with various different graphic layers.

Users can select assets contained within the graphic layers by mouse click. Developers can configure the module to fit a specific use case by passing property values to the module's two custom elements. (Asset Chooser Container and Asset Chooser Map Layer)

The ArcGIS Asset Chooser Module is not a standalone application. It is intended for use within a parent application and was built with flexibility in mind.

When the asset selection requirements have been met by the user, the array of chosen assets ('chosenAssets') becomes available to the parent application through a custom event.

The parent application can then receive the 'chosenAssets' array through the use of a custom event listener.

## **Contents**

- [Parts of the GIS Asset Chooser](#parts-of-the-arcgis-asset-chooser-module)
- [How To Use the ArcGIS Asset Chooser](#how-to-use-the-arcgis-asset-chooser)

## Parts of the ArcGIS Asset Chooser Module

### **The ArcGIS Asset Chooser Module is made of three JavaScript files**

1. [assest-chooser-container.js](#assest-chooser-containerjs)
2. [asset-chooser-map-layer.js](#asset-chooser-map-layerjs)
3. [asset-chooser.js](#asset-chooserjs)

#### **assest-chooser-container.js**

 A reusuable [Custom Element](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements) made with [Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components) technologies. This is where the ArcGIS Asset Chooser, including the map, is rendered. It is a parent to **asset-chooser-map-layer.js**.

The Asset Chooser can be configured as needed by passing values for the following properties to the container element.

1. **title**
   - type: string
   - description: An appropriate title based on the specific implementation of the ArcGIS Asset Chooser
   - default value: none
2. **hint**
   - type: string
   - description: A simple statement to let the user know what to do with the ArcGIS Asset Chooser for the specific implementation
   - default value: none
3. **zoom**
   - type: number
   - description: Sets the zoom level for the map when it first loads. The lower the number, the farther out the zoom level.
   - default value: 12
4. **base-map**
   - type: string
   - description: Sets the base map to be used for the ArcGIS Asset Chooser.
   - default value: "topo-vector"
5. **center-x**
   - type: number
   - description: Sets the X coordinate for where the map will be entered
   - default value: -90.25
6. **center-y**
   - type: number
   - description:
   - default value: 38.64
7. **show-search**
   - type: boolean
   - description: Determines if the search box is shown on the map or not.
   - default value: true

**Please note:**

***If a string is passed in instead of a number or a boolean, such as "12" instead of 12, or "false", instead of false, it will be converted to the proper data type.***

***If a property is not included the default value will take effect.***

```html
<asset-chooser-container
  title="Parade Permit Application"
  hint="Select the street segments for your proposed parade route."
>
</asset-chooser-container>
```

#### **asset-chooser-map-layer.js**

A reusuable [Custom Element](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements) made with [Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components) technologies. A child to **assest-chooser-container.js**. An instance of the map layer element is used for each layer placed on the map. For example to put 3 different graphic layers on the map, you would use 3 seperate instances of **asset-chooser-map-layer.js** (one for each layer) and pass each instance the necessary properties.

A map layer can be configured as needed by passing values for the following properties to the map layer element.

1. **minimum**
   - type: number
   - description:
   - default value:
2. **maximum**
   - type: number
   - description:
   - default value:
3. **label-mask**
   - type:
   - description:
   - default value:
4. **layer-asset-id-field-name**
   - type:
   - description:
   - default value:
5. **min-scale**
   - type: number
   - description:
   - default value:
6. **max-scale**
   - type: number
   - description:
   - default value:

**Please note:**

***If a string is passed in instead of a number, such as "4" instead of 4, it will be converted to the proper data type.***

***If a property is not included the default value will take effect.***

```html
<asset-chooser-map-layer
  name="Streets"
  layer-class-url="https://maps6.stlouis-mo.gov/arcgis/rest/services/CITYWORKS/CW_BASE/MapServer/0"
  layer-asset-id-field-name="OBJECTID"
  minimum="1"
  maximum="3"
  label-mask="{FULLNAME} from {From_Stree} to {To_Street}"
>
</asset-chooser-map-layer>
```

#### **asset-chooser.js**

This file holds the logic to make the ArcGIS Asset Chooser Module work. This is where the magic happens.

### Example of using the Map Layer Component inside of the Asset Chooser Container Component

```html
    <div>
      <asset-chooser-container
        title="GIS Asset Chooser"
        hint="Click on the map to select required assets. Click again to unselect."
      >
        <asset-chooser-map-layer
          name="Streets"
          layer-class-url="https://maps6.stlouis-mo.gov/arcgis/rest/services/CITYWORKS/CW_BASE/MapServer/0"
          layer-asset-id-field-name="OBJECTID"
          minimum="1"
          maximum="3"
          label-mask="{FULLNAME} from {From_Stree} to {To_Street}"
          min-scale="0"
        >
        </asset-chooser-map-layer>
        <asset-chooser-map-layer
          name="Parcels"
          layer-class-url="https://services6.arcgis.com/HZXbCkpCSqbGd0vK/ArcGIS/rest/services/Parcels/FeatureServer/0"
          layer-asset-id-field-name="FID"
          minimum="1"
          label-mask="{SITEADDR}"
          min-scale="0"
        >
        </asset-chooser-map-layer>
      </asset-chooser-container>
    </div>
  ```

## How To Use the ArcGIS Asset Chooser

### [ArcGIS Maps SDK for JavaScript](https://developers.arcgis.com/javascript/latest)

### Custom Event Listeners for the parent application

[isValidTrue event listener](#isvalidtrue-event-listener)
[isValidFalse event listener](isvalidfalse-event-listener)

## isValidTrue event listener

### Use the custom event listener below in the parent application to receive 'chosenAssets' from the GIS Asset Chooser when asset eselection is valid (isValid = true)

```javascript
// Custom event listener to receive chosenAssets from the asset chooser when asset eselection is valid (isValid = true)
document.addEventListener("isValidTrue", function (event) {
  const chosenAssets = event.detail.chosenAssets;
  // log chosenAssets to the console to verify that it was received
  console.log("chosenAssets received:", chosenAssets);
  // your logic here to handle chosenAssets within the parent application when isValid is true
});
```

## isValidFalse event listener

### Use the custom event listener below to handle when asset selection is not valid (isValid = false)

```javascript
// Custom event listener for when isValid is false
// recommended for integration with gis aset chooser - customize as needed
document.addEventListener("isValidFalse", function (event) {
  // your logic here to handle when isValid is false 
});

```

### Once received 'chosenAssets' can be used as needed within the parent application

### Some possible integration strategies include

1. store in a new variable scoped for the parent application  
2. use local storage to save 'chosenAssets'
3. use a submit button to send or store 'chosenAssets' to desired location
4. store to database
5. use in an API call
<!-- Other Ideas? -->

### Example of using 'isValidTrue' event listener

```javascript
// Custom event listener to receive chosenAssets from the asset chooser when isValid is true
document.addEventListener("isValidTrue", function (event) {
  const chosenAssets = event.detail.chosenAssets;
  console.log("chosenAssets received:", chosenAssets);
  // example of a possible integration strategy using local storage and a submit button
  localStorage.setItem("chosenAssets", JSON.stringify(chosenAssets));
  document.getElementById("submit-chosen-assets-button").removeAttribute("disabled");
  document.getElementById("submit-chosen-assets-button").style.boxShadow = "0px 0px 10px 5px #538400";
}); 2
```

### Example of using 'isValidFalse' event listener

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

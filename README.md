# **GIS Asset Chooser Module**

## **Description**

The GIS Asset Chooser Module utilizes the [ArcGIS Maps SDK for JavaScript](https://developers.arcgis.com/javascript/latest) to create an interactive map that can be configured with various different graphic layers.

Users can select assets contained within the graphic layers by mouse click. Developers can configure the module to fit a specific use case by passing property values to the module's two custom elements.

The GIS Asset Chooser Module is not a standalone application. It is intended for use within a parent application and was built with flexibility in mind.

When the asset selection requirements have been met by the user, the array of chosen assets ('chosenAssets') becomes available to the parent application through a custom event.

The parent application can then receive the 'chosenAssets' array through the use of a custom event listener and consume the data as needed.

## **Link to Demo**
[Demo-deployment](https://miniature-chainsaw-9qqvvzp.pages.github.io/)

## **Contents**

- [Parts of the GIS Asset Chooser Module](#parts-of-the-gis-asset-chooser-module)
- [How To Use the GIS Asset Chooser Module](#how-to-use-the-gis-asset-chooser-module)

## Parts of the GIS Asset Chooser Module

1. [assest-chooser-container-functions.js](#asset-chooser-container-functionsjs)
2. [asset-chooser-container.js](#asset-chooser-containerjs)
3. [asset-chooser-functions.js](#asset-chooser-functionsjs)
4. [asset-chooser-initialize-map.js](#asset-chooser-initialize-mapjs)
5. [asset-chooser-map-layer.js](#asset-chooser-map-layerjs)
6. [asset-chooser-state.js](#asset-chooser-statejs)
7. [asset-chooser.js](#asset-chooserjs)
8. [asset-chooser-styles.css](#asset-chooser-stylescss)

### **asset-chooser-container-functions.js**

This file contains the functions that are only used in the asset chooser container. Functions are exported from this file and imported into asset-chooser-container.js

### **asset-chooser-container.js**

 A reusable [Custom Element](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements) made with [Web Component](https://developer.mozilla.org/en-US/docs/Web/API/Web_components) technologies. This is where the ArcGIS Asset Chooser, including the map, is rendered. It is a parent to **asset-chooser-map-layer.js**.

The Asset Chooser can be configured as needed by passing values for the following properties to the container element.

1. **title**
   - type: string
   - description: An appropriate title based on the specific implementation of the GIS Asset Chooser
   - default value: **none**
2. **hint**
   - type: string
   - description: A simple statement to let the user know what to do with the GIS Asset Chooser for the specific implementation
   - default value: **none**
3. **zoom**
   - type: number
   - description: Sets the zoom level for the map when it first loads. The lower the number, the farther out the zoom level.
   - default value: **12**
4. **base-map**
   - type: string
   - description: Sets the base map to be used for the ArcGIS Asset Chooser.
   - default value: **"topo-vector"**
5. **center-x**
   - type: number
   - description: Sets the X coordinate for where the map will be entered
   - default value: **-90.25** (By default the map centers on the center of the City of St. Louis.)
6. **center-y**
   - type: number
   - description: Sets the Y coordinate for where the map will be entered
   - default value: **38.64** (By default the map centers on the center of the City of St. Louis.)
7. **show-search**
   - type: boolean
   - description: Determines if the search box is shown on the map or not.
   - default value: **true**

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

The asset chooser container also houses the **accessibility accommodation**. Users navigating by keyboard are unable to tab into the map and select assets with the keyboard. Even if they could, a map layer may contain thousands of assets. It is not reasonable to ask someone to tab through thousands of assets to find the one they need. In order to account for this we have provided an accommodation for folks navigating by keyboard and using assistive technology such as a screen reader. We have placed a button above the map for users who need to access this accommodation. When the button is clicked a modal opens with a text input allowing users to enter information on their required assets.

No additional configuration is required to implement this solution. A text input is generated for each map layer that has been applied. If asset selection is required for any particular layer, then a user will be required to provide asset information for that layer through the alternate text input.

This feature can be further built out to accomodate a specific use case, allowing users to provide more detailed information if needed.

### **asset-chooser-functions.js**

This file contains most of the functions used by the asset chooser. Functions are exported from this file and imported where they are needed.

### **asset-chooser-initialize-map.js**

This file holds the initializeMap function. This function uses the map layers and other data to generate the map. It is exported from here and imported into asset-chooser.js and asset-chooser-container-functions.js

### **asset-chooser-map-layer.js**

A reusuable [Custom Element](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements) made with [Web Component](https://developer.mozilla.org/en-US/docs/Web/API/Web_components) technologies. A child to **assest-chooser-container.js**. An instance of the map layer element is used for each layer placed on the map. For example to put 3 different graphic layers on the map, you would use 3 seperate instances of **asset-chooser-map-layer.js** (one for each layer) and pass each instance the necessary properties.

A map layer can be configured as needed by passing values for the following properties to the map layer element.

1. **name**
   - type: string
   - description: The name of the layer
   - default value: none
2. **layer-class-url**
   - type: string
   - description: The url for the ArcGIS map layer that you want to use.
   - default value: none
3. **minimum**
   - type: number
   - description: The minimum number of assets that must be selected from this layer by a user.
   - default value: 0
4. **maximum**
   - type: number
   - description: The maximum number of assets that can be selected from this layer by a user.
   - default value: 0
5. **label-mask**
   - type: string
   - description: Template for how the asset will be labeled on the screen when selected by the user. Parts of the string that
     change dynamically based on asset selection must be surrounded by curly braces in your string. You do not need to use backticks. See examples below.
   - default value: none
   - **Example:** The label mask for the streets layer is "**{FULLNAME} from {From_Stree} to {To_Street}**". The parts in brackets
     are filled in dynamically based on the asset selected. When a street segement is selected, it renders on the screen as follows: "**N GRAND BLVD from MONTGOMERY ST to ST. LOUIS AVE**"
6. **layer-asset-id-field-name**
   - type: string
   - description: The type of unique asset ID for this layer. Each graphic layer has a unique ID for identifying the assets
     connected to that layer. These are not always uniform from layer to layer. Some possible ID types that may be used are "OBJECTID", "FID", or "GUID". Pass in thte appropriate ID type for the layer you are using.
   - default value: "GUID"
7. **min-scale**
   - type: number
   - description: Use "min-scale" and "max-scale" if you want a map layer to only appear at certain zoom levels.
   - default value: none
8. **max-scale**
   - type: number
   - description: Use "min-scale" and "max-scale" if you want a map layer to only appear at certain zoom levels.
   - default value: none

**Please note:**

***If a string is passed in instead of a number, such as "4" instead of 4, it will be converted to the proper data type.***

***If a property is not included the default value will take effect.***

```html
<asset-chooser-map-layer
  name="Streets"
  layer-class-url="https://maps6.stlouis-mo.gov/arcgis/rest/services/CITYWORKS/CW_BASE/MapServer/0"
  layer-asset-id-field-name="OBJECTID"
  minimum=1
  maximum=3
  label-mask="{FULLNAME} from {From_Stree} to {To_Street}"
  min-scale=10000
>
</asset-chooser-map-layer>
```

### **asset-chooser-state.js**

This file holds all of the state variables that are required for the asset chooser to function. Variables are declared and exported from this file and imported into the other files as needed.

### **asset-chooser.js**

This file captures the x,y coordinates from address validation and the map layer data from the map-layer components and uses the data to initialize the map.

### **asset-chooser-styles.css**

CSS stylesheet for the asset chooser module  

## **How To Use the GIS Asset Chooser Module**

1. [Bring in ArcGIS Maps SDK for JavaScript](#bring-in-arcgis-maps-sdk-for-javascript)
2. [Bring in GIS Asset Chooser Module JavaScript](#bring-in-gis-asset-chooser-module-javascript)
3. [Use Custom Elements in HTML](#use-custom-elements-in-html)
4. [Place custom event listeners in parent application](#place-custom-event-listeners-in-parent-application)
5. [Further customize event listeners to fit your use case](#further-customize-event-listeners-to-fit-your-use-case)

### **Bring in ArcGIS Maps SDK for JavaScript**

The GIS Asset Chooser Module utilizes the [ArcGIS Maps SDK for JavaScript](https://developers.arcgis.com/javascript/latest) and is intended for use with base maps and map layers made through ArcGIS.

In order for the GIS Asset Chooser you must bring the ArcGIS Maps SDK for JavaScript into your application. You can do this through [CDN](https://developers.arcgis.com/javascript/latest/get-started-cdn/) or [npm](https://developers.arcgis.com/javascript/latest/get-started-npm/). For our system CDN was the way to go. This READme demonstrates CDN implementation. For information on using npm see the [ArcGIS documentation](https://developers.arcgis.com/javascript/latest/get-started-npm/)

To utilize the CDN there are two tags, one for CSS and one for JavaScript. ArcGIS documentation recommends putting both in the HEAD of your HTML.

```html
<link rel="stylesheet" href="https://js.arcgis.com/4.30/esri/themes/light/main.css" />
<script src="https://js.arcgis.com/4.30/"></script>
```

### **Bring in GIS Asset Chooser Module JavaScript**

To use the GIS Asset Chooser Module you will need to pull in the asset-chooser.js file. Place the script tag in your HTML just before the closing body tag. Make sure you set type to equal "module".

```html
    <script type="module" src="asset-chooser.js"></script>
  </body>
```

### **Use Custom Elements in HTML**

Once the ArcGIS Maps SDK for JavaScript and the GIS Asset Chooser are in place, simply use the custom elements in your HTML and pass the necessary property values to both elements as needed.

### **Example Implementation of the GIS Asset Chooser module's two custom elements**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GIS Asset Chooser Demo</title>
    <!-- Bring in ArcGIS CSS -->
    <link rel="stylesheet" href="https://js.arcgis.com/4.30/esri/themes/light/main.css" />
    <!-- Bring in ArcGIS JavaScript -->
    <script src="https://js.arcgis.com/4.30/"></script>
  </head>
  <body>
    <header></header>
    <main>
      <!-- Insert the container element into html. Pass in property values as needed. -->
      <!-- Title and hint are the only properties with no default value.  -->
      <asset-chooser-container
        title="Select Assets Required For Your Use Case"
        hint="Click on the map to select required assets. Click again to unselect."
      >
        <!-- Use the map layer element inside the container element. -->
        <!-- Use a new instance of the map layer element for each layer you want to put on the map. -->
        <!-- Instance of the map layer custom element used to add "Streets" layer. -->
        <asset-chooser-map-layer
          name="Streets"
          layer-class-url="https://maps6.stlouis-mo.gov/arcgis/rest/services/CITYWORKS/CW_BASE/MapServer/0"
          layer-asset-id-field-name="OBJECTID"
          minimum=1
          maximum=3
          label-mask="{FULLNAME} from {From_Stree} to {To_Street}"
          min-scale=10000
        >
        </asset-chooser-map-layer>
        <!-- Instance of the map layer custom element used to add "Parcels" layer. -->
        <asset-chooser-map-layer
          name="Parcels"
          layer-class-url="https://maps6.stlouis-mo.gov/arcgis/rest/services/CITYWORKS/CW_BASE/MapServer/4"
          layer-asset-id-field-name="FID"
          minimum=1
          maximum=0
          label-mask="{SITEADDR}"
          max-scale=10000
        >
        </asset-chooser-map-layer>
      </asset-chooser-container>
    </main>
    <footer></footer>
    <script type="module" src="asset-chooser.js"></script>
  </body>
</html>
```

### **Place custom event listeners in parent application**

- [isValidTrue event listener](#isvalidtrue-event-listener)
- [isValidFalse event listener](isvalidfalse-event-listener)

When assets are selected by a user they are added to an array 'chosenAssets'. When the selections in 'chosenAssets' meet the selection criteria, a custom event 'isValidTrue' is triggered. This event makes the 'chosenAssets' array available to the parent application. Use the 'isValidTrue' event listener to bring 'chosenAssets' into the parent application and handle any changes to the user interface or any other logic that needs to run at that time. For example you may what to enable a submit button when 'isValidTrue' is triggered.

If after the 'isValidTrue' event has been triggered, assets are unselected, and the items within 'chosenAssets' no longer meet the selection criteria, a second custom event 'isValidFalse' is triggered. The 'isValidFalse' event listener can be used to handle any necssary logic that needs to run at that time. For example if when 'isValidTrue' fires, a button is enabled to submit 'chosenAssets', you would probably want to disable the button when 'isValidFalse' is triggered. You also might want to secure 'chosenAssets' so it is no longer available in the parent application.

#### **isValidTrue event listener**

Use the custom event listener below in the parent application to receive 'chosenAssets' from the GIS Asset Chooser when asset selection is valid (isValid = true)

```javascript
// Custom event listener to receive chosenAssets from the asset chooser when asset selection is valid (isValid = true)
document.addEventListener("isValidTrue", function (event) {
  const chosenAssets = event.detail.chosenAssets;
  // log chosenAssets to the console to verify that 'chosenAssets' is available to parent app
  console.log("chosenAssets available to parent:", chosenAssets);
  // your logic here to handle chosenAssets within the parent application when isValid is true
});
```

#### **isValidFalse event listener**

Use the custom event listener below to handle when asset selection is not valid (isValid = false)

```javascript
// Custom event listener for when isValid is false (isValid = false)
// Further customize as needed to fit your use case
document.addEventListener("isValidFalse", function (event) {
  // your logic here to handle when isValid is false 
});

```

### **Further customize event listeners to fit your use case**

Customize the event listeners to fit your needs. Once received 'chosenAssets' can be consumed as needed within the parent application.  The event listeners can also be used to handle any necessary changes to the user interface, or run any other necessary logic.

#### Some possible integration strategies include

1. save chosen asset data to a new variable scoped for the parent application  
2. use local storage to save 'chosenAssets'
3. use a submit button to send or store 'chosenAssets' to desired location
4. store to database
5. use in an API call
6. change the user interface when isValid = true
7. change the user interface when isValid = false
8. your idea here

#### Example of using 'isValidTrue' event listener

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

#### Example of using 'isValidFalse' event listener

```javascript
// Custom event listener for when isValid is false
// example of possible integration strategy with a submit button and local storage
document.addEventListener("isValidFalse", function (event) {
  document.getElementById("submit-chosen-assets-button").setAttribute("disabled", true);
  document.getElementById("submit-chosen-assets-button").style.boxShadow = "0px 0px 0px 0px ";
  localStorage.removeItem("chosenAssets");
});
```

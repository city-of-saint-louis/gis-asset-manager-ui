# **GIS Asset Manager UI**

## **Developed By The City of St. Louis Web Team**

_Please note: The documentation below is in process and is not yet fully comprehensive._

## **Description**

GIS Asset Manager UI utilizes the [ArcGIS Maps SDK for JavaScript](https://developers.arcgis.com/javascript/latest) to create an interactive map that can be configured with various different graphic layers for selecting existing assets and/or adding new assets.

Developers can configure the module to fit a specific use case by passing property values to the module's custom elements. Users can select assets contained within the graphic layers by mouse click and/or add new assets using the Sketch feature depending on the module is configured. GIS Asset Manager UI can be configured to run in **Select Mode** allowing users to select existing assets, **Sketch Mode** allowing users to add new assets, or **both modes simultaneously**.

Selected assets are added to an array called 'chosenAssets', and newly sketched assets are added to an array called 'createdAssets'.

GIS Asset Manager UI is not a standalone application. It is intended for use within a parent application.

When the asset requirements have been met by the user, the array of chosen assets ('chosenAssets') and/or the array of newly sketched assets ('createdAssets') become available to the parent application through custom events that are triggered automatically when the asset requirements are met.

The parent application can then receive the 'chosenAssets' array and/or the 'createdAssets' array through the use of custom event listeners. The parent application can then consume the data as needed.

## **[Link to Demo](https://miniature-chainsaw-9qqvvzp.pages.github.io/)**

## **Contents**

- [Getting Started](#getting-started)
- [How To Use GIS Asset Manager UI](#how-to-use-gis-asset-manager-ui)
- [Parts of GIS Asset Manager UI](#parts-of-gis-asset-manager-ui)
- [Accessible Accommodation](#accessible-accommodation)

## Getting Started

### Installation

There are three ways to use GIS Asset Manager UI in your project:

**_Please note: The commands below are placeholders to be updated once the module is published to npm._**

1. You can install the module via npm:

   ```bash
   npm install gis-asset-chooser
   ```

2. You can use GIS Asset Manager UI via a CDN:

   ```html
   <script src="https://cdn.jsdelivr.net/npm/gis-asset-chooser/dist/gis-asset-manager.js"></script>
   ```

3. You can also include GIS Asset Manager UI directly in your project by downloading the source files and referencing them locally. This method is not recommended as you do not need all of the files in the asset chooser repository to run the module and it will make updating the module within your project more difficult. If you choose this method you only need to include the JavaScript files (not including `parent-application.js`) in your project. You must keep all of the JavaScript files in the same directory. You can choose to use the two CSS stylesheets or not. See the section on [CSS Files](#css-files) for more information. You only need to include a script tag for the main JavaScript file `gis-asset-manager.js` in your HTML file.

   ```html
   <script src="path/to/gis-asset-manager.js"></script>
   ```

### ArcGIS Maps SDK for JavaScript

GIS Asset Manager UI relies on the [ArcGIS Maps SDK for JavaScript](https://developers.arcgis.com/javascript/latest). You will need to include this SDK in your project for the module to function correctly. To utilize the SDK in your project include the necessary script tags in the order shown below in the `<head>` section of your HTML file:

```html
<!-- Load Calcite Design System from ArcGIS-->
<script type="module" src="https://js.arcgis.com/calcite-components/3.3.3/calcite.esm.js"></script>

<!-- Load the JavaScript Maps SDK core API -->
<script src="https://js.arcgis.com/4.34/"></script>

<!-- Load the JavaScript Maps SDK Map components or other component packages -->
<script type="module" src="https://js.arcgis.com/4.34/map-components/"></script>
```

According to the [ArcGIS Maps SDK for JavaScript documentation](https://developers.arcgis.com/javascript/latest/get-started/), you can also install the SDK via npm although the documentation is a bit vague on which packages are required.

The documentation references the following command to install ArcGIS Map Components:

```bash
npm install @arcgis/map-components
```

There is also the option to install the ArcGIS Maps SDK for JavaScript via npm:

```bash
npm install @arcgis/core
```

Refer to the [ArcGIS Maps SDK for JavaScript documentation](https://developers.arcgis.com/javascript/latest/get-started/) for more information.

## **How To Use GIS Asset Manager UI**

1. [Use Custom Elements in HTML](#use-custom-elements-in-html)
2. [Place custom event listeners in parent application](#place-custom-event-listeners-in-parent-application)
3. [Further customize event listeners to fit your use case](#further-customize-event-listeners-to-fit-your-use-case)

### **Use Custom Elements in HTML**

Once the ArcGIS Maps SDK for JavaScript and the GIS Asset Chooser are in place, simply use the custom elements in your HTML and pass the necessary property values to both elements as needed.

**_Note: Remember to quote all attribute values in HTML, even for numbers and booleans. For example: `zoom="12"`, `show-search="true"`._**

#### **Example Implementation of GIS Asset Manager UI's two custom elements in HTML**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GIS Asset Chooser Demo</title>
    <!-- Bring in ArcGIS CSS -->
    <link
      rel="stylesheet"
      href="https://js.arcgis.com/4.30/esri/themes/light/main.css"
    />
    <!-- Bring in ArcGIS JavaScript -->
    <script src="https://js.arcgis.com/4.30/"></script>
  </head>
  <body>
    <header></header>
    <main>
      <!-- Insert the container element into html. Pass in property values as needed. -->
      <!-- Title and hint are the only properties with no default value.  -->
      <asset-manager-container
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
          minimum="1"
          maximum="3"
          label-mask="{FULLNAME} from {From_Stree} to {To_Street}"
          min-scale="10000"
        >
        </asset-chooser-map-layer>
        <!-- Instance of the map layer custom element used to add "Parcels" layer. -->
        <asset-chooser-map-layer
          name="Parcels"
          layer-class-url="https://maps6.stlouis-mo.gov/arcgis/rest/services/CITYWORKS/CW_BASE/MapServer/4"
          layer-asset-id-field-name="FID"
          minimum="1"
          maximum="0"
          label-mask="{SITEADDR}"
          max-scale="10000"
        >
        </asset-chooser-map-layer>
      </asset-manager-container>
    </main>
    <footer></footer>
    <script type="module" src="asset-manager.js"></script>
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

Customize the event listeners to fit your needs. Once received 'chosenAssets' can be consumed as needed within the parent application. The event listeners can also be used to handle any necessary changes to the user interface, or run any other necessary logic.

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
  document
    .getElementById("submit-chosen-assets-button")
    .removeAttribute("disabled");
  document.getElementById("submit-chosen-assets-button").style.boxShadow =
    "0px 0px 10px 5px #538400";
});
2;
```

#### Example of using 'isValidFalse' event listener

```javascript
// Custom event listener for when isValid is false
// example of possible integration strategy with a submit button and local storage
document.addEventListener("isValidFalse", function (event) {
  document
    .getElementById("submit-chosen-assets-button")
    .setAttribute("disabled", true);
  document.getElementById("submit-chosen-assets-button").style.boxShadow =
    "0px 0px 0px 0px ";
  localStorage.removeItem("chosenAssets");
});
```

## Parts of GIS Asset Manager UI

1. [Custom Elements](#custom-elements)
2. [Other JavaScript Files](#other-javascript-files)
3. [CSS Files](#css-files)

### Custom Elements

There are 5 custom elements in GIS Asset Manager UI. The module is configured by passing property values to AssetManagerContainer, AssetChooserMapLayer, and AssetChooserSketchableMapLayer. The other two custom elements, AssetManagerMapLayerDataDisplay and AssetManagerModeToggle, are used internally by the module.

1. [AssetManagerContainer](#assetmanagercontainer)
2. [AssetChooserMapLayer](#assetchoosermaplayer)
3. [AssetChooserSketchableMapLayer](#assetchoosersketchablemaplayer)
4. [AssetManagerMapLayerDataDisplay](#assetmanagermaplayerdatadisplay)
5. [AssetManagerModeToggle](#assetmanagermodetoggle)

#### **AssetManagerContainer**

##### **asset-manager-container.js**

A reusable [Custom Element](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements) made with [Web Component](https://developer.mozilla.org/en-US/docs/Web/API/Web_components) technologies. This is where the ArcGIS Asset Chooser, including the map, is rendered. It is a parent to **asset-chooser-map-layer.js**.

The Asset Chooser can be configured as needed by passing values for the following properties to the container element.

1. **title**
   - **Type:** `string`
   - **Description:** An appropriate title based on the specific implementation of the GIS Asset Chooser.
   - **Default value:** _none_

2. **hint**
   - **Type:** `string`
   - **Description:** A simple statement to let the user know what to do with the GIS Asset Chooser for the specific implementation.
   - **Default value:** _none_

3. **zoom**
   - **Type:** `number`
   - **Description:** Sets the zoom level for the map when it first loads. The lower the number, the farther out the zoom level.
   - **Default value:** `12`

4. **base-map**
   - **Type:** `string`
   - **Description:** Sets the base map to be used for the ArcGIS Asset Chooser.
   - **Default value:** `"topo-vector"`

5. **center-x**
   - **Type:** `number`
   - **Description:** Sets the X coordinate for where the map will be centered.
   - **Default value:** `-90.25` (By default the map centers on the center of the City of St. Louis.)

6. **center-y**
   - **Type:** `number`
   - **Description:** Sets the Y coordinate for where the map will be centered.
   - **Default value:** `38.64` (By default the map centers on the center of the City of St. Louis.)

7. **show-search**
   - **Type:** `boolean`
   - **Description:** Determines if the search box is shown on the map or not.
   - **Default value:** `true`

8. **is-select-enabled**
   - **Type:** `boolean`
   - **Description:** Determines if select mode is enabled, allowing users to select existing assets on the map.
   - **Default value:** `true`

9. **is-sketch-enabled**
   - **Type:** `boolean`
   - **Description:** Determines if sketch mode is enabled, allowing users to add new assets to the map.
   - **Default value:** `false`

10. **is-select-by-search-enabled**
    - **Type:** `boolean`
    - **Description:** Determines if select by search mode is enabled, allowing users to select assets by searching for them. This must be enabled in the container and in any map layer where select by search is desired.
    - **Default value:** `false`

11. **title-heading-level**
    - **Type:** `number`
    - **Description:** Sets the heading level for the title of the asset chooser (h1 - h6). Pass in a number from 1 to 6.
    - **Default value:** `2`

12. **extent-xmin**
    - **Type:** `number`
    - **Description:** Sets the minimum X coordinate for the map extent.
    - **Default value:** `-10054448.855908303`

13. **extent-xmax**
    - **Type:** `number`
    - **Description:** Sets the maximum X coordinate for the map extent.
    - **Default value:** `-10038240.32627997`

14. **extent-ymin**
    - **Type:** `number`
    - **Description:** Sets the minimum Y coordinate for the map extent.
    - **Default value:** `4654966.477336443`

15. **extent-ymax**
    - **Type:** `number`
    - **Description:** Sets the maximum Y coordinate for the map extent.
    - **Default value:** `4689440.938430255`

16. **extent-spatial-reference-wkid**
    - **Type:** `number`
    - **Description:** Sets the spatial reference WKID for the map extent.
    - **Default value:** `102100`

  **_If a value is not provided for a property, the default value will take effect._**

  **_Note: All attribute values must be quoted in HTML, regardless of type. For example, use `zoom="12"` and `show-search="true"`, not `zoom=12` or `show-search=true`._**

##### HTML example

```html
<asset-manager-container
  title="Parade Permit Application"
  hint="Select the street segments for your proposed parade route."
>
</asset-manager-container>
```

##### JavaScript example

```javascript
const assetManagerContainer = document.createElement("asset-manager-container");
assetManagerContainer.setAttribute("title", "Parade Permit Application");
assetManagerContainer.setAttribute("hint", "Select the street segments for your proposed parade route.");
assetManagerContainer.setAttribute("title-heading-level", "1");
```

The asset chooser container also houses the **accessibility accommodation**. Users navigating by keyboard are unable to tab into the map and select assets with the keyboard. Even if they could, a map layer may contain thousands of assets. It is not reasonable to ask someone to tab through thousands of assets to find the one they need. In order to account for this we have provided an accommodation for folks navigating by keyboard and using assistive technology such as a screen reader. We have placed a button above the map for users who need to access this accommodation. When the button is clicked a modal opens with a text input allowing users to enter information on their required assets.

No additional configuration is required to implement this solution. A text input is generated for each map layer that has been applied. If asset selection is required for any particular layer, then a user will be required to provide asset information for that layer through the alternate text input.

This feature can be further built out to accomodate a specific use case, allowing users to provide more detailed information if needed.

#### **AssetChooserMapLayer**

#### **asset-chooser-map-layer.js**

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

 **_If a value is not provided for a property, the default value will take effect._**

 **_Note: All attribute values must be quoted in HTML, regardless of type. For example, use `zoom="12"` and `show-search="true"`, not `zoom=12` or `show-search=true`._**

```html
<asset-chooser-map-layer
  name="Streets"
  layer-class-url="https://maps6.stlouis-mo.gov/arcgis/rest/services/CITYWORKS/CW_BASE/MapServer/0"
  layer-asset-id-field-name="OBJECTID"
  minimum="1"
  maximum="3"
  label-mask="{FULLNAME} from {From_Stree} to {To_Street}"
  min-scale="10000"
>
</asset-chooser-map-layer>
```

#### **AssetChooserSketchableMapLayer**

#### **AssetManagerMapLayerDataDisplay**

#### **AssetManagerModeToggle**

### Other JavaScript Files

1. [assest-chooser-container-functions.js](#asset-manager-container-functionsjs)
2. [asset-manager-functions.js](#asset-manager-functionsjs)
3. [asset-manager-initialize-map.js](#asset-manager-initialize-mapjs)
4. [asset-manager-state.js](#asset-manager-statejs)
5. [asset-manager.js](#asset-managerjs)
6. [asset-manager-styles.css](#asset-manager-stylescss)

### **asset-manager-container-functions.js**

This file contains the functions that are only used in the asset chooser container. Functions are exported from this file and imported into asset-manager-container.js

### **asset-manager-functions.js**

This file contains most of the functions used by the asset chooser. Functions are exported from this file and imported where they are needed.

### **asset-manager-initialize-map.js**

This file holds the initializeMap function. This function uses the map layers and other data to generate the map. It is exported from here and imported into asset-manager.js and asset-manager-container-functions.js

### **asset-manager-state.js**

This file holds all of the state variables that are required for the asset chooser to function. Variables are declared and exported from this file and imported into the other files as needed.

### **asset-manager.js**

This file captures the x,y coordinates from address validation and the map layer data from the map-layer components and uses the data to initialize the map.

### CSS Files

1. [asset-manager-styles.css](#asset-manager-stylescss)
2. [city-of-stl-styles.css](#city-of-stl-stylescss)

#### **asset-manager-styles.css**

CSS stylesheet for the asset chooser module

#### **city-of-stl-styles.css**

CSS stylesheet for the City of St. Louis asset chooser implementation

## Accessible Accommodation

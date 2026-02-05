// declare variables for the GIS Asset Chooser
// set default values for map view
// set empty arrays for dynamic data storage
// provide setter functions for mutable variables
// export all variables and functions for external access
export const defaultZoom = 12;
export const defaultCenterX = -90.25; // longitude, centered on St. Louis, MO
export const defaultCenterY = 38.64; // latitude, centered on St. Louis, MO
// default extent in Web Mercator (102100) keeps St. Louis city limits in view
export const defaultExtent = {
  xmin: -10054448.855908303,
  xmax: -10038240.32627997,
  ymin: 4654966.477336443,
  ymax: 4689440.938430255,
  spatialReference: { wkid: 102100 },
};
export const defaultBaseMap = "topo-vector";
export const defaultShowSearch = true;
export const mapLayersToAdd = [];
export const sketchableMapLayersToAdd = [];
export const featureLayers = [];
export const graphicLayers = [];
export const chosenAssets = [];
export const createdAssets = [];
export const chosenAssetFormData = [];
export const createdAssetFormData = [];
export const allMapLayerIds = [];
export const allSketchableLayerIds = [];
export const layersWithNoSelectionRequired = [];
export const sketchableLayersWithNoAdditionRequired = [];
export const validLayers = [];
export const validSketchableLayers = [];
export let addressMarkerX;
export function setAddressMarkerX(value) {
  addressMarkerX = value;
}
export let addressMarkerY;
export function setAddressMarkerY(value) {
  addressMarkerY = value;
}
export let isValid = false;
export function setIsValid(value) {
  isValid = value;
}
// export let createdAssetsAreValid = false;
// export function setCreatedAssetsAreValid(value) {
//   createdAssetsAreValid = value;
// }

let _createdAssetsAreValid = false;
export function setCreatedAssetsAreValid(value) {
  _createdAssetsAreValid = value;
}
export function getCreatedAssetsAreValid() {
  return _createdAssetsAreValid;
}

export let allAssetsValid = false;
export function setAllAssetsValid(value) {
  allAssetsValid = value;
}
export let currentView = null;
export function setCurrentView(view) {
  currentView = view;
}
// state vars for sketch capability
export let isSketchEnabled = false;
export function setIsSketchEnabled(value) {
  // console.log("Setting isSketchEnabled to:", value);
  isSketchEnabled = value;
}
// state vars for select capability
export let isSelectEnabled = false;
export function setIsSelectEnabled(value) {
  // console.log("Setting isSelectEnabled to:", value);
  isSelectEnabled = value;
}

export let isSelectBySearchEnabled = false;
export function setIsSelectBySearchEnabled(value) {
  isSelectBySearchEnabled = value;
}

export let assetMode = ""; // possible values: "select", "sketch"
export function setAssetMode(value) {
  assetMode = value;
  // console.log("Asset mode set to:", assetMode);
}

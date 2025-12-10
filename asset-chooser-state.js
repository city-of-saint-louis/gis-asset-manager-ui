// declare variables for the GIS Asset Chooser
// set default values for map view
// set empty arrays for dynamic data storage
// provide setter functions for mutable variables
// export all variables and functions for external access
export const defaultZoom = 12;
export const defaultCenterX = -90.25;
export const defaultCenterY = 38.64;
export const defaultBaseMap = "topo-vector";
export const defaultShowSearch = true;
export const mapLayersToAdd = [];
export const sketchableMapLayersToAdd = [];
export const featureLayers = [];
export const graphicLayers = [];
export const chosenAssets = [];
export const createdAssets = [];
export const chosenAssetFormData = [];
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
export let createdAssetsAreValid = false;
export function setCreatedAssetsAreValid(value) {
  createdAssetsAreValid = value;
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
  console.log("Setting isSketchEnabled to:", value);
  isSketchEnabled = value;
}
// state vars for select capability
export let isSelectEnabled = false;
export function setIsSelectEnabled(value) {
  console.log("Setting isSelectEnabled to:", value);
  isSelectEnabled = value;
}

export let assetMode = ""; // possible values: "select", "sketch"
export function setAssetMode(value) {
  assetMode = value;
  console.log("Asset mode set to:", assetMode);
}
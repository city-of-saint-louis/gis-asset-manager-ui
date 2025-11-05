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
export const featureLayers = [];
export const chosenAssets = [];
// collect sketched assets in createdAssets array
export const createdAssets = [];
export const chosenAssetFormData = [];
export const allMapLayerIds = [];
export const layersWithNoSelectionRequired = [];
export const validLayers = [];
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
export let currentView = null;
export function setCurrentView(view) {
  currentView = view;
}
// state vars for sketch component
// export const isSketchEnabled = false;
// export function setIsSketchEnabled(value) {
//   isSketchEnabled = value;
// }
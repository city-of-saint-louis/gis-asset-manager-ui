// set variables to hold default values and arrays to hold data for the GIS Asset Chooser
export const defaultZoom = 12;
export const defaultCenterX = -90.25;
export const defaultCenterY = 38.64;
export const defaultBaseMap = "topo-vector";
export const defaultShowSearch = true;
export const mapLayersToAdd = [];
export const featureLayers = [];
export const chosenAssets = [];
export const chosenAssetFormData = [];
export const allMapLayerIds = [];
export const layersWithNoSelectionRequired = [];
export const validLayers = [];
export let addressMarkerX;
export let addressMarkerY;
export let isValid = false;
export function setIsValid(value) {
  isValid = value;
}
export let currentView = null;
export function setCurrentView(view) {
  currentView = view;
}
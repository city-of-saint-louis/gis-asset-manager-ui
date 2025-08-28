// set variables to hold default values and arrays to hold data for the GIS Asset Chooser
const defaultZoom = 12;
const defaultCenterX = -90.25;
const defaultCenterY = 38.64;
const defaultBaseMap = "topo-vector";
const defaultShowSearch = true;
const mapLayersToAdd = [];
const featureLayers = [];
const chosenAssets = [];
const chosenAssetFormData = [];
const allMapLayerIds = [];
const layersWithNoSelectionRequired = [];
const validLayers = [];
let addressMarkerX;
let addressMarkerY;
let isValid = false;
let currentView = null;
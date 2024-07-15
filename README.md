# GIS Asset Chooser

## The asset chooser is made of two reusable custom web components

1. GIS Asset Chooser component
2. Map Layer component

The GIS Asset Chooser Component is a parent to the Map Layer component. It contains the base map.

The Map Layer component is a child to the GIS Asset Chooser component.
An instance of the Map Layer component is used for each layer placed on the map. For example to put 3 different graphic layers on the map, you would use 3 seperate instances of the Map Layer component, one for each layer.

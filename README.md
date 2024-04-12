# Coordinate Search Plugin

Extends search widget for coordinate input

Per default coordinates can be searched in following coordinate reference systems:

- app projection (defined in map config)
- geographic wgs84 (EPSG:4326)

Additionally other projections can be configured using `searchProjections`.

## Usage

Open the searchbar of the VC Map and type in a coordinate, e.g. `13.405, 52.52`.

Camera will move to the searched position and a balloon shows position in EPSG:4326 and a projected crs.

## Configuration (all optional):

| Property            | Type                       | State    | Description                                                                                                                           |
| ------------------- | -------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `searchProjections` | `Array<ProjectionOptions>` | optional | options for additional search projections, see [VC Map API](https://lib.virtualcitymap.de/core/5.1/docs/types/ProjectionOptions.html) |

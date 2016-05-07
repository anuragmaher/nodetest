// Constants shared between client and server.

var TILE_WIDTH = 16;
var TILE_HEIGHT = 16;
var SOURCE_IMAGE = "sourceImage";
var MOSAIC_CANVAS = "mosaicCanvas";

var exports = exports || null;
if (exports) {
  exports.TILE_WIDTH = TILE_WIDTH;
  exports.TILE_HEIGHT = TILE_HEIGHT;
}

var MAX_SOURCE_IMAGE_SIZE = "auto";

var IMAGE_REMOTE_LOAD_WORKER = "js/imageRemoteLoad.js";
var AVERAGE_CALC_WORKER = "js/getRowAverage.js";

var MAX_AVERAGE_WORKER = 4;
var MAX_IMAGE_LOADER_WORKER = 4;
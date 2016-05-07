importScripts('httprequest.js');
importScripts('columnLoader.js');

// This function is called when the worker is invoked.
onmessage = function(e) {
  messageParams = e.data;
  var columnLoader = new ColumnLoader();
  columnLoader.loadImages(messageParams.hexvals, messageParams.rowCount, messageParams.imageId);
};

// This worker computes average of each tile of each row and generates average hexvalues for each tile.

importScripts('utils.js');
importScripts('average.js');

// The task of the worker begins when onmessage is called. 
onmessage = function(e) {
	var messageParams = e.data; 
	var imageData = messageParams.imageData.data;
	imageWidth = messageParams.imageWidth;
	tileWidth = messageParams.tileWidth;
	tileHeight = messageParams.tileHeight;
	var rowCount = messageParams.rowCount;
	var hexvals = averageCalc.getHexValuesRow(imageData);
	postMessage({"hexvals": hexvals, "rowCount": rowCount});
	close();
};


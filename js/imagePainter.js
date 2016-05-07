// Module: Painter
// Author: Anurag Maherchandani
// Description: This Module Keeps count of which row has been painted and which not.
// This Module Makes sure that the Rows are loaded in sequence. 
// Map is as follows: 
// 	// Example 
	// RowCount: 0
	//rowCanvasMap[0]["rendered"] = true/false
	//rowCanvasMap[0].rowCanvas = rowcanvas
	//rowCanvasMap[0].rowCanvas = columnVals

// Here there is a important use of Promise,
//    Promise makes sure that if all the images of a row are loaded, then only the paint the Row
//    It is achieved by the function loadAllImages
// We first load the Image to a temporary Canvas, then this canvas is finally painted to the resulting Canvas.

/*jslint browser:true */
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */ /*global define */


// Constructor for Painter class
var Painter = function(imageId, mosaicCanvas, maxrows){
	"use strict";
	var _this = this;
	_this.maxRows = maxrows;
	_this.rowCanvasMap = [];
	if(!mosaicCanvas){
		throw Error(" Canvas with id " + mosaicCanvasId + " not found ");
	}
	_this.mosaicCanvasContext = mosaicCanvas.getContext('2d');
	_this.init();
	_this.canvasWidth = mosaicCanvas.width;
	_this.imageId = imageId;
};

Painter.prototype.init = function(){
	var _this = this;
	for(var rowCount=0;rowCount< _this.maxRows;rowCount++){
		_this.rowCanvasMap[rowCount] = {};
		_this.rowCanvasMap[rowCount].rendered = false;
		_this.rowCanvasMap[rowCount].rowCanvas = false;
	}
};

Painter.prototype.paintRowToRowCanvas = function(rowCount, columnVals){
	var _this = this;

	// This function gets rowCount as parameter and the corresponding tile BLOB values  
	var rowCanvas = document.createElement('canvas');
	rowCanvas.width = _this.canvasWidth;

	_this.rowCanvasMap[rowCount].columnVals = columnVals;
	loadAllImages(_this, rowCount, columnVals, rowCanvas).then(function(response){
		response.painter.paintRowToCanvas(response.rowCount, response.rowCanvas);
	}, function(Error){
		console.log(Error);
		//reject(Error('There was a while loading the image.'));
	});
};

Painter.prototype.paintRowToCanvas = function(rowCount, rowCanvas){
	var _this = this;
	// Just converting the string count to INT 
	rowCount = parseInt(rowCount);

	// This is a fallback mechanism; Sometimes if any one mage due to some reason does not apper in onload function 
	// entire row gets blocked, so just to make sure all the rows are rendered this check in the end ensures loading of images again.
	if(rowCount == _this.maxRows){
		_this.checkForIncompleteRows();
	}

	_this.rowCanvasMap[rowCount].rowCanvas = rowCanvas;
	for(var row=0;row< _this.maxRows;row++){
		if(row == rowCount){
			// Now check for the upper rows which are left unrendered. 
			_this.rowCanvasMap[rowCount].rendered = true;
			_this.paintRowWithCanvas(rowCanvas, rowCount);
			break;
		}
		if(!_this.rowCanvasMap[row].rendered){
			// Not rendering now 
			// If there is any row which is not rendered yet we will return;
			return;
		}
	}
	// Now check if there are Immediate rows available for rendering. 
	// That means rendered should be false and rowcanvas should be present
	rowCount = rowCount + 1;
	for(row= rowCount; row< _this.maxRows; row++){
		if(_this.rowCanvasMap[row].rowCanvas && !_this.rowCanvasMap[row].rendered){
			_this.rowCanvasMap[row].rendered = true;
			var _rowCanvas = _this.rowCanvasMap[row].rowCanvas;
			_this.paintRowWithCanvas(_rowCanvas, row);
		}
		else{
			// Even If one row is found which is rendered then excape, will be taken care next time
			break;
		}
	}
};

// Takes rowCanvas, and rowCount as parameter 
Painter.prototype.paintRowWithCanvas = function(rowCanvas, rowCount){
	var _this = this;
	_this.mosaicCanvasContext.drawImage(rowCanvas, 0, rowCount*TILE_HEIGHT);
	_this.incrementProgress();
};

// Fallback : Now this is written because if for some reason Image loading fails 
// Then try this once. 
Painter.prototype.checkForIncompleteRows = function(){
	var _this = this;
	for(var row=0;row< _this.maxRows;row++){
		if(!_this.rowCanvasMap[row].rendered){
			throw Error(" There was some issue while loading images ");
			//this.paintRowToRowCanvas(row, this.rowCanvasMap[row].columnVals);
		}
	}
};

// Changes the value of percentage value
Painter.prototype.incrementProgress = function(){
	var _this = this;
	if(!_this.imageId){
		throw Error("could not find this.imageId");
	}
	var renderedCount = 0;
	for(var row=0;row< _this.maxRows;row++){
		if(_this.rowCanvasMap[row].rendered){
			renderedCount = renderedCount + 1;
		}
	}
	var percentage = Math.floor((renderedCount/_this.maxRows) * 100);
	mosaics.incrementProgress(_this.imageId, percentage);
};



// This Promise makes sure that when all the images are loaded then only render the row. 
function loadAllImages(painter, rowCount, columnVals, rowCanvas){
	return new Promise(function(resolve, reject) {
		var num_images_loaded = 0, num_images_total=0;
		var numCoumns = columnVals.length;

		function onImageLoad(){
			var _this = this;
			var columnCount = _this.getAttribute('columnCount');
			var rowCount = _this.getAttribute('rowCount');
			var rowContext = rowCanvas.getContext('2d');
			rowContext.drawImage(_this, columnCount * TILE_WIDTH, 0);
			num_images_loaded = num_images_loaded + 1;
			if(num_images_loaded == num_images_total){
				resolve({"rowCanvas": rowCanvas, "rowCount": rowCount, "painter": painter});
			}
		}

		function onError(){
			reject(Error("There was a error While loading the Image"));
		}

		for(var columnCount in columnVals){
			num_images_total = num_images_total + 1;
			var img = new Image();
			var imageURL = window.URL.createObjectURL(columnVals[columnCount]);
	    	img.src = imageURL;
	    	img.setAttribute('columnCount', columnCount);
	    	img.setAttribute('rowCount', rowCount);
			img.onload = onImageLoad;
	    	img.onerror = onError;
	    	img.onabort = onError;
		}
	});
}


// Main module: Mosaic Core
// @author - Anurag Maherchandani -testing
// Core module 
// Description - Short Summary of the App.
//  
// Firstly the image is broken down into different Rows and for each row a Job is sent to queue to 
// compute the averages of the tiles and then the result is sent to another worker to 
// fetch the image blob details from the server. 
// Once the images are fetched and a rowCanvas is created with all the images. 
// Here Promise plays a important role, since all the images should be loaded before rowCanvas is painted to the finalCanvas.
// Finally there is a part in the App which makes sure that even if the later rows are returned first, they are not rendered 
// untill it's previous rows are painted. 

// function start() is called when a user clicks on generate mosiac image for source image.

var Core = (function(){
	"use strict";
	
	var _this = this;

	// Local variables 
	var sourceCanvas;
	var mosaicCanvas;
	// This is a module which can be used to load a image when the Blob data is there 
	var imagePainter;
	_this.imageId = 0;
	_this.canvasWidth = 0;
	_this.canvasHeight = 0;

	// This can contain either ready, processing, completed
	_this.state = "ready";

	_this.changeState = function(state){
		_this.state = state;
	};

	_this.getState = function(){
		return _this.state;
	};
	_this.showCanvas = function(){
		var ele = document.getElementById('mosaicCanvas');
		ele.style.width = "100%";
		ele.innerHTML = "";
		_this.mosaicCanvas.className = "mosaicCanvasElement";
		_this.mosaicCanvas.setAttribute('imageId', _this.imageId);
		ele.appendChild(_this.mosaicCanvas);
	};

	// As soon as the image is added this process start
	_this.begin = function(){
		var numRows = sourceCanvas.height/TILE_HEIGHT;
		for(var rowCount =0; rowCount < numRows; rowCount ++){
			processrow(rowCount);
		}
		_this.changeState("processing");
	};

	// successfun will be called when the mosaic is complete
	_this.onComplete = function(successfun){
		_this.oncomplete = successfun;
	};

	// Here we will be getting the entire row ImageData and sending it to the worker to calculate Average 
	// We will get Average hex values for all the tiles in the row. 
	// We add this worker task to the Pool of workers. 
	// When a worker is free it can pick the new task for processing. 
	// Callback goes to another worker for getting the Image Data from Remote Server call. 
	// Worker is "js/getRowAverage.js"
	function processrow(rowCount){
		var hexvals = [];
		// Getting the Entire Data for Row at once only. 
		var imageData = sourceCanvas.getContext('2d').getImageData(0, rowCount*TILE_HEIGHT, sourceCanvas.width, TILE_HEIGHT);
		var callback = function(e){
			remoteLoadImageUrls(e.data);
		};
		var workerData = {};
		workerData.rowCount = rowCount;
		workerData.imageData = imageData;
		workerData.tileWidth = TILE_WIDTH;
		workerData.tileHeight = TILE_HEIGHT;
		workerData.imageId = mosaics.currentMosaic.imageId;
		workerData.imageWidth = sourceCanvas.width;
		var workerTask = new WorkerTask(AVERAGE_CALC_WORKER, callback, workerData);
  		mosaics.averageWorkers.addWorkerTask(workerTask);
	}



	// This function has input of hexvalues and the corresponding ROW for which we have to get the data
	// Dumps the hexvals and the rowcount to get all the column Blob Data
	// And Final step is paintRowToRowCanvas. 
	function remoteLoadImageUrls(response){
		var hexvals = response.hexvals;
		var rowCount = response.rowCount;
		var workerData = {};
		workerData.hexvals = hexvals;
		workerData.rowCount = rowCount;
		workerData.imageId = mosaics.currentMosaic.imageId;

		function callback(e){
			var rowCount = e.data.rowCount;
			var columnVals = e.data.columnVals;
			if(e.data.imageId == mosaics.currentMosaic.imageId){
				imagePainter.paintRowToRowCanvas(rowCount, columnVals);
			}	
		}

		var workerTask = new WorkerTask(IMAGE_REMOTE_LOAD_WORKER, callback, workerData);
  		mosaics.imgLoaderPool.addWorkerTask(workerTask);
	}

	function createMosiacCanvas(){
		var mosaicCanvas = document.createElement('canvas');
		//mosaicCanvas = document.getElementById(MOSAIC_CANVAS);
		var mosaicCanvasContext = mosaicCanvas.getContext('2d');
		// Clearing the canvas before we begin.
		mosaicCanvasContext.clearRect(0, 0, mosaicCanvas.width, mosaicCanvas.height);
		mosaicCanvas.width = sourceCanvas.width;
		mosaicCanvas.height = sourceCanvas.height;
		var maxRows = Math.ceil(sourceCanvas.height/TILE_HEIGHT);
		imagePainter = new Painter(_this.imageId, mosaicCanvas, maxRows);
		_this.mosaicCanvas = mosaicCanvas;
	}

	_this.setSourceCanvas = function(img, imageId){
		var _this = this;

		_this.imageId = imageId;
		sourceCanvas = document.createElement('canvas');
		sourceCanvas.width = img.width;
		_this.canvasWidth = img.width;
		_this.canvasHeight = img.height;
		sourceCanvas.height = img.height;
		// Drawing the image to the canvas
		sourceCanvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
		// Canvas where we will paint new Image, Tile by Tile
		createMosiacCanvas();
	};

	_this.setProgressBar = function(progressBar){
		_this.progressBar = progressBar;
	};

	_this.incrementProgress = function(percentage){
		var progressBarWidth = percentage * _this.progressBar.parentElement.offsetWidth / 100;
    	_this.progressBar.style.width = progressBarWidth + "px";
    	//console.log(_this.progressBar);
		_this.progressBar.innerHTML = percentage.toString() + "%";
		if(percentage == 100 && _this.oncomplete){
			_this.oncomplete();
		}
	};
	
});


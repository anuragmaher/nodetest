// MosaicCollection of mosaic objects 
var MosaicCollection = function(){
	var _this = this;

	_this.mosaics = [];
	_this.averageWorkers = new Pool(MAX_AVERAGE_WORKER);
	_this.imgLoaderPool = new Pool(MAX_IMAGE_LOADER_WORKER);
	_this.currentMosaic = null;

};

MosaicCollection.prototype.addMosaic = function(img){
	var _this = this;

	var mosaic = new Core();
	var imageId = utils.guid();
	mosaic.setSourceCanvas(img, imageId);
	_this.mosaics.push(mosaic);
	_this.addImageToUI(img, imageId);
	var progressBar = _this.addProgressBar();
	mosaic.setProgressBar(progressBar);
	_this.showImageClickInfo();

	return imageId;
};

MosaicCollection.prototype.showImageClickInfo = function(){
	var ele = document.getElementById("imageClickInfo");
	if(ele){
		ele.className = "faddedText";
	}

};

MosaicCollection.prototype.addToSoureImageBar = function(element){
	var sourceDiv = document.getElementById('sourceImages');
	if(!sourceDiv){
		console.log(" sourceDiv not found ");
		return;
	}
	sourceDiv.appendChild(element);
};

MosaicCollection.prototype.addProgressBar = function(){
	var _this = this;

	var parentEle = document.createElement("div"); 
	parentEle.className = "progressBar";
	var progressBar = document.createElement("div");
	progressBar.className = "progressBarProgress";
	parentEle.appendChild(progressBar);	
	_this.addToSoureImageBar(parentEle);
	return progressBar;
};

MosaicCollection.prototype.addImageToUI = function(img, imageId){
	var _this = this;

	img.className = "sourceImages";
	img.setAttribute('imageId', imageId);
	_this.addEventListner(img);
	_this.addToSoureImageBar(img);
};

MosaicCollection.prototype.getMosaic = function(imageId){
	var _this = this;

	for(var i=0;i< _this.mosaics.length;i++){
		if(imageId == _this.mosaics[i].imageId){
			return _this.mosaics[i];
		}
	}

	throw Error(" Mosaic with imageId " + imageId + " not found ");
};

// Change the progress bar of the corresponding image
MosaicCollection.prototype.incrementProgress = function(imageId, percentage){
	if(!imageId){
		throw Error(" imageId was sent as null. ");
	}
	var _this = this;

	var mosaic = _this.getMosaic(imageId);
	mosaic.incrementProgress(percentage);
	if(percentage == 100){
		mosaic.changeState("completed");
	}
};

MosaicCollection.prototype.addClickHanderMosaic = function(){
	var _this = this;
	var canvas = document.getElementsByClassName("mosaicCanvasElement")[0];
	console.log("canvas element: ");
	console.log(canvas);
	canvas.addEventListener('click', function(e){
		console.log(this);
		var c = this.getContext('2d');

		var xPos = e.clientX - this.offsetLeft;
		var yPos = e.clientY - this.offsetTop + window.pageYOffset;
		var canvas = document.getElementsByClassName("mosaicCanvasElement")[0];
		var imageId = canvas.getAttribute("imageId");
		var mosaic = mosaics.getMosaic(imageId);

		/*
		var rowPos = yPos/mosaic.canvasHeight;
		var colPos = xPos/mosaic.canvasWidth;
		console.log(rowPos);
		console.log(colPos);
		*/


		console.log(xPos);
		console.log(yPos);
    	var p = c.getImageData(xPos, yPos, 1, 1).data; 
    	console.log(p);
    	var rgb = "rgba(" + p[0] + ", "+ p[1] +", " + p[2] + ", "+ p[3] +")";
    	var inversergb = "rgba(" + (255 - p[0]) + ", "+ (255 - p[1]) +", " + (255 -p[2]) + ", "+ p[3] +")";
    	var hex = utils.rgb2hex(inversergb);
    	var coordinates = xPos.toString() + "," + yPos.toString();
    	var url = "/color/" + hex;
		httpRequest(url, coordinates).then(function(response){
			console.log(response);

		}, function(response){
			console.error(response);
		});

    	console.log(hex);

	});
};

// Add a event listner for displaying mosaic when a image is clicked. 
MosaicCollection.prototype.addEventListner  = function(image){
	var _this = this;
	image.addEventListener('click', function (e) {
	    var imageId = this.getAttribute("imageId");
	    mosaic = _this.getMosaic(imageId);
	    if(mosaic.percentage == 100 || mosaic.state == "completed" || _this.currentMosaic == mosaic){
	    	mosaic.showCanvas();
	    	return;
	    }
	    /*
	    if(_this.checkIfMosiacIsRunning()){
	    	alertify.error(" A Mosaic generation is already under progress. ");
	    	return;
	    }*/
	    _this.currentMosaic = mosaic;
	    mosaic.begin();
	    alertify.success(" Mosaic generation started. ");
	    mosaic.showCanvas();
	    utils.scrollToTop();
	    _this.addClickHanderMosaic();
	});

};

MosaicCollection.prototype.checkIfMosiacIsRunning = function(){
	for(var i=0;i< this.mosaics.length;i++){
		if(this.mosaics[i].state == "processing"){
			// Someone is already processing 
			console.log("Someone is already processing");
			return true;
		}
	}
	return false;
};



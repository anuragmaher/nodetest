// Edit me.
// @author: Anurag Maherchandani
// This App creates a Mosaic image from a source image. 
// This App uses parallism to achieve faster image transformation from source image to mosiac image.
// Description - Short Summary of the App.
//  
// Firstly the image is broken down into different Rows and for each row a Job is sent to queue to 
// compute the averages of the tiles and then the result is sent to another worker to 
// fetch the image blob details from the server. 
// Once the images are fetched a dummy rowCanvas is created with all the images. 
// Here Promise played a important role, since all the images should be loaded even before rowCanvas is painted to the finalCanvas.
// Finally there is a part in the App which makes sure that even if the later rows are returned first, they are not rendered 
// untill it's previous rows are painted.


// Initializing core module from core.js

// Mosiac Objects
var mosaics = new MosaicCollection();

// Workers for processing the average calculations and image load 
var averageWorkers = new Pool(MAX_AVERAGE_WORKER);
var imgLoaderPool = new Pool(MAX_IMAGE_LOADER_WORKER);


// ----- * On Drop Events * ------ 
// Drag and drop HTML5 feature for getting the source image. 
document.ondragover = function(event) {
	event.preventDefault();
	event.dataTransfer.dropEffect = 'copy';
};

document.ondrop = function(event) {
	
	event.preventDefault();
	var files = event.dataTransfer.files;
	
	var onimgload = function(){
		mosaics.addMosaic(this);
	};

	for(var i=0;i<files.length;i++){
		var preview = document.createElement('img');
		preview.src = URL.createObjectURL(files[i]);
		preview.addEventListener("load", onimgload); 
	}
	imageLoadSuccess();
};

// ----- * On Upload Events * ------ 
// Once the creation of the image is completed this button will be visible 
var fileUpload = document.getElementById("fileUpload");
fileUpload.addEventListener('change', function (e) {
    previewFile();
});

function imageLoadSuccess(){
	alertify.success(" Images uploaded, you can now click on image to generate a photo Mosaic.");
}

// Called when a user uploads a file
function previewFile(){
	
	alertify.logPosition("bottom right");
	
	//var preview = document.getElementById('sourceImage'); //selects the query named img

	var files = document.getElementById('fileUpload').files;

	function onimgload(){
		var preview = document.createElement('img');	
	    preview.src = this.result;
	    mosaics.addMosaic(preview);
	}

	for(var i=0;i<files.length;i++){
		var file    = files[i]; //sames as here
		var reader  = new FileReader();
		reader.onloadend = onimgload;
		if (file) {
		   reader.readAsDataURL(file); //reads the data as a URL
		} else {
		   preview.src = "";
		}
	}
	imageLoadSuccess();
}


// AverageCalc: A worker to calculate average 
// Input: imageData - This is a Raw data of pixel information 
// i.e- number of values = tileWidth * tileHeight * imageWidth * 4
// 4 - because there are 4 values for each pixel (RGBA)

var averageCalc = {};

averageCalc.getColorAverages = function(columnRGBInfo, totalColumns, totalPixels){
	var hexvals = [];
	for(var column=0;column< totalColumns;column++){

		var red = parseInt(columnRGBInfo[column].R / totalPixels).toString();
		//console.log(columnRGBInfo[column].R / totalPixels);

		var green = (parseInt(columnRGBInfo[column].G / totalPixels)).toString();
		var blue = (parseInt(columnRGBInfo[column].B / totalPixels)).toString();
		var alpha = (parseInt(columnRGBInfo[column].A / totalPixels)).toString();
		var rgba = "rgba(" + red + ", "+ green +", " + blue + ", "+ alpha +")";

		hexvals.push(utils.rgb2hex(rgba));
	}
	return hexvals;
};

averageCalc.getHexValuesRow = function(imageData){
	"use strict";
	var columnRGBInfo = [];
	
	var totalColumns = Math.ceil(imageWidth/tileWidth);

	// Initializing our output array with 
	for(var columnCount =0;columnCount<totalColumns;columnCount++){
		columnRGBInfo[columnCount] = [];
		columnRGBInfo[columnCount].R = 0;
		columnRGBInfo[columnCount].G = 0;
		columnRGBInfo[columnCount].B = 0;
		columnRGBInfo[columnCount].A = 0;
	}
	// pixelCount is a local variable which tracks the number of pixels moved,
	// If moved pixels are equal to tile width then move the count to next values. 
	columnCount = 0;
	var pixelCount = 0;
	// Will now add the R G B and A values per column basis

	var numPixels = imageWidth*tileHeight*4;
	for(var pixel=0; pixel< numPixels;pixel+= 4){
		// If the pixelCount reaches the tileWidth, the pixel belongs to the next column
		if(pixelCount == tileWidth){
			columnCount++;
			if(columnCount == totalColumns ){
				columnCount = 0;
			}
			pixelCount = 0;
		}
		
		columnRGBInfo[columnCount].R += imageData[pixel];				
		columnRGBInfo[columnCount].G += imageData[pixel+1];
		columnRGBInfo[columnCount].B += imageData[pixel+2];
		columnRGBInfo[columnCount].A += imageData[pixel+3];
		pixelCount++;
	}
	
	// totalPixels is the number of pixels in one block, we need this for average.
	var totalPixels = tileWidth*tileHeight;
	// Adding of the values is  done, now just divide the sum with the number of values. 
	var hexvals = averageCalc.getColorAverages(columnRGBInfo, totalColumns, totalPixels);

	return hexvals;
};


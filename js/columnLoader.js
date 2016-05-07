
// httpRequest is imported from js/httprequest.js from the worker
// ColumnLoader make sure all the columns of the rows are loaded so that we see one row at a time.

var ColumnLoader = (function(){
	"use strict";
	var _this = this;
	_this.num_images_loaded=0;
	_this.numHexVals=0;

	_this.loadColumns = function(hexvals, rowCount, imageId){

		return new Promise(function(resolve, reject) {
			var columnVals = {};
			
			function checkColumnFilled(serverResponse){
				var response = serverResponse.response;
				var columnCount = serverResponse.passedValue;
				columnVals[columnCount] = response;
				_this.num_images_loaded = _this.num_images_loaded + 1;
				if(_this.num_images_loaded == _this.numHexVals){
					resolve({"columnVals": columnVals, "rowCount": rowCount, "imageId": imageId});
		    	}
			}

			function onError(){
				console.log(Error);
			    reject(Error('There was a network error.'));
			}

			for(var columnCount=0; columnCount < _this.numHexVals; columnCount++){
				var hex = hexvals[columnCount];
				var url = "/color/" + hex;
				// httpRequest is in httprequest.js
				httpRequest(url, columnCount).then(checkColumnFilled, onError);
			}
		});	
	};

	_this.loadImages = function(hexvals, rowCount, imageId){
		_this.numHexVals = hexvals.length;
		_this.loadColumns(hexvals, rowCount, imageId).then(function(response){
			postMessage(response);
			close();
		}, function(Error) {
	    	console.log(Error);
	    	reject(Error('There was a network error.'));
		});
	};

});


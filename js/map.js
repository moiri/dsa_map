/**
 *
 */
function Map(mapId, mappingMapId) {
	var me = this;
	me.images = [];
	me.canvas = document.getElementById(mapId);
	me.context = me.canvas.getContext('2d');

	/**
	 * 
	 */
	this.initMap = function () {
		var url;
		url = "php/ajax/getJson.php?j=allImg";
		$.getJSON(url, me.loadImages);
	};
	
	/**
	 * 
	 */
	this.loadImages = function (imgDb) {
		var index, loadImage, contMap;
		index = 0;
		contMap = [];
		contMap.picturePath = "map/continental.jpg";
		contMap.id = 0;
		imgDb.push(contMap);
		LoadImage();

		function LoadImage() {
			var img;
			//stop condition:
			if (index >= imgDb.length) {
				// to continue start next funtion here
				alert ("done");
				return false;
			}

			img = new Image();
			img.src = 'img/' + imgDb[index].picturePath;
			img.onload = function() {
				var id;
				id = imgDb[index].table + '-' + imgDb[index].id;
				index++;
				me.images[id] = img;
				$('#loader').html(index + " elements of " + imgDb.length + " loaded");
				LoadImage();
			};
		}
	};
}
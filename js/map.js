/**
 *
 */
function Map(mapId, mappingMapId) {
	var me = this;
	me.images = [];
	me.canvas = document.getElementById(mapId);
	me.context = me.canvas.getContext('2d');
	me.delta = [];
	me.deltaFix = [];
	me.scaleFact = 1;
	me.size = [];
	me.size.iw = 1000;
	me.size.ih = 1358;
	me.size.zoom = 1;

	this.calcPosRatio = function () {

	};

	/**
	 * 
	 */
	this.enableMoveMap = function () {
		var isDown;
		isDown = false;
		$('#map-canvas').bind('mousedown', function (e) {
			var mPosX, mPosY;
			isDown = true;
			mPosX = e.pageX;
			mPosY = e.pageY;
			$(this).css('cursor','move');
			$(this).bind('mousemove', function (e) {
				me.delta = me.drawImageToCanvas(mPosX - e.pageX, mPosY - e.pageY);
			});
		});
		$(window).bind('mouseup', function (e) {
			if (isDown === true) {
				if ((me.delta.x !== undefined) && (me.delta.x !== undefined)) {
					me.deltaFix.x = me.delta.x;
					me.deltaFix.y = me.delta.y;
					me.delta = [];
				}
				$('#map-canvas').css('cursor','default');
				$('#map-canvas').unbind('mousemove');
			}
		});
	};
	
	/**
	 * 
	 */
	this.initMapOnCanvas = function () {
		var iw, ih, ia, cw, ch, ca, dw, dh, dx, dy, ratio, img, res;

		iw = me.size.iw; // original image with
		ih = me.size.ih; // original image heigth
		ia = iw / ih; // original image aspect
		cw = $('#map-canvas').width(); // canvas width
		ch = $('#map-canvas').height(); // canvas height
		ca = cw / ch; // canvas aspect
		ratio = (iw * ch) / (cw * ih); // scale_ratio_width / scale_ratio_height
		if (ia === ca) {
			// canvas and image heve the same aspect
			dw = iw;
			dh = ih;
			dx = 0;
			dy = 0; // center vertical
		}
		else if (ia > ca) {
			// canvas thinner than image
			ratio = ca / ia;
			dw = iw;
			dh = Math.round(ih * ratio);
			dx = 0;
			dy = Math.round((ih - dh) / 2); // center vertical
		}
		else if (ia < ca) {
			// canvas larger than image
			// set image in canvas to max height
			ratio = ia / ca;
			dh = ih;
			dw = Math.round(iw * ratio);
			dx = Math.round((iw - dw) / 2); // center horizontal
			dy = 0;
		}
		me.size.dh = dh;
		me.size.dw = dw;
		me.size.hr = ih / ch;
		me.size.wr = iw / cw;

		img = me.images['main-0'];
		me.context.drawImage(img, 0, 0, iw, ih, dx, dy, dw, dh);
		res = [];
		res.x = dx;
		res.y = dy;
		return res;
	}

	/**
	 * 
	 */
	this.enableZoom = function () {
		$('#map-canvas').bind('dblclick', function (e) {
			var dx, dy, x, y, xMid, yMid, zoomFact;
			zoomFact = 1;
			x = e.pageX - this.offsetLeft;
			xMid = $('#map-canvas').width() / 2;
			y = e.pageY - this.offsetTop;
			yMid = $('#map-canvas').height() / 2;
			me.size.zoom *= 1.5;
			dx = 0;//me.deltaFix.x * (me.size.zoom - 1);//(xMid - x);// * me.size.zoom;
			dy = 0;//me.deltaFix.y * (me.size.zoom - 1);//(yMid - y);// * me.size.zoom;
			me.delta = me.drawImageToCanvas(dx, dy);
		});
	};

	/**
	 * 
	 */
	this.drawImageToCanvas = function (deltaX, deltaY) {
		var img, res, dx, dy, dw, dh;
		if (deltaX === undefined) {
			deltaX = 0;
		}
		if (deltaY === undefined) {
			deltaY = 0;
		}
		res = [];
		dx = res.x = me.deltaFix.x - Math.round(deltaX * me.size.wr); // calculate x-cord of top corner of image 
		dy = res.y = me.deltaFix.y - Math.round(deltaY * me.size.hr); // calculate y-cord of top corner of image 
		dw = me.size.dw * me.size.zoom;	// calculate width of rendered image
		dh = me.size.dh * me.size.zoom; // calculate height of rendered image
		
		if (me.size.iw < dw) {
			// canvas is smaller than image in canvas
			if (dx > 0) {
				// block movement at top canvas border
				dx = 0;
			}
			if (dx + dw < me.size.iw) {
				// block movement at bottom canvas border
				dx = me.size.iw - dw;
			}
		}
		else {
			// canvas is larger than image in canvas -> keep image in canvas
			if (dx < 0) {
				dx = 0;
			}
			if (dx > (me.size.iw - dw)) {
				dx = me.size.iw - dw;
			}
		}
		if (me.size.ih < dh) {
			// canvas is smaller than image in canvas
			if (dy > 0) {
				// block movement at left canvas border
				dy = 0;
			}
			if (dy + dh < me.size.ih) {
				// block movement at right canvas border
				dy = me.size.ih - dh;
			}
		}
		else {
			// canvas is taller than image in canvas -> keep image in canvas
			if (dy < 0) {
				dy = 0;
			}
			if (dy > (me.size.ih - dh)) {
				dy = me.size.ih - dh;
			}
		}

		img = me.images['main-0'];
		me.context.clearRect (0, 0, me.size.iw, me.size.ih);
		me.context.drawImage(img, 0, 0, me.size.iw, me.size.ih, dx, dy, dw, dh);
		return res;
	}

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
		contMap.id = '0';
		contMap.table = 'main';
		imgDb.push(contMap);
		LoadImage();

		function LoadImage() {
			var img;
			//stop condition:
			if (index >= imgDb.length) {
				// to continue start next funtion here
				me.deltaFix = me.initMapOnCanvas();
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
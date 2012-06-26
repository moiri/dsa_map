/**
 * Map class, used to draw the map on the canvas
 * 
 * @param string mapId: id of the canvas element the map is drawn into 
 */
function Map(mapId) {
	var me = this;
	me.images = [];
	me.canvas = document.getElementById(mapId);
	me.context = me.canvas.getContext('2d');
	me.deltaFix = [];
	me.scaleFact = 1;
	me.size = [];
	me.size.iw = 1000;
	me.size.ih = 1358;
	me.size.zoom = 1;

	/**
	 * draws image sto the canvas (atm only the main map is drawn - hardcoded)
	 * 
	 * @param int dx: x coordinate in pixel of the left border of the image (real pixel read from html)
	 * @param int dy: y coordinate in pixel of the top border of the image (real pixel read from html)
	 * @return array: modified (real) x and y coordiantes passed as parameters 
	 */
	this.drawImageToCanvas = function (dx, dy) {
		var img, dx, dy, dw, dh, clearCanvas, proj;
		if (dx === undefined) {
			dx = 0;
		}
		if (dy === undefined) {
			dy = 0;
		}
		proj = me.tansformToProjection(dx, dy);
		clearCanvas = false;
		dw = me.size.dw * me.size.zoom;	// calculate width of rendered image
		dh = me.size.dh * me.size.zoom;	// calculate height of rendered image
		
		if (me.size.iw < dw) {
			// canvas is smaller than image in canvas
			if (proj.x > 0) {
				// block movement at top canvas border
				proj.x = 0;
			}
			if (proj.x + dw < me.size.iw) {
				// block movement at bottom canvas border
				proj.x = me.size.iw - dw;
			}
		}
		else {
			// canvas is larger than image in canvas -> keep image in canvas
			clearCanvas = true;
			if (proj.x < 0) {
				proj.x = 0;
			}
			if (proj.x > (me.size.iw - dw)) {
				proj.x = me.size.iw - dw;
			}
		}
		if (me.size.ih < dh) {
			// canvas is smaller than image in canvas
			if (proj.y > 0) {
				// block movement at left canvas border
				proj.y = 0;
			}
			if (proj.y + dh < me.size.ih) {
				// block movement at right canvas border
				proj.y = me.size.ih - dh;
			}
		}
		else {
			// canvas is taller than image in canvas -> keep image in canvas
			clearCanvas = true;
			if (proj.y < 0) {
				proj.y = 0;
			}
			if (proj.y > (me.size.ih - dh)) {
				proj.y = me.size.ih - dh;
			}
		}

		img = me.images['main-0']; // TODO: use parameter
		if (clearCanvas === true) {
			me.context.clearRect (0, 0, me.size.iw, me.size.ih);
		}
		me.context.drawImage(img, 0, 0, me.size.iw, me.size.ih, proj.x, proj.y, dw, dh);
		return me.tansformToReal(proj.x, proj.y);
	};
	
	/**
	 * allow to move the canvas content by drag and dropping
	 */
	this.enableMoveMap = function () {
		var isDown, delta;
		isDown = false;
		// bind mousedown event (start drag)
		$('#map-canvas').bind('mousedown', function (e) {
			var mPosX, mPosY, counter;
			isDown = true;
			mPosX = e.pageX;
			mPosY = e.pageY;
			$(this).css('cursor','move');
			counter = 0;
			// bind mousemove event (dragging)
			$(this).bind('mousemove', function (e) {
				var myDelta;
				counter++;
				if (counter === 3) {
					counter = 0;
					myDelta = [];
					myDelta.x = me.deltaFix.x - (mPosX - e.pageX);
					myDelta.y = me.deltaFix.y - (mPosY - e.pageY);
					delta = me.drawImageToCanvas(myDelta.x, myDelta.y);
					// adjust mousedown-position if delta is detected (image is
					// blocked on canvas border but mouse still moves furter away)
					mPosX += myDelta.x - delta.x;
					mPosY += myDelta.y - delta.y;
				}
			});
		});
		// bind mouseup event (drop image)
		$(window).bind('mouseup', function (e) {
			if (isDown === true) {
				if ((delta !== undefined) && (delta.x !== undefined) && (delta.x !== undefined)) {
					me.deltaFix = delta;
					delta = [];
				}
				$('#map-canvas').css('cursor','default');
				$('#map-canvas').unbind('mousemove');
			}
		});
	};

	/**
	 * allow to zoom in and out of the canvas content
	 */
	this.enableZoom = function () {
		var zoom, timer;
		timer = 0;
		/**
		 * helper function performing the zoom calculations
		 * 
		 * @param event e: doubleclick event
		 * @param bool zoomIn: true means zoom in, false zoom out
		 */
		zoom = function (e, zoomIn) {
			var dx, dy, x, y, xMid, yMid, maxImgFact, zoomFact;
			maxImgFact = 2;
			zoomFact = 1;
			x = e.pageX - this.offsetLeft;
			xMid = $('#map-canvas').width() / 2;
			y = e.pageY - this.offsetTop;
			yMid = $('#map-canvas').height() / 2;

			if (zoomIn) {
				if ((me.size.dh / me.size.hr * me.size.zoom) < (me.size.ih * maxImgFact)) {
					// max not yet reached, next zoom allowed
					me.size.zoom *= 1.5;
					zoomFact = 1.5;
				}
				else {
					// max zoom reached, show warning
					$('#maxZoom').fadeIn('fast', 'swing', function () {
						setTimeout(function () {
							$('#maxZoom').fadeOut('fast', 'swing');
						}, 1500);
					});
				}
			}
			else {
				if (me.size.zoom > 1) {
					// min not yet reached, next zoom allowed
					me.size.zoom /= 1.5;
					zoomFact = 1 / 1.5;
				}
				else {
					// min zoom reached, show warning
					$('#minZoom').fadeIn('fast', 'swing', function () {
						setTimeout(function () {
							$('#maxZoom').fadeOut('fast', 'swing');
						}, 1500);
					});
				}
			}
			
			// calculate x and y coord of left and top border
			dx = zoomFact * (me.deltaFix.x - x) + xMid;
			dy = zoomFact * (me.deltaFix.y - y) + yMid;
			
			// draw image
			me.deltaFix = me.drawImageToCanvas(dx, dy);
		};
		// bind doublecklick with left button
		$('#map-canvas').bind("contextmenu",function(e) {
			if (timer === 0) {
				timer = setTimeout(function () {
					timer = 0;
					// TODO: if a contextmenu should apear, inster functionnality here
				}, 500);
			}
			else {
				clearTimeout(timer);
				timer = 0;
				zoom.call(this, e, false);
			}
            return false;
		});
		// bind doublecklick with right button
		$('#map-canvas').bind('dblclick', function (e) {
			zoom.call(this, e, true);
		});
	};
	
	/**
	 * initialise the map by loading all image paths from the db
	 */
	this.initMap = function () {
		var url;
		url = "php/ajax/getJson.php?j=allImg";
		$.getJSON(url, me.loadImages);
	};
	
	/**
	 * first draw of map on the canvas element (calculate projection aspects, etc)
	 */
	this.initMapOnCanvas = function () {
		var iw, ih, ia, cw, ch, ca, dw, dh, dx, dy, ratio, img;
		
		iw = me.size.iw; // original image with
		ih = me.size.ih; // original image heigth
		ia = iw / ih; // original image aspect
		cw = $('#map-canvas').width(); // canvas width
		ch = $('#map-canvas').height(); // canvas height
		ca = cw / ch; // canvas aspect
		
		if (ia === ca) {
			// canvas and image have the same aspect
			dw = iw;
			dh = ih;
			dx = 0;
			dy = 0;
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
			dw = Math.round(iw * ratio);
			dh = ih;
			dx = Math.round((iw - dw) / 2); // center horizontal
			dy = 0;
		}
		
		me.size.wr = iw / cw;
		me.size.hr = ih / ch;
		me.size.dw = dw;
		me.size.dh = dh;
		me.size.zoom = 1;

		img = me.images['main-0'];
		me.context.clearRect (0, 0, me.size.iw, me.size.ih);
		me.context.drawImage(img, 0, 0, me.size.iw, me.size.ih, dx, dy, dw, dh);
		me.deltaFix = me.tansformToReal(dx, dy);
	};
	
	/**
	 * load images into the ram of the browser
	 * @deprecated: need to thing this over
	 * it takes a lot of time to load all and uses up lots of memory
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
				me.initMapOnCanvas();
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
	
	/**
	 * transform real coordiantes to projected coordiantes
	 * 
	 * @param int x: real x-coordiante
	 * @param int y: real y-coordiante
	 * @return array: projected coordiantes
	 */
	this.tansformToProjection = function (x, y) {
		var proj;
		proj = [];
		proj.x = Math.round(x * me.size.wr);
		proj.y = Math.round(y * me.size.hr);
		return proj;
	};
	
	/**
	 * transform projected coordiantes to real coordiantes
	 * 
	 * @param int x: prjected x-coordiante
	 * @param int y: prjected y-coordiante
	 * @return array: real coordiantes
	 */
	this.tansformToReal = function (x, y) {
		var real;
		real = [];
		real.x = Math.round(x / me.size.wr);
		real.y = Math.round(y / me.size.hr);
		return real;
	};
}
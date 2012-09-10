/**
 * Map class, used to draw the map on the canvas
 * 
 * @param string mapId: id of the canvas element the map is drawn into 
 */
function Map(mapId, cache) {
	var me = this;
	me.images = cache.images;
	me.canvas = document.getElementById(mapId);
	me.context = me.canvas.getContext('2d');
	me.deltaFix = [];
	me.scaleFact = 1;
	me.size = [];
	me.size.iw = 1000;
	me.size.ih = 1358;
	me.size.zoom = 1;
	
	me.buffer = document.createElement('canvas');
	me.buffer.width = me.size.iw;
	me.buffer.height = me.size.ih;
	me.bufferCtx = me.buffer.getContext('2d');

	/**
	 * draws image to the canvas (atm only the main map is drawn - hardcoded)
	 * 
	 * @param int dx: x coordinate in pixel of the left border of the image (real pixel read from html) (optional, default: last position)
	 * @param int dy: y coordinate in pixel of the top border of the image (real pixel read from html) (optional, default: last position)
	 * @param bool drawInBuffer: if false, imgArray is not drawn in buffer (optional, default: true)
	 * @return array: modified (real) x and y coordinates passed as parameters 
	 */
	this.drawImageToCanvas = function (dx, dy, drawInBuffer) {
		var img, dx, dy, dw, dh, clearCanvas, proj;
		if (dx === undefined) {
			dx = me.deltaFix.x;
		}
		if (dy === undefined) {
			dy = me.deltaFix.y;
		}
		if (drawInBuffer === undefined) {
			drawInBuffer = true;
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

		if (clearCanvas === true) {
			me.context.clearRect (0, 0, me.size.iw, me.size.ih);
		}
		
		if (drawInBuffer) {
			for (var id in me.images) {
				if (me.images.hasOwnProperty(id) && me.images[id].draw && (me.images[id].img !== null)) {
					img = me.images[id].img;
					me.bufferCtx.drawImage(img, 0, 0);
				}	
			}
		}
		me.context.drawImage(me.buffer, 0, 0, me.size.iw, me.size.ih, proj.x, proj.y, dw, dh);
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
					delta = me.drawImageToCanvas(myDelta.x, myDelta.y, false);
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
			x = e.pageX - $(this).offset().left;
			xMid = $('#map-canvas').width() / 2;
			y = e.pageY - $(this).offset().top;
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
							$('#minZoom').fadeOut('fast', 'swing');
						}, 1500);
					});
				}
			}

			// calculate x and y coord of left and top border
			dx = zoomFact * (me.deltaFix.x - x) + xMid;
			dy = zoomFact * (me.deltaFix.y - y) + yMid;

			// draw image
			me.deltaFix = me.drawImageToCanvas(dx, dy, false);
		};
		// bind double-click with left button
		$('#map-canvas').bind("contextmenu",function(e) {
			if (timer === 0) {
				timer = setTimeout(function () {
					timer = 0;
					// TODO: if a context-menu should appear, insert functionality here
				}, 500);
			}
			else {
				clearTimeout(timer);
				timer = 0;
				zoom.call(this, e, false);
			}
			return false;
		});
		// bind double-click with right button
		$('#map-canvas').bind('dblclick', function (e) {
			zoom.call(this, e, true);
		});
	};

	/**
	 * first draw of map on the canvas element (calculate projection aspects, etc)
	 */
	this.initMapOnCanvas = function () {
		var iw, ih, ia, cw, ch, ca, dw, dh, dx, dy, ratio, img;

		iw = me.size.iw; // original image with
		ih = me.size.ih; // original image height
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

		me.size.cw = cw;
		me.size.ch = ch;
		me.size.wr = iw / cw;
		me.size.hr = ih / ch;
		me.size.dw = dw;
		me.size.dh = dh;
		me.size.zoom = 1;
		me.deltaFix = me.tansformToReal(dx, dy);
	};

	/**
	 * load one image into the ram but only if it is not alrady existing
	 * 
	 * @param array imgDb: an array containing img information [id, table, picturePath]
	 * @param function cb: callback function to be executed after the img is loaded
	 * @param bool draw: if true, loaded image will be drawn, else it will be ignored (-> during the next draw step deleted on canvas) (optionla, default = true)
	 */
	this.loadImage = function (imgDb, cb, draw) {
		var img, id;
		if (draw === undefined) {
			draw = true;
		}

		if (imgDb !== undefined) {
			id = imgDb.id_mode + '-' + imgDb.id;
			if (me.images[id] === undefined) {
				me.images[id] = [];
				me.images[id].draw = draw;
				me.images[id].img = null;
				img = new Image();
				img.src = 'img/' + imgDb.picturePath;
				img.onload = function() {
					me.images[id].img = img;
					cb.call(me);
				}
			}
			else {
				me.images[id].draw = draw;
				cb.call(me);
			}
		}
		else {
			cb.call(me);
		}
	};

	/**
	 * load multiple images into the ram
	 * 
	 * @param array imgsDb: array containing arrays with img information [id, table, picturePath]
	 * @param function cb: callback function to be executed after the last img is loaded
	 */
	this.loadImages = function (imgsDb, cb) {
		var iterate, idx, iterationCb;

		function iterate () {
			// stop condition:
			if (idx >= imgsDb.length - 1) {
				// last loadImg iteration with cb as callback function
				iterationCb = cb;
			}
			me.loadImage(imgsDb[idx++], iterationCb);
		};

		idx = 0;
		iterationCb = iterate;
		iterate();
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
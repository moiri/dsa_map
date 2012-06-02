$(document).ready(function() {
	// do stuff when DOM is ready

	var url = "php/ajax/getMainMenu.php";

	$.getJSON(url, function(data) {
		var items = [];
		var iteration;

		iteration = function (menu, destId, modeId, modeIdIt, lvl) {
			var id, myId, cssClass;
			myId = id = 'tabCont-' + modeId;
			cssClass = 'tabCont l' + lvl;
			if (lvl === 1) {
				// create container for tabs on top
				myId = 'tabContTitle-' + modeId;
				id = destId;
				cssClass = 'tabContTitle';
			}
			$('<div/>', {
				'id': myId,
				'class': cssClass,
			}).appendTo('#' + destId);
			$.each(menu, function(key, val) {
				// iterate through tab elements
				var cssClass;
				cssClass = 'tab l' + lvl;
				if ((key === 0) && (lvl === 1)) {
					cssClass += ' active';
				}
				$('<div/>', {
					'id': 'mode-' + modeIdIt + '-' + val.id,
					'class': cssClass,
					html: '<img src="img/' + val.iconPath + '" alt="' + val.name + '" title="' + val.name + '"/>'
				}).appendTo('#' + myId);
				
				if (val.submenu !== undefined) {
					// a submenu is available, do recursive iteration
					iteration(val.submenu, id, val.id, modeIdIt + '-' + val.id, lvl + 1);
				}
			});
		}

		iteration(data, 'menu-main', 0, 0, 1);
		
		// bind mode change click events
		$('[id^="mode-"]').unbind('click');
		$('[id^="mode-"]').bind('click', function () {
			var idElem, i, id, lastId, myId;
			$('[id^="tabCont-"]').hide();
			$('[id^="mode-"]').removeClass('active');

			idElem = $(this).attr('id').split('-');
			idElem.shift(); // remove descripter (keep only ids)
			
			while(myId = $('#tabCont-' + idElem[idElem.length - 1]).children('[id^="mode-"]:first').attr('id')) {
				idElem = myId.split('-');
				idElem.shift(); // remove descripter (keep only ids)
			}

			id = '';
			for (i = 0; i < idElem.length; i++) {
				id += '-' + idElem[i];
				$('#tabCont-' + idElem[i]).show(); // show backwards
				$('#mode' + id).addClass('active'); // set active backwards
				lastId = idElem[i];
			}
		});
		
		// bind show and hide clicks
		$('[id^="button-menu"]').unbind('click');
		$('[id^="button-menu"]').bind('click', function () {
			var idElem;
			idElem = $(this).attr('id').split('-');
			idElem.shift(); // remove descripter (keep only ids)
			if ($(this).hasClass('open')) {
				$('#' + idElem.join('-')).fadeOut();
				$(this).removeClass('open');
				$(this).addClass('close');
			}
			else {
				$('#' + idElem.join('-')).fadeIn();
				$(this).removeClass('close');
				$(this).addClass('open');
			}
		});
	});
});
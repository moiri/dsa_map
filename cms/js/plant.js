$(document).ready(function () {
	registerEvents();
	$("#msg").hide();
});


function registerEvents() {
	$('div[id|="plantListElem"]').click(function () {
        $('#content').html("<img src='../../img/icon/loader.gif' alt='loader'>");
        handlePlantInfo($(this).attr('id').split('-')[1]);
	});
	$('#content').focusout(handleUpdate);
	// $('#content').keyup(handleEnterKey);
	$('#content').click(handleUpdate);
	$('#content').focusin(handleUpdate);
	$('#content').change(handleUpdate);
}

function handlePlantInfo(id) {
    $.ajax("../php/ajax/plant.php?action=getPlant&id=" + id)
    .done(function (data) {
        $('#content').html(data);
    })
    .fail(function () {
        $('#content').html("server error");
    });
}

// /**
//  * 
//  * @param e
//  */
// function handleEnterKey(e) {
// 	var targ, res, temp;
// 	if (!e) e = window.event;
// 	if (e.target) targ = e.target;
// 	else if (e.srcElement) targ = e.srcElement;
// 	if (targ.nodeType == 3) // defeat Safari bug
// 		targ = targ.parentNode;
// 	if ((e.keyCode == 13) && (targ.type == "text")){
// 		res = $(targ).parent().next().find('input, textarea').focus();
// 		res = $(targ).parent().next().find('input').select();
// 		if (res.length == 0) {
// 			handleUpdate(e, true);
// 		}
// 	}
// }

/**
 * 
 */
function handleUpdate(e, enter) {
	var targ, targetId, elemId, url, value;
	if (!e) e = window.event;
	if (e.target) targ = e.target;
	else if (e.srcElement) targ = e.srcElement;
	if (targ.nodeType == 3) // defeat Safari bug
		targ = targ.parentNode;
	targetId = $(targ).parents("div[id|='base']").attr('id').split('-');
	targetId = targetId[2];
	plantId = targetId;
	elemId = targ.id.split('-');
	value = null;
	if ((elemId[0] == "input") && ((e.type === "focusout") || enter)) {
		value = targ.value;
	}
	else if ((elemId[0] == "input") && ((e.type === "click") || (e.type === "focusin"))) {
		if ($(targ).hasClass("empty") === true) {
			$(targ).val("");
			$(targ).removeClass("empty");
		}
	}
	else if ((elemId[0] == "checkbox") && (e.type === "click")) {
		if (targ.checked === true) {
			value = "1";
			$("#plantListElem-" + targetId).addClass("done");
		}
		else if (targ.checked === false) {
			value = "0";
			$("#plantListElem-" + targetId).removeClass("done");
		}
	}
	else if ((elemId[0] == "select") && (e.type === "change")) {
		value = targ.value;
		if (value == "0") {
			value = "NULL";
		}
		elemId = null;
		elemId = $(targ).parents("div[id|='select']").attr('id').split('-');
	}
	if(elemId[1] != "plant") {
		targetId = elemId[3];
	}
	if ((value !== null) && (elemId[0] != "new")) {
		url = "../php/ajax/plant.php?action=updateEntry&id=" + targetId + "&col=" + elemId[2] + "&table=" + elemId[1] + "&val=" + encodeURIComponent(value);
        $.ajax(url)
        .done(function (res) {
			if(res != "") {
				$("<div/>").text(res).appendTo("#log");
			}
			else {
				$("<div/>").text("Wert nach " + elemId[1] + "." + elemId[2] + " gespeichert").appendTo("#log");
			}
			if ((elemId[0] === "input") && (elemId[1] === "plantPart") && (elemId[2] === "name")) {
				handlePlantInfo(plantId);
			}
        });
	}
	if (elemId[0] == "new") {
		url = "../php/ajax/plant.php?action=insertEntry&table=" + elemId[1] + "&cols=" + elemId[2] + "&vals=" + targetId;
        $.ajax(url)
        .done(function (res) {
			if(res != "") {
				$("<div/>").text(res).appendTo("#log");
			}
			else {
				$("<div/>").text("Neues Element zu " + elemId[1] + " hinzugefügt").appendTo("#log");
				handlePlantInfo(targetId);
			}
        });
	}
}

$(document).ready(function () {
	registerEvents();
	$("#msg").hide();
	$('#selectDropDown').change(getDropDownContent);
});

function registerEvents() {
	$('[id|="new"]').click(insertEntry);
	$('[id|="delete"]').click(deleteEntry);
	$('[id|="input"]').focusout(updateEntry);
}

function getDropDownContent(e) {
	var url, idArr, table, tableFk;
	idArr = $(this).val().split('-');
	tableFk = idArr[1];
	table = idArr[0];
	drawDropDown(table, tableFk);
}

function drawDropDown(table, tableFk) {
	url = "../php/ajax/plant.php?action=getList&table=" + table + "&tableFk=" + tableFk;
	document.getElementById("content").innerHTML = "<img src='loader.gif' alt='loader'>";
	$.ajax(url).done(function (res) {
		document.getElementById("content").innerHTML = res;
		registerEvents();
	});
}

function deleteEntry(e) {
	var url, idArr, table, tableFk, id;
	idArr = $(this).attr('id').split('-');
	table = idArr[1];
	tableFk = idArr[2];
	id = idArr[3];
	url = "../php/ajax/plant.php?action=deleteEntry&table=" + table + "&tableFk=" + tableFk + "&id=" + id;
	$.ajax(url).done(function (res) {
		if(res != "") {
			$("<div/>").text(res).appendTo("#log");
		}
		else {
			$("<div/>").text("Element aus " + table + " und " + tableFk + " gelöscht").appendTo("#log");
			drawDropDown(table, tableFk);
		}
	});
}

function insertEntry(e) {
	var url, idArr, table, tableFk;
	idArr = $(this).attr('id').split('-');
	table = idArr[1];
	tableFk = idArr[2];
	value = $(this).val();
	url = "../php/ajax/plant.php?action=insertEntry&table=" + table;
	$.ajax(url).done(function (res) {
		if(res != "") {
			$("<div/>").text(res).appendTo("#log");
		}
		else {
			$("<div/>").text("Neues Element zu " + table + " hinzugefügt").appendTo("#log");
			drawDropDown(table, tableFk);
		}
	});
}

function updateEntry(e) {
	var url, idArr, table, col, id, value;
	idArr = $(this).attr('id').split('-');
	table = idArr[1];
	col = idArr[2];
	id = idArr[3];
	value = $(this).val();
	url = "../php/ajax/plant.php?action=updateEntry&id=" + id + "&col=" + col + "&table=" + table + "&val=" + encodeURIComponent(value);
	$.ajax(url).done(function (res) {
		if(res != "") {
			$("<div/>").text(res).appendTo("#log");
		}
		else {
			$("<div/>").text("Wert nach " + table + "." + col + " gespeichert").appendTo("#log");
		}
	});
}

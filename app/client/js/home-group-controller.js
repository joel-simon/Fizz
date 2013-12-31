
function loadGroup() {

	var htmlString;

	friends.forEach(function(friend, i) {
		getFbData(friend, function(pic, name) {
			htmlString = 
				'<li class="group-'+friend+' drag float-left">'+
					'<img src="'+pic+'" title="'+name+'" class="pic">'+
				'</li>';
			$('#friends').append(htmlString);
			$('li.drag').draggable({
				revert: "invalid",
				containment: "#groupManager",
				helper: "clone",
				cursor: "move"
			});
		});

	});
}

$('#group').droppable({
	accept: "#friends li",
	drop: function( event, ui ) {
		$('#group').append(ui.draggable);
	}
});

$('#friends').droppable({
	accept: "#group li",
	drop: function( event, ui ) {
		$('#friends').append(ui.draggable);
	}
});

$('li.drag').draggable({
	revert: "invalid",
	containment: "#groupManager",
	helper: "clone",
	cursor: "move"
});
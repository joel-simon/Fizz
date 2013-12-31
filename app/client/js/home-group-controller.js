var group = [];
var friendNames = [];

function loadGroup() {

	var htmlString;

	friends.forEach(function(friend, i) {
		getFbData(friend.id, function(pic, name) {
			htmlString = 
				'<li id="group-'+friend.id+'" class="drag float-left">'+
					'<img src="'+pic+'" title="'+name+'" class="pic">'+
				'</li>';
			$('#friends').append(htmlString);
			friendNames.push(name);
			$('li.drag').draggable({
				appendTo: "#groupManager",
				revert: "invalid",
				containment: "#groupManager",
				helper: "clone",
				cursor: "move",
				scroll: "false"
			});
		});
	});
}

$('#group').droppable({
	accept: "#friends li",
	drop: function( event, ui ) {
		$('#group').append(ui.draggable);
		var friend = ui.draggable[0].id;
		var fid = friend.replace('group-','');
		group.push(fid);
		// console.log(group);
	}
});

$('#friends').droppable({
	accept: "#group li",
	drop: function( event, ui ) {
		$('#friends').append(ui.draggable);
		var friend = ui.draggable[0].id;
		var fid = friend.replace('group-','');
		var index = group.indexOf(fid);
		if (index > -1) {
			group.splice(index, 1);
		}
		// console.log(group);
	}
});
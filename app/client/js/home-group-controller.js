var group = [];
var friendNames = [];
var groupNames =[];
var nameToId = {};

function loadGroup() {

	var htmlString;
	var friendCount = 0;

	friends.forEach(function(friend, i) {
		getFbData(friend.id, function(pic, name) {
			htmlString = 
				'<li id="group-'+friend.id+'" class="drag float-left">'+
					'<img src="'+pic+'" title="'+name+'" class="pic">'+
				'</li>';
			if ( group.indexOf(friend.id) != -1 ) {
				$('#group').append(htmlString);
				groupNames.push(name);
			}
			else {
				$('#friends').append(htmlString);
				friendNames.push(name);
			}

			if ( nameToId[name] ) nameToId.push( friend.id );
			else nameToId[name] = [ friend.id ];
			
			$('li.drag').draggable({
				appendTo: "#groupManager",
				revert: "invalid",
				containment: "#groupManager",
				helper: "clone",
				cursor: "move",
				scroll: "false"
			});
			if (++friendCount == friends.length) {
				setAutoComplete();
			}
		});
	});
}

function setAutoComplete() {
	$( '#friendSearch' ).autocomplete({
		source: friendNames
	});
	$( '#groupSearch' ).autocomplete({
		source: groupNames
	});
}


$('#friendSearch').on('input', function() {
	// console.log(this.value);
	var auto = $('.ui-autocomplete li a').map(function() { 
		return $(this).text() 
	}).get();
	$('#friends li').addClass('hidden');
	auto.forEach(function(name, i) {
		var idArray = nameToId[name];
		for (var i = 0; i < idArray.length; i++) {
			$('group-'+idArray[i]).removeClass('hidden');
		}
	});
});


$('#group').droppable({
	accept: "#friends li",
	drop: function( event, ui ) {
		$('#group').append(ui.draggable);
		var friend = ui.draggable[0].id;
		var fid = friend.replace('group-','');
		group.push(fid);

		getFbData(fid, function(pic, name) {
			friendNames.splice( friendNames.indexOf(name), 1 );
			groupNames.push(name);
			setAutoComplete();
		});
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

		getFbData(fid, function(pic, name) {
			groupNames.splice( groupNames.indexOf(name), 1 );
			friendNames.push(name);
			setAutoComplete();
		});
	}
});



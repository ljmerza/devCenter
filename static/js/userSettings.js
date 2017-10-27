$('#userSettingsModal').modal('show');


$('#userSettingsSubmit').click( event => {
	event.preventDefault();
	userSettings.port = $('#userPort').val();
	userSettings.ember = $('#emberBuild').val();

	$('#userSettingsModal').modal('hide');

	// load nav menu
	loadnavMenu();
});
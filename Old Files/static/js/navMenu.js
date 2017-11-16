

$('#JiraSearchform button').click( event => {
	event.preventDefault();

	const msrp = $('#searchJiraInput').val();

	if(!msrp) return;

	// if a Jira key then just open up else we need to get the key from the msrp number
	if( isNaN(msrp) ){
		window.open(`https://jira.web.att.com:8443/browse/${msrp}`);
	} else {
		$.ajax({
			type: 'GET',
			url: `http://m5devacoe01.gcsc.att.com:5858/devCenter/jira/get_key/${msrp}`
		})
		.then( data => {
			if(data.key){
				window.open(`https://jira.web.att.com:8443/browse/${data.key}`);
			}
		})
	}
});


$('.dropdown-menu a.dropdown-toggle').on('mouseover', function(e) {
	if (!$(this).next().hasClass('show')) {
		$(this).parents('.dropdown-menu').first().find('.show').removeClass("show");
	}
	let $subMenu = $(this).next(".dropdown-menu");
	$subMenu.toggleClass('show');

	$(this).parents('li.nav-item.dropdown.show').on('hidden.bs.dropdown', function(e) {
		$('.dropdown-submenu .show').removeClass("show");
	});

	return false;
});


$('#getUserSettings').click(loadUserSettings);
export function addNavbarItems(state, navBarItems) {

	let fullNavbar = [];
	navBarItems.forEach(item => {
		const linkPosition = item.type.split('/');

		if(linkPosition.length === 1){
			fullNavbar = pushIntoNav(fullNavbar, item);

		} else if(linkPosition.length === 2){
			fullNavbar = syncChild(fullNavbar, linkPosition[0]);
			let navDropdown = fullNavbar.find(nav => nav.name === linkPosition[0]);
			navDropdown.items = pushIntoNav(navDropdown.items, item);

		} else if(linkPosition.length === 3){
			fullNavbar = syncChild(fullNavbar, linkPosition[0]);
			let navDropdown = fullNavbar.find(nav => nav.name === linkPosition[0]);

			navDropdown.items = syncChild(navDropdown.items, linkPosition[1]);
			let navDropdown2 = navDropdown.items.find(nav => nav.name === linkPosition[2]);
			navDropdown2.items = pushIntoNav(navDropdown2.items, item);
		}
	})

	console.log({fullNavbar, navBarItems});

	return { ...state, ...{fullNavbar} };
}


function syncChild(fullNavbar, name){
	const hasChildNav = fullNavbar.find(nav => nav.name === name);
	if(!hasChildNav){
		fullNavbar.push({name, items: []});
	}

	return fullNavbar;
}

function pushIntoNav(fullNavbar, item){
	fullNavbar.push({link: item.link, name: item.name});
	return fullNavbar;
}
export function addNavbarItems(state, navBarItems) {

	let fullNavbar = [];
	navBarItems.forEach(item => {
		const linkPosition = item.type.split('/');

		if(linkPosition.length === 1){
			fullNavbar = pushIntoNav(fullNavbar, item);

		// } else {

		// 	let temp:any = {};
		// 	linkPosition.map((element, index) => {
		// 		temp = syncChild(fullNavbar, linkPosition[index]);
		// 		temp = temp.items;
		// 		console.log({fullNavbar});
		// 	});

		// 	temp.items = pushIntoNav(temp.items, item);
		// }

		} else if(linkPosition.length === 2){
			let navDropdown = syncChild(fullNavbar, linkPosition[0]);
			navDropdown.items = pushIntoNav(navDropdown.items, item);

		} else if(linkPosition.length === 3){
			let navDropdown = syncChild(fullNavbar, linkPosition[0]);
			let navDropdown2 = syncChild(navDropdown.items, linkPosition[1]);
			navDropdown2.items = pushIntoNav(navDropdown2.items, item);
		}
	});

	return { ...state, ...{fullNavbar} };
}


function syncChild(fullNavbar, name){
	const hasChildNav = fullNavbar.find(nav => nav.name === name);
	if(!hasChildNav){
		fullNavbar.push({name, items: []});
	}

	let navDropdown = fullNavbar.find(nav => nav.name === name);
	return navDropdown;
}

function pushIntoNav(fullNavbar, item){
	fullNavbar.push({link: item.link, name: item.name});
	return fullNavbar;
}
let username = '';
let cache = '';

export function addNavbarItems(state, navBarItems) {

	let fullNavbar:any = [];
	navBarItems.forEach(item => {
		const linkPosition = item.type.split('/');

		if(linkPosition.length == 1){
			let navDropdown = syncChild(fullNavbar, linkPosition[0]);
			navDropdown.items = processNavBarItem(navDropdown.items, item, linkPosition[0]);
			navDropdown.items.sort(sortByName);

		} else if(linkPosition.length == 2){
			let navDropdown = syncChild(fullNavbar, linkPosition[0]);
			let navDropdown2 = syncChild(navDropdown.items, linkPosition[1]);
			navDropdown2.items = processNavBarItem(navDropdown2.items, item, linkPosition[1]);
			navDropdown2.items.sort(sortByName);

		} else if(linkPosition.length == 3){
			let navDropdown = syncChild(fullNavbar, linkPosition[0]);
			let navDropdown2 = syncChild(navDropdown.items, linkPosition[1]);
			let navDropdown3 = syncChild(navDropdown2.items, linkPosition[3]);
			navDropdown3.items = processNavBarItem(navDropdown3.items, item, linkPosition[3]);
			navDropdown3.items.sort(sortByName);
		}
	});

	console.log({fullNavbar});

	return { ...state, ...{navBarItems:fullNavbar} };
}


function syncChild(fullNavbar, name){
	const hasChildNav = fullNavbar.find(nav => nav.name === name);
	let curr = {
		name, 
		items: [], 
		isEmber: /^ember$/i.test(name), 
		isTeam: /^teamdb_ember$/i.test(name),
		isDev: /^dev_links$/i.test(name),
		isBeta: /^beta_links$/i.test(name),
		isProd: /^prod_links$/i.test(name),
		isRds: /^rds/i.test(name),
		isGps: /^gps/i.test(name),
	};

	if(!hasChildNav){
		fullNavbar.push(curr);
	} else {
		curr = hasChildNav;
	}



	return curr;
}

/**
 *
 */
function processNavBarItem(fullNavbar, item, category){
	console.log({fullNavbar, item, category});
	let navBarItem:any = {link: item.link, name: item.name}

	if(navBarItem.isProd || navBarItem.isDev || navBarItem.isBeta){
		curr = addUserNameToUrl(curr);
	}
	
	if(navBarItem.isBeta){
		
	}
	
	if(navBarItem.isEmber || navBarItem.isTeam || navBarItem.isRds || navBarItem.isGps){
		navBarItem.linkName = navBarItem.link;
		curr = addCacheParameter(curr);
		curr = addUserNameToUrl(curr);
	}
	
	if(navBarItem.isGps){
		curr = addGpsIdToUrl(curr);
	}

	fullNavbar.push(navBarItem);
	return fullNavbar;
}

/**
 * adds username to any URLs that need it
 * @param {Object} navbarItem
 */
function addUserNameToUrl(navbarItem, alwaysAddUsername){
	navbarItem.link = navbarItem.link.replace('##username##', username);
		return navbarItem;
}

/**
 * adds GPS username to any URLs that need it
 * @param {Object} navbarItem
 */
function addGpsIdToUrl(navbarItem){
	const queryAddition = navbarItem.link.includes('?') ? '&' : '?';
	navbarItem.link += `${queryAddition}gpsid=${username}`;
	return navbarItem;
}

/**
 * adds cache query parameter to URLs
 * @param {Object} navbarItem
 */
function addCacheParameter(navbarItem){
	const queryAddition = navbarItem.link.includes('?') ? '&' : '?';
	navbarItem.link += `${queryAddition}cache=${cache}`;
	return navbarItem;
}

/**
 *
 */
function sortByName(a, b){
	if(a.name > b.name) return 1;
	else if(a.name < b.name) return -1;
	else return 0;
}
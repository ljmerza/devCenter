let username = '';
let cache = '';

/**
 *
 */
export function addNavbarItems(state, navBarItems) {
	let fullNavbar = splitNavbarItems(navBarItems);
	const navItems = converNavbarToObject(fullNavbar);
	console.log({navItems});
	return { ...state, ...{navBarItems:navItems} };
}

/**
 *
 */
function splitNavbarItems(navBarItems){
	let fullNavbar:any = [];

	navBarItems.forEach(item => {
		const linkPosition = item.type.split('/');
		let navDropdown:any;

		linkPosition.forEach((linkName, index) => {
			if(index){
				navDropdown = getChildNavMenu(navDropdown.items, linkName, item.type);
			} else {
				navDropdown = getChildNavMenu(fullNavbar, linkName, item.type);
			}

			if(index == linkPosition.length-1){
				navDropdown.items = processNavBarItem(navDropdown.items, item, linkName);
			}
		})

		navDropdown.items.sort(sortByName);
	});

	return fullNavbar;
}

/**
 *
 */
function converNavbarToObject(fullNavbar){
	return fullNavbar.reduce((acc, curr) => {
		if(!acc[curr.name]) {
			const propName = curr.name.replace(/\s/g, '');
			acc[propName] = curr;
		}
		return acc;
	}, {});
}

/**
 * find a child navmenu - if does't exist then create one and add it
 * @param {Object} parentNavMenu the parent navmenu we want to find a child of
 * @param {string} name the name of the navmenu we are trying to locate
 * @param {string} itemType the type of the navbar item
 * @return {Object}
 */
function getChildNavMenu(parentNavMenu, name, itemType){
	const childNavMenu = parentNavMenu.find(nav => nav.name === name);
	let navBarItem;

	if(!childNavMenu){
		navBarItem = {name, items: []};
		parentNavMenu.unshift(navBarItem);

	} else {
		navBarItem = childNavMenu;
	}

	return navBarItem;
}

/**
 *
 */
function processNavBarItem(fullNavbar, item, category){
	let navBarItem:any = {
		link: item.link, 
		name: item.name, 
		hasFullUrl: /^http/.test(item.link),
		isEmber: /Ember/i.test(item.type),
		isTeam: /TeamDB/i.test(item.type) || /TeamDB/i.test(item.name),
	};
	
	if(/Ember/i.test(item.name)){
		navBarItem = addParam(navBarItem, 'cache');
	}
	
	if(/GPS/i.test(item.name)){
		navBarItem = addParam(navBarItem, 'gpsid');
	}

	fullNavbar.push(navBarItem);
	return fullNavbar;
}

/**
 * adds a parameter name to a URL
 * @param {Object} navbarItem
 * @param {string} paramName
 */
function addParam(navbarItem, paramName){
	const queryAddition = navbarItem.link.includes('?') ? '&' : '?';
	navbarItem.link += `${queryAddition}${paramName}=`;
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
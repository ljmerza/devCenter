export function processJqlLinks( jqlLinks){
 	const projectIndex = jqlLinks.findIndex(link => link.name === 'PROJECT');
 	const projectJql = (jqlLinks.splice(projectIndex, 1)[0] || {}).query || '';

 	const fullJqls = jqlLinks.map(link => {
 		if(link.add_projects == 1) link.query = `${projectJql} ${link.query }`;
 		return link;
 	});

 	const jqlNavbar = _formatNavBarJqlLinks(jqlLinks);
	return {fullJqls, jqlNavbar};
}

function _formatNavBarJqlLinks(jqlLinks){
	let jqlNavbar = jqlLinks.reduce((acc, curr) => {
 		if(curr.submenu){
 			const submenuIndex = acc.findIndex(item => item.name === curr.submenu);
 			if(submenuIndex !== -1) acc[submenuIndex].items.push(curr);
 			else acc.push({name: curr.submenu, items: [curr]})

 		} else {
 			acc.push(curr);
 		}

 		return acc;
 	}, []);

 	jqlNavbar.sort(_sortByOrder);
 	return jqlNavbar;
}

/**
 * sorts the jql navbar links by order wanted on list
 */
function _sortByOrder(a, b){
	if(a.order_on_list > b.order_on_list) return 1;
	else if(a.order_on_list < b.order_on_list) return -1;
	else return 0;
}
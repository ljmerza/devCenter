let userSettings = new Proxy({}, {
	get(target, name) {
		const item = localStorage.getItem(`user.${name}`);
		return item ? item : '';
	},
	set(target, name, value) {
		localStorage.setItem(`user.${name}`, value)
		return true
	},
	deleteProperty(target, name) {
		return true;
	}
});



//  check for user settings
if(!userSettings.port || !userSettings.ember){
	loadUserSettings();
} else {
	loadnavMenu();
}
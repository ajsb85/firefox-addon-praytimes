
// Pray Times! - Misc
// By: Hamid Zarrabi-Zadeh
// Licensed under GPL


PrayTimes.Misc = function() {

	this.debugMode = false;
	this.isLinux = navigator.userAgent.toLowerCase().indexOf("inux") != -1;

	// Events
	this.None = 0;
	this.ResetData = 1;
	this.StopSound = 2;


	//--------------------------- Utils -----------------------------


	// check array membership
	this.isMember = function(anArray, aValue) 
	{
		var temp = '|' + anArray.join('|') + '|';
		if (temp.indexOf('|' + aValue + '|') == -1) 
			return false;
		else 
			return true;
	}  


	//----------------------- DOM Functions ------------------------
	 

	// remove all childs of a DOM node
	this.removeChildrenOfNode = function(node)
	{
		if (node == undefined || node == null)
			return;

		while (node.firstChild)
			node.removeChild(node.firstChild);
	}


	// remove a DOM node
	this.removeNode = function(node)
	{
		if (node == undefined || node == null || !node.parentNode)
			return null;
		return node.parentNode.removeChild(node);
	}


	// retruen first value of a tag in doc
	this.getTagValue = function(doc, tagName)
	{
		var item = doc.getElementsByTagName(tagName);
		return (item && item.length > 0 && item[0].firstChild) ? item[0].firstChild.nodeValue : '';
	}


	// select menu item by value
	this.selectMenuItem = function(menu, value) {
		menu = document.getElementById(menu);
		var items = menu.menupopup.childNodes;
		for (var i=0; i<items.length; i++)
			if (typeof items[i].value != 'undefined' && items[i].value == value)
				menu.selectedIndex = i;
	}


	//---------------------- Date & Time Functions -----------------------


	// return month abbreviated name
	this.monthName = function(month)
	{
		var monthName = new Array('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
						'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec');
		return monthName[month];
	}


	// return month full name
	this.monthFullName = function(month)
	{
		var monthName = new Array('January', 'February', 'March', 'April', 'May', 'June', 
						'July', 'August', 'September', 'October', 'November', 'December');
		return monthName[month];
	}


	// convert 24h times to 12h format
	this.floatToTime12 = function(time)
	{
		if (time.indexOf(':') == -1)
			return ('NA');
		var times = time.split(':');
		var hours = times[0];
		var minutes = times[1];
		var suffix = hours >= 12 ? 'pm' : 'am';
		hours = (hours -1)% 12+ 1;
		if (hours <10) {hours = '0'+ hours}
		return hours+ ':'+ minutes+ ' '+ suffix;
	}


	// add a leading 0 if necessary
	this.twoDigitsFormat = function(num)
	{
		return (num <10) ? '0'+ num : num;
	}


	// compute number of minutes in a float time 
	this.timeMinutes = function(time)
	{
		return Math.floor(time* 60);
	}


	// return next day of a date
	this.nextDay = function(date)
	{
		var nextDay = new Date(date);
		nextDay.setDate(date.getDate()+ 1);
		return nextDay;
	}


	//---------------------- PrayTime Functions -----------------------


	// load preferences for prayTime object
	this.loadPrayTimePrefs = function()
	{
		PrayTimes.calc.setCalcMethod(PrayTimes.prefs.getIntPref('calcMethod'));
		PrayTimes.calc.setAsrMethod(PrayTimes.prefs.getIntPref('asrJuristic'));
		PrayTimes.calc.setDhuhrMinutes(1* PrayTimes.prefs.getStrPref('dhuhrMinutes'));
		PrayTimes.calc.setHighLatsMethod(PrayTimes.prefs.getIntPref('adjustHighLats'));

		PrayTimes.calc.setCustomParams(new Array(
			1* PrayTimes.prefs.getStrPref('fajrAngle'),
			1* PrayTimes.prefs.getIntPref('maghribSelector'),
			1* PrayTimes.prefs.getStrPref('maghribAngleMinutes'),
			1* PrayTimes.prefs.getIntPref('ishaSelector'),
			1* PrayTimes.prefs.getStrPref('ishaAngleMinutes')
		));
	}


	// set preferences for a method
	this.setMethodPrefs = function(method) 
	{
		PrayTimes.prefs.setIntPref('calcMethod', method);
		var defaults = PrayTimes.calc.methodParams[method];
		PrayTimes.prefs.setStrPref('fajrAngle', defaults[0]);
		PrayTimes.prefs.setIntPref('maghribSelector', defaults[1]);
		PrayTimes.prefs.setStrPref('maghribAngleMinutes', defaults[2]);
		PrayTimes.prefs.setIntPref('ishaSelector', defaults[3]);
		PrayTimes.prefs.setStrPref('ishaAngleMinutes', defaults[4]);
	}


	// return current time zone 
	this.getCurrentTimeZone = function(date) 
	{
		var currentTimeZone = 1* PrayTimes.prefs.getStrPref('timeZone');
		if (PrayTimes.prefs.getBoolPref('timeZoneAuto'))
			currentTimeZone = PrayTimes.calc.getTimeZone(date);
		return currentTimeZone;
	}


	//---------------------- Window Functions -----------------------

	// get main window 
	this.getMainWindow = function() {
		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
						   .getService(Components.interfaces.nsIWindowMediator);
		var mainWindow = wm.getMostRecentWindow("navigator:browser");
		return mainWindow;
	}


	// open a dialog window 
	this.openDialogWindow = function(dialogName, modal) 
	{
		window.openDialog('chrome://praytimes/content/'+ dialogName+ '.xul', 
			dialogName, 'chrome, centerscreen, dependent'+ (modal ?  ', modal' : ''));
	}


	// open a new window 
	this.openNewWindow = function(url) 
	{
		var win = this.getMainWindow();
		var myTab = win.getBrowser().addTab(url, null, null);
		win.getBrowser().selectedTab = myTab;
	}


	// open qibla direction window 
	this.openQiblaWindow = function() 
	{
		var addr = PrayTimes.prefs.getStrPref('location');
		addr = addr.replace(/ /g, '+');
		var url = 'http://eqibla.com/?addr='+ addr;
		this.openNewWindow(url);
	}


	//---------------------- Button functions -----------------------

	// show azan button on nav-bar
	this.showButton = function(show) {
		var win = this.getMainWindow(); 
		var navbar = win.document.getElementById('nav-bar');
		if (show == false) 
			navbar.currentSet = navbar.currentSet.replace(/azan-button,*/, '');
		else if (!navbar.currentSet.match('azan-button'))
			navbar.insertItem('azan-button', null, null, false);
		navbar.setAttribute('currentset', navbar.currentSet);
		win.document.persist('nav-bar', 'currentset');
	}


	// check if azan button is on nav-bar
	this.isButtonOnNavBar = function() {
		var win = this.getMainWindow(); 
		var navbar = win.document.getElementById('nav-bar');
		return navbar.currentSet.match('azan-button');
	}


	//---------------------- logging functions -----------------------

	// log a message on the error console
	this.log = function(aMessage) {
		if (!this.debugMode)
			return;
		var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
				.getService(Components.interfaces.nsIConsoleService);
		consoleService.logStringMessage(aMessage);
	}


	//--------------------------- Timer ---------------------------


	// keeping track of time
	this.Timer = { 

		startTime: 0,
		elapsedTime: 0,
		startInterval: 0,
		
		init: function() {
			this.startTime = this.getTime();	
		},

		start: function() {
			this.startInterval = this.getTime();	
		},

		stop: function() {
			var now = this.getTime();		
			var diff = now- this.startInterval;
			this.elapsedTime += diff;
		},
		
		getUsage: function() { // cpu percentage used
			return this.elapsedTime/ (this.getTime()- this.startTime)* 100;
		},
		
		getTime: function() {
			var now = new Date();
			return now.getTime();
		}
	}



	//---------------------- Play Sound (flash) -----------------------


	// play a sound file
	this.playFile = function(fileName, volume)
	{
		var win = this.getMainWindow();
		var doc = win.document.getElementById('soundFrame').contentWindow;
		volume = volume != null ? (volume+ 1)* 10 : 100;

		try {
			var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
			var fileHandler = ios.getProtocolHandler("file").QueryInterface(Components.interfaces.nsIFileProtocolHandler);
			var file = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
			file.initWithPath(fileName);
			fileName =  fileHandler.getURLSpecFromFile(file);
		} 
		catch(e) {}
		this.log(fileName);

		var FO = { movie:'mp3player.swf', width:'20', height:'20', majorversion:'7', build:'0', bgcolor:'#FFFFFF',
			flashvars:'file='+ fileName+ '&autostart=true&volume='+ volume };
		doc.UFO.create(FO, 'player');
	}


	// stop sound 
	this.stopSound = function()
	{
		this.playFile('', 0);
		//this.addlog(' stopped ');
	}


	// stop sound pressed
	this.stopSoundPressed = function()
	{
		this.triggerEvent(this.StopSound);
		PrayTimes.prefs.setBoolPref('azanPlaying', false);
		this.stopSound();
	}


	// play sound pressed
	this.playSoundPressed = function()
	{
		this.playFile(PrayTimes.prefs.getStrPref('soundFileName'), PrayTimes.prefs.getIntPref('soundVolume'));	
	}


	//------------------------- Events -----------------------


	// trigger an event
	this.triggerEvent = function(eventID) {
		eventID = eventID || 0;
		PrayTimes.prefs.setIntPref('currentEvent', eventID);
	}

	// reset events
	this.resetEvents = function() {
		setTimeout(PrayTimes.misc.triggerEvent, 1000);
	}


	// refresh azan data
	this.resetAzanData = function() {
		this.triggerEvent(PrayTimes.misc.ResetData);
	}
	
}


//------------------------- Misc Object -----------------------

PrayTimes.misc = new PrayTimes.Misc();



// Pray Times! - Main
// By: Hamid Zarrabi-Zadeh
// Licensed under GPL


PrayTimes.Main = function() {

	// globals variables
	this.num = 7;
	this.name = new Array(
		'Fajr',
		'Sunrise',
		'Dhuhr',
		'Asr',
		'Sunset',
		'Maghrib',
		'Isha'
	);

	this.time = new Array(2* this.num);
	this.fullTime = new Array(2* this.num);

	this.nextAzan = 0;
	this.timeLeftHM = '';

	this.azanPeriod = false;

	this.timeoutID = 0;
	this.tooltipTimes = null;
	this.tooltipTimeLeft = null;
	this.statusPad = null;
	this.navPad = null;
	this.navButton = null;
	this.lastOptionsTab = 0;

	this.dataDate = '';
	this.pref = {};	


	//--------------------------- Main Functions ---------------------------


	// main counter function
	this.run = function()
	{
		//PrayTimes.misc.Timer.start();
		this.timeoutID = setTimeout(PrayTimes.main.run, 1000);
		var now = new Date();
		
		if (PrayTimes.main.pref.location == '')
			return;
		if (!PrayTimes.main.dataIsValid(now))
			PrayTimes.main.readTimes();

		var hours = now.getHours();
		var minutes = now.getMinutes();
		var seconds = now.getSeconds();
		var nowMinutes = hours* 60+ minutes;
		var nowPlayingAzan = 0;
		PrayTimes.main.playingPeriod = false;

		var azanFlags = PrayTimes.main.getPref('azanFlags');
		var displayMode = PrayTimes.main.getPref('azanDisplayMode'); 

		for (var i=0; i<2*PrayTimes.main.num; i++)
		{
			if (azanFlags[i% PrayTimes.main.num] == 'c')
			{
				minutesLeft = PrayTimes.main.time[i]- nowMinutes; // it's +1 in praytime.info;
				if (minutesLeft <= 0 && minutesLeft > -PrayTimes.main.getPref('playDuration'))
				{
					PrayTimes.main.playingPeriod = true;
					nowPlayingAzan = PrayTimes.main.name[i];
				}
				if (minutesLeft == -PrayTimes.main.getPref('playDuration'))
					PrayTimes.main.resetAlertIndicators();

				if (minutesLeft >= 0)
				{
					PrayTimes.main.nextAzan = i;
					PrayTimes.main.timeLeftHM = PrayTimes.main.timeLeftLongString(minutesLeft); 
					var timeLeft = PrayTimes.main.timeLeftString(minutesLeft- 1, seconds);

					if (PrayTimes.main.playingPeriod)
						PrayTimes.main.setDisplay('Now: '+ nowPlayingAzan);
					else if (displayMode == 1 || displayMode == 3 && minutesLeft >= PrayTimes.main.getPref('startCountDown'))
						PrayTimes.main.setDisplay(PrayTimes.main.name[i% PrayTimes.main.num]+ ': '+ PrayTimes.main.fullTime[i]);
					else
						PrayTimes.main.setDisplay(timeLeft+ ' to '+ PrayTimes.main.name[i% PrayTimes.main.num]);
									
					PrayTimes.main.showPreNotification(minutesLeft, PrayTimes.main.name[i% PrayTimes.main.num]);
					PrayTimes.main.showNotification(minutesLeft, nowPlayingAzan);
					PrayTimes.main.playAzan(minutesLeft, nowPlayingAzan);
					break;
				}
			}
		}
		//PrayTimes.misc.Timer.stop();
	}


	//--------------------------- Alerts and Sound ---------------------------


	// show advanced notification
	this.showPreNotification = function(minutesLeft, nextAzan)
	{
		var preMins = PrayTimes.main.getPref('preNotificationMinutes');
		if (minutesLeft == preMins) 
		{
			if (PrayTimes.prefs.getBoolPref('showPreNotification') && !PrayTimes.prefs.getBoolPref('preNotificationShowed'))
			{
				PrayTimes.prefs.setBoolPref('preNotificationShowed', true);
				PrayTimes.main.displayAlertSlider(nextAzan, minutesLeft + ' minutes left' )
			}
		}
		else if (!PrayTimes.misc.isLinux || minutesLeft <= preMins- 2 || minutesLeft > preMins+ 2)
			PrayTimes.prefs.setBoolPref('preNotificationShowed', false);
	}


	// show slider notification
	this.showNotification = function(minutesLeft, nowPlayingAzan)
	{
		if (minutesLeft == 0) 
		{
			if (PrayTimes.prefs.getBoolPref('showSliderNotification') && !PrayTimes.prefs.getBoolPref('notificationShowed')) 
			{
				PrayTimes.prefs.setBoolPref('notificationShowed', true);
				PrayTimes.main.displayAlertSlider(nowPlayingAzan, (nowPlayingAzan == 'Sunrise' || nowPlayingAzan == 'Sunset') ? '' 
					: PrayTimes.prefs.getStrPref('notificationText'));
			}
		}
		else if (!PrayTimes.main.playingPeriod && (minutesLeft > 2 || !PrayTimes.misc.isLinux))
			PrayTimes.main.resetAlertIndicators();
	}


	// play azan
	this.playAzan = function(minutesLeft, nowPlayingAzan)
	{
		if (minutesLeft == 0)
		{
			if (PrayTimes.prefs.getBoolPref('playSound') && !PrayTimes.prefs.getBoolPref('azanStarted') && nowPlayingAzan != 'Sunrise' && nowPlayingAzan != 'Sunset')
			{
				PrayTimes.prefs.setBoolPref('azanStarted', true);
				PrayTimes.prefs.setBoolPref('azanPlaying', true);
				PrayTimes.misc.playFile(PrayTimes.prefs.getStrPref('soundFileName'), PrayTimes.prefs.getIntPref('soundVolume'));
			}
		}
	}


	// reset alert indicators
	this.resetAlertIndicators = function()
	{
		PrayTimes.prefs.setBoolPref('notificationShowed', false);
		PrayTimes.prefs.setBoolPref('azanStarted', false);
		PrayTimes.prefs.setBoolPref('azanPlaying', false);
	}


	//--------------------- Prefs Quick Access ------------------


	// init pref data
	this.initPrefs = function() {
		var data = { 
			// types: 0: int, 1: string, 2: boolean
			azanDisplayMode: 0,
			playDuration: 0,
			startCountDown: 0,
			preNotificationMinutes: 0,
			azanFlags: 1,
			location: 1
		}
		for (var i in data)
			this.pref[i] = data[i] ? PrayTimes.prefs.getStrPref(i) : PrayTimes.prefs.getIntPref(i);
		
	}


	// get pref data
	this.getPref = function(aPref) {
		return this.pref[aPref];
	}


	//--------------------------- Counter ---------------------------


	// stop counters
	this.stop = function()
	{
		clearTimeout(this.timeoutID);
	}


	// restart counters
	this.restart = function()
	{
		PrayTimes.main.stop();
		PrayTimes.main.run();
	}


	// refresh counters
	this.refresh = function()
	{
		PrayTimes.main.resetAzanData();
		PrayTimes.main.restart();
	}


	// force to recompute data
	this.resetAzanData = function()
	{
		PrayTimes.misc.triggerEvent(PrayTimes.misc.ResetData);
	}


	//---------------------- Compute Times -----------------------


	// read prayer times
	this.readTimes = function() 
	{
		if (PrayTimes.main.pref.location == '')
			return;

		var now = new Date();

		var lat = PrayTimes.prefs.getStrPref('latitude');
		var lng = PrayTimes.prefs.getStrPref('longitude'); 
		var timeZone = PrayTimes.misc.getCurrentTimeZone(now); 

		PrayTimes.misc.loadPrayTimePrefs();
		PrayTimes.calc.setTimeFormat(PrayTimes.calc.Float);
		var time = PrayTimes.calc.getPrayerTimes(now, lat, lng, timeZone);
		for (var i=0; i<PrayTimes.main.num; i++)
		{
			PrayTimes.main.time[i] = Math.floor(time[i]* 60+ 0.5);
			PrayTimes.main.fullTime[i] = (PrayTimes.prefs.getIntPref('clockFormat') == 0) ? PrayTimes.calc.floatToTime12(time[i]) : PrayTimes.calc.floatToTime24(time[i]);
		}

		var tomorrow = PrayTimes.misc.nextDay(now);
		var timeZone = PrayTimes.misc.getCurrentTimeZone(tomorrow); 
		time = PrayTimes.calc.getPrayerTimes(tomorrow, lat, lng, timeZone);
		for (var i=0; i<PrayTimes.main.num; i++)
		{
			var i2 = i+ PrayTimes.main.num;
			PrayTimes.main.time[i2] = Math.floor((time[i]+ 24)* 60);
			PrayTimes.main.fullTime[i2] = (PrayTimes.prefs.getIntPref('clockFormat') == 0) ? PrayTimes.calc.floatToTime12(time[i]) : PrayTimes.calc.floatToTime24(time[i]);
		}

		var day = now.getDate();
		var month = now.getMonth()+ 1;
		//PrayTimes.main.addlog('refresh');
		this.dataDate = month+ '/'+ day;
	}


	// check if current data is uptodate
	this.dataIsValid = function(now)
	{
		var month = now.getMonth()+ 1;
		var day = now.getDate();
		return (this.dataDate == month+ '/'+ day);
	}


	//---------------------- Display Functions -----------------------


	// update display panel
	this.setDisplay = function(str) {
		PrayTimes.main.statusPad.label = str;
		PrayTimes.main.statusPad.setAttribute('playazan', ''+ PrayTimes.main.playingPeriod);
		if (PrayTimes.main.navPad) {
			PrayTimes.main.navPad.value = str;
			PrayTimes.main.navButton.setAttribute('playazan', ''+ PrayTimes.main.playingPeriod);
		}
	}


	// set display style
	this.setDisplayStyle = function(str) {
		PrayTimes.main.statusPad = document.getElementById('azan-display');
		PrayTimes.main.navButton = document.getElementById('azan-button');
		PrayTimes.main.navPad = document.getElementById('azan-button-display');

		var mode = PrayTimes.prefs.getIntPref('statusBarMode');
		var style = (mode == 2) ? '' : 'statusbarpanel-iconic'+ (mode ==0 ? '-text' : '');
		PrayTimes.main.statusPad.setAttribute('class', style);
		PrayTimes.main.statusPad.hidden = PrayTimes.prefs.getBoolPref('showOnStatusBar') ? '' : 'true';
		//PrayTimes.main.statusPad.style.direction = PrayTimes.misc.getDirection();

		if (PrayTimes.main.navPad)
			PrayTimes.main.navPad.hidden = PrayTimes.prefs.getIntPref('navBarMode') == 1 ? 'true' : '';
		this.resetTooltip();
	}


	// generate the timeLeft string
	this.timeLeftString = function(minutesLeft, seconds)
	{
		var hideSeconds = PrayTimes.prefs.getBoolPref('removeSecondsIfHours') && minutesLeft >= 60;
		if (hideSeconds)
			minutesLeft++;

		hours = Math.floor(minutesLeft/ 60);
		minutes = minutesLeft- hours* 60;
		seconds = 59- seconds; 

		hours = PrayTimes.misc.twoDigitsFormat(hours);
		minutes = PrayTimes.misc.twoDigitsFormat(minutes);
		seconds = PrayTimes.misc.twoDigitsFormat(seconds);

		var timeLeft = minutes+ (hideSeconds? '' : ':'+ seconds);
		timeLeft = (PrayTimes.prefs.getBoolPref('removeLeadingZeroHours') && hours == '00' ? '' : hours+ ':')+ timeLeft;
		return timeLeft;
	}


	// generate the timeLeftHM string
	this.timeLeftLongString = function(minutesLeft)
	{
		if (minutesLeft < 0) 
			minutesLeft = 0;
		var hours = Math.floor((minutesLeft)/ 60);
		var minutes = (minutesLeft)- hours* 60;

		var hoursTitle = (hours > 1) ? 'hours' : 'hour';
		var str = (hours == '0') ? '' : hours+ ' '+ hoursTitle+ ' and ';
		
		str = str+ minutes+ ' minute'+ (minutes != 1 ? 's' : '');
		return str;
	}


	// show popup menu
	this.showPopupMenu = function(e) 
	{
		var statusbar = document.getElementById('azan-display');
		var context = document.getElementById('azan-contextmenu');
		var x = e.clientX;
		var y = e.clientY;
		// document.popupNode = statusbar;
		context.showPopup(statusbar, x, y, 'bottomleft', 'topleft');
	}


	// process clicks on the context menu 
	this.azanContextMenu = function(e) 
	{
		switch (e.button) 
		{
			case 0:
				if (PrayTimes.prefs.getBoolPref('azanPlaying'))
					PrayTimes.misc.stopSoundPressed();
				else
					PrayTimes.misc.openDialogWindow('options');
				break;
			case 1:
				PrayTimes.misc.openNewWindow('http://praytimes.org/show-site/');
				break;
			case 2:
				PrayTimes.main.initContextMenu();
				// show context menu (done by xul)
				break; 
		}
	}


	// display alert slider
	this.displayAlertSlider = function(title, text)
	{
		var icon = 'chrome://praytimes/content/icons/azan.png';
		var alert = Components.classes["@mozilla.org/alerts-service;1"].getService(Components.interfaces.nsIAlertsService);
		if (alert)
			alert.showAlertNotification(icon, title, text, false, '', null);
	}


	// insert a tooltip text
	this.tooltipText = function(str)
	{
		var tooltipPanel = document.getElementById('azan-tooltip');
		var label = document.createElement('label');
		label.setAttribute('value', str);
		tooltipPanel.firstChild.appendChild(label);
	}


	// reset tooltip 
	this.resetTooltip = function()
	{
		var tooltip = 'azan-tooltip';
		if (!PrayTimes.prefs.getBoolPref('showTooltip') || 
				!PrayTimes.prefs.getBoolPref('showTooltipTimes') && !PrayTimes.prefs.getBoolPref('showTooltipTimeLeft'))
			tooltip = '';
		this.statusPad.tooltip = tooltip;
		if (PrayTimes.main.navButton)
			this.navButton.tooltip = tooltip;
	}


	// fill in the tooltip 
	this.fillTooltip = function()
	{
		var tooltipPanel = document.getElementById('azan-tooltip');
		PrayTimes.misc.removeChildrenOfNode(tooltipPanel.firstChild);

		if (PrayTimes.main.pref.location == '') {
			PrayTimes.main.tooltipText('Click to set your location...');
			return;
		}

		if (PrayTimes.prefs.getBoolPref('showTooltip') && PrayTimes.prefs.getBoolPref('showTooltipTimes'))
		{
			tooltipPanel.firstChild.appendChild(PrayTimes.main.tooltipTimes);

			var azanTimes = document.getElementById('tooltip-azan-times');
			PrayTimes.misc.removeChildrenOfNode(azanTimes);

			var azanFlags = PrayTimes.prefs.getStrPref('azanFlags');
			var offset = PrayTimes.main.nextAzan >= PrayTimes.main.num ? PrayTimes.main.num : 0;

			for (var i=offset; i<PrayTimes.main.num+ offset; i++)
			{
				if(azanFlags[i% PrayTimes.main.num] == 'u')
					continue;
				var row = document.createElement('hbox');
				var c1 = document.createElement('label');
				var c2 = document.createElement('label');
				c1.setAttribute('flex', '1');
				c1.setAttribute('value', PrayTimes.main.name[i% PrayTimes.main.num]);
				c2.setAttribute('class', 'tooltip-azan-time');
				c2.setAttribute('value', PrayTimes.main.fullTime[i]+ '');
				row.appendChild(c1);
				row.appendChild(c2);
				if (i == PrayTimes.main.nextAzan)
					row.setAttribute('class', 'tooltip-highlight');
				azanTimes.appendChild(row);
			}

			var azanTitle = document.getElementById('tooltip-title');
			//azanTitle.value = (offset == 0 ? 'Today\'s' : 'Tomorrow\'s' )+ ' Prayer Times';
			var date = new Date();
			if (offset > 0)
				date = PrayTimes.misc.nextDay(date);
			var title = offset == 0 ? 'Today' : 'Tomorrow'; 
			title += ':  '+ PrayTimes.misc.monthName(date.getMonth())+ ' '+ PrayTimes.misc.twoDigitsFormat(date.getDate())+ ', ';
			//title += ':  '+ PrayTimes.misc.twoDigitsFormat(date.getDate())+ ' '+ PrayTimes.misc.monthName(date.getMonth())+ ' ';
			title += date.getFullYear()+ ''; //PrayTimes.misc.twoDigitsFormat(date.getFullYear()% 100);
			azanTitle.value = title;
		}

		if (PrayTimes.prefs.getBoolPref('showTooltip') && PrayTimes.prefs.getBoolPref('showTooltipTimeLeft'))
		{
			tooltipPanel.firstChild.appendChild(PrayTimes.main.tooltipTimeLeft);

			var nextAzanTime = document.getElementById('tooltip-next-azan');
			nextAzanTime.value = PrayTimes.main.timeLeftHM;

			var nextAzanTitle = document.getElementById('tooltip-next-azan-title');
			nextAzanTitle.value = 'Time left to '+ PrayTimes.main.name[PrayTimes.main.nextAzan% PrayTimes.main.num]+ ' ';
		}
	}



	//----------------------- Handling Azan flags -----------------------


	// init context menu items
	this.initContextMenu = function() 
	{
		var azanFlags = PrayTimes.prefs.getStrPref('azanFlags');
		var azanTimes = document.getElementById('azan-showtimes');
		PrayTimes.misc.removeChildrenOfNode(azanTimes);
		var row = document.createElement('menupopup');

		for (var i=0 ; i<PrayTimes.main.num ; i++)
		{
			var c1 = document.createElement('menuitem');
			c1.setAttribute('id', 'praytimes-show-prayer-'+ i);
			c1.setAttribute('type', 'checkbox');
			c1.setAttribute('label', PrayTimes.main.name[i]);
			c1.setAttribute('oncommand', 'PrayTimes.main.updateShowTimes()');
			// c1.addEventListener('command', PrayTimes.main.updateShowTimes.bind(this), false);
			if (azanFlags[i] == 'c')
				c1.setAttribute('checked', 'true');
			row.appendChild(c1);
		}
		azanTimes.appendChild(row);
	}


	// update azan flags
	this.updateShowTimes = function()
	{
		azanFlags = '';
		for (var i=0 ; i<PrayTimes.main.num ; i++)
		{
			var item = document.getElementById('praytimes-show-prayer-'+ i);
			azanFlags = azanFlags+ (item.getAttribute('checked') == 'true' ? 'c' : 'u');
		}
		PrayTimes.prefs.setStrPref('azanFlags', azanFlags);
	}


	//---------------------- Log functions -----------------------


	// error log
	this.log = function(str)
	{
		PrayTimes.misc.log(str);
	}


	// error additive log 
	this.addlog = function(str)
	{
		PrayTimes.misc.log(str, 1);
	}


	//---------------------- Display Panel -----------------------

	// initialize displays
	this.initDisplays = function() {	
		PrayTimes.main.tooltipTimes = PrayTimes.misc.removeNode(document.getElementById('tooltipTimes'));
		PrayTimes.main.tooltipTimeLeft = PrayTimes.misc.removeNode(document.getElementById('tooltipTimeLeft'));
		PrayTimes.main.setDisplayStyle();
	}

	// check if window is a popup
	this.windowIsPopUp = function() {
		var check = window.statusbar.visible && window.toolbar.visible;
		// one can also check locationbar and menubar
		return !check;
	}


	//---------------------- Preference Listener -----------------------


	// init preference listener
	this.initPrefListener = function() {
		this.prefListener = new PrayTimes.PrefListener(PrayTimes.main.prefHandler);
		this.prefListener.register();
		PrayTimes.misc.resetEvents(); 
	}


	// preference handler
	this.prefHandler = function(branch, name) {
		//PrayTimes.misc.Timer.start();
		switch (name) {
			case 'azanFlags':
				PrayTimes.misc.resetAzanData();
				break;
			case 'currentEvent':
				PrayTimes.main.handleEvents();
				break;
		}
		PrayTimes.main.setDisplayStyle();
		PrayTimes.main.initPrefs();
		//PrayTimes.misc.Timer.stop();
	}


	// handle program event
	this.handleEvents = function() {
		var event = PrayTimes.prefs.getIntPref('currentEvent');

		if (event == PrayTimes.misc.StopSound)
			PrayTimes.misc.stopSound();

		if (event == PrayTimes.misc.ResetData)
			PrayTimes.main.dataDate = '';
		
		PrayTimes.misc.resetEvents();
	}


	//---------------------- Upgrade -----------------------


	// praytimes upgrader
	this.upgrade = function() {
		if (PrayTimes.prefs.get('installedVersion') < '1.2') 
			this.movePrefs();
		if (PrayTimes.prefs.get('installedVersion') == '') // first use
			return;
		//if (PrayTimes.prefs.getIntPref('statusBarMode') == 2)
		//	PrayTimes.prefs.setIntPref('statusBarMode', 1); 	
	}

	// move preferences from v1.1 to v1.2
	this.movePrefs = function() {
		var prefs = [
			'location', 'longitude', 'latitude',
			'timeZoneAuto', 'timeZone',
			'lang', 'clockFormat',
			'azanFlags', 'azanDisplayMode', 'startCountDown',
			'statusBarMode', 'showOnStatusBar', 'navBarMode',
			'showTooltip', 'showTooltipTimes', 'showTooltipTimeLeft',
			'removeLeadingZeroHours', 'removeSecondsIfHours',
			'playSound', 'soundFileName', 'soundVolume', 'playDuration',
			'showSliderNotification', 'notificationText',
			'showPreNotification', 'preNotificationMinutes',
			'calcMethod', 'adjustHighLats', 'fajrAngle', 
			'maghribSelector', 'maghribAngleMinutes', 'ishaSelector', 'ishaAngleMinutes',
			'dhuhrMinutes', 'asrJuristic', 'adjustHighLatsMethod'
		];
		
		var oldPrefs = new PrayTimes.Preference('azan.');
		for (var i = 0 ; i < prefs.length ; i++) {
			var p = prefs[i];
			if (oldPrefs.hasUserValue(p)) {
				PrayTimes.prefs.set(p, oldPrefs.get(p))
				//PrayTimes.prefs.clearUserValue(p)
			}
		}	
	}

	// set default values on first run
	this.setDefaults = function() {
		if (typeof(Application) != 'undefined' && Application.version >= '4' && PrayTimes.prefs.getStrPref('installedVersion') < '1.1.6') { 
			PrayTimes.misc.showButton(); // show button by default on FF 4+
		}
		if (PrayTimes.prefs.getStrPref('installedVersion') == '') {
			// set default method
			PrayTimes.misc.setMethodPrefs(3); // MWL
		}
	}

	//---------------------- Extension Init -----------------------

	// add-on initializer
	this.init = function()
	{
		// PrayTimes.prefs.setStrPref('location', '');  // Test first load
		// PrayTimes.prefs.setStrPref('installedVersion', '');  // Test first load
		
		if (PrayTimes.main.windowIsPopUp())
			return;

		PrayTimes.main.setDefaults();
		PrayTimes.main.upgrade();
		PrayTimes.prefs.setStrPref('installedVersion', PrayTimes.prefs.getStrPref('version'));  

		PrayTimes.main.initDisplays();
		PrayTimes.main.initPrefs();

		PrayTimes.main.initPrefListener();
		PrayTimes.misc.Timer.init();
		PrayTimes.main.run();
	}


	// add-on unload
	this.unload = function() {
		PrayTimes.main.prefListener.unregister();
	}

}


//---------------------- PrayTimes Object -----------------------

PrayTimes.main = new PrayTimes.Main;

window.addEventListener('load', PrayTimes.main.init, false);
window.addEventListener('unload', PrayTimes.main.unload, false);



// Pray Times! - Options
// By: Hamid Zarrabi-Zadeh
// Licensed under GPL


PrayTimes.Options = function() {

	this.mapRequest = new XMLHttpRequest();
	this.mapRequestRunning = false;

	this.mapLocation = '';
	this.mapLatitude = 0;
	this.mapLongitude = 0;

	this.mapDataIsReady = false;

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

	this.isPlaying = false;

	this.monthDist = 0;  // month indicator for monthly timetable



	//---------------------- Read Google Map Data -----------------------


	// extract map data from the xml doc
	this.extractMapData = function(doc) 
	{
		var myLocation = '';
		status = PrayTimes.misc.getTagValue(doc, 'status')
		if (status != 'OK')
		{
			myLocation = 'Address not found!';
			PrayTimes.options.setLocationButton(false);
		}
		else
		{
			myLocation = PrayTimes.misc.getTagValue(doc, 'formatted_address');
			PrayTimes.options.setLocationButton(true);
			var location = doc.getElementsByTagName('location')[0];
			PrayTimes.options.mapLatitude = PrayTimes.misc.getTagValue(location, 'lat');
			PrayTimes.options.mapLongitude = PrayTimes.misc.getTagValue(location, 'lng');
		}
		PrayTimes.options.mapLocation = myLocation;
	}


	// extract map data from the json object -- not used
	this.extractGoogleMapData = function(obj) 
	{
		var myLocation = '';
		if (obj.status != 'OK')
		{
			myLocation = 'Address not found!';
			PrayTimes.options.setLocationButton(false);
		}
		else
		{
			myLocation = obj.results[0].formatted_address;
			PrayTimes.options.setLocationButton(true);
			var location = obj.results[0].geometry.location;
			PrayTimes.options.mapLatitude = location.lat;
			PrayTimes.options.mapLongitude = location.lng;
		}
		PrayTimes.options.mapLocation = myLocation;
	}


	// handler for the XMLHttpRequest
	this.processGoogleMapRequest = function() 
	{
		if (PrayTimes.options.mapRequest.readyState == 4) 
		{
			PrayTimes.options.mapRequestRunning = false;
			if (PrayTimes.options.mapRequest.status == 200)
			{
				var doc = PrayTimes.options.mapRequest.responseXML;
				PrayTimes.options.extractMapData(doc);
				// var json = PrayTimes.options.mapRequest.responseText;
				// obj = JSON.parse(json);
				// PrayTimes.options.extractGoogleMapData(obj);
				PrayTimes.options.displayLocation(PrayTimes.options.mapLocation);
			}
			else
				PrayTimes.options.displayLocation('Error reading map data!');
		}
	}


	// create the map url 
	this.GoogleMapURL = function()
	{
		var item = document.getElementById('city-text-search');
		var myLocation = item ? item.value : '';
		address = myLocation.replace(/ /g, '+');  //encodeURI(myLocation);
		url = 'http://maps.googleapis.com/maps/api/geocode/xml?sensor=false&address=' + address;
		//url = 'http://maps.googleapis.com/maps/api/geocode/json?sensor=false&address=' + address;
		return url; 
	}


	// reading map data using XMLHttpRequest
	this.readGoogleMapData = function() 
	{

		PrayTimes.options.displayLocation('Loading Address...');
		PrayTimes.options.mapRequestRunning = true;

		PrayTimes.options.mapRequest.open('GET', PrayTimes.options.GoogleMapURL(), true);
		PrayTimes.options.mapRequest.onreadystatechange = PrayTimes.options.processGoogleMapRequest;
		PrayTimes.options.mapRequest.send(null); 
	}


	//---------------------- Set Location -----------------------


	// reading map data 
	this.readMapData = function() 
	{
		PrayTimes.options.setLocationButton(false);
		var searchStr = document.getElementById('city-text-search').value;
		if (searchStr == '')
			return;

		PrayTimes.options.readGoogleMapData();

	}


	// show a text in location tree
	this.displayLocation = function(myLocation)
	{
		//alert(myLocation);
		var results = document.getElementById('azan-locations-results');
		var item = document.createElement('treeitem');
		var row = document.createElement('treerow');
		var cell1 = document.createElement('treecell');
		cell1.setAttribute('label', myLocation);
		var cell2 = document.createElement('treecell');
		cell2.setAttribute('label', PrayTimes.options.mapDataIsReady ? PrayTimes.options.mapLatitude : '');
		var cell3 = document.createElement('treecell');
		cell3.setAttribute('label', PrayTimes.options.mapDataIsReady ? PrayTimes.options.mapLongitude : '');
		
		row.appendChild(cell1);
		row.appendChild(cell2);
		row.appendChild(cell3);
		item.appendChild(row);
		PrayTimes.misc.removeChildrenOfNode(results);
		results.appendChild(item);
	}


	//set the location button
	this.setLocationButton = function(which)
	{
		PrayTimes.options.mapDataIsReady = which;
		var button = document.getElementById('set-location-button');
		button.setAttribute('disabled', !which);
	}


	//set the location infrmation
	this.setLocation = function()
	{
		if (!PrayTimes.options.mapDataIsReady)
			return;

		PrayTimes.prefs.setStrPref('location', PrayTimes.options.mapLocation);
		PrayTimes.prefs.setStrPref('longitude', PrayTimes.options.mapLongitude);
		PrayTimes.prefs.setStrPref('latitude', PrayTimes.options.mapLatitude);

		//set location value
		var item = window.opener.document.getElementById('current-location');
		if (item)
			item.value = PrayTimes.options.mapLocation;
		
		PrayTimes.misc.resetAzanData();

		if (window.opener.PrayTimes.options) {
			window.opener.PrayTimes.options.dirty();
		}

		window.close();  
	}


	//---------------------- Options Functions -----------------------


	// initialize options window
	this.initOptionsDialog = function()
	{
		document.getElementById('tab-box').selectedIndex = PrayTimes.misc.getMainWindow().PrayTimes.Main.lastOptionsTab;
		document.getElementById('current-location').value = PrayTimes.prefs.getStrPref('location');
		//document.getElementById('navBarOptions').hidden = Application.version < '4' ? 'true' : ''

		PrayTimes.options.initTimeZoneList();
		document.getElementById('time-zone-group').selectedIndex = PrayTimes.prefs.getBoolPref('timeZoneAuto') ? 0 : 1;
		PrayTimes.options.toggleTimeZoneAuto();

		//document.getElementById('daylightSaving').selectedIndex = PrayTimes.prefs.getIntPref('daylightSaving');
		document.getElementById('clockFormat').selectedIndex = PrayTimes.prefs.getIntPref('clockFormat');


		var mode = PrayTimes.prefs.getIntPref('azanDisplayMode');
		var displayModeGroup = document.getElementById('display-mode-group');
		displayModeGroup.selectedItem = displayModeGroup.childNodes[mode-1];
		if (mode == 3)
			displayModeGroup.selectedItem = displayModeGroup.childNodes[2].childNodes[0];

		var time = document.getElementById('start-count-down');
		var timeList = time.childNodes[0];
		for (var i=0 ; i<timeList.childNodes.length ; i++)
			if (timeList.childNodes[i].value == PrayTimes.prefs.getIntPref('startCountDown'))
				time.selectedIndex = i;

		var item = document.getElementById('preNotificationMinutes');
		var itemList = item.childNodes[0];
		for (var i=0 ; i<itemList.childNodes.length ; i++)
			if (itemList.childNodes[i].value == PrayTimes.prefs.getIntPref('preNotificationMinutes'))
				item.selectedIndex = i;

		document.getElementById('removeLeadingZeroHours').checked = PrayTimes.prefs.getBoolPref('removeLeadingZeroHours');
		document.getElementById('removeSecondsIfHours').checked = PrayTimes.prefs.getBoolPref('removeSecondsIfHours');
		document.getElementById('showSliderNotification').checked = PrayTimes.prefs.getBoolPref('showSliderNotification');
		document.getElementById('notificationText').value = PrayTimes.prefs.getStrPref('notificationText');
		document.getElementById('showPreNotification').checked = PrayTimes.prefs.getBoolPref('showPreNotification');

		document.getElementById('playSound').checked = PrayTimes.prefs.getBoolPref('playSound');
		document.getElementById('sound-url').value = PrayTimes.prefs.getStrPref('soundFileName');
		document.getElementById('soundVolume').selectedIndex = PrayTimes.prefs.getIntPref('soundVolume');

		document.getElementById('statusBarMode').selectedIndex = PrayTimes.prefs.getIntPref('statusBarMode');
		document.getElementById('navBarMode').selectedIndex = PrayTimes.prefs.getIntPref('navBarMode');
		document.getElementById('showOnStatusBar').checked = PrayTimes.prefs.getBoolPref('showOnStatusBar');
		document.getElementById('showOnNavBar').checked = PrayTimes.misc.isButtonOnNavBar();
		document.getElementById('showTooltip').checked = PrayTimes.prefs.getBoolPref('showTooltip');
		document.getElementById('showTooltipTimes').checked = PrayTimes.prefs.getBoolPref('showTooltipTimes');
		document.getElementById('showTooltipTimeLeft').checked = PrayTimes.prefs.getBoolPref('showTooltipTimeLeft');

		PrayTimes.options.toggleShowTooltip();
		PrayTimes.options.loadFlags();

		PrayTimes.misc.loadPrayTimePrefs();
		PrayTimes.misc.selectMenuItem('calc-method', PrayTimes.prefs.getIntPref('calcMethod'));
		//document.getElementById('calc-method').selectedIndex = PrayTimes.prefs.getIntPref('calcMethod');
		PrayTimes.options.loadMethodDefaults(PrayTimes.calc.methodParams[PrayTimes.prefs.getIntPref('calcMethod')]);
		document.getElementById('dhuhrMinutes').value = 1* PrayTimes.prefs.getStrPref('dhuhrMinutes');
		document.getElementById('asrJuristic').selectedIndex = PrayTimes.prefs.getIntPref('asrJuristic');
		document.getElementById('adjustHighLats').selectedIndex = PrayTimes.prefs.getIntPref('adjustHighLats');

	}


	// option window's apply and close
	this.saveOptionsDialog = function(close)
	{

		PrayTimes.prefs.setStrPref ('timeZone', document.getElementById('time-zone-list').selectedItem.value);
		PrayTimes.prefs.setBoolPref('timeZoneAuto', document.getElementById('time-zone-group').selectedIndex == 0);
		//PrayTimes.prefs.setIntPref ('daylightSaving', document.getElementById('daylightSaving').selectedIndex);
		PrayTimes.prefs.setIntPref ('clockFormat', document.getElementById('clockFormat').selectedIndex);
		PrayTimes.prefs.setIntPref ('azanDisplayMode', document.getElementById('display-mode-group').selectedItem.value);
		PrayTimes.prefs.setIntPref ('startCountDown', document.getElementById('start-count-down').selectedItem.value);
		PrayTimes.prefs.setBoolPref('removeLeadingZeroHours', document.getElementById('removeLeadingZeroHours').checked);
		PrayTimes.prefs.setBoolPref('removeSecondsIfHours', document.getElementById('removeSecondsIfHours').checked);
		PrayTimes.prefs.setBoolPref('showSliderNotification', document.getElementById('showSliderNotification').checked);
		PrayTimes.prefs.setStrPref ('notificationText', document.getElementById('notificationText').value);
		PrayTimes.prefs.setBoolPref('showPreNotification', document.getElementById('showPreNotification').checked);
		PrayTimes.prefs.setIntPref ('preNotificationMinutes', document.getElementById('preNotificationMinutes').selectedItem.value);
		PrayTimes.prefs.setBoolPref('playSound', document.getElementById('playSound').checked);
		PrayTimes.prefs.setIntPref ('soundVolume', document.getElementById('soundVolume').selectedIndex);
		PrayTimes.prefs.setStrPref ('soundFileName', document.getElementById('sound-url').value);
		PrayTimes.prefs.setIntPref ('statusBarMode', document.getElementById('statusBarMode').selectedIndex);
		PrayTimes.prefs.setIntPref ('navBarMode', document.getElementById('navBarMode').selectedIndex);
		PrayTimes.prefs.setBoolPref('showOnStatusBar', document.getElementById('showOnStatusBar').checked);
		PrayTimes.prefs.setBoolPref('showTooltip', document.getElementById('showTooltip').checked);
		PrayTimes.prefs.setBoolPref('showTooltipTimes', document.getElementById('showTooltipTimes').checked);
		PrayTimes.prefs.setBoolPref('showTooltipTimeLeft', document.getElementById('showTooltipTimeLeft').checked);
		PrayTimes.misc.showButton(document.getElementById('showOnNavBar').checked);

		PrayTimes.options.saveFlags();
		PrayTimes.options.saveMethodParams();

		PrayTimes.misc.resetAzanData();

		PrayTimes.options.dirty(false);

		if (close)
			window.close();
	}

	// initialize time zone list in options window
	this.initTimeZoneList = function()
	{
		var halfHours = Array(-3,3,4,5,6,9);
		var timeZoneList = document.getElementById('time-zone-list');
		PrayTimes.misc.removeChildrenOfNode(timeZoneList);
		var row = document.createElement('menupopup');

		var currentTimeZone = PrayTimes.misc.getCurrentTimeZone(new Date());
		var selected = null;

		for (var i=-24 ; i<=26 ; i++)
		{
			var hour = Math.floor((i<0 ? i+1 : i)/2);
			var minutes = (i%2 == 0) ? '00' : '30';
			var timeZoneText = 'GMT '+ (i<0 ? '-' : '+')+ PrayTimes.misc.twoDigitsFormat(Math.abs(hour))+ ':'+ minutes;
			if (minutes != '00' && !PrayTimes.misc.isMember(halfHours, hour))
				continue;
			
			var item = document.createElement('menuitem');
			item.setAttribute('label', timeZoneText);
			item.setAttribute('value', i/2);
			row.appendChild(item);
			if (currentTimeZone == i/2)
				selected = item;
		}
		timeZoneList.appendChild(row);
		timeZoneList.selectedItem = selected ? selected : item;
	}


	// turn time-zone-list on and off
	this.toggleTimeZoneAuto = function()
	{
		var disabled = document.getElementById('time-zone-group').selectedIndex == 0;
		document.getElementById('time-zone-list').disabled = disabled;
	}


	// toggle show tooltip contents 
	this.toggleShowTooltip = function()
	{
		var disabled = !document.getElementById('showTooltip').checked;
		document.getElementById('showTooltipTimes').disabled = disabled;
		document.getElementById('showTooltipTimeLeft').disabled = disabled;
		document.getElementById('statusBarMode').disabled = !document.getElementById('showOnStatusBar').checked;
		document.getElementById('navBarMode').disabled = !document.getElementById('showOnNavBar').checked;
	}


	// enable and disable apply buttom
	this.dirty = function(mode)
	{
		var disable = (mode == false) ? true : false;
		var button = document.getElementById('azan-options-apply');
		button.setAttribute('disabled', disable);
	}


	// import defaults for each calculation method
	this.importMethodDefaults = function()
	{
		var method = 1* document.getElementById('calc-method').selectedItem.value;
		PrayTimes.options.loadMethodDefaults(PrayTimes.calc.methodParams[method]);
	}


	// load default values of calculation metgod parameters
	this.loadMethodDefaults = function(defaults)
	{
		document.getElementById('fajrAngle').value = defaults[0];
		document.getElementById('maghribSelector').selectedIndex = defaults[1];
		document.getElementById('maghribAngleMinutes').value = defaults[2];
		document.getElementById('ishaSelector').selectedIndex = defaults[3];
		document.getElementById('ishaAngleMinutes').value = defaults[4];
	}


	// save parameters for calculation method
	this.saveMethodParams = function()
	{
		PrayTimes.prefs.setIntPref('calcMethod', 1* document.getElementById('calc-method').selectedItem.value);

		PrayTimes.prefs.setStrPref('fajrAngle', document.getElementById('fajrAngle').value);
		PrayTimes.prefs.setIntPref('maghribSelector', document.getElementById('maghribSelector').selectedIndex);
		PrayTimes.prefs.setStrPref('maghribAngleMinutes', document.getElementById('maghribAngleMinutes').value);
		PrayTimes.prefs.setIntPref('ishaSelector', document.getElementById('ishaSelector').selectedIndex);
		PrayTimes.prefs.setStrPref('ishaAngleMinutes', document.getElementById('ishaAngleMinutes').value);

		PrayTimes.prefs.setStrPref('dhuhrMinutes', document.getElementById('dhuhrMinutes').value);
		PrayTimes.prefs.setIntPref('asrJuristic', document.getElementById('asrJuristic').selectedIndex);
		PrayTimes.prefs.setIntPref('adjustHighLats', document.getElementById('adjustHighLats').selectedIndex);

	}


	// set calculation method to custom
	this.setCustom = function()
	{
		//document.getElementById('calc-method').selectedIndex = 6; // custom setting
		PrayTimes.misc.selectMenuItem('calc-method', 6); // custom setting
		PrayTimes.options.dirty();
	}


	//---------------------- Azan Flags -----------------------


	// apply azan and play flags into options window
	this.loadFlags = function()
	{
		var showTimes = document.getElementById('show-azan-times-list');
		PrayTimes.misc.removeChildrenOfNode(showTimes);

		var azanFlags = PrayTimes.prefs.getStrPref('azanFlags', 'cccuucu');

		for (var i=0 ; i<this.num ; i++)
		{
			var c1 = document.createElement('checkbox');
			c1.setAttribute('label', this.name[i]);
			c1.setAttribute('oncommand', 'PrayTimes.options.dirty();');
			// c1.addEventListener('command', PrayTimes.options.dirty.bind(this), false);
			if (azanFlags[i] == 'c')
				c1.setAttribute('checked', 'true');
			showTimes.appendChild(c1);
		}
	}


	// update azan flags
	this.saveFlags = function()
	{
		var azanFlags = '';
		var showTimes = document.getElementById('show-azan-times-list');

		for (var i=0 ; i<this.num ; i++)
		{
			azanFlags += (showTimes.childNodes[i].getAttribute('checked') ? 'c' : 'u');
		}
		PrayTimes.prefs.setStrPref('azanFlags', azanFlags);
	}



	//---------------------- Monthly Timetable -----------------------


	// create monthly timetable
	this.fillTimeTable = function()
	{
		var now = new Date();
		var yearMonth = now.getFullYear()* 12+ now.getMonth()+ this.monthDist;
		var year = Math.floor(yearMonth/ 12);

		document.getElementById('timetable-title').value = PrayTimes.misc.monthFullName(yearMonth% 12)+ ' '+ year;

		var firstDayOfMonth = new Date(year, yearMonth% 12, 1);
		var firstDayOfNextMonth = new Date(Math.floor((yearMonth+ 1)/ 12), (yearMonth+ 1)% 12, 1);

		var lat = PrayTimes.prefs.getStrPref('latitude');
		var lng = PrayTimes.prefs.getStrPref('longitude'); 
		PrayTimes.misc.loadPrayTimePrefs();
		
		var tree = document.getElementById('prayer-times-tree');
		PrayTimes.misc.removeChildrenOfNode(tree);
		
		var day = firstDayOfMonth;
		for (var i=1 ; day < firstDayOfNextMonth ; i++)
		{
			var timeZone = PrayTimes.misc.getCurrentTimeZone(day); 
			if (PrayTimes.prefs.getIntPref('clockFormat') == 0) 
				PrayTimes.calc.setTimeFormat(PrayTimes.calc.Time12NS) // 12-hour format with no suffix

			var time = PrayTimes.calc.getPrayerTimes(day, lat, lng, timeZone);
			var item = document.createElement('treeitem');
			var row = document.createElement('treerow');
			var cell = document.createElement('treecell');
			cell.setAttribute('label', PrayTimes.misc.twoDigitsFormat(i));
			row.appendChild(cell);

			for (var j=0 ; j<this.num ; j++)
			{
				var cell = document.createElement('treecell');
				cell.setAttribute('label', time[j]);
				row.appendChild(cell);
			}
			
			item.appendChild(row);
			tree.appendChild(item);
			day = PrayTimes.misc.nextDay(day);
		}
		
		var tree = document.getElementById('timetable-tree');
		if (this.monthDist == 0)
			tree.view.selection.select(now.getDate()- 1); 
	}


	//----------------------  Sound Buttons -----------------------


	// play sound  
	this.playSound = function()
	{
		var soundFile = document.getElementById('sound-url').value;
		var volume = document.getElementById('soundVolume').selectedIndex;
		this.isPlaying = true;
		PrayTimes.misc.playFile(soundFile, volume);
	}

	// stop sound  
	this.stopSound = function()
	{
		this.isPlaying = false;
		PrayTimes.misc.stopSoundPressed();
	}


	// reset sound  
	this.resetSound = function()
	{
		if (this.isPlaying)
			this.playSound();
	}


	// select a file-name 
	this.selectFile = function(textboxID)
	{
		try {
			var NFP = Components.interfaces.nsIFilePicker;
			var picker = Components.classes["@mozilla.org/filepicker;1"].createInstance(NFP);
			//var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
			//var fileHandler = ios.getProtocolHandler("file").QueryInterface(Components.interfaces.nsIFileProtocolHandler);
			picker.init(window, null, NFP.modeOpen);
			picker.appendFilter('Audio Files (*.mp3)', '*.mp3');
			picker.appendFilters(NFP.filterAll);

			if(picker.show() == NFP.returnOK) 
			{
				//var URL = fileHandler.getURLSpecFromFile(picker.file);
				document.getElementById(textboxID).value = picker.file.path;
			}
		} 
		catch(e) {}
	}


	//---------------------- Comments Dialog -----------------------


	// submit comment form 
	this.submitCommentForm = function()
	{
		if (document.getElementById('comment-sender-name').value.length == '')
		{
			alert('Please enter your name');
			return;
		}
		if (document.getElementById('comment-text').value.length == '')
		{
			alert('Please enter your comment');
			return;
		}
		document.getElementById('loadingText').value = ' Submitting...';
		document.getElementById('loadingImage').src = 'chrome://praytimes/content/icons/loading.gif';
		var destURL = 'http://praytimes.org/php/contact/receive.php';
		var arguments = this.getCommentFormParams();
		var ajax = new PrayTimes.Ajax({method: 'post'});
		ajax.request(destURL, arguments, PrayTimes.options.submitFormProc);

	}


	// return comment form data
	this.getCommentFormParams = function()
	{
		return {
			'Name': document.getElementById('comment-sender-name').value,
			'Email': document.getElementById('comment-sender-email').value,
			'Subject': encodeURIComponent(document.getElementById('comment-subject').value),
			'Comments': encodeURIComponent(document.getElementById('comment-text').value),
			'Topic': 'Pray+Times!'
		};
	}


	// process comment form response
	this.submitFormProc = function(response)
	{
		document.getElementById('loadingImage').src = '';
		if (response == "OK")
		{
			document.getElementById('loadingText').value = 'Successfully Submitted';
			document.getElementById('submit-button').hidden = true;
			document.getElementById('close-button').hidden = false;
		}
		else
			document.getElementById('loadingText').value = 'Connection Error...';
	}

}

//---------------------- Options Object -----------------------


PrayTimes.options = new PrayTimes.Options();


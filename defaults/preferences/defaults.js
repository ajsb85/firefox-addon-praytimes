
pref('extensions.praytimes.version', '1.2.3');
pref('extensions.praytimes.installedVersion', '');
pref('extensions.praytimes.currentEvent', 0);		// 0: none

pref('extensions.praytimes.location', '');
pref('extensions.praytimes.longitude', '0');
pref('extensions.praytimes.latitude', '0');

pref('extensions.praytimes.timeZoneAuto', true);
pref('extensions.praytimes.timeZone', '0');

pref('extensions.praytimes.lang', 'en-US');
pref('extensions.praytimes.clockFormat', 0);		//  0: 12-hour, 1: 24-hour

pref('extensions.praytimes.azanFlags', 'ccccucc');
pref('extensions.praytimes.azanDisplayMode', 2);	//  1: next azan, 2: countdown, 3: combination
pref('extensions.praytimes.startCountDown', 60);

pref('extensions.praytimes.statusBarMode', 0);		//  0: icon-text, 1: icon, 2: text
pref('extensions.praytimes.showOnStatusBar', true);	
pref('extensions.praytimes.navBarMode', 1);			//  0: icon-text, 1: icon, 2: text

pref('extensions.praytimes.showTooltip', true);		
pref('extensions.praytimes.showTooltipTimes', true);
pref('extensions.praytimes.showTooltipTimeLeft', true);

pref('extensions.praytimes.removeLeadingZeroHours', true);
pref('extensions.praytimes.removeSecondsIfHours', true);


// sound and alerts

pref('extensions.praytimes.playSound', false);
pref('extensions.praytimes.soundFileName', 'sample.mp3');
pref('extensions.praytimes.soundVolume', 7);	// 0-9
pref('extensions.praytimes.playDuration', 4);

pref('extensions.praytimes.azanStarted', false);
pref('extensions.praytimes.azanPlaying', false);

pref('extensions.praytimes.showSliderNotification', true);
pref('extensions.praytimes.notificationText', 'It is time to pray');
pref('extensions.praytimes.notificationShowed', false);

pref('extensions.praytimes.showPreNotification', false);
pref('extensions.praytimes.preNotificationMinutes', 10);
pref('extensions.praytimes.preNotificationShowed', false);


// calculation methods

pref('extensions.praytimes.calcMethod', 0);  // 0: Ithna Ashari
pref('extensions.praytimes.adjustHighLats', 3);  // 3: Angle-Based
pref('extensions.praytimes.fajrAngle', '16');
pref('extensions.praytimes.maghribSelector', 0);
pref('extensions.praytimes.maghribAngleMinutes', '4');
pref('extensions.praytimes.ishaSelector', 0);
pref('extensions.praytimes.ishaAngleMinutes', '14');

pref('extensions.praytimes.dhuhrMinutes', '0');
pref('extensions.praytimes.asrJuristic', 0);
pref('extensions.praytimes.adjustHighLatsMethod', 1);

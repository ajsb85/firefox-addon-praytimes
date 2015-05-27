
// Pray Times! - Preferences
// By: Hamid Zarrabi-Zadeh
// Licensed under GPL


PrayTimes.Preference = function(branch) {

	this.branch = branch;
	this.prefservice = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
	this.prefs = this.prefservice.getBranch(this.branch);
	this.sString = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);

	//-------------------------- Get Functions -------------------------------

	this.getBoolPref = function(prefName, defval) {
		var result = defval;
		if (this.prefs.getPrefType(prefName) == this.prefs.PREF_BOOL) {
			try { result = this.prefs.getBoolPref(prefName); } catch(e) {}
		}
		return(result);
	}

	this.getIntPref = function(prefName, defval) {
		var result = defval;
		if (this.prefs.getPrefType(prefName) == this.prefs.PREF_INT) {
			try { result = this.prefs.getIntPref(prefName); } catch(e) {}
		}
		return(result);
	}

	this.getStrPref = function(prefName, defval) {
		var result = defval;
		if (this.prefs.getPrefType(prefName) == this.prefs.PREF_STRING) {
			try { result = this.prefs.getComplexValue(prefName, Components.interfaces.nsISupportsString).data; } catch(e) {}
		}
		return(result);
	}


	//-------------------------- Set Functions -------------------------------

	this.setBoolPref = function(prefName, value) {
		try { this.prefs.setBoolPref(prefName, value); } catch(e) {}
	}

	this.setIntPref = function(prefName, value) {
		try { this.prefs.setIntPref(prefName, value); } catch(e) {}
	}

	this.setStrPref = function(prefName, value) {
		var prefservice = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		var prefs = prefservice.getBranch(this.branch);
		this.sString.data = value;
		try { this.prefs.setComplexValue(prefName, Components.interfaces.nsISupportsString, this.sString); } catch(e) {}
	}

	//-------------------------- General Getter/Setter -------------------------------

	this.get = function(prefName, defval) {
		var result = defval;
		var p = this.prefs;
		var type = p.getPrefType(prefName);
		if (type == p.PREF_BOOL)
			try { result = p.getBoolPref(prefName); } catch(e) {}
		else if (type == p.PREF_INT)
			try { result = p.getIntPref(prefName); } catch(e) {}
		else if (type == p.PREF_STRING)
			try { result = p.getComplexValue(prefName, Components.interfaces.nsISupportsString).data; } catch(e) {}
		return(result);
	}

	this.set = function(prefName, value) {
		var p = this.prefs;
		try { 
			var type = p.getPrefType(prefName);
			if (type == p.PREF_BOOL)
				p.setBoolPref(prefName, value);
			else if (type == p.PREF_INT)
				p.setIntPref(prefName, value);
			else if (type == p.PREF_STRING) {
				var prefservice = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
				var prefs = prefservice.getBranch(this.branch);
				this.sString.data = value;
				p.setComplexValue(prefName, Components.interfaces.nsISupportsString, this.sString);
			}
		} catch(e) {}
	}
	
	this.hasUserValue = function(prefName) {
		return this.prefs.prefHasUserValue(prefName); 
	}

	this.clearUserValue = function(prefName) {
		this.prefs.clearUserPref(prefName); 
	}

}

//----------------------- Preference Listener ----------------------------


// source: https://developer.mozilla.org/En/Code_snippets/Preferences

PrayTimes.PrefListener = function(func) {

	var branchName = 'extensions.praytimes.';
	var prefService = Components.classes["@mozilla.org/preferences-service;1"]
								.getService(Components.interfaces.nsIPrefService);
	var branch = prefService.getBranch(branchName);
	branch.QueryInterface(Components.interfaces.nsIPrefBranch2);

	this.register = function() {
		branch.addObserver("", this, false);
		branch.getChildList("", { })
			  .forEach(function (name) { func(branch, name); });
	};

	this.unregister = function() {
		if (branch)
			branch.removeObserver("", this);
	};

	this.observe = function(subject, topic, data) {
		if (topic == "nsPref:changed")
			func(branch, data);
	};
}


//------------------------------------------------------------------------

PrayTimes.prefs = new PrayTimes.Preference('extensions.praytimes.');

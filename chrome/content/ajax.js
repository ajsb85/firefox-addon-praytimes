/* 

Simple AJAX Handler (ver 0.3)
Copyright (C) 2007-2013 Hamid Zarrabi-Zadeh
Licensed under GPL


//---------------------- User Interface -----------------------


	request (destURL, arguments, callBackFunc);
	formRequest (destURL, formID, callBackFunc);


//----------------------- Sample Usage ------------------------
	

1)  var ajax = new PrayTimes.Ajax();
    ajax.request('search.php', {name: 'ali', id: 12}, showResults);

2)  var ajax = new PrayTimes.Ajax({ method: 'post', xml: true, timeout: 60 });
    ajax.formRequest('query.php', 'myForm', analyzeResponse);

*/

//------------------------- PrayTimes.Ajax Class -------------------------


PrayTimes.Ajax  = function(args) {

	// args: {method, timeout, xml}
	args = args || {}; 
	this.method = (args.method == 'get') ? 'get' : 'post';
	this.requestTimeout = args.timeout || 30;  // in seconds
	this.xmlResponse = (args.xml == true);  

	this.callBackFunction = null;
	this.httpRequest = new XMLHttpRequest();


	//------------------------- Requests -------------------------


	// handle changes in the httpRequest status
	this.handler = function() 
	{
		var response = null;
		if (this.httpRequest.readyState == 4) 
		{
			if (this.httpRequest.status == 200) 
			{
				if (this.xmlResponse)
					response = this.httpRequest.responseXML;
				else
					response = this.httpRequest.responseText;
			} 
			if (this.callBackFunction != null)
				this.callBackFunction.call(this, response);
		}
	}


	// make a request 
	this.request = function(destURL, params, procFunc) 
	{
		if (!this.httpRequest)
			return;
		var args = this.hashToStr(params);
		this.callBackFunction = procFunc;
		//this.httpRequest.onreadystatechange = this.handler.bind(this);
		this.httpRequest.onreadystatechange = this.bind(this.handler, this);
		this.httpRequest.open(this.method, destURL, true);
		this.httpRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		this.httpRequest.setRequestHeader("Content-length", args.length);
		this.httpRequest.setRequestHeader("Connection", "close");
		if (this.httpRequest.timeout) 
			this.httpRequest.timeout = this.requestTimeout;
		if (this.httpRequest.overrideMimeType) 
			this.httpRequest.overrideMimeType(this.xmlResponse ? 'text/xml' : 'text/html');
		this.httpRequest.send(args);
	}


	// make a form request
	this.formRequest = function(destURL, formID, procFunc) 
	{
		var args = this.getFormData(formID);
		this.request(destURL, args, procFunc);
	}


	//------------------------- Misc -------------------------


	// return form contents as a hash table
	this.getFormData = function(formID) 
	{
		var theForm = document.getElementById(formID);
		var args = {};
		for (var e=0 ; e < theForm.elements.length ; e++) 
		{
			var name = theForm.elements[e].name;
			if (!name) continue;
			args[name] = encodeURIComponent(theForm.elements[e].value);
		}
		return args;
	} 


	// convert a hash table to a string
	this.hashToStr = function(table) 
	{
		var args = [];
		for (var name in table)
			args.push(name+ '='+ table[name]);
		return args.join('&');
	}


	// bind a funciton
	this.bind = function(method, obj)
	{
		return function() { return method.apply(obj); };
	}
}


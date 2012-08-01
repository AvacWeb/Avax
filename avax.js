/**
 * Avax
 * A small Javascript Ajax handler with form management.
 *
 * Copyright 2011-2012 AvacWeb (avacweb.com)
 * Released under the MIT and GPL Licenses.
 */
$avax = (function() {

	var $avax = {responseCache: {}, localURL: window.location.hostname};

	$avax.config = {
		type: 'GET',
		async : true,
		headers : {
			//header name : header value
		},
		params : {
			//param name : param value
			avax : 1
		},
		oncomplete : function(response){},
		onstatechange : function(xhr){},
		onfailure : function(xhr, status) {},
		response : 'responseText',
		cache : false
	};
	
	$avax.XHR = window.XMLHttpRequest ? 
					function() { return new XMLHttpRequest() } : 
					function() { return new ActiveXObject('Microsoft.XMLHTTP') };

	$avax.XHR2 = function() {
		var xhr = new XMLHttpRequest;
		if ("withCredentials" in xhr) return xhr;
		if (typeof XDomainRequest != "undefined") return new XDomainRequest;
		return null;
	};

	//turn object into query string.
	$avax.params = function(obj) {
		if(obj.join) {
			return obj.join('&');
		}
		if(typeof obj === 'string') {
			return obj.replace(/^\?/, '');
		}
		else if(typeof obj === 'object')  {
			var params = [];
			for(var i in obj) params.push( i + '=' + encodeURIComponent(obj[i]) );
			return params.join('&');
		}
	};

	//cache response, key based on url and params. 
	$avax.cache = function(url, params, data) {
		var key = url + ' ' + params;
		if(data) this.responseCache[key] = data;
		return this.responseCache[key];
	};

	//test if the url is a local URL not external (needing XHR2)
	$avax.localTest = function(url) {
		return RegExp('(^|\\W)' + this.localURL + '(\\W|$)').exec( url ) != null;
	};
	
	//merge object 2 properties into object 1. Object 1's values taking precedence.
	$avax.mergeObj = function(obj1, obj2) {
		for(var i in obj2) {
			if( !(i in obj1) ) obj1[ i ] = obj2[ i ];
		}
		return obj1;
	};

	$avax.ajax = function(obj) {
		if(!obj.url) return;

		//we need to merge any headers set in the config.
		var config = this.config
		, headers = this.mergeObj(obj.headers || {}, config.headers)
		, defaultParams = this.params( config.params )
		, obj = this.mergeObj(obj, this.config )
		, params = this.params( obj.params || '' ) + (defaultParams.length ? '&' + defaultParams : '')
		, cached = obj.cache ? this.cache(obj.url, params) : null;
		if(cached) return obj.oncomplete.call(xhr, cached);
		//fire oncomplete event with cached response.

		var xhr = this.localTest(obj.url) ? this.XHR() : this.XHR2();
		if(!xhr) return null;
		xhr.open(obj.type, obj.url, obj.async);

		//set all request headers.
		for(var i in headers) xhr.setRequestHeader(i, headers[i]);	
		
		var finish = function() {
			if(obj.cache) $avax.cache(obj.url, data, xhr[obj.response]);
			obj.oncomplete.call(xhr, xhr[obj.response]);
		};
		
		if(obj.async) {
			if(xhr.onload) {
				xhr.onload = finish;
				xhr.onerror = function() {
					obj.onfailure.call(xhr, xhr.status);	
				};
			}
			else {
				xhr.onreadystatechange = function() {
					if (xhr.readyState == 4) {
						if(xhr.status === 200) {
							finish();
						}
						else {
							obj.onfailure.call(xhr, xhr.status);
						}
					}
					else {
						obj.onstatechange(xhr);
					}
				};
			}
		}
		xhr.send( params );
		if(!obj.async) finish();
		return xhr;
	};

	$avax.get = function(url, callback) {
		var obj = {url: url}
		if(callback) obj.oncomplete = callback;
		return this.ajax(obj);
	};

	//make a post request.
	$avax.post = function(url, data, callback) {
		var obj = {
			type : 'POST',
			url : url,
			params : data,
			headers : this.mergeObj( this.config.headers , {'Content-type' : 'application/x-www-form-urlencoded'} )
		};
		if(callback) obj.oncomplete = callback;
		return this.ajax(obj);
	};

	$avax.serialize = function(form) {
		var formElements = { input:1, select:1, textarea:1 };

		//if(form.tagName.toLowerCase() !== 'form') return ''; Commented out, i suppose it doesn't NEED to be a form.
		
		var elems = form.all ? form.all : form.getElementsByTagName('*');
		for(var i = 0, params = [], e = elems[0]; e; e = elems[ ++i ]) {
			var tag = e.tagName.toLowerCase(), name = e.name || e.getAttribute('name'), 
			type = e.getAttribute('type'), value = e.value ? encodeURIComponent(e.value) : null;

			if(!tag in formElements || !name) continue;

			if(tag == 'input') {
				if(type == 'button' || type == 'submit' || type == 'reset') continue;
				if(type == 'checkbox' || type == 'radio') {
					if(e.checked) params.push( name + '=' + value );
				}
				else {
					params.push( name + '=' + value );
				}
			}
			else if(tag == 'textarea') {
				params.push( name + '=' + value );
			}
			else if(tag == 'select') {
				if(value) {
					params.push( name + '=' + value );
				}
				else {
					var selI = e.selectedIndex;
					params.push( name + '=' + e.options[selI].value );
				}
			}
		};
		return params.join('&');
	};

	$avax.sendForm = function(form, callback, extraData) {
		if(form.tagName.toLowerCase() !== 'form') return;
		var url = form.action || window.location.pathname
		, method = form.method ? form.method.toLowerCase() : 'get'
		, data = this.serialize(form) + (extraData ? '&' + this.params( extraData ) : '');
		if(method == 'get') url += (url.indexOf('?') ? '&' : '?') + data;
		
		if(method == 'get' || method == 'post')
			return $avax[ method ](url, method == 'get' ? callback : data, callback);
		else {
			var obj = {url : url, type : method, params : data}
			if(callback) obj.oncomplete = callback;
			return $avax.ajax(obj);
		}
	};

	return $avax;

})();

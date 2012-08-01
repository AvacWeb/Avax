Avax
===============================
Avax is just a tiny little fella for handling ajax requests easily, including form serialization, form sending, XHR2 and optional caching. Use with global $avax object. Eg. ```$avax.get('/url', function(){ alert('sent!') }):```

####get(url [,callback])
Make a GET request. Optional callback, receives one parameter, the reponse text, and `this` is the XMLHttpRequest object. 
The URL can be a pathname ('/path'), a full url, and even an external URL, if your browsers support XHR2, and the external url has provided permission to receive requests.

####post(url, data [,callback])
Make a POST request. Optional callback receieves the response text, and `this` is the XMLHttpRequest object. Data can be null/false if not needed. Data can be in the form of an object ```{param: value, param2:value2}``` or a query string ```'param=value&param2=value'``` or an array ```['param=value', 'param2=value2']```.

####ajax(config)
Function which deals with all requests. This function is used internally for get and post methods. It will provide a lot more freedom whe you need to tweak certain aspects of the request. config should be an object with config rules included. 

__Config__    
The config parameter should be an object containing any of these keys. A url key must be specified.
```
{
	url : '/', //needed, URL to request
	type: 'GET', //type of request
	async : true, //perform the request asynchronously
	headers : { //headers to send with the request
		//header name : header value
	},
	params : { //the parameters/data to send, can be an object, array or string as shown above.
		//param name : param value
	},
	oncomplete : function(response){}, //function to execute on completion
	onstatechange : function(xhr){}, //function to execute on each state change
	onfailure : function(xhr, status){}, //function to execute on failure
	response : 'responseText',  //type of response returned
	cache : false //cache the response or not. 
}
```
The default values for these options can be changed in the $avax.config object: ```$avax.config.async = false```.
Or you can change multiple default options by using the internal `mergeObj` method:
```javascript
$avax.config = $avax.mergeObj({
	async : false,
	cache : true,
	headers : {
		defaultHeader : defaultHeaderValue
		//headers must stay as an object in the config
	},
	params : {
		param: value //this param will be sent with every request.
	}
}, $avax.config);
```
The default options set, apply to all requests, so any parameters set in the $avax.config object will be sent with all requests. By default, there is 1 parameter sent with all requests `avax=1` so you can identify ajax use on the reponse page.

If cache is true, the response will be cached in the ```$avax.responseCache``` object. If you make a request with the same URL and data, then the callback will be called with the cached response and another request will not be made.

####serialize(form)
Serialize a form into a data/parameter string. 1 parameter should be the form element.
Buttons are not included in the serialization, why, because then you might end up with things like submit=1&preview=1&resend=1 and presumably you wouldn't want all of them. If certain buttons are required you should concatenate them onto the end of the serialization manually.

####sendForm(form [,callback] [,extraData])
Send a form through ajax. The specified form will be serialized using $avax.serialize (see above) to the forms action (or current page if none) using the forms method (or 'GET' if none). Callback function is optional and receieves the response. The extraData parameter is used for sending any extra parameters you may wish to send with the form.
exports.init = init;
exports.fake = fake;
exports.requests = getAllRequests;

var page;

function init(initPage, libraryRoot){
	var root = libraryRoot ? libraryRoot : '.';
	var inject = initPage.injectJs(root+'/sinon.js');

	page = initPage;

	if(inject){
		setup();
	} else {
		console.log("Can't find sinon.js");
	}
}

function setup(){
	page.evaluate(function () {

		if (!window._ajaxmock_) {
			window._ajaxmock_ = {
				matches: [],
				requests: {},
				call: {},
				fake: function (match) {

					function S4() {
						return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
					}

					function makeGuid() {
						return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
					}

					var urlIsString = match.url.indexOf('REGEXP') === -1;
					var guid = makeGuid();

					match.guid = guid;
					match.url = match.url.replace('REGEXP', '');
					
					console.log('[FAKE XHR] Match added [' + (match.method || 'All REST verbs') + "] : " + match.url + "'");

					match.requests = [];
					match.responses = [];
					window._ajaxmock_.call[guid] = match;

					window._ajaxmock_.matches.push(function (method, url) {

						if (!url) {
							return false;
						}

						var urlMatch = urlIsString ? url.indexOf(match.url) !== -1 : new RegExp(match.url).test(url);
						var methodMatch = (typeof match.method === 'undefined') ? true : match.method.toLowerCase() === method.toLowerCase();

						if (urlMatch && methodMatch) {
							return match;
						} else {
							return false;
						}
					});

					return guid;
				},
				init: function () {
					var _xhr = window.sinon.useFakeXMLHttpRequest();

					_xhr.onCreate = function (request) {

						setTimeout(function () {
							var anyMatches = false;
							var requests = window._ajaxmock_.requests;

							if (!request.url) {
								console.log('NO XHR URL');
								return;
							} // this shouldn't happen, but sometimes does
							// store the request for later matching
							if (requests[request.method.toLowerCase() + request.url]) {
								requests[request.method.toLowerCase() + request.url].count++;
							} else {
								requests[request.method.toLowerCase() + request.url] = {
									data: request,
									count: 1
								};
							}

							window._ajaxmock_.matches.forEach(function (func) {
								anyMatches = anyMatches || func(request.method, request.url);
							});

							if (anyMatches) {

								respond(request, anyMatches);

							} else {
								console.log('[FAKE XHR] did not respond to ' + request.url);
							}
						}, 100);
					};
				}
			};
			window._ajaxmock_.init();
		}

		function respond(request, response) {
			var call = window._ajaxmock_.call;
			var callForThisMatch;
			var responseForThisMatch;
			var status;
			var body;

			console.log('[FAKE XHR] gonna respond to ' + request.method + ": " + request.url + "'");

			callForThisMatch = call[response.guid];
			callForThisMatch.requests.push(request);

			responseForThisMatch = callForThisMatch.responses[callForThisMatch.requests.length];

			if (responseForThisMatch) {
				status = responseForThisMatch.status;
				body = responseForThisMatch.responseBody;
			}

			request.respond(
			status || response.status || 200, response.headers || {
				"Content-Type": "application/json"
			}, body || response.responseBody || '');
		}
	});
}

function fake(options){

	var url = !! options.url.source ? 'REGEXP' + options.url.source : options.url;
	var guid = page.evaluate(function (url, method, responseBody, status) {
		if (window._ajaxmock_ && url) {

			if (responseBody) {
				try {
					JSON.parse(responseBody);
				} catch (e) {
					return 'JSON';
				}
			}

			return window._ajaxmock_.fake({
				url: url,
				method: method,
				responseBody: responseBody,
				status: status
			});
		}
	}, url, options.method, options.responseBody, options.status );

	if (guid === 'JSON') {
		console.log('[FAKE FAILED] JSON was invalid : ' + options.method + ' : ' + url);
	}

	return {

		count: function () {
			return page.evaluate(function (guid) {
				return window._ajaxmock_.call[guid].requests.length;
			}, guid);
		},

		nthRequest: function (index) {
			return page.evaluate(function (guid, index) {
				var request = window._ajaxmock_.call[guid].requests[index - 1];
				return request.requestBody;
			}, guid, index);
		},

		last: function () {
			var last = page.evaluate(function (guid) {
				return window._ajaxmock_.call[guid].requests.length;
			}, guid);

			return this.nthRequest(last);
		},

		first: function () {
			return this.nthRequest(1);
		},

		nthResponse: function (num, response) {
			page.evaluate(function (guid, num, response) {
				window._ajaxmock_.call[guid].responses[num] = response;
			}, guid, num, response );

			return this;
		}
	};
}

function getAllRequests() {
	var requests = page.evaluate(function () {
		var requests = {};

		if (window._ajaxmock_) {
			requests = window._ajaxmock_.requests;
		}

		return requests;
	});

	return requests;
}
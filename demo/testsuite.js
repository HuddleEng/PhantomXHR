// We need CasperJS's module loading system
// + CasperJs is pretty awesome
phantom.casperPath = 'CasperJs';
phantom.injectJs(phantom.casperPath + '/bin/bootstrap.js');
var casper = require('casper').create();

// The PhantomJS/Sinon wrapper
var xhr = require('./phantomxhr.js');

// Start up PhantomJS server for hosting html page on localhost
// Also serves up 'real' XHR responses
var url = initPageOnServer('demo/testpage.html');

// global vars which will be assigned a fake XHR handlers
var xhr1, xhr2;

// Define the fake data
var firstResponse = JSON.stringify({real:false, request:1});
var secondResponse = JSON.stringify({real:false, request:2});
var thirdResponse = JSON.stringify({real:false, request:3});

// setup and run
casper.
on('remote.message', log). // Add logging so that we can see what is happening on the client
on('page.initialized', init). // comment out this line to see real requests
start(url).
wait(500). // forgive the waits, in the real world you would test for the existence of something to tell if it's ready
then( shouldHaveSeenRequest1 ).
then( whenUserClicksLink ).
wait(500).
then( shouldHaveSeenRequest2 ).
then( whenUserClicksLink ).
wait(500).
then( shouldHaveSeenRequest3 ).
run(end);

function log(msg){
	console.log(msg);
}

function init(){
	xhr.init(casper.page /*, root-of-sinon-library*/);

    xhr1 = xhr.fake({ // Simple example, this gets called on page load
		url: /r1/,
		responseBody: firstResponse
    });

    xhr2 = xhr.fake({ // this one gets called after users clicks the link
		url:/r2/,
		responseBody: secondResponse
    });

    xhr2.nthResponse(2, {
		responseBody: thirdResponse
    });
}

function getViewValue (){ // we want to assert on the DOM in this case
	return casper.evaluate(function () {
		return document.getElementById('count').innerHTML;
    });
}

function shouldHaveSeenRequest1(){
	casper.test.assert(getViewValue() == firstResponse, 'First response should have been inserted into the page as text');
	casper.test.assert(xhr1.count() === 1, 'First mock should have only been called once');
	casper.test.assert(xhr2.count() === 0, 'Second mock should not have been called');
}

function whenUserClicksLink(){
	casper.page.sendEvent('click', 10, 10); // You obviously shouldn't hardcode element positions in your tests
}

function shouldHaveSeenRequest2(){
	casper.test.assert(getViewValue() == secondResponse, 'Second response should have been inserted into the page as text');
	casper.test.assert(xhr1.count() === 1, 'First mock should have only been called once');
	casper.test.assert(xhr2.count() === 1, 'Second mock should have only been called once');
}

function shouldHaveSeenRequest3(){
	casper.test.assert(getViewValue() == thirdResponse, 'Third response should have been inserted into the page as text');
	casper.test.assert(xhr1.count() === 1, 'First mock should have only been called once');
	casper.test.assert(xhr2.count() === 2, 'Second mock should have been called twice');
}

function end(){
	console.log('\nFini.');
	phantom.exit();
}

function initPageOnServer(path){
	var server = require('webserver').create();
	var fs = require("fs");
	var html = fs.read(path);
	
	var service = server.listen(1337, function(request, response) {
		response.statusCode = 200;
		
		if(request.url.indexOf('1.js') != -1){
			response.write( JSON.stringify({real:true, request:1}) );
		}
		else if(request.url.indexOf('2.js') != -1){
			response.write( JSON.stringify({real:true, request:2}) );
		}
		else {
			response.write(html);
		}

		response.close();
	});

	return 'http://localhost:1337';
}
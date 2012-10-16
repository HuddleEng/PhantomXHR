var page = require('webpage').create();

phantom.casperPath = 'demo/CasperJs';
phantom.injectJs(phantom.casperPath + '/bin/bootstrap.js');

// Populate global variables
var casper = require('casper').create();
var xhr = require('./phantomxhr.js');

var xhr1, xhr2;
var firstResponse = JSON.stringify({a:1});
var secondResponse = JSON.stringify({a:1, b:2});

casper.
on('remote.message', log).
on('page.initialized', init).
start('demo/testpage.html').
wait(500, step1).
wait(500, step2).
run(end);

function log(msg){
	console.log(msg);
}

function init(){
	xhr.init(casper.page);

    xhr1 = xhr.fake({
		url: /r1/,
		responseBody: firstResponse
    });

    xhr2 = xhr.fake({
		url:/r2/,
		responseBody: secondResponse
    });
}

function getViewValue (){
	return casper.evaluate(function () {
		return document.getElementById('count').innerHTML;
    });
}

function step1(){
	console.log('viewValue',getViewValue());
	if(getViewValue() == firstResponse.length){
		console.log('First response length is correct');
	} else {
		console.log('First response length is wrong');
	}
	
	console.log('XHR count',xhr1.count());
	console.log('XHR last response',xhr1.last());
	casper.page.render('test.png');
	casper.page.sendEvent('click', 10, 10);
}

function step2(){
	console.log(getViewValue());
	if(getViewValue() == secondResponse.length){
		console.log('Second response length is correct');
	} else {
		console.log('Second response length is wrong');
	}

	console.log(xhr2.count());
	console.log(xhr2.last());
}

function end(){
	console.log('\nFini.');
	phantom.exit();
}
var xhr = require('../phantomxhr.js');

var sinonSrc = {
	libraryRoot: './'
};

casper.test.begin('Initial load success', 1, function(test) {
	var fake;
	var initSuccessMessage = 'My random success message';

	casper.
		on('remote.message', function(m){console.log(m);}).
		on('page.initialized', function(){
			xhr.init(casper.page, sinonSrc);
			fake = xhr.fake({
				url: '/api/collection/1234',
				method: 'GET',
				responseBody: {
					successMessage: initSuccessMessage
				}
			});
		}).
		start('./demo/simpleapp.html').
		then(function(){
			casper.waitFor(
				function(){
					return fake.count() === 1;
				}, function (){
					test.assertSelectorHasText('#msg', initSuccessMessage);
				});
		}).
		run(done);
});

casper.test.begin('Initial load failure', 1, function(test) {
	var fake;

	casper.
		on('remote.message', function(m){console.log(m);}).
		on('page.initialized', function(){
			xhr.init(casper.page, sinonSrc);

			fake = xhr.fake({
				url: '/api/collection/1234',
				method: 'GET',
				status: 500
			});
		}).
		start('./demo/simpleapp.html').
		then(function(){
			casper.waitFor(
				function(){
					return fake.count() === 1;
				}, function (){
					test.assertSelectorHasText('#msg', "Generic failure message");
				});
		}).
		run(done);
});

casper.test.begin('POST success', 2, function(test) {
	var fake;
	var myValue = 'something random';

	casper.
		on('remote.message', function(m){console.log(m);}).
		on('page.initialized', function(){
			xhr.init(casper.page, sinonSrc);
		}).
		start('./demo/simpleapp.html').
		then(function(){
			fake = xhr.fake({
				url: '/api/collection/1234',
				method: 'POST'
			});
		}).
		then(function(){
			casper.evaluate(function(value){
				document.getElementById('input').value = value;
			}, myValue);

			casper.click('#button');
		}).
		then(function(){
			casper.waitFor(
				function(){
					return fake.count() === 1;
				}, function (){
					test.assertEquals(JSON.parse(fake.first()), {value: myValue});
					test.assertSelectorHasText('#msg', "Generic POST success message");
				});
		}).
		run(done);
});

casper.test.begin('POST failure', 1, function(test) {
	var fake;

	casper.
		on('page.initialized', function(){
			xhr.init(casper.page, sinonSrc);
		}).
		start('./demo/simpleapp.html').
		then(function(){
			fake = xhr.fake({
				url: '/api/collection/1234',
				method: 'POST',
				status: 500
			});
		}).
		then(function(){
			casper.click('#button');
		}).
		then(function(){
			casper.waitFor(
				function(){
					return fake.count() === 1;
				}, function (){
					test.assertSelectorHasText('#msg', "Generic POST failure message");
				});
		}).
		run(done);
});

casper.test.begin('Multiple POSTs', 1, function(test) {
	var fake;
	var totalClicks = 3;

	casper.
		on('page.initialized', function(){
			xhr.init(casper.page, sinonSrc);
		}).
		start('./demo/simpleapp.html').
		then(function(){
			fake = xhr.fake({
				url: '/api/collection/1234',
				method: 'POST',
				status: 200
			});
		}).
		then(function(){
			var i = 0;
			while ( i++ < totalClicks ){
				casper.click('#button');	
			}
		}).
		then(function(){
			casper.waitFor(
				function(){
					return fake.count() === totalClicks;
				}, function (){
					test.assertEquals(fake.count(), totalClicks);
				});
		}).
		run(done);
});

function done(){
	console.log('...');
	casper.removeAllListeners();
	casper.removeAllFilters();
	casper.test.done();
}

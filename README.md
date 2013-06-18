PhantomXHR
==========

*Test your UI by faking Ajax requests*. An integration of [SinonJS](http://sinonjs.org/)'s mock XHR interface with [PhantomJS](http://github.com/ariya/phantomjs/) and [CasperJS](http://github.com/n1k0/casperjs).

### Why?

PhantomJS & CasperJS provide an excellent framework in which to test Web applications.  Unfortunately, with any complex Web application there is a lot of data setup necessary.  This data setup slows down the running of tests, reducing feedback time.

The PhantomXHR project has been developed to support testing of Ajax powered Web apps. Using SinonJS, PhantomXHR isolates the UI from its server-side API using mocks to simulate server responses. This allows data-setup within the test-suite, substantially faster than creating real data in the database.

PhantomXHR is not about integration testing, it's about testing the UI as a separate concern and should be used alongside other tools to ensure complete test coverage. For more complete UI test suite also consider using [PhantomCSS](/Huddle/PhantomCSS) for CSS regression.

### Example

```javascript

var xhr = require('./modules/phantomxhr.js');

xhr.init(casper.page, './modules');

xhr.fake({
  url: /object\/([0-9]+\?)/,
  responseBody: { /*my response*/ }
});
```

In the above case, if an API call to 'something/object/48546?' is requested by the JS app under test, the app will receive the given mocked response.

Note: Be careful when defining URL matches. Try to keep them specific otherwise you may find that the wrong XHR fake is responding.

### Demo

Please see the [demo](/demo) folder to see an example test suite.

### API

Your fake response will expose the following methods to allow you to make various test assertions.

```javascript
deleteRequest.first(); // get the first requestBody it intercepted
deleteRequest.last(); // get the last requestBody it intercepted
deleteRequest.nthRequest(6); // get the 6th requestBody it intercepted
deleteRequest.count(); // get the number of requests made
```

### Response sequences

A mock will also return some useful methods for changing subsequent responses.  This allows us to test retry user flows; say you want to test that a retry button appears after a 500, trying again and getting a 200 should remove the retry button.

```javascript
var deleteRequest = xhr.fake({
  url: /object\/([0-9]+\?)/,
  method: 'delete',
  status: 500
});

deleteRequest.nthResponse(2,{
  status: 200
});
```

This method will also let you return a different responseBody on a subsequent request.

### Limitations

SinonJS mocks the XHR interface in a particular way, you might have some issues mocking simple XHR calls though jQuery.ajax should work fine.  Cross-domain requests cannot be faked currently.


--------------------------------------

Created by [James Cryer](https://github.com/jamescryer) and the Huddle development team.

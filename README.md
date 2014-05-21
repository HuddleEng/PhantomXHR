PhantomXHR
==========

**Drive UI from faked XHR responses and test your UI in isolation**. [A CasperJS](http://github.com/n1k0/casperjs) module that wraps the XHR faking abilities of [SinonJS](http://sinonjs.org/).

### Why?

The PhantomXHR library has been developed to support testing of Ajax powered Web apps. Using SinonJS, PhantomXHR isolates the UI from its server-side API using stubs and mocking to simulate server responses. This allows test data-setup within the test-suite, substantially faster than creating data in the database.

PhantomXHR is not for integration testing, it's about testing the UI as a separate concern and should be used alongside other tools to ensure complete test coverage.

For more complete UI test suite also consider using [PhantomCSS](http://github.com/Huddle/PhantomCSS) for CSS regression.

### Example

```javascript

var xhr = require('./modules/phantomxhr.js');

xhr.init(casper.page, {
  libraryRoot: './modules'
});

xhr.fake({
  url: /object\/([0-9]+\?)/,
  responseBody: { /*my response*/ }
});
```

In the above case, if an API call to 'something/object/48546?' is requested by the JS app under test, the app will receive the given mocked response.

Note: Be careful when defining URL matches. Try to keep them specific otherwise you may find that the wrong XHR fake is responding.

### How to use

If your not already using CasperJS, first [install CasperJS](http://docs.casperjs.org/en/latest/installation.html) and set up a test for an app that uses Ajax.

To install, try one of these
* `npm install phantomxhr --save-dev`
* `bower install phantomxhr`
* `git clone git://github.com/Huddle/PhantomXHR.git`

Now, in your test, simple require the PhantomXHR module.

`var xhr = require('{yourpath}/phantomxhr.js');`

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

### Hold, progress, respond

```javascript
var uploadRequest = xhr.fake({
  url: /object\/([0-9]+\?)\/upload/,
  method: 'post',
  holdResponse: true
});

// Progress of first
uploadRequest.progress(1, { loaded: 25, total: 100 });

// Complete the first call
uploadRequest.respond( /*optionalResponseOverride*/ );

// uploadRequest.nthProgress(2, { loaded: 25, total: 100 });
// uploadRequest.nthRespond(2, /*optionalResponseOverride*/ );

```

--------------------------------------

Created by [James Cryer](https://github.com/jamescryer) and the Huddle development team.

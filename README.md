**Unmaintained notice**: As of December 22nd 2017 this project will no longer be maintained. Five years ago PhantomXHR offered a new and exciting promise of testing single page applications without implementing dependency injection and Mockist style unit tests. And for Huddle at least, it was a huge success. But like [PhantomCSS, its time to move on](https://github.com/Huddle/PhantomCSS#why-is-this-project-no-longer-maintained).



PhantomXHR
==========

**Control Web UI application flow with fake XHR responses. Test your UI in isolation!**. [A CasperJS](http://github.com/n1k0/casperjs) module that wraps the XHR faking abilities of [SinonJS](http://sinonjs.org/). For testing rich Ajax driven web applications.

### What?

An Ajax driven app can be tested in isolation by mocking or stubbing XHR interactions. Isolated tests are faster and more stable because they are less at risk from faults in external and peripheral dependencies such as server-side logic and network connectivity. PhantomXHR takes full control of the XHR layer, blocking **all** XHR requests to the server and reacting instead with responses defined by the test engineer within the test itself.  PhantomXHR provides the freedom to exercise all code paths, like error handling, paths that would usually be nondeterministic.

![PhantomXHR acts as a facade for XHR interactions](https://raw.github.com/Huddle/PhantomXHR/master/readme_assets/sequence.png "PhantomXHR acts as a facade for XHR interactions")

### Download

* `npm install phantomxhr`
* `bower install phantomxhr`
* `git clone git://github.com/Huddle/PhantomXHR.git

### Demo

* `casperjs test demo/test.js`

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

This method will also let you return a different responseBody on a subsequent request, great for testing uploads.

### Hold, progress, respond

```javascript
var uploadRequest = xhr.fake({
  url: /object\/([0-9]+\?)\/upload/,
  method: 'post',
  holdResponse: true
});

// Progress of first
uploadRequest.progress({ loaded: 25, total: 100 });

// Complete the first call
uploadRequest.respond( /*optionalResponseOverride*/ );

// uploadRequest.nthProgress(2, { loaded: 25, total: 100 });
// uploadRequest.nthRespond(2, /*optionalResponseOverride*/ );

```

--------------------------------------

Created by [James Cryer](https://github.com/jamescryer) and the Huddle development team.

PhantomXHR
==========

Integration of SinonJS's mock XHR interface with PhantomJS

### The good stuff

* [Controlling response sequences](#sequences)
* [Getters for making assertions](#getters)

### Overview

Isolating the UI from the API requires the insertion of mocks to simulate server responses. To setup a mock you must specify a URI to match on and a response.  The URL can either be a string or a regular expression.  The response body (in our case) is a JSON object.

```javascript

var xhr = require('./modules/PhantomXHR/phantomxhr.js');

xhr.fake({
  url: /documents\/([0-9]+\?)/,
  responseBody: { /*my response*/ }
});
```

In the above case, if an API call to 'something/documents/48546?' is made, the JavaScript application will receive the response.  The JS app with then use this fake data to build up the UI.

Note: be careful when defining URL matches, try to keep them specific otherwise you may find that the wrong XHR fake is responding.

### <a name="sequences"></a> Response sequences

Your mock will return an object which exposes some useful methods for changing subsequent responses.  This allows us to test retry user flows; say you want to test that a retry button appears after a 500, trying again and getting a 200 should remove the retry button.

```javascript
var deleteRequest = xhr.fake({
  url: /documents\/([0-9]+\?)/,
  method: 'delete',
  status: 500
});

deleteRequest.nthResponse(2,{
  status: 200
});
```

This method will also let you return a different responseBody on a subsequent request.

### <a name="getters"></a> Getters

Your fake response will expose the following methods to allow you to make all kinds of test assertions.

```javascript
deleteRequest.first(); // get the first requestBody it intercepted
deleteRequest.last(); // get the last requestBody it intercepted
deleteRequest.nthRequest(6); // get the 6th requestBody it intercepted
deleteRequest.count(); // get the number of requests made
```

### Limitations

Cross-domain requests cannot be faked currently.
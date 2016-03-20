'use strict'

describe("XRH request", function() {
  // fake XMLHttpRequest
  var XMLHttpRequest, requests, server;
  beforeEach(function () {
    server = sinon.fakeServer.create();
  });
  afterEach(function () {
    server.restore();
  });

  // create a new instance of the logger
  var openMetrics;
  beforeEach(function() {
    openMetrics = new OpenMetrics('http://test.com');
  });
  afterEach(function() {
    openMetrics.destroy();
    delete window._om;
  });

  it("is been sent", function() {
    openMetrics._get('/v1/setUserId', {uid: '123'});
    expect(server.requests.length).to.be.equal(1);
  });

  it("calls the callback", function(done) {
    server.respondWith("GET", /\/v1\/setUserId(.*)/, [200, {}, 'ok']);
    openMetrics._get('/v1/setUserId', {uid: '123'}, function() {
      done();
    });
    server.respond();
  });

  it("calls the callback with the correct arguments", function(done) {
    server.respondWith("GET", /\/v1\/setUserId(.*)/, [200, {}, 'ok']);
    openMetrics._get('/v1/setUserId', {uid: '123'}, function(e, r) {
      expect(e).to.be.null;
      expect(r).to.be.equal('ok');
      done();
    });
    server.respond();

    server.respondWith("GET", /\/v1\/setUserId(.*)/, [301, {}, '']);
    openMetrics._get('/v1/setUserId', {uid: '123'}, function(e, r) {
      expect(e).to.be.true;
      expect(r).to.be.undefined;
      done();
    });
    server.respond();
  });

  it("is been sent with the correct route and parameters", function() {
    var sessionId = OpenMetrics.docCookies.getItem('_metricId');

    var newUserId = '12342';
    openMetrics._get('/v1/setUserId', {uid: newUserId});
    
    expect(server.requests.length).to.be.equal(1);
    var request = server.requests[0];
    var requestParams = testsUtils.getUrlParams(request.url);

    expect(requestParams.hostname).to.be.equal('test.com');
    expect(requestParams.pathname).to.be.equal('/v1/setUserId');

    expect(requestParams.queryParams.q).to.not.be.undefined;

    var payload = JSON.parse(requestParams.queryParams.q);
    expect(payload.sessionId).to.be.equal(sessionId);
    expect(payload.uid).to.be.equal(newUserId);
  });
});

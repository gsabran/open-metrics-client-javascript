'use strict'

describe("Session properties", function () {
  var openMetrics;

  beforeEach(function() {
    window._om = [];
    openMetrics = new OpenMetrics('http://test.com');
    openMetrics._get = sinon.spy();
  });
  afterEach(function() {
    openMetrics.destroy();
    delete window._om;
  });

  it("are logged with one property", function() {
    openMetrics.setSessionProperties({browser: "Chrome"});
    expect(openMetrics._get.callCount).to.be.equal(1);

    var call = openMetrics._get.getCall(0).args;
    expect(call[0]).to.be.equal('/v1/setSessionProps');
    expect(call[1]).to.be.deep.equal({props: {browser: "Chrome"}});
  });

  it("are logged with several properties", function() {
    openMetrics.setSessionProperties({browser: "Chrome", isMobile: false});
    expect(openMetrics._get.callCount).to.be.equal(1);

    var call = openMetrics._get.getCall(0).args;
    expect(call[0]).to.be.equal('/v1/setSessionProps');
    expect(call[1]).to.be.deep.equal({props: {browser: "Chrome", isMobile: false}});
  });

  it("works with _om", function(done) {
    this.timeout(5000);
    window._om.push(['setSessionProperties', {browser: "Chrome"}]);
    expect(openMetrics._get.callCount).to.be.equal(0);

    setTimeout(function() {
      expect(openMetrics._get.callCount).to.be.equal(1);
      var call = openMetrics._get.getCall(0).args;

      expect(window._om.length).to.be.equal(0);
      expect(call[0]).to.be.equal('/v1/setSessionProps');
      expect(call[1]).to.be.deep.equal({props: {browser: "Chrome"}});
      done();
    }, 2000);
  });
});

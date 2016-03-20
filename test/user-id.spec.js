'use strict'

describe("User identification", function () {
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

  it("is sent", function() {
    openMetrics.setUserId('123');
    expect(openMetrics._get.callCount).to.be.equal(1);

    var call = openMetrics._get.getCall(0).args;
    expect(call[0]).to.be.equal('/v1/setUserId');
    expect(call[1]).to.be.deep.equal({uid: '123'});
  });

  it("works with _om", function(done) {
    this.timeout(5000);
    window._om.push(['setUserId', '123']);
    expect(openMetrics._get.callCount).to.be.equal(0);

    setTimeout(function() {
      expect(openMetrics._get.callCount).to.be.equal(1);
      var call = openMetrics._get.getCall(0).args;

      expect(window._om.length).to.be.equal(0);
      expect(call[0]).to.be.equal('/v1/setUserId');
      expect(call[1]).to.be.deep.equal({uid: '123'});
      done();
    }, 2000);
  });
});

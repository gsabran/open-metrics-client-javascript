'use strict'

describe("Events logging", function () {
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

  it("initializes the queue correctly", function() {
    expect(window._om).to.not.be.undefined;
    expect(window._om.length).to.be.equal(0);
    expect(openMetrics._eventsQueue.length).to.be.equal(0);
  });

  it("logs the first event immefiately", function() {
    openMetrics.logEvent('click');
    expect(openMetrics._get.callCount).to.be.equal(1);
    expect(openMetrics._eventsQueue.length).to.be.equal(0);
  });

  it("doesn't log events too often", function(done) {
    this.timeout(5000);
    openMetrics.logEvent('login');
    expect(openMetrics._get.callCount).to.be.equal(1);

    openMetrics.logEvent('click');
    expect(openMetrics._get.callCount).to.be.equal(1);
    expect(openMetrics._eventsQueue.length).to.be.equal(1);
    setTimeout(function() {
      expect(openMetrics._get.callCount).to.be.equal(2);
      expect(openMetrics._eventsQueue.length).to.be.equal(0);
      done();
    }, 2000)
  });

  it("sends logs as soon as the queue is quite long", function() {
    openMetrics.logEvent('login');
    expect(openMetrics._get.callCount).to.be.equal(1);

    openMetrics.logEvent('click');
    expect(openMetrics._get.callCount).to.be.equal(1);
    openMetrics.logEvent('click');
    openMetrics.logEvent('click');
    openMetrics.logEvent('click');
    expect(openMetrics._get.callCount).to.be.equal(1);
    expect(openMetrics._eventsQueue.length).to.be.equal(4);
    openMetrics.logEvent('click');
    expect(openMetrics._get.callCount).to.be.equal(2);
    expect(openMetrics._eventsQueue.length).to.be.equal(0);
  });

  it("sends logs as soon as the session is over", function() {
    openMetrics.logEvent('login');
    expect(openMetrics._get.callCount).to.be.equal(1);

    openMetrics.logEvent('click');
    expect(openMetrics._get.callCount).to.be.equal(1);

    openMetrics.clearSession();
    expect(openMetrics._get.callCount).to.be.equal(2);
    expect(openMetrics._eventsQueue.length).to.be.equal(0);
  });

  it("gets events from _om", function(done) {
    this.timeout(5000);

    window._om.push(['event', 'click']);
    expect(window._om.length).to.be.equal(1);
    expect(openMetrics._eventsQueue.length).to.be.equal(0);
    expect(openMetrics._get.callCount).to.be.equal(0);

    setTimeout(function() {
      expect(openMetrics._get.callCount).to.be.equal(1);
      expect(window._om.length).to.be.equal(0);
      expect(openMetrics._eventsQueue.length).to.be.equal(0);
      done();
    }, 2000);
  });
});

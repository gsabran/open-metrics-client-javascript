'use strict'

// describe("new browser", function() {
//   it("has no cookies", function() { 
//     var sessionId = decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent('_metricId').replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
//     expect(!!sessionId).to.be.false;
//   })
// });

describe("librairy", function () {
  var openMetrics;

  beforeEach(function() {
    openMetrics = new OpenMetrics('http://test.com');
    openMetrics._get = sinon.spy();
  });
  afterEach(function() {
    openMetrics.destroy();
    delete window._om;
  });

  it("sets a cookie at initialization", function() {
    var sessionId = OpenMetrics.docCookies.getItem('_metricId');
    expect(sessionId).to.not.be.equal(undefined);
  });

  it("keeps the same cookie accross requests", function() {
    var sessionId = OpenMetrics.docCookies.getItem('_metricId');
    openMetrics.logEvent('login');
    expect(OpenMetrics.docCookies.getItem('_metricId')).to.be.equal(sessionId);
  });

  it("creates a different cookie at the end of a session", function() {
    var sessionId = OpenMetrics.docCookies.getItem('_metricId');
    openMetrics.logEvent('login');
    openMetrics.clearSession();
    expect(OpenMetrics.docCookies.getItem('_metricId')).to.not.be.equal(sessionId);
  });
});

'use strict'

describe("Library loading", function () {
  it("works", function () {
    expect(OpenMetrics).to.not.be.undefined;
    expect(window.openMetrics).to.be.undefined;

    var openMetrics = new OpenMetrics('http://test.com');
    expect(openMetrics).to.not.be.undefined;
    expect(openMetrics._eventsQueue.length).to.be.equal(0)

    openMetrics.destroy();
    delete window._om;
  });
});

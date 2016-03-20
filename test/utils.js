testsUtils = {
  getUrlParams: function(href) {
    var parser = document.createElement('a');
    parser.href =href;

    function getQueryVariable(search) {
      if (!search)
        return {};

      var result = {};

      var query = search.substring(1);
      var vars = query.split('&');
      for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        result[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
      }
      return result;
    }

    return {
      protocol: parser.protocol,
      hostname: parser.hostname,
      port: parser.port,
      pathname: parser.pathname,
      search: parser.search,
      hash: parser.hash,
      host: parser.host,
      queryParams: getQueryVariable(parser.search),
    };
  },
};
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
export default {
  name: 'session',
  lookup: function lookup(req, res, options) {
    var found;
    if (options.lookupSession !== undefined && _typeof(req) && options.getSession(req)) {
      found = options.getSession(req)[options.lookupSession];
    }
    return found;
  },
  cacheUserLanguage: function cacheUserLanguage(req, res, lng) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    if (options.lookupSession && req && options.getSession(req)) {
      options.getSession(req)[options.lookupSession] = lng;
    }
  }
};
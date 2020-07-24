talkify = talkify || {};

talkify.generateGuid = function() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === "x" ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

talkify.log = function(){
    if(talkify.config.debug){
        console.log.apply(console, arguments);
    }
}

talkify.toLowerCaseKeys = function(o) {
    var newO, origKey, newKey, value;
    if (o instanceof Array) {
      return o.map(function(value) {
          if (typeof value === "object") {
            value = talkify.toLowerCaseKeys(value);
          }
          return value;
      })
    } else {
      newO = {};
      for (origKey in o) {
        if (o.hasOwnProperty(origKey)) {
          newKey = (origKey.charAt(0).toLowerCase() + origKey.slice(1) || origKey).toString();
          value = o[origKey];
          if (value instanceof Array || (value !== null && value.constructor === Object)) {
            value = talkify.toLowerCaseKeys(value);
          }
          newO[newKey] = value;
        }
      }
    }
    return newO;
  }

function talkifyAjax(application) {

    var get = function (url) {
        var call = new promise.Promise();

        promise
          //  .get(application.appendAppPath(url))
            .get(window.talkifyConfig.host + url)
            .then(function(error, data) {
                try {
                    var jsonObj = JSON.parse(data);
                    call.done(error, jsonObj);
                } catch (e) {
                    call.done(error, data);
                } 

            }); //$http({ method: 'GET', url: application.appendAppPath(url), timeout: canceler });
                
        return call;
    };

    return {
        get: get
    };
}
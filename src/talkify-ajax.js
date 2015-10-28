window.app.service('ajax', ['$http', 'application', function ($http, application) {

    var calls = [];

    var get = function (url) {
        var canceler = new promise.Promise();

        var call = $http({ method: 'GET', url: application.appendAppPath(url), timeout: canceler });
        
        call.key = calls.length + 1;

        calls.push({ call: call, canceler: canceler });
        
        return call;
    };

    var abort = function (call) {
        if (!call) {
            return;
        }

        for (var i = 0; i < calls.length; i++) {
            if (calls[i].call.key === call.key) {
                calls[i].canceler.done();

                break;
            }
        }
    };

    return {
        get: get,
        abort: abort
    };
}]);


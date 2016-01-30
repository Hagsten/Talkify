function Timer() {
    var callback, timerId, start, remaining;

    this.pause = function () {
        window.clearTimeout(timerId);
        remaining -= new Date() - start;
    };

    this.resume = function () {
        start = new Date();
        window.clearTimeout(timerId);
        timerId = window.setTimeout(callback, remaining);
    };

    this.cancel = function () {
        window.clearTimeout(timerId);
        callback = null;
    };

    this.start = function (cb, delay) {
        callback = cb;
        remaining = delay;
        timerId = window.setTimeout(callback, remaining);
    };
}
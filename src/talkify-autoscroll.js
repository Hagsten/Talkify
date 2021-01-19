talkify = talkify || {};

talkify.autoScroll = function () {
    function activate() {
        talkify.messageHub.unsubscribe("autoscroll", "*.player.*.loaded");

        talkify.messageHub.subscribe("autoscroll", "*.player.*.loaded", function (item) {
            var y = item.element.getBoundingClientRect().top + window.pageYOffset + talkify.config.autoScroll.offsetpx;

            window.scrollTo({ top: y, behavior: 'smooth' });
        });
    }

    return {
        activate: activate
    }
}();

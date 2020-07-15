talkify = talkify || {};
talkify.controlcenters = talkify.controlcenters || {};

talkify.controlcenters.local = function () {
    this.html =
        '<div class="talkify-control-center local">\
            <div>\
                <button class="talkify-play-button" title="Listen to text">\
                    <i class="fas fa-volume-up"></i>\
                    <span>Listen</span>\
                </button>\
                <button class="talkify-pause-button" title="Pause">\
                    <i class="fas fa-pause"></i>\
                </button>\
                <div class="talkify-audio-loading">\
                </div>\
                <button class="talkify-cc-button"   title="Toggle text highlighting">\
                    <i class="fa fa-closed-captioning"></i>\
                </button>\
                <div class="by-talkify">Talkify TTS</div>\
            </div>\
        </div>';
};
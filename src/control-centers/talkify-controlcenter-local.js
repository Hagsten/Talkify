talkify = talkify || {};
talkify.controlcenters = talkify.controlcenters || {};

talkify.controlcenters.local = function () {
    this.html =
        '<div class="talkify-control-center local">\
            <div>\
                <div class="talkify-brand">T</i></div>\
                <button class="talkify-step-backward-button" title="Previous">\
                    <i class="fa fa-step-backward"></i>\
                </button>\
                <button class="talkify-play-button" title="Listen to text">\
                    <i class="fas fa-play"></i>\
                </button>\
                <div class="talkify-audio-loading">\
                    <i class="fas fa-dharmachakra fa-spin"></i>\
                </div>\
                <button class="talkify-pause-button" title="Pause">\
                    <i class="fas fa-pause"></i>\
                </button>\
                <button class="talkify-audio-error" title="An error occurred at playback"><i class="fas fa-exclamation-triangle"></i></button>\
                <button class="talkify-step-forward-button" title="Next">\
                    <i class="fa fa-step-forward"></i>\
                </button>\
                <button class="talkify-cc-button" title="Toggle text highlighting">\
                    <i class="fa fa-closed-captioning"></i>\
                </button>\
                <button class="talkify-text-interaction-button" title="Toggle text interaction">\
                    <i class="fas fa-hand-point-up"></i>\
                </button>\
                <button class="talkify-enhanced-visibility-button" title="Toggle enhanced visibility">\
                    <i class="fas fa-eye"></i>\
                </button>\
                <button class="talkify-download-button" title="Download">\
                    <i class="fas fa-download"></i>\
                </button>\
                <div class="talkify-download-loading">\
                    <i class="fas fa-dharmachakra fa-spin"></i>\
                </div>\
                <div class="talkify-download-error">\
                    <i class="fas fa-exclamation-triangle"></i>\
                </div>\
                <button title="More settings">\
                    <label for="talkify-local-settings"><i class="fas fa-cog"></i></label>\
                </button>\
            </div>\
            <input type="checkbox" style="display:none;" id="talkify-local-settings"/>\
            <div class="talkify-columns talkify-more-settings">\
                <div title="Adjust playback volume">\
                    <i class="fas fa-volume-up"></i>\
                    <div class="volume-slider talkify-volume-button">\
                        <input type="range" value="10" min="0" max="10">\
                    </div>\
                </div>\
                <div title="Adjust playback rate">\
                    <i class="fa fa-tachometer-alt"></i>\
                    <div class="rate-slider talkify-rate-button">\
                        <input type="range" value="5" min="0" max="10">\
                    </div>\
                </div>\
            </div>\
        </div>';
};
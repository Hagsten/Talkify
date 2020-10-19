talkify = talkify || {};
talkify.controlcenters = talkify.controlcenters || {};

talkify.controlcenters.modern = function (parent, correlationId) {

    this.html = '<div class="talkify-control-center modern attached"> \
    <progress value="0" max="1.0"></progress>\
    <ul class="player-controls">\
        <li style="display: flex; justify-content: center;">\
            <button data-type="drag" class="talkify-detached talkify-drag-area" title="Drag player">\
                <i class="fa fa-grip-horizontal"></i>\
            </button>\
            <button class="talkify-attached talkify-detatch-handle" title="Detatch player">\
                <i class="fa fa-window-maximize"></i>\
            </button>\
            <div class="player-settings">\
                <button>\
                    <label for="player-settings-toggle" title="More settings">\
                        <i class="fas fa-ellipsis-h"></i>\
                    </label>\
                </button>\
                <input type="checkbox" id="player-settings-toggle" style="display: none;" />\
                <ul>\
                    <li>\
                        <button class="modern-talkify-control-center-accent" title="Playback mode">\
                            <i class="fas fa-music"></i>\
                        </button>\
                        <select class="talkify-phonation-element">\
                            <option id="talkify-phonation-normal" value="normal">Normal tone</option>\
                            <option id="talkify-phonation-soft" value="soft">Softer tone</option>\
                            <option id="talkify-phonation-whisper" value="whisper">Whisper</option>\
                        </select>\
                    </li>\
                    <li class="talkify-wordbreak-element">\
                        <button class="modern-talkify-control-center-accent" title="Word break">\
                            <i class="fas fa-arrows-alt-h"></i>\
                        </button>\
                        <div>\
                            <input type="range" value="0" min="0" max="3000" title="Adjust pause between words">\
                        </div>\
                    </li>\
                    <li class="talkify-pitch-element">\
                        <button class="modern-talkify-control-center-accent" title="Adjust pitch">\
                            <i class="fas fa-arrows-alt-h pitch-icon"></i>\
                        </button>\
                        <div>\
                            <input type="range" value="0" min="-7" max="7" title="Adjust pitch">\
                        </div>\
                    </li>\
                    <li class="talkify-cc-button">\
                        <button class="modern-talkify-control-center-accent"\
                            title="Toggle text highlighting">\
                            <i class="fa fa-closed-captioning"></i>\
                        </button>\
                        <div>Text highlighting</div>\
                    </li>\
                    <li class="talkify-text-interaction-button">\
                        <button class="modern-talkify-control-center-accent" title="Toggle text interaction">\
                            <i class="fas fa-hand-point-up"></i>\
                        </button>\
                        <div>Text interaction</div>\
                    </li>\
                    <li class="talkify-enhanced-visibility-button">\
                        <button class="modern-talkify-control-center-accent" title="Toggle enhanced visibility">\
                            <i class="fas fa-eye"></i>\
                        </button>\
                        <div>Enhanced visibility</div>\
                    </li>\
                    <li class="talkify-detached talkify-rate-button">\
                        <button class="modern-talkify-control-center-accent" title="Adjust playback rate">\
                            <i class="fas fa-tachometer-alt"></i>\
                        </button>\
                        <div>\
                            <input type="range" value="5" min="0" max="10" title="Adjust playback rate">\
                        </div>\
                    </li>\
                    <li class="talkify-detached talkify-volume-button">\
                        <button class="modern-talkify-control-center-accent" title="Adjust playback volume">\
                            <i class="fas fa-volume-up"></i>\
                        </button>\
                        <div class="detached-volume-slider">\
                            <input type="range" value="10" min="0" max="10" title="Adjust playback volume">\
                        </div>\
                    </li>\
                    <li class="talkify-download-button mobile">\
                        <button title="Download" class="modern-talkify-control-center-accent">\
                            <i class="fas fa-download"></i>\
                        </button>\
                        <div>Download</div>\
                    </li>\
                    <li class="talkify-detached talkify-attach-handle">\
                        <button class="modern-talkify-control-center-accent" title="Attach player">\
                            <i class="fa fa-window-minimize"></i>\
                        </button>\
                        <div>Dock player</div>\
                    </li>\
                </ul>\
            </div>\
        </li>\
        <li class="talkify-playback-controls">\
            <button class="talkify-rate-button talkify-attached" title="Rate of speech">\
                <i class="fa fa-tachometer-alt"></i>\
                <div class="rate-slider">\
                    <input type="range" value="5" min="0" max="10" title="Adjust playback rate">\
                </div>\
            </button>\
            <button class="talkify-step-backward-button" title="Previous">\
                <i class="fa fa-step-backward"></i>\
            </button>\
            <button class="talkify-play-button" title="Play">\
                <i class="fa fa-play"></i>\
            </button>\
            <button class="talkify-audio-loading"></button>\
            <button class="talkify-pause-button" title="Pause">\
                    <i class="fa fa-pause"></i>\
            </button>\
            <button class="talkify-audio-error" title="An error occurred at playback"><i class="fas fa-exclamation-triangle"></i></button>\
            <button class="talkify-step-forward-button" title="Next">\
                <i class="fa fa-step-forward"></i>\
            </button>\
            <button class="talkify-volume-button talkify-attached" title=" Volume">\
                <i class="fa fa-volume-up"></i>\
                <div class="volume-slider">\
                    <input type="range" value="10" min="0" max="10" title="Adjust playback volume">\
                </div>\
            </button>\
            <button class="talkify-download-button desktop" title="Download">\
                    <i class="fas fa-download"></i>\
            </button>\
            <div class="talkify-download-loading desktop">\
                <i class="fas fa-dharmachakra fa-spin"></i>\
            </div>\
            <div class="talkify-download-error desktop">\
                <i class="fas fa-exclamation-triangle"></i>\
            </div>\
        <li class="talkify-attached">\
            <div class="talkify-voice-selector ">\
                <label for="voice-selector-toggle">\
                <img class="talkify-selected-voice-flag talkify-flag talkify-hidden" src="">\
                <span></span>\
                </label><input type="checkbox" id="voice-selector-toggle" style="display: none;" />\
            </div>\
        </li>\
    </ul>\
</div>';
}
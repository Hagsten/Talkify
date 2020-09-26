talkify = talkify || {};
talkify.controlcenters = talkify.controlcenters || {};

talkify.controlcenters.classic = function () {
    this.html = '<div class="talkify-control-center classic attached">\
        <ul>  \
        <li class="talkify-drag-area talkify-detached">  \
        <i class="fa fa-grip-horizontal"></i>  \
        </li>  \
        <li>  \
        <button class="talkify-play-button talkify-disabled" title="Play">  \
        <i class="fa fa-play"></i>  \
        </button>  \
        <button class="talkify-pause-button talkify-disabled" title="Pause">  \
        <i class="fa fa-pause"></i>  \
        </button>  \
        <i class="fa fa-circle-notch fa-spin talkify-audio-loading"></i> \
        <i class="fas fa-exclamation-triangle talkify-audio-error" title="An error occurred at playback"></i> \
        </li>  \
        <li class="progress-wrapper">  \
        <progress value="0.0" max="1.0"></progress>  \
       <span class="talkify-time-element"> 00:00 / 00:00 </span> \
        </li>  \
        <li>  \
        <button class="talkify-volume-button" title="Volume">  \
        <i class="fa fa-volume-up"></i>  \
        <div class="volume-slider">  \
        <input type="range" value="10" min="0" max="10" title="Adjust playback volume">  \
        </div>  \
        </button></li>  \
       <li>  \
       <button class="talkify-rate-button" title="Rate of speech">  \
       <i class="fa fa-tachometer-alt"></i>  \
        <div class="rate-slider">  \
       <input type="range" value="10" min="0" max="10" title="Adjust playback rate">  \
       </div>  \
        </button>  \
        </li>  \
        <li>  \
        <button class="talkify-cc-button" title="Enable/disable text highlighting">  \
       <i class="fa fa-closed-captioning"></i>  \
       </button>  \
       </li>\
       <li>\
            <button class="talkify-enhanced-visibility-button" title="Toggle enhanced visibility">\
                <i class="fas fa-eye"></i>\
            </button>\
        </li>\
        <li>  \
        <button class="talkify-detached talkify-attach-handle" title="Dock player to screen">  \
        <i class="fa fa-window-minimize"></i>  \
        </button>  \
        <button class="talkify-attached talkify-detatch-handle" title="Detach player">  \
       <i class="fa fa-window-maximize"></i>  \
       </button>  \
       </li> \
       <li class="talkify-voice-selector"> \
       <label for="voice-selector-toggle"> \
        Voice: <span></span> \
       </label><input type="checkbox" id="voice-selector-toggle" style="display: none;"/>; \
           </li> \
           </ul></div>';

}
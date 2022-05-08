# Talkify
A javascript text to speech (TTS) library. Originally from and used by https://talkify.net.

Give a voice to your website in a matter of minutes. Talkify library provides you with high quality text to speech (TTS) voices in many languages.

To use our backend services (our hosted voices) you will require an api-key. Visit our portal (https://manage.talkify.net) to create your own API-key, Talkify offers 1000 free requests per month. 

* [Install](#installation)
* [Dependencies](#dependencies)
* [Usage](#usage)
* [Features](#features)
* [SSML](#ssml)
* [Configuration](#configuration)
* [API](#api)
    * [Playlist](#playlist-fluent-builder)
    * [Players](#player-valid-for-all-players)
    * [Form reader](#formreader)
    * [Text selection reader](#text-selection-reader)
* [Events](#pubsub-events)

## Installation
```
$ bower install talkify
```

or

```
$ npm install talkify-tts
```

# Dependencies
Font Awesome 5+ (Used in Talkify Control Center)

# Usage

## Quick demos
- Web Reader http://jsfiddle.net/5atrbjc6/
- Form Reader http://jsfiddle.net/dx53bg6k/2/ 
- Text selection Reader http://jsfiddle.net/t5dbcL64/
- Enhanced text visibility http://jsfiddle.net/pwbqkzxj/2/

## Include the scripts and stylesheets
### Minified version
```html
<script src="talkify.min.js"></script>
```
### Non-minified version
```html
<script src="talkify.js"></script>
```

### Stylesheets
You find our stylesheets under /styles folder. Include the stylesheets that you need (i.e. all under /modern-control-center for our "modern" UI).

## Play all, top to bottom
```javascript		
    var player = new talkify.TtsPlayer().enableTextHighlighting();

    var playlist = new talkify.playlist()
        .begin()
        .usingPlayer(player)
        .withTextInteraction()
        .withElements(document.querySelectorAll('p')) //<--Any element you'd like. Leave blank to let Talkify make a good guess
        .build();
    
    playlist.play();
```

## Play simple text

```javascript
var player = new talkify.TtsPlayer(); //or new talkify.Html5Player()
player.playText('Hello world');
```

# Features
- High qualiy voices (https://manage.talkify.net/docs#voices)
- Supported languages:
    - English
    - Chinese
    - Swedish
    - German
    - Korean
    - Japanese
    - Spanish
    - French
    - Italian
    - Norweigean
    - Danish
    - Arabic
    - Russian
    - Dutch
    - Polish
    - Turkish
    - Icelandic
    - Portuguese
    - Romanian
    - Welsh
    - Ukranian
    - Slovak
    - Bulgarian
    - Czech
    - Greek
    - Finnish
    - Hebrew
    - Hindi
    - Croatian
    - Hungarian
    - Indonesian
    - Malay
    - Slovenian
    - Tamil
    - Telugu
    - Thai
    - Vietnamese
    - And more!
  
- Text highligting for easy read along
- Control pitch, pauses between words, volume, speech rate, phonation and much more 
- Download as mp3
- Playback of entire website or paragraph/s of your choice
- Fully integrated UI options
- Read web forms aloud
- Listen to selected text
- Enhanced visibility features

## SSML
```javascript
talkify.config.useSsml = true;
```

When useSSML is active, Talkify will translate the following markup into SSML. This has the potential of creating a smoother voice experience.

| HTML tags | SSML |
|----------|:------ |
| h1 - h3 | emphasis strong |
| b | emphasis strong |
| strong | emphasis strong |
| i | emphasis reduced |
| em | emphasis strong |
| br | break-strength strong |

## Declarative settings
These settings are only supported by the TtsPlayer for now.

Talkify supports declarative settings. These settings will override general settings. The following attributes can be added to any element that Talkify is connected to. When these attributes are present, Talkify will use them as playback settings.

| data-attribute | Accepted values | Example | Remarks |
|----------|:------ |:-------|:-------|
| data-talkify-wordbreakms | [0, 10000] | data-talkify-wordbreakms="100" ||
| data-talkify-pitch | [-5, 5] | data-talkify-pitch="-2" ||
| data-talkify-rate | [-10, 10] | data-talkify-rate="-2" ||
| data-talkify-voice | Any authorized voice | data-talkify-voice="David" ||
| data-talkify-phonation | "soft", "normal" or "" | data-talkify-phonation="soft" ||
| data-talkify-whisper | "true" or "false" | data-talkify-whisper="true" ||
| data-talkify-whisper | "true" or "false" | data-talkify-whisper="true" ||
| data-talkify-read-as-lowercase | "true" | data-talkify-read-as-lowercase="true"| Some voices spell out capital letters, which might be unwanted, this setting will read the content of the element as lower case |

# Configuration
```javascript
talkify.config = {
    debug: false, //true to turn on debug print outs
    useSsml: false, //true to turn on automatic HTML to SSML translation. This should give a smoother reading voice (https://en.wikipedia.org/wiki/Speech_Synthesis_Markup_Language)
    maximumTextLength: 5000, //texts exceeding this limit will be splitted into multiple requests
    remoteService: {
        host : 'https://talkify.net',
        apiKey = 'your-api-key',
        active: true //True to use Talkifys language engine and hosted voices. False only works for Html5Player.
    },
    ui:
    {
        audioControls: { //disable to provide your own player or use Talkify headless.
            enabled: true,
            controlcenter: "modern", //["modern", "classic", "local", "native"]
            container: document.body,
            voicepicker: {
                enabled: true, //Applicable on modern and classic control centers
                filter: {
                    byClass: [], //Not applicable for Html5Player,  example: ["Standard", "Premium", "Exclusive", "Neural"]
                    byCulture: [], //example: ["en-EN", "en-AU"]
                    byLanguage: [] //Not applicable for Html5Player, example: ["English", "Spanish"]
                }
            }
        }
    },
    keyboardCommands: { //Ctrl + command
        enabled: false,
        commands: { // Configure your own keys for the supported commands
            playPause: 32,
            next: 39,
            previous: 37
        }
    },
    voiceCommands: {
        enabled: false,
        keyboardActivation: { //Ctrl + command
            enabled: true,
            key: 77
        },
        commands: { // Configure your own phrases for the supported commands
            playPause: ["play", "pause", "stop", "start"],
            next: ["play next", "next"],
            previous: ["play previous", "previous", "back", "go back"]
        }
    },
    formReader: {
        voice: null, //TTS voice name if remote service otherwise Web Speech API voice object
        rate: 0, //See possible values for each tyoe of player down below
        remoteService: true,
        //Below is the default texts for the form.
        requiredText: "This field is required",
        valueText: "You have entered {value} as: {label}.",
        selectedText: "You have selected {label}.",
        notSelectedText: "{label} is not selected."
    },
    autoScroll: {
        offsetpx: 100 //number of pixels offset from window top
    }
}
```

# API
[WebReader demo](http://jsfiddle.net/5atrbjc6/)

Talkify lives in its own namespace - talkify. Hence, everything below is scoped to that namespace (i.e. talkify.playlist, etc).

## Auto scroll
Talkify provides an opt in auto scroll to the item to be played. 

Activate the feature by calling talkify.autoScroll.activate()

| Method   | 
| activate |

## Playlist fluent builder
Playlist builder is Talkifys way to instantiate your playlist. It comes with a fluent API.	

Entry point: talkify.playlist()

| Method   | Parameters | Default |      Description      |  Mandatory |
|----------|:------ |:------|:-------------|------:|
| begin |  | |  Entry point. Call this to start building your playlist | Yes |
| usingPlayer | TtsPlayer/Html5Player  | |   Specify which player to be used. |   Yes |
| withTextInteraction | | | Enables you to click on paragraphs (and other text) to play |    No |
| withElements | DOM elements | | Specifies with elements to play. If omitted, Talkify will crawl the page and select for you |    No |
| excludeElements | Array of DOM-elements | [] | For example: document.querySelectorAll("button") | No |
| withTables | Table configuration, array of objects* | | Reads tables in a more intuitive way. The relevant header is repeated before each cell | No |
| withRootSelector | string | 'body' | Sets the scope from where Talkify will start to crawl the page for text to play |    No |
| subscribeTo | Json object | | Event subscriptions |    No |
| build | | | Finalizes and creates the playlist instance |    Yes |

*withTables parameter is an array of objects with the following properties: 
- table (DOM-query selector or actual DOM-elements)
- headerCells (Optional. DOM-query selector or actual DOM-elements. Defaults to "th")
- bodyCells (Optional. DOM-query selector or actual DOM-elements. Defaults to "td")

withTables works with any standard HTML-table and other non-standard tabular content (for example bootstrap grid system). For non standard tabular content, please use the optional parameters to tell Talkify which elements are header cells and which are body cells.

## Playlist
This is the instance built from the playliste above.

| Method   | Parameters | Default |      Description      |
|----------|:------ |:------|:-------------|
| getQueue | | | Returns the playlist queue |
| play | | | Begins playback of playlist |
| pause | | | Pauses playlist |
| replayCurrent | | | Replays the current item in the playlist |
| insert | DOM element | | Inserts new html elements to play. Useful for elements that Talkify were unable to locate. Elements will be inserted in correct order with respect to the page. |
| isPlaying | | | True if any item is currently in a playing state |
| setPlayer | TtsPlayer/Html5Player | | Sets the player that the playlist is using |
| enableTextInteraction | | | Enables click to play on HTML elements |
| disableTextInteraction | | | Disables click to play on HTML elements |
| dispose | | | Clean up |

### Playlist Events
| Event   |
|---------|
| onEnded |
| onVoiceCommandListeningStarted |
| onVoiceCommandListeningEnded |

## Player (valid for all players)
| Method   | Parameters | Default |      Description      |
|----------|:------ |:------|:-------------|
| enableTextHighlighting | | | Tells the player to use text highlighting. For Html5Player this only works on localVoice. |
| disableTextHighlighting | | | Turns off text highlighting. |
| subscribeTo | Json object | | Event listeners |
| playText | string | | Plays a text |
| paused | | | True if paused |
| isPlaying | | | True if playing |
| play | | | Play |
| pause | | | Pause |
| forceVoice | object | | For Talkify hosted voices, this is a JSON object with a name property. The value of name should be the name of a voice from /api/speech/v1/voices. For browser voices, this is the actual voice from window.speechSynthesis.getVoices() |
| enableEnhancedTextVisibility | | | Enables enhanced text visibility. Subtitle-bar, with a larger font-size, is added to the bottom of the screen. [Demo](http://jsfiddle.net/pwbqkzxj/2/) |
| disableEnhancedTextVisibility | | | Disables enhanced text visibility |

### Html5Player only
Entry point: talkify.Html5Player().

| Method   | Parameters | Default |      Description      |
|----------|:------ |:------|:-------------|
| forceLanguage | string | | Force the usage of a specific language. Use standard cultures like se-SE for Swedish and so on. Talkify will select a voice that matches the culture. |
| setRate | double | 1 | [0.0, 2.0] Playback rate. |
| setVolume | double | 1 | [0.0 - 1.0 ] |
| usePitch | double | 1 | [0.0, 2.0] Adjusts the pitch of the voice. |

### Talkify hosted only
Entry point: talkify.TtsPlayer(options?).

constructor parameter "options" is optional.  Example { controlcenter: { container: document.querySelector('p.selector') , name: 'modern' }}

| Method   | Parameters | Default |      Description      |
|----------|:------ |:------|:-------------|
| setRate | int | 1 | Playback rate. A value between -5 and 5 |
| whisper | | | Sets the player to whispering mode |
| normalTone | | | Sets the player to normal mode (opposite of whispering) |
| usePhonation | string | normal | Supports for two phonations. "soft" and "normal". Empty string translates to "normal". Case sensitive |
| useWordBreak | int | 0 | [0-10000] Adds a break between each word. Any value above 0 adds to the voices standard break length. |
| usePitch | int | 0 | [-10 - +10] Adjusts the pitch of the voice. |
| useVolumeBaseline | double | 0 | [-10 - +10] Adjusts the volume baseline |

### Player Events
| Event   |
|---------|
| onBeforeItemPlaying |
| onSentenceComplete |
| onPause |
| onPlay | 
| onResume |  
| onItemLoaded |
| onTextHighligtChanged |

## FormReader
[Demo](http://jsfiddle.net/dx53bg6k/2/ )

Example: talkify.formReader.addForm(document.getElementById("form-id"));

| Method   | Parameters | Default |      Description      |
|----------|:------ |:------|:-------------|
| addForm   | form element | None |   Adds TTS functionality to the form.         |
| removeForm   | form element | None |  Unbinds all TTS functionality from the form         |

## Text selection reader
[Demo](http://jsfiddle.net/t5dbcL64/)

This feature allows the user to select/mark text using the mouse and have that text read aloud.

Example: 

```javascript
    talkify.selectionActivator
        .withTextHighlighting()
        .withEnhancedVisibility()
        .activate();
```

| Method   | Parameters | Default |      Description      |
|----------|:------ |:------|:-------------|
| activate | - | - | Call this method to actiate the feature  |
| deactivate | - | - | Call this method to deactivate the feature   |
| withTextHighlighting | - | - | Presets text highlighting to activated. Users can turn this off in the control center UI |
| withEnhancedVisibility | - | - | Presets enhanced visibility to activated. Users can turn this off in the control center UI |
| withVoice | voice object | { name: 'Zira' } |  A voice object from our backend voice API or at the very least an object wih a name property including a valid voice name  |
| withButtonText | string | "Listen" | The text that appears on popover button  |
| excludeElements | Array of DOM-elements | [] | For example: document.querySelectorAll("button") |

## React to events
TLDR; Example @ http://jsfiddle.net/andreas_hagsten/x6pve0jd/8/

Talkify provides two event models - PubSub and classic callbacks. The newest, and primary, model is the PubSub model. PubSub is a loosly coupled model which enables client applications to hook in to the Talkify pipeline. To subscribe to events you will need to pass a context key (used when unsubscribing) as well as the event type and the event handler function. The event type is a string containing topics. An event is normally divided into 4 topics - context, origin, type and action.

### The Context topic
You would use this top level topic if you run multiple instances of Talkify. This allows you to hook into a specific Talkify instance. If you want to listen to all instances or only have one just specify "*". You will find the context ID in the property "correlationId" of your Player instance.

### The Origin topic
Where the event originates from. For example "player" or "controlcenter". A common use case is to listen to player events which is done by specifying "player" in this topic section.

### The type topic
Type of event. For example "tts" for TTS-based events. 

### The action topic
This is the topic that describes what action is taken. This can be "play", "loading", "pause" and so forth.

Putting all 4 topics together forms the event type to listen to. You can replace any part with the wildcard "*" which means that you listens to all events of the given topic.

A few examples can be seen below. A full list of events supported is listed [Here](#PubSub-events).

```javascript
talkify.messageHub.subscribe("[key]", "*", function () {}); //all events
talkify.messageHub.subscribe("[key]", "*.player.tts.play", function () {}); //play events from TtsPlayer
talkify.messageHub.subscribe("[key]", "*.player.tts.*", function () {}) //all events from TtsPlayer
talkify.messageHub.subscribe("[key]", "*.player.*.play", function () {}) //Play events from all player types
```

## PubSub events
| Type | args (TBD) |
|----------|:------ |
| {contextId}.player.tts.ratechanged |  |
| {contextId}.player.tts.seeked |  |
| {contextId}.player.tts.pause |  |
| {contextId}.player.tts.timeupdated |  |
| {contextId}.player.tts.play |  |
| {contextId}.player.tts.resume |  |
| {contextId}.player.tts.loading |  |
| {contextId}.player.tts.loaded |  |
| {contextId}.player.tts.ended |  |
| {contextId}.player.tts.voiceset |  |
| {contextId}.player.tts.texthighlight.enabled |  |
| {contextId}.player.tts.texthighlight.disabled |  |
| {contextId}.player.tts.prepareplay |  |
| {contextId}.player.tts.disposed |  |
| {contextId}.player.tts.error |  |
| {contextId}.player.tts.phonationchanged |  |
| {contextId}.player.tts.whisperchanged |  |
| {contextId}.player.tts.wordbreakchanged |  |
| {contextId}.player.tts.volumechanged |  |
| {contextId}.player.tts.pitchchanged |  |
| {contextId}.player.tts.created |  |
| {contextId}.player.tts.unplayable |  |
| {contextId}.player.tts.enhancedvisibilityset | |
| {contextId}.player.tts.creating | |
| - | - |
| {contextId}.player.html5.ratechanged |  |
| {contextId}.player.html5.pause |  |
| {contextId}.player.html5.utterancecomplete |  |
| {contextId}.player.html5.ended |  |
| {contextId}.player.html5.loaded |  |
| {contextId}.player.html5.play |  |
| {contextId}.player.html5.timeupdated |  |
| {contextId}.player.html5.voiceset |  |
| {contextId}.player.html5.texthighlight.enabled |  |
| {contextId}.player.html5.texthighlight.disabled |  |
| {contextId}.player.html5.prepareplay |  |
| {contextId}.player.html5.created |  |
| {contextId}.player.html5.unplayable |  |
| {contextId}.player.html5.enhancedvisibilityset | |
| {contextId}.player.html5.creating | |
| - | - |
| {contextId}.controlcenter.request.play |  |
| {contextId}.controlcenter.request.pause |  |
| {contextId}.controlcenter.request.rate |  |
| {contextId}.controlcenter.request.volume |  |
| {contextId}.controlcenter.request.pitch |  |
| {contextId}.controlcenter.request.wordbreak |  |
| {contextId}.controlcenter.request.phonation.normal |  |
| {contextId}.controlcenter.request.phonation.soft |  |
| {contextId}.controlcenter.request.phonation.whisper |  |
| {contextId}.controlcenter.request.texthighlightoggled |  |
| {contextId}.controlcenter.request.textinteractiontoggled |  |
| {contextId}.controlcenter.request.enhancedvisibility | |
| {contextId}.controlcenter.attached | |
| {contextId}.controlcenter.detached | |
| - | - |
| {contextId}.wordhighlighter.complete |  |
| - | - |
| {contextId}.playlist.playing |  |
| {contextId}.playlist.loaded |  |
| {contextId}.playlist.textinteraction.enabled |  |
| {contextId}.playlist.textinteraction.disabled |  |
# License
GPLv3

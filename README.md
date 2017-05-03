# Talkify
A javascript text to speech (TTS) library. Originally from and used by http://talkify.net.

Give a voice to your website in a matter of minutes. Talkify library provides you with high quality text to speech (TTS) voices in many languages.

## Installation
```
$ bower install talkify
```

or

```
$ npm install talkify-tts
```

# Dependencies
- None

# Usage

## Working fiddle
http://jsfiddle.net/woqw6b6g/48/

## Include the scripts
### Minified version
```html
<script src="talkify.min.js"></script>
```
### Non-minified version
```html
<script src="talkify.js"></script>
```

## Play all, top to bottom
```javascript		
    var player = new talkify.TtsPlayer().enableTextHighlighting();

    new talkify.playlist()
        .begin()
        .usingPlayer(player)
        .withTextInteraction()
        .withElements($('p')) //<--Any element you'd like. Leave blank to let Talkify make a good guess
        .build() //<-- Returns an instance.
        .play();
```

## Play simple text

```javascript
var player = new talkify.TtsPlayer(); //or new talkify.Html5Player()
player.playText('Hello world');
```

# Features

- High qualiy voices
- Light weight (15-25Kb minified)
- Multi lingual with built in language detection (i.e. if the text is in english, an english voice is used). Supported languages:
  - English
  - Spanish
  - French
  - Chinese
  - Japanese
  - Korean
  - Swedish
  - German
- Text highligting for easy read along
- Download as mp3
- Playback of entire website or paragraph/s of your choice

# Configuration
```javascript
talkify.config = {
    host: 'http://talkify.net', //Host of streamed audio media.
    ui:
    {
        audioControls: { //If enabled, replaces the built in audio controls. Especially good for the Web Speech API bits
            enabled: false,
            container: document.body
        }
    }
}
```

# API
Talkify lives in its own namespace - talkify. Hence, everything below is scoped to that namespace (i.e. talkify.playlist, etc).
## Playlist fluent builder
Playlist builder is Talkifys way to instantiate your playlist. It comes with a fluent API.	

Entry point: talkify.playlist()

| Method   | Parameters | Default |      Description      |  Mandatory |
|----------|:------ |:------|:-------------|------:|
| begin |  | |  Entry point. Call this to start building your playlist | Yes |
| usingPlayer | TtsPlayer/Html5Player  | |   Specify which player to be used. |   Yes |
| withTextInteraction | | | Enables you to click on paragraphs (and other text) to play |    No |
| withElements | jQuery element | | Specifies with elements to play. If omitted, Talkify will crawl the page and select for you |    No |
| withRootSelector | string | 'body' | Sets the scope from where Talkify will start to crawl the page for text to play |    No |
| subscribeTo | Json object | | Event subscriptions |    No |
| build | | | Finalizes and creates the playlist instance |    Yes |

## Playlist
This is the instance built from the playliste above.

| Method   | Parameters | Default |      Description      |
|----------|:------ |:------|:-------------|
| getQueue | | | Returns the playlist queue |
| play | | | Begins playback of playlist |
| pause | | | Pauses playlist |
| replayCurrent | | | Replays the current item in the playlist |
| insert | jQuery element | | Inserts new html elements to play. Useful for elements that Talkify were unable to locate. Elements will be inserted in correct order with respect to the page. |
| isPlaying | | | True if any item is currently in a playing state |
| setPlayer | TtsPlayer/Html5Player | | Sets the player that the playlist is using |
| enableTextInteraction | | | Enables click to play on HTML elements |
| disableTextInteraction | | | Disables click to play on HTML elements |
| dispose | | | Clean up |

### Playlist Events
| Event   |
|---------|
| onEnded |

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
| forceVoice | object | | For Talkify hosted voices, this is a JSON object with a name property. The value of name should be the name of a voice from /api/Voices. For browser voices, this is the actual voice from window.speechSynthesis.getVoices() |

### Html5Player only
Entry point: talkify.Html5Player().

| Method   | Parameters | Default |      Description      |
|----------|:------ |:------|:-------------|
| forceLanguage | string | | Force the usage of a specific language. Use standard cultures like se-SE for Swedish and so on. Talkify will select a voice that matches the culture. |
| setRate | double | 1 | Playback rate. A value between 0.0 - 2.0 |
| setVolume | double | 1 | Volume. A value between 0.0 - 1.0 |

### Talkify hosted only
Entry point: talkify.TtsPlayer().

| Method   | Parameters | Default |      Description      |
|----------|:------ |:------|:-------------|
| setRate | int | 1 | Playback rate. A value between 1 and 3 |

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

# License
GPLv3

Please note that this library talks with a backend that is driven by personal fundings, therefore I intend to keep it free of charge until no longer possible. A rule of thumb: If you have a commersial product with heavy traffic, then a restriction or fee might be introduced to call the server.

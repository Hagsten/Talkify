# Talkify (alpha version)
A javascript text to speech (TTS) library.

Give a voice to your website in a matter of minutes. Talkify library provides you with high quality text to speech (TTS) voices in many languages.

# Usage

## Working fiddle
http://jsfiddle.net/woqw6b6g/6/

## Play all, top to bottom
```javascript
    var talkify = new talkifyPlaylist(new talkifyAjax())
        .withTextHighlighting()
        .withElements($('p')) //<--Any element you'd like. Leave blank to let Talkify make a good guess
        .build()
        .play();
```

## Play simple text

```javascript
talkify.playText('Hello world');
```

# Features

- High qualiy voices
- Multi lingual with built in language detection (i.e. if the text is in english, an english voice is used). Supported languages:
  - English
  - Chinese
  - Japanese
  - Korean
  - Swedish
  - German
- Text highligting for easy read along
- Download as mp3
- Playback of entire website or paragraph/s of your choice

# License
TBD

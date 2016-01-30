# Talkify (alpha version)
A javascript text to speech (TTS) library.

Give a voice to your website in a matter of minutes. Talkify library provides you with high quality text to speech (TTS) voices in many languages.

# Usage

## Working fiddle
http://jsfiddle.net/woqw6b6g/9/

## Play all, top to bottom
```javascript		
    var player = new TalkifyPlayer().withTextHighlighting();

    new talkifyPlaylist()
        .begin()
        .usingPlayer(player)
        .withTextInteraction()
        .withElements($('p')) //<--Any element you'd like. Leave blank to let Talkify make a good guess
        .build() //<-- Returns an instance.
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
GPLv3

Please note that this library talks with a backend that is driven by personal foundings, therefore I intend to keep it free of charge until no longer possible. A rule of thumb: If you have a commersial product with heavy traffic, then a restriction or fee might be introduced to call the server.

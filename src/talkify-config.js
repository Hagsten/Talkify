talkify = talkify || {};
talkify.config = {
    ui:
    {
        audioControls: {
            enabled: false,
            container: document.body
        }
    },
    remoteService: {
        active: true,
        host: 'https://talkify.net',
        apiKey: '',
        speechBaseUrl: '/api/speech/v1',
        languageBaseUrl: '/api/language/v1'
    },
    keyboardCommands: {
        enabled: false,
        commands: {
            playPause: 32,
            next: 39,
            previous: 37
        }
    },
    voiceCommands: {
        enabled: false,
        keyboardActivation: {
            enabled: true,
            key: 77
        },
        commands: {
            playPause: ["play", "pause", "stop", "start"],
            next: ["play next", "next"],
            previous: ["play previous", "previous", "back", "go back"]
        }
    }

}
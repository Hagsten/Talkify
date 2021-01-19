talkify = talkify || {};
talkify.config = {
    debug: false,
    useSsml: false,
    maximumTextLength: 5000,
    ui:
    {
        audioControls: {
            enabled: true,
            controlcenter: "native", //["classic", "modern", "local", "native"]
            container: document.body,
            downloadEnabled: true,
            voicepicker: {
                enabled: true, //where applicable
                filter: {
                    byClass: [], //example: ["Standard", "Premium", "Exclusive"]
                    byCulture: [], //example: ["en-EN", "en-AU"]
                    byLanguage: [] //example: ["English", "Spanish"]
                }
            }
        }
    },
    formReader: {
        voice: null,
        rate: 0,
        remoteService: true,
        requiredText: "This field is required",
        valueText: "You have entered {value} as: {label}.",
        selectedText: "You have selected {label}.",
        notSelectedText: "{label} is not selected."
    },
    remoteService: {
        active: true,
        host: 'https://talkify.net',
        apiKey: '',
        speechBaseUrl: '/api/speech/v2',
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
    },
    autoScroll: {
        offsetpx: 100
    }
}
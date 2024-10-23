
export const categories = [
    {
        "name": "Star Events",
        "slug": "star-events",
        "availableEvents": [
            {
                "title": "BEAT BOXING (HUM MEI HAI DUM)",
                "oneLiner": "Your heart is just a beatbox for the song of your life.",
                "description": "Beatboxing isn't merely copying drums, but you can also integrate melodies and harmonies by using sounds like the siren, trumpet, whistlesand different kinds of bass.",
                "type": "INDIVIDUAL",
                "image": "",
                "slug": "beat-boxing",
                "venues": [
                    {
                        "name": "Main Stage",
                        "start": "2024-10-09T00:00:00",
                        "end": "2024-10-10T00:00:00"
                    }
                ],
                "eventRules": [
                    {
                        "type": "MIN_PARTICIPANTS",
                        "value": 1,
                        "description": "Number of Participants"
                    },
                    {
                        "type": "TIME_LIMIT",
                        "value": 3,
                        "description": "Time limit"
                    },
                    {
                        "type": "OTSE",
                        "value": true,
                        "description": "OTSE is"
                    },
                    {
                        "type": "MAX_PARTICIPANTS",
                        "value": 20,
                        "description": "Maximum number of participants"
                    }
                ],
                "rounds": [
                    {
                        "name": "Round 1",
                        "roundType": "PRELIMNARY",
                        "qualifyNumber": 0,
                        "status": "NOT_STARTED"
                    }
                ]
            },
            {
                "title": "FASHION SHOW (FASHION KA JALWA)",
                "oneLiner": "Fashion is the armor that allows you to survive the realities of everyday life.",
                "description": "There is no road map to style, so walk down the ramp and exhibit your creativity and style. It’s time to conquer the ramp with your confidence.",
                "type": "TEAM",
                "image": "",
                "slug": "fashion-show",
                "venues": [
                    {
                        "name": "Main Stage",
                        "start": "2024-10-09T00:00:00",
                        "end": "2024-10-10T00:00:00"
                    }
                ],
                "eventRules": [
                    {
                        "type": "MIN_PARTICIPANTS",
                        "value": 12,
                        "description": "Number of Participants"
                    },
                    {
                        "type": "MAX_PARTICIPANTS",
                        "value": 12,
                        "description": "Number of Participants"
                    },
                    {
                        "type": "MIN_TEAMS",
                        "value": 1,
                        "description": "Minimum no. of teams"
                    },
                    {
                        "type": "MAX_TEAMS",
                        "value": 18,
                        "description": "Minimum no. of teams"
                    },
                    {
                        "type": "TIME_LIMIT",
                        "value": 8,
                        "description": "Time limit"
                    },
                    {
                        "type": "THEME",
                        "value": "",
                        "description": "The theme will be disclosed in the first representative meeting."
                    },
                    {
                        "type": "NOTE",
                        "value": null,
                        "description": "Any kind of obscenity and vulgarity is not allowed."
                    },
                    {
                        "type": "NOTE",
                        "value": null,
                        "description": "Prop list should be submitted in the last representative meeting."
                    },
                    {
                        "type": "OTSE",
                        "value": true,
                        "description": "OTSE is"
                    }
                ],
                "rounds": [
                    {
                        "name": "Round 1",
                        "roundType": "PRELIMNARY",
                        "qualifyNumber": 0,
                        "status": "NOT_STARTED"
                    }
                ]
            }
        ]
    },
    {
        "name": "Performing Arts",
        "slug": "performing-arts",
        "availableEvents": []
    },
    {
        "name": "Management Events",
        "slug": "management-events",
        "availableEvents": []
    },
    {
        "name": "Voices-in-action",
        "slug": "voices-in-actions",
        "availableEvents": []
    },
    {
        "name": "Fine Arts",
        "slug": "fine-arts",
        "availableEvents": []
    },
    {
        "name": "Literary Arts",
        "slug": "literary-arts",
        "availableEvents": []
    },
    {
        "name": "Gaming Console",
        "slug": "gaming-console",
        "availableEvents": []
    },
    {
        "name": "Indoor Sports",
        "slug": "indoor-sports",
        "availableEvents": []
    },
    {
        "name": "Outdoor Sports",
        "slug": "outdoor-sports",
        "availableEvents": []
    }
]

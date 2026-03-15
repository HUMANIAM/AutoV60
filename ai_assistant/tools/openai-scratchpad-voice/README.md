# OpenAI Scratchpad Voice

This local VS Code extension adds natural text-to-speech commands backed by OpenAI.

Commands:

- `OpenAI Voice: Speak Here` reads from the cursor to the end of the current paragraph.
- `OpenAI Voice: Speak Selection` reads the current selection.
- `OpenAI Voice: Speak Document` reads the full current document.
- `OpenAI Voice: Stop Speaking` stops playback.

Configuration:

- `openaiScratchpadVoice.apiKey`
- `openaiScratchpadVoice.apiKeyEnvVar`
- `openaiScratchpadVoice.model`
- `openaiScratchpadVoice.voice`
- `openaiScratchpadVoice.instructions`
- `openaiScratchpadVoice.maxCharsPerChunk`
- `openaiScratchpadVoice.playerCommand`
- `openaiScratchpadVoice.playerArgs`

Defaults:

- model: `gpt-4o-mini-tts`
- voice: `alloy`
- player: `ffplay`

# Voice Workflow

This document describes a simple speech-to-Codex workflow that works with the current setup in VS Code on Linux.

Direct dictation into the Codex panel is currently treated as unsupported on this machine. The working approach is to dictate into a normal editor file first, then send that text to Codex.

## Scratchpad file

Use this file as the prompt staging area:

- `docs/scratchpad.md`

This file is disposable. It exists only to capture spoken prompts before sending them to Codex.

## Workflow

1. Open `docs/scratchpad.md`.
2. Put the text cursor in that file.
3. Start `VS Code Speech` dictation.
4. Speak the prompt you want to send to Codex.
5. Review the transcribed text in `docs/scratchpad.md`.
6. Transfer the text to Codex using the existing VS Code or Codex thread command, or use simple copy/paste.
7. Send the prompt to Codex.

## OpenAI Reply Playback

The repository also includes a local VS Code extension for natural text-to-speech using OpenAI:

- `ai_assistant/tools/openai-scratchpad-voice`

Installed command palette commands:

- `OpenAI Voice: Speak Here`
- `OpenAI Voice: Speak Selection`
- `OpenAI Voice: Speak Document`
- `OpenAI Voice: Stop Speaking`

Recommended use with the scratchpad workflow:

1. Put the cursor at the start of the scratchpad text you want to hear.
2. Run `OpenAI Voice: Speak Here`.
3. If you only want part of the text, select it and run `OpenAI Voice: Speak Selection`.
4. If the answer is long, stop playback with `OpenAI Voice: Stop Speaking`.

The local extension uses the OpenAI `gpt-4o-mini-tts` speech model and `ffplay` for audio playback.

## Test Prompt

Use this exact prompt for a quick test:

`Summarize the purpose of this repository from the README in three short bullet points.`

## Working Definition Of Success

The workflow is working if all of the following are true:

- Speech appears in `docs/scratchpad.md`.
- The same text can be sent to Codex.
- Codex responds normally.

## Manual Test Plan

1. Open `docs/scratchpad.md` and dictate one sentence.
2. Confirm the sentence appears in the file.
3. Send that dictated text to Codex.
4. Confirm Codex answers.
5. Repeat once using the README-based test prompt above.

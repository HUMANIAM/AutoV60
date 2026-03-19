"use strict";

const vscode = require("vscode");
const fs = require("fs");
const os = require("os");
const path = require("path");
const https = require("https");
const { spawn, spawnSync } = require("child_process");

const EXTENSION_PREFIX = "openaiScratchpadVoice";
const DEFAULT_PLAYER_ARGS = ["-nodisp", "-autoexit", "-loglevel", "error"];

let currentSession = null;

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      `${EXTENSION_PREFIX}.speakHere`,
      async (editor) => {
        const text = extractTextFromCursor(editor);
        await speakTextFromEditor(text, "OpenAI Voice: Speak Here");
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      `${EXTENSION_PREFIX}.speakSelection`,
      async (editor) => {
        const text = editor.document.getText(editor.selection).trim();
        if (!text) {
          vscode.window.showWarningMessage(
            "OpenAI Voice: Select some text first."
          );
          return;
        }
        await speakTextFromEditor(text, "OpenAI Voice: Speak Selection");
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      `${EXTENSION_PREFIX}.speakDocument`,
      async (editor) => {
        const text = editor.document.getText().trim();
        await speakTextFromEditor(text, "OpenAI Voice: Speak Document");
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(`${EXTENSION_PREFIX}.stopSpeaking`, () => {
      stopCurrentSession();
    })
  );
}

async function speakTextFromEditor(text, title) {
  const normalized = normalizeText(text);
  if (!normalized) {
    vscode.window.showWarningMessage(`${title}: No readable text found.`);
    return;
  }

  const config = loadConfig();
  const apiKey = getApiKey(config);
  if (!apiKey) {
    vscode.window.showErrorMessage(
      "OpenAI Voice: No API key found. Set OPENAI_API_KEY or openaiScratchpadVoice.apiKey."
    );
    return;
  }

  const playerCheck = spawnSync(config.playerCommand, ["-version"], {
    encoding: "utf8"
  });
  if (playerCheck.error && playerCheck.error.code === "ENOENT") {
    vscode.window.showErrorMessage(
      `OpenAI Voice: Audio player '${config.playerCommand}' was not found.`
    );
    return;
  }

  stopCurrentSession();

  const chunks = chunkText(normalized, config.maxCharsPerChunk);
  const session = {
    cancelled: false,
    currentChild: null,
    tempFiles: []
  };
  currentSession = session;

  try {
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title,
        cancellable: true
      },
      async (progress, token) => {
        token.onCancellationRequested(() => stopCurrentSession());

        for (let index = 0; index < chunks.length; index += 1) {
          if (session.cancelled) {
            break;
          }

          progress.report({
            message: `Generating audio ${index + 1}/${chunks.length}`
          });

          const audioBuffer = await createSpeechBuffer(
            apiKey,
            config,
            chunks[index]
          );
          if (session.cancelled) {
            break;
          }

          const audioFile = writeTempAudio(audioBuffer, index);
          session.tempFiles.push(audioFile);

          progress.report({
            message: `Playing audio ${index + 1}/${chunks.length}`
          });

          await playAudioFile(audioFile, config, session);
        }
      }
    );
  } catch (error) {
    if (!session.cancelled) {
      vscode.window.showErrorMessage(`OpenAI Voice: ${error.message}`);
    }
  } finally {
    cleanupSession(session);
    if (currentSession === session) {
      currentSession = null;
    }
  }
}

function loadConfig() {
  const config = vscode.workspace.getConfiguration(EXTENSION_PREFIX);
  const playerArgs = config.get("playerArgs", DEFAULT_PLAYER_ARGS);
  return {
    apiKey: config.get("apiKey", "").trim(),
    apiKeyEnvVar: config.get("apiKeyEnvVar", "OPENAI_API_KEY").trim(),
    instructions: config
      .get(
        "instructions",
        "Speak naturally, clearly, and warmly with conversational pacing."
      )
      .trim(),
    maxCharsPerChunk: Number(config.get("maxCharsPerChunk", 2200)) || 2200,
    model: config.get("model", "gpt-4o-mini-tts").trim(),
    playerArgs: Array.isArray(playerArgs) ? playerArgs : DEFAULT_PLAYER_ARGS,
    playerCommand: config.get("playerCommand", "ffplay").trim(),
    voice: config.get("voice", "alloy").trim()
  };
}

function getApiKey(config) {
  if (config.apiKey) {
    return config.apiKey;
  }
  if (config.apiKeyEnvVar && process.env[config.apiKeyEnvVar]) {
    return process.env[config.apiKeyEnvVar];
  }
  if (
    config.apiKeyEnvVar &&
    /^[A-Za-z_][A-Za-z0-9_]*$/.test(config.apiKeyEnvVar)
  ) {
    const shell = process.env.SHELL || "/bin/bash";
    const probe = spawnSync(
      shell,
      ["-lc", `printf '%s' "\${${config.apiKeyEnvVar}}"`],
      { encoding: "utf8" }
    );
    const shellValue = (probe.stdout || "").trim();
    if (shellValue) {
      return shellValue;
    }
  }
  return "";
}

function extractTextFromCursor(editor) {
  const document = editor.document;
  const active = editor.selection.active;

  let endLine = active.line;
  while (
    endLine + 1 < document.lineCount &&
    document.lineAt(endLine + 1).text.trim() !== ""
  ) {
    endLine += 1;
  }

  const endCharacter = document.lineAt(endLine).text.length;
  const range = new vscode.Range(
    active,
    new vscode.Position(endLine, endCharacter)
  );
  return document.getText(range).trim();
}

function normalizeText(text) {
  return text.replace(/\r\n/g, "\n").trim();
}

function chunkText(text, maxCharsPerChunk) {
  if (text.length <= maxCharsPerChunk) {
    return [text];
  }

  const paragraphs = text
    .split(/\n\s*\n/g)
    .map((part) => part.trim())
    .filter(Boolean);

  const chunks = [];
  let current = "";

  for (const paragraph of paragraphs) {
    const candidate = current ? `${current}\n\n${paragraph}` : paragraph;
    if (candidate.length <= maxCharsPerChunk) {
      current = candidate;
      continue;
    }

    if (current) {
      chunks.push(current);
      current = "";
    }

    if (paragraph.length <= maxCharsPerChunk) {
      current = paragraph;
      continue;
    }

    splitLongParagraph(paragraph, maxCharsPerChunk).forEach((piece) =>
      chunks.push(piece)
    );
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

function splitLongParagraph(text, maxCharsPerChunk) {
  const sentences = text.match(/[^.!?]+[.!?]*\s*/g) || [text];
  const chunks = [];
  let current = "";

  for (const rawSentence of sentences) {
    const sentence = rawSentence.trim();
    if (!sentence) {
      continue;
    }

    const candidate = current ? `${current} ${sentence}` : sentence;
    if (candidate.length <= maxCharsPerChunk) {
      current = candidate;
      continue;
    }

    if (current) {
      chunks.push(current);
    }

    if (sentence.length <= maxCharsPerChunk) {
      current = sentence;
      continue;
    }

    for (let index = 0; index < sentence.length; index += maxCharsPerChunk) {
      chunks.push(sentence.slice(index, index + maxCharsPerChunk));
    }
    current = "";
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

function createSpeechBuffer(apiKey, config, input) {
  const payload = JSON.stringify({
    input,
    instructions: config.instructions,
    model: config.model,
    voice: config.voice
  });

  return new Promise((resolve, reject) => {
    const request = https.request(
      "https://api.openai.com/v1/audio/speech",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Length": Buffer.byteLength(payload),
          "Content-Type": "application/json"
        }
      },
      (response) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          const body = Buffer.concat(chunks);
          if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300) {
            resolve(body);
            return;
          }

          const fallback = `HTTP ${response.statusCode}`;
          try {
            const parsed = JSON.parse(body.toString("utf8"));
            reject(
              new Error(parsed.error && parsed.error.message ? parsed.error.message : fallback)
            );
          } catch (_error) {
            reject(new Error(fallback));
          }
        });
      }
    );

    request.on("error", reject);
    request.write(payload);
    request.end();
  });
}

function writeTempAudio(buffer, index) {
  const filePath = path.join(
    os.tmpdir(),
    `openai-scratchpad-voice-${process.pid}-${Date.now()}-${index}.mp3`
  );
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

function playAudioFile(filePath, config, session) {
  return new Promise((resolve, reject) => {
    if (session.cancelled) {
      resolve();
      return;
    }

    const child = spawn(config.playerCommand, [...config.playerArgs, filePath], {
      stdio: "ignore"
    });
    session.currentChild = child;

    child.once("error", (error) => {
      session.currentChild = null;
      reject(error);
    });

    child.once("exit", (code, signal) => {
      session.currentChild = null;
      if (session.cancelled) {
        resolve();
        return;
      }
      if (code === 0 || signal === "SIGTERM" || signal === "SIGKILL") {
        resolve();
        return;
      }
      reject(new Error(`Audio player exited with code ${code ?? "unknown"}.`));
    });
  });
}

function stopCurrentSession() {
  if (!currentSession) {
    return;
  }

  currentSession.cancelled = true;
  if (currentSession.currentChild) {
    try {
      currentSession.currentChild.kill("SIGTERM");
    } catch (_error) {
      // Ignore playback shutdown errors.
    }
  }
}

function cleanupSession(session) {
  session.cancelled = true;
  if (session.currentChild) {
    try {
      session.currentChild.kill("SIGTERM");
    } catch (_error) {
      // Ignore playback shutdown errors.
    }
    session.currentChild = null;
  }

  for (const filePath of session.tempFiles) {
    try {
      fs.unlinkSync(filePath);
    } catch (_error) {
      // Ignore temp file cleanup failures.
    }
  }
  session.tempFiles = [];
}

function deactivate() {
  stopCurrentSession();
}

module.exports = {
  activate,
  deactivate
};

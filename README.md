# Thinking Translate

A Claude Code mod that shows Claude's thinking live in a side panel next to the chat, instead of mixed into the conversation.

- Each of your prompts appears as a bubble on the right, with the thinking it triggered underneath, just like the chat.
- Thinking streams in as Claude writes it ("思考中..." while a block is still being written) and the panel follows the newest text while you are at the bottom. Scroll up to read and it stays put; scroll back to the end and it follows again.
- Optional translation: each finished thinking block can be translated into the language you pick, for free by Microsoft Edge's translate endpoint, with Claude Haiku (low effort) as fallback. Chinese by default.
- Between the thinking blocks, a dim line says what Claude did next ("→ 读取 register.tsx", "→ 执行：...", "→ 网页搜索：..."). Only the main agent's calls; the app's own bookkeeping tools are left out.
- Only the main agent's thinking is shown; subagents' thinking is left out.

The panel is in Chinese (the panel is titled "思考过程").

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install thinking-translate --marketplace zhangyu-ch/claude-thinking-panel
```

From a shell:

```bash
claude plugin install thinking-translate --marketplace zhangyu-ch/claude-thinking-panel
```

In the Claude desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, Add marketplace with `zhangyu-ch/claude-thinking-panel`, then Add plugin.

Install it at the user scope to get the panel in every session. Sessions already open pick it up after a restart.

## Use

The panel opens by itself when a session starts. If you close it, run `/thinking-translate` to open it again.

The panel only receives the thinking that Claude Code is set to show. In the desktop app, set the conversation's transcript view to "thinking" (title bar menu, or Ctrl+O). With the "normal" view the panel stays empty.

## Translation

Two options in the plugin's config:

- `translateTo`: off, Spanish, English, French, German, Portuguese, Italian, Chinese or Japanese. Default Chinese.
- `translator`:
  - `edge` (default): Microsoft Edge's free translate endpoint (`edge.microsoft.com/translate/translatetext`). No key, no account, no usage. It is unofficial: Microsoft can change or stop it at any time, and your thinking text is sent to Microsoft. Long blocks are sent in chunks of up to 10,000 characters. If Edge fails, that block is translated by Claude Haiku instead.
  - `haiku`: always Claude Haiku at low effort, through your own Claude session. Good quality, uses a little of your subscription usage per block.

While a block is being written it shows as written; once the block ends it is replaced by the translation, usually within a second or two.

Or set them in `~/.claude/settings.json`:

```json
"pluginConfigs": {
  "thinking-translate@claude-thinking-panel": {
    "options": { "translateTo": "Chinese", "translator": "edge" }
  }
}
```

## How it works

The mod hooks the model's response stream (`turn.step`), copies the thinking chunks into session state and draws them in a pane. It writes no files and reads nothing else. The only thing sent anywhere is the optional translation request (to Microsoft with `edge`, or to your own Claude session with Haiku).

## Directory edition

`catalogo/` is the edition submitted to Anthropic's plugin directory. The directory does not allow reading chat history or calling endpoints the author does not own, so it leaves out Edge's translator, and translates with Haiku only. `tools/catalogo.py` builds it from this plugin: code between `//#if full` and `//#else` or `//#endif` is dropped, and lines between `//#else` and `//#endif` written as `//: <code>` are uncommented. Run `python -I tools/catalogo.py` after a change; `--check` says whether `catalogo/` is current, and `--with-tests <folder>` writes the edition with its tests for `claude plugin test`. Its `plugin.json`, `icon.png` and `README.md` are written by hand.

## License

MIT

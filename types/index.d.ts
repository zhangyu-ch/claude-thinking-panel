// A translation of the thinking right before a row: `key` is the tool call's id, or `text:` and a reply's opening words.
export type Note = { key: string; zh?: string; isDone?: boolean }

declare module 'claude-code' {
  interface PluginState {
    'thinking-translate': { notes: Note[] }
  }
}

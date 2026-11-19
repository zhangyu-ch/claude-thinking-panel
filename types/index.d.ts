export type Block = { id: string; who: string; text: string; isDone: boolean; es?: string; via?: 'Edge' | 'Haiku'; isPrompt?: boolean; isAction?: boolean }

declare module 'claude-code' {
  interface PluginState {
    'thinking-translate': { blocks: Block[] }
  }
}

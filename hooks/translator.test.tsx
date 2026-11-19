import { expect, test } from 'claude-code/testing'

const REPLY = 'All six repositories are cloned and verified as git work trees.'

// Stands for the model: thinks, calls a tool, thinks again, then replies.
function engine(on: any) {
  on('turn.step', async function* (_: any, e: any) {
    yield { kind: 'thinking', index: 0, text: 'Hello ' }
    yield { kind: 'thinking', index: 0, text: 'world' }
    yield { kind: 'tool', index: 1, id: 'tu1', name: 'Bash' }
    yield { kind: 'thinking', index: 2, text: 'Second thought' }
    yield { kind: 'text', index: 3, text: REPLY.slice(0, 20) }
    yield { kind: 'text', index: 3, text: REPLY.slice(20) }
    return { turnId: e.turnId, index: e.index, answer: REPLY, toolUses: [], stopReason: 'end_turn', usage: null, id: 'm1' }
  })
}

const settle = async () => { for (let i = 0; i < 200; i++) await Promise.resolve() }

async function step($: any, agentId?: string) {
  const out: any[] = []
  for await (const c of $.turn.step({ turnId: 't1', index: 0, model: 'opus', messageCount: 1, ...(agentId ? { agentId } : {}) })) out.push(c)
  await settle()
  return out
}

const toolRow = ($: any) => $.ui.mount({ plugin: 'thinking-translate', component: 'ToolUse', requestId: 'tu1', surface: 'terminal',
  props: { tool_use_id: 'tu1', tool: 'Bash', input: { command: 'ls' }, isRunning: false, isErrored: false, isInterrupted: false } })
const replyRow = ($: any) => $.ui.mount({ plugin: 'thinking-translate', component: 'AssistantMessage', requestId: 'm1', surface: 'terminal',
  props: { text: REPLY, isFirstOfReply: true } })

test('haiku: the stream is untouched and each translation is quoted above the row after its thinking', { options: { translateTo: 'Chinese', translator: 'haiku' } }, async ($, on) => {
  engine(on)
  const asked: string[] = []
  on('model.complete', (_, e: any) => (asked.push(e.prompt), { value: { isAnswered: true, text: e.prompt.includes('Hello') ? '你好\n世界' : '第二个想法', usage: { input_tokens: 1, output_tokens: 1 } } }) as any)
  const out = await step($)
  expect(out.map(c => c.kind)).toEqual(['thinking', 'thinking', 'tool', 'thinking', 'text', 'text'])
  expect(asked).toEqual(['<text>\nHello world\n</text>', '<text>\nSecond thought\n</text>'])

  const tool = await toolRow($)
  expect((await tool.find({ type: 'Markdown' }))?.text).toBe('> 你好\n> 世界')
  await tool.unmount()
  const reply = await replyRow($)
  expect((await reply.find({ type: 'Markdown', text: /第二个想法/ }))?.text).toBe('> 第二个想法')
  await reply.unmount()
})

test('api: posts to the Messages endpoint with the key and model', { options: { translateTo: 'Chinese', translator: 'api', apiBaseUrl: 'https://example.com/anthropic/', apiKey: 'k1', apiModel: 'm1' } }, async ($, on) => {
  engine(on)
  const sent: any[] = []
  on('http.fetch', (_, e: any) => (sent.push(e), { value: { status: 200, ok: true, headers: {}, text: JSON.stringify({ content: [{ type: 'text', text: '你好世界' }] }) } }) as any)
  await step($)
  expect(sent[0].url).toBe('https://example.com/anthropic/v1/messages')
  expect(sent[0].init.headers['x-api-key']).toBe('k1')
  expect(JSON.parse(sent[0].init.body)).toMatchObject({ model: 'm1', messages: [{ role: 'user', content: '<text>\nHello world\n</text>' }] })
  const tool = await toolRow($)
  expect((await tool.find({ type: 'Markdown' }))?.text).toBe('> 你好世界')
  await tool.unmount()
})

test('a failed translation draws nothing, and subagents are not translated', { options: { translateTo: 'Chinese', translator: 'api' } }, async ($, on) => {
  engine(on)
  let calls = 0
  on('http.fetch', () => (calls++, { value: { status: 500, ok: false, headers: {}, text: '' } }) as any)
  await step($, 'a1')
  expect(calls).toBe(0)
  await step($)
  expect(calls).toBe(2)
  const tool = await toolRow($)
  expect(await tool.find({ type: 'Markdown' })).toBeUndefined()
  expect(await tool.find({ type: 'Text', text: /翻译中/ })).toBeUndefined()
  await tool.unmount()
})

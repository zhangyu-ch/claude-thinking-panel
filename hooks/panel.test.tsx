import { expect, mock, test } from 'claude-code/testing'

const PANE = {
  plugin: 'thinking-translate',
  component: 'Pane',
  requestId: 'thinking-translate',
  props: { title: '思考过程', isFocused: false, bodyColumns: 60, placement: 'dock', scroll: { offset: 0, bodyRows: 40 }, view: {} },
} as const

test('the pane shows what Claude did and has no usage banner', async ($, on) => {
  on('ui.scroll', () => ({ value: {} }))
  mock.clock(on)
  on('tool.call', () => ({ result: 'ok', text: 'ok' }) as any)
  on('command.register', () => ({ value: { command: 'thinking-translate' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  // A Windows path, its backslashes built here.
  await $.tool.call({ tool: 'Read', file_path: ['C:', 'Users', 'HP', 'x', 'register.tsx'].join(String.fromCharCode(92)) } as any)
  await $.tool.call({ tool: 'Bash', command: 'git status', description: '显示状态' } as any)
  await $.tool.call({ tool: 'Read', file_path: '/a/sub.ts', agentId: 'a1' } as any)
  for (let i = 0; i < 20; i++) await Promise.resolve()

  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect((await ui.find({ type: 'Text', text: /^→ 读取 register\.tsx$/ }))?.text).toBe('→ 读取 register.tsx')
  expect((await ui.find({ type: 'Text', text: /^→ 执行：显示状态$/ }))).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /sub\.ts/ })).toBeUndefined()
  expect(await ui.find({ type: 'Button' })).toBeUndefined()
  await ui.unmount()
})


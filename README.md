# Thinking Translate

Claude Code 插件：把 Claude 的思考（thinking）翻译成你选的语言，译文以引用块显示在主对话里，紧挨着那段思考，方便快速浏览 agent 的工作思路、检查有没有疏忽。

- 每段思考结束后在后台翻译，不阻塞 Claude 继续工作；译文显示在思考之后的那一行（工具调用或回复文字）上方，翻译完成前显示「翻译中...」。
- 模型输出原样透传，译文只是界面上的显示，不会进入对话记录，模型看不到，也不占上下文。
- 只翻译主 agent 的思考，子代理的不翻译；翻译失败时什么都不显示。

## 安装

在 Claude Code 里：

```
/plugin install thinking-translate --marketplace zhangyu-ch/claude-thinking-panel
```

或在终端里：

```bash
claude plugin install thinking-translate --marketplace zhangyu-ch/claude-thinking-panel
```

## 让思考常驻显示

插件只负责翻译，思考是否展开由 Claude Code 控制：终端里在 `/config` 打开 **Verbose output**（或按 Ctrl+O 临时展开）；桌面版把对话视图设为 thinking。

## 配置

在 `/config` 的插件选项里设置，或写进 `~/.claude/settings.json`：

```json
"pluginConfigs": {
  "thinking-translate@claude-thinking-panel": {
    "options": {
      "translateTo": "Chinese",
      "translator": "api",
      "apiBaseUrl": "https://api.anthropic.com",
      "apiModel": "claude-haiku-5-5"
    }
  }
}
```

| 选项 | 说明 | 默认 |
| --- | --- | --- |
| `translateTo` | 目标语言：off、Chinese、English、Japanese 等；off 关闭翻译 | Chinese |
| `translator` | `api`：调用任意支持 Anthropic Messages 协议的接口（低 effort），失败或无结果时回退 Haiku。`haiku`：只通过你自己的 Claude 会话调用 Haiku（低 effort），会用掉少量订阅额度 | api |
| `apiBaseUrl` | `api` 方式的接口地址，会自动拼上 `/v1/messages`。Anthropic 或兼容 Messages 协议的服务商都可以 | https://api.anthropic.com |
| `apiKey` | `api` 方式的密钥，以 `x-api-key` 发送；属于敏感字段，存在系统安全存储里，请在 `/config` 里填写，不要写进 settings.json | 空 |
| `apiModel` | `api` 方式使用的模型名 | claude-haiku-5-5 |

## 已知限制

- 回复文字按开头 40 个字符与译文对应；终端若显示的是回复摘要而非原文，那条回复上方不显示译文（工具调用行按 id 对应，不受影响）。
- `api` 方式没有单独的超时，接口卡住时会等到宿主的请求超时。
- 思考内容会发送给你配置的翻译服务（Haiku 走你自己的 Claude 会话；`api` 发往你填的接口）。

## 许可

MIT。基于 [gomez5757/claude-thinking-panel](https://github.com/gomez5757/claude-thinking-panel) 修改。

// Copyright (c) 2026 Justine Louise.
// Created by Justine Louise.
//
// This software is provided for personal and educational use only.
// Commercial use, resale, or distribution for profit is strictly prohibited
// without prior written permission from the author.
//
// Please respect the developer's work.
// Do not remove or modify this copyright notice or claim this project as your own.
//
// © 2026 Justine Louise. All Rights Reserved.
// ® Powered By Zapo-js
// handler.js

import util from 'util'
import { createRequire } from 'module'
import { config } from './settings.js'
import {
  transformImports,
  createFakeConsole,
  formatEvalResult,
  formatEvalError,
  executeAsyncCode
} from './lib/utils.js'

const require = createRequire(import.meta.url)

export function buildEvalContext(m, sock) {
  return {
    m,
    sock,
    quoted: m.quoted,
    q: m.quoted,
    jid: m.chat,
    from: m.chat,
    sender: m.sender,
    me: sock?.user?.id || null,
    process,
    Buffer,
    require,
    importModule: (spec) => import(spec),
    util,
    config
  }
}

export async function runUserCode(code, m, sock) {
  const { consoleOutput, fakeConsole } = createFakeConsole()

  try {
    const result = await executeAsyncCode(transformImports(code), {
      ...buildEvalContext(m, sock),
      console: fakeConsole,
      __dirname: process.cwd(),
      __filename: '[eval]'
    })
    return '```' + formatEvalResult(result, consoleOutput) + '```'
  } catch (err) {
    return `Error:\n\`\`\`js\n${formatEvalError(err)}\n\`\`\``
  }
}

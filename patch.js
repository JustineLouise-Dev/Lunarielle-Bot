// Copyright (c) 2026 Justine Louise & MioDev.
// Created by Justine Louise & MioDev.
//
// This software is provided for personal and educational use only.
// Commercial use, resale, or distribution for profit is strictly prohibited
// without prior written permission from the author.
//
// Please respect the developer's work.
// Do not remove or modify this copyright notice or claim this project as your own.
//
// © 2026 Justine Louise & MioDev. All Rights Reserved.
// ® Powered By Zapo-js

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const targetFiles = [
  path.join(
    __dirname,
    'node_modules/zapo-js/dist/esm/transport/node/builders/message.js'
  ),
  path.join(
    __dirname,
    'node_modules/zapo-js/dist/transport/node/builders/message.js'
  )
]

const MARKER = '/* OVERRIDE_CUSTOM_NODES_PATCH */'

const regex =
  /if\s*\(\s*input\.customNodes\s*\)\s*\{\s*for\s*\(\s*const\s+node\s+of\s+input\.customNodes\s*\)\s*\{\s*content\.push\(\s*node\s*\);\s*\}\s*\}/

const patchReplacement = `${MARKER}
    if (input.customNodes) {
        for (const node of input.customNodes) {
            if (!node || !node.tag) continue;

            const existingIndex = content.findIndex(
                item => item && item.tag === node.tag
            );

            if (existingIndex !== -1) {
                content[existingIndex] = node;
            } else {
                content.push(node);
            }
        }
    }`

let patchedCount = 0
let skippedCount = 0
let missingCount = 0
let failedCount = 0

const results = []

for (const file of targetFiles) {
  const relativePath = path.relative(__dirname, file)

  if (!fs.existsSync(file)) {
    missingCount++
    results.push(`⏭️ Gak ketemu: ${relativePath}`)
    continue
  }

  let content = fs.readFileSync(file, 'utf8')

  if (content.includes(MARKER)) {
    skippedCount++
    results.push(`ℹ️ Udah ter-patch: ${relativePath}`)
    continue
  }

  if (!regex.test(content)) {
    failedCount++
    results.push(
      `⚠️ Pattern gak match: ${relativePath}`
    )
    continue
  }

  content = content.replace(regex, patchReplacement)

  fs.writeFileSync(file, content, 'utf8')

  patchedCount++
  results.push(`✅ Berhasil patch: ${relativePath}`)
}

console.log(`
══════════════════════════════════════
        ZAPO-JS CUSTOM NODES PATCH
══════════════════════════════════════
`)

console.log(results.join('\n'))

console.log(`
══════════════════════════════════════
Total:
  ${patchedCount} patched
  ${skippedCount} sudah ter-patch
  ${missingCount} tidak ditemukan
  ${failedCount} gagal match
══════════════════════════════════════
`)

const albumTargets = [
  ...['dist', 'dist/esm'].flatMap((base) => [
    path.join(__dirname, `node_modules/zapo-js/${base}/protocol/message.js`),
    path.join(__dirname, `node_modules/zapo-js/${base}/message/encode/content.js`)
  ])
]

const ALBUM_MARKER = '/* OVERRIDE_ALBUM_COLLECTION_PATCH */'

const albumResults = []
let albumPatched = 0
let albumSkipped = 0

for (const file of albumTargets) {
  const relativePath = path.relative(__dirname, file)

  if (!fs.existsSync(file)) {
    albumResults.push(`⏭️ Gak ketemu: ${relativePath}`)
    continue
  }

  let content = fs.readFileSync(file, 'utf8')

  if (content.includes(ALBUM_MARKER)) {
    albumSkipped++
    albumResults.push(`ℹ️ Udah ter-patch: ${relativePath}`)
    continue
  }

  const isEsm = file.includes('/esm/')
  const nsPrefix = isEsm ? '' : 'constants_1.'

  if (file.endsWith('protocol/message.js')) {
    const oldConstant = "GROUP_HISTORY: 'group_history'\n})"
    const newConstant = `GROUP_HISTORY: 'group_history',
    ${ALBUM_MARKER}
    COLLECTION: 'collection'
})`

    if (!content.includes(oldConstant)) {
      albumResults.push(`⚠️ Pattern konstanta gak match: ${relativePath}`)
      continue
    }

    content = content.replace(oldConstant, newConstant)
  } else {
    const indent = isEsm ? '    ' : '    '
    const oldResolver = `${indent}if (msg.messageHistoryBundle)\n${indent}    return ${nsPrefix}WA_ENC_MEDIA_TYPES.GROUP_HISTORY;`
    const newResolver = `${indent}${ALBUM_MARKER}\n` +
      `${indent}if (msg.albumMessage)\n${indent}    return ${nsPrefix}WA_ENC_MEDIA_TYPES.COLLECTION;\n` +
      oldResolver

    if (!content.includes(oldResolver)) {
      albumResults.push(`⚠️ Pattern resolver gak match: ${relativePath}`)
      continue
    }

    content = content.replace(oldResolver, newResolver)
  }

  fs.writeFileSync(file, content, 'utf8')
  albumPatched++
  albumResults.push(`✅ Berhasil patch: ${relativePath}`)
}

console.log(`
══════════════════════════════════════
      ZAPO-JS ALBUM COLLECTION PATCH
══════════════════════════════════════
`)

console.log(albumResults.join('\n'))

console.log(`
══════════════════════════════════════
Total:
  ${albumPatched} patched
  ${albumSkipped} sudah ter-patch
══════════════════════════════════════
`)

const SHARP_SHIM_MARKER = '/* OVERRIDE_SHARP_TO_JIMP_PATCH */'

const sharpShimTargets = [
  {
    target: path.join(__dirname, 'node_modules/@zapo-js/media-utils/dist/esm/sharp.js'),
    source: path.join(__dirname, 'patches/media-utils-sharp.esm.js')
  },
  {
    target: path.join(__dirname, 'node_modules/@zapo-js/media-utils/dist/sharp.js'),
    source: path.join(__dirname, 'patches/media-utils-sharp.cjs.js')
  }
]

const sharpShimResults = []
let sharpShimPatched = 0
let sharpShimSkipped = 0
let sharpShimMissing = 0

for (const { target, source } of sharpShimTargets) {
  const relativePath = path.relative(__dirname, target)

  if (!fs.existsSync(target)) {
    sharpShimMissing++
    sharpShimResults.push(`⏭️ Gak ketemu: ${relativePath}`)
    continue
  }

  const existing = fs.readFileSync(target, 'utf8')
  if (existing.includes(SHARP_SHIM_MARKER)) {
    sharpShimSkipped++
    sharpShimResults.push(`ℹ️ Udah ter-patch: ${relativePath}`)
    continue
  }

  if (!fs.existsSync(source)) {
    sharpShimResults.push(`⚠️ File sumber shim gak ketemu: ${path.relative(__dirname, source)}`)
    continue
  }

  fs.writeFileSync(target, fs.readFileSync(source, 'utf8'), 'utf8')
  sharpShimPatched++
  sharpShimResults.push(`✅ Berhasil patch (sharp -> jimp): ${relativePath}`)
}

console.log(`
══════════════════════════════════════
    MEDIA-UTILS SHARP -> JIMP PATCH
══════════════════════════════════════
`)

console.log(sharpShimResults.join('\n'))

console.log(`
══════════════════════════════════════
Total:
  ${sharpShimPatched} patched
  ${sharpShimSkipped} sudah ter-patch
  ${sharpShimMissing} tidak ditemukan
══════════════════════════════════════
`)

const SQLITE_PATCH_MARKER = '/* OVERRIDE_ANDROID_TERMUX_PATCH */'

const sqliteBindingFile = path.join(__dirname, 'node_modules/better-sqlite3/lib/binding.js')
const sqliteOldFn = `function getPrebuildPath() {
	if (PREBUILD_PLATFORMS.includes(process.platform) && PREBUILD_ARCHS.includes(process.arch)) {
		const target = \`\${isLinuxMusl() ? 'linuxmusl' : process.platform}-\${process.arch}\`;
		const filename = path.join(__dirname, '..', 'prebuilds', \`\${target}.node\`);
		if (fs.existsSync(filename)) {
			return filename;
		}
	}
	return null;
}`
const sqliteNewFn = `function getPrebuildPath() {
	${SQLITE_PATCH_MARKER}
	const effectivePlatform = process.platform === 'android' ? 'linux' : process.platform;
	if (PREBUILD_PLATFORMS.includes(effectivePlatform) && PREBUILD_ARCHS.includes(process.arch)) {
		const target = \`\${isLinuxMusl() ? 'linuxmusl' : effectivePlatform}-\${process.arch}\`;
		const filename = path.join(__dirname, '..', 'prebuilds', \`\${target}.node\`);
		if (fs.existsSync(filename)) {
			return filename;
		}
	}
	return null;
}`

const sqliteResults = []
let sqlitePatched = 0
let sqliteSkipped = 0
let sqliteMissing = 0
let sqliteFailed = 0

if (!fs.existsSync(sqliteBindingFile)) {
  sqliteMissing++
  sqliteResults.push(`⏭️ Gak ketemu: ${path.relative(__dirname, sqliteBindingFile)}`)
} else {
  let content = fs.readFileSync(sqliteBindingFile, 'utf8')
  if (content.includes(SQLITE_PATCH_MARKER)) {
    sqliteSkipped++
    sqliteResults.push(`ℹ️ Udah ter-patch: ${path.relative(__dirname, sqliteBindingFile)}`)
  } else if (!content.includes(sqliteOldFn)) {
    sqliteFailed++
    sqliteResults.push(`⚠️ Pattern gak match (kemungkinan versi better-sqlite3 berbeda): ${path.relative(__dirname, sqliteBindingFile)}`)
  } else {
    content = content.replace(sqliteOldFn, sqliteNewFn)
    fs.writeFileSync(sqliteBindingFile, content, 'utf8')
    sqlitePatched++
    sqliteResults.push(`✅ Berhasil patch (android -> linux prebuild): ${path.relative(__dirname, sqliteBindingFile)}`)
  }
}

console.log(`
══════════════════════════════════════
   BETTER-SQLITE3 TERMUX/ANDROID PATCH
══════════════════════════════════════
`)

console.log(sqliteResults.join('\n'))

console.log(`
══════════════════════════════════════
Total:
  ${sqlitePatched} patched
  ${sqliteSkipped} sudah ter-patch
  ${sqliteMissing} tidak ditemukan
  ${sqliteFailed} gagal match
══════════════════════════════════════
`)
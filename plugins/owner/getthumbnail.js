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
// plugins/owner/getthumbnail.js

export default {
  command: 'getthumbnail',
  alias: ['gt', 'getthumb'],
  category: 'owner',
  description: 'Mengambil thumbnail dari pesan yang di-reply.\n\n' +
    '*Format Penggunaan:*\n' +
    '> `Reply pesan yang memiliki thumbnail lalu ketik:`\n> .getthumbnail',
  onlyOwner: true,
  typing: true,

  async execute(m, { sock }) {
    if (!m.quoted) return m.reply('❌ Reply pesan yang mau diambil thumbnail-nya')

    const content = m.quoted.full?.[m.quoted.type] || {}
    const adReply = content.contextInfo?.externalAdReply

    if (content.thumbnailDirectPath && content.mediaKey) {
      try {
        const { buffer, mimetype, jpegThumbnail } = await sock.downloadThumbnail({
          thumbnailDirectPath: content.thumbnailDirectPath,
          mediaKey: content.mediaKey,
          thumbnailSha256: content.thumbnailSha256,
          thumbnailEncSha256: content.thumbnailEncSha256
        })

        return m.reply({
          type: 'image',
          media: buffer,
          mimetype,
          jpegThumbnail,
          caption: '✅ *Source:* Media Server'
        })
      } catch (err) {
        console.error('[getthumbnail]', err.message)
      }
    }

    const url = adReply?.thumbnailUrl || adReply?.sourceUrl
    if (url && /^https?:\/\//.test(url)) {
      return m.reply({
        type: 'image',
        media: url,
        caption: `✅ *Source:* External URL\n🔗 ${url}`
      })
    }

    let jpegThumbnail = adReply?.jpegThumbnail || content.jpegThumbnail
    if (typeof jpegThumbnail === 'string') jpegThumbnail = Buffer.from(jpegThumbnail, 'base64')
    if (jpegThumbnail) {
      return m.reply({
        type: 'image',
        media: jpegThumbnail,
        mimetype: 'image/jpeg',
        caption: '✅ *Source:* JPEG Thumbnail'
      })
    }

    return m.reply('❌ Thumbnail tidak ditemukan.')
  }
}

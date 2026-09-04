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
// plugins/owner/listthumb.js

import { listThumbs } from '../../db/thumbnails.js'

export default {
    command: 'listthumb',
    alias: ['listthumbnail', 'lt', 'thumblist', 'thumbnaillist'],
    category: 'owner',
    description: `Menampilkan daftar semua thumbnail & favicon tersimpan, dikelompokkan per status.

\`Cara Penggunaan:\`
> langsung kirim perintah: \`.listthumb\``,
    ownerOnly: true,
    typing: true,

    async execute(m) {
        const thumbs = listThumbs('thumbnail')
        const favicons = listThumbs('favicon')

        const randoms = thumbs.filter(t => t.status === 'random').map(t => `- \`${t.name}\``)
        const privates = thumbs.filter(t => t.status === 'private').map(t => `- \`${t.name}\``)
        const favLines = favicons.map(t => `- \`${t.name}\``)

        const section = (title, lines) =>
            `*${title}* (${lines.length}):\n${lines.length ? lines.join('\n') : '- _kosong_'}`

        const text = [
            `╾─「 *DAFTAR THUMBNAIL* 」─╼`,
            ``,
            section('🖼️ Thumbnail random', randoms),
            ``,
            section('🔒 Thumbnail private', privates),
            ``,
            section('🌐 Favicon', favLines)
        ].join('\n')

        return m.reply(text)
    }
}

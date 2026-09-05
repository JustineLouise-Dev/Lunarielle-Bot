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
// plugins/owner/addfavicon.js

import { addThumbFlow } from './addthumb.js'

export default {
    command: 'addfavicon',
    alias: ['addfav', 'addfavico'],
    category: 'owner',
    description: 'Menyimpan metadata favicon ke database dengan nama tertentu.\n\n' +
        '*Format Penggunaan:*\n' +
        '> `Reply gambar`\n> .addfavicon <nama>\n\n' +
        '> `Kirim gambar dengan caption`\n> .addfavicon <nama>\n\n' +
        '> `Dari URL gambar`\n> .addfavicon <nama> <url>',
    help: '`<nama>` `[url]`',
    ownerOnly: true,
    typing: true,
    wait: true,

    async execute(m, ctx) {
        return addThumbFlow(m, ctx, 'favicon')
    }
}

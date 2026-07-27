/*
 * Copyright (c) 2026 Justine Louise.
 * Created by Justine Louise.
 *
 * This software is provided for personal and educational use only.
 * Commercial use, resale, or distribution for profit is strictly prohibited
 * without prior written permission from the author.
 *
 * Please respect the developer's work.
 * Do not remove or modify this copyright notice or claim this project as your own.
 *
 * © 2026 Justine Louise. All Rights Reserved.
 */
import * as baileysNs from '@whiskeysockets/baileys';
import { sendMainMenu, sendCategoryDetail } from '../../lib/menuCategory.js';

const baileysNamed = typeof baileysNs.prepareWAMessageMedia === 'function' ? baileysNs : baileysNs.default || baileysNs;
const prepareWAMessageMedia = baileysNamed.prepareWAMessageMedia;

export default {
  name: 'Menu',
  command: ['menu', 'help'],
  tags: ['MainMenu'],
  description: 'Menampilkan menu utama (gambar + tombol View List kategori)',
  owner: false,

  async execute({ sock, msg, args, config, handler }) {
    const deps = { prepareWAMessageMedia };

    // Dipicu klik kategori di dalam bottom sheet "View List":
    // ".menu <Kategori> --content"
    const [maybeTag, maybeFlag] = args;
    if (maybeTag && maybeFlag === '--content') {
      const grouped = handler.getMenuGrouped();
      const matchedTag = Object.keys(grouped).find(
        (t) => t.toLowerCase() === maybeTag.toLowerCase()
      );
      if (matchedTag) {
        return sendCategoryDetail(sock, msg.key.remoteJid, msg, config, handler, matchedTag, deps);
      }
    }

    return sendMainMenu(sock, msg.key.remoteJid, msg, config, handler, deps);
  },
};

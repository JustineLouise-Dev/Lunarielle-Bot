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
import { replaceStickerMetadata } from '../../lib/sticker.js';

const baileysNamed =
  typeof baileysNs.downloadMediaMessage === 'function' ? baileysNs : baileysNs.default || baileysNs;
const downloadMediaMessage = baileysNamed.downloadMediaMessage;

function getQuotedSticker(msg) {
  const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
  const quoted = contextInfo?.quotedMessage;
  if (!quoted?.stickerMessage) return null;

  return {
    message: quoted,
    key: {
      remoteJid: msg.key.remoteJid,
      id: contextInfo.stanzaId,
      participant: contextInfo.participant,
    },
  };
}

export default {
  name: 'Sticker WM',
  command: ['swm'],
  tags: ['MakerMenu'],
  description: 'Mengganti packname stiker yang di-reply (format: <NamaBot> - <text>)',
  owner: false,
  group: false,

  async execute({ sock, msg, args, config }) {
    const remoteJid = msg.key.remoteJid;

    const target = getQuotedSticker(msg);
    if (!target) {
      await sock.sendMessage(
        remoteJid,
        { text: '⚠️ Reply sebuah stiker dengan perintah `.swm <text>` untuk mengganti packname-nya.' },
        { quoted: msg }
      );
      return;
    }

    const text = args.join(' ').trim();
    if (!text) {
      await sock.sendMessage(
        remoteJid,
        { text: '⚠️ Sertakan teks packname baru.\nContoh: `.swm Cinta Damai`' },
        { quoted: msg }
      );
      return;
    }

    let stickerBuffer;
    try {
      stickerBuffer = await downloadMediaMessage(
        { message: target.message, key: target.key },
        'buffer',
        {}
      );
    } catch (e) {
      console.error('[SWM ERROR] Gagal mengunduh stiker:', e);
      await sock.sendMessage(
        remoteJid,
        { text: '⚠️ Gagal mengunduh stiker. Coba reply ulang.' },
        { quoted: msg }
      );
      return;
    }

    const botName = config.botName || config.stickerPackname || 'Bot';
    const packname = `©${botName}`;
    const usertext = `${text}`;

    try {
      const newStickerBuffer = replaceStickerMetadata(stickerBuffer, usertext, packname);
      await sock.sendMessage(remoteJid, { sticker: newStickerBuffer }, { quoted: msg });
    } catch (e) {
      console.error('[SWM ERROR] Gagal mengganti metadata stiker:', e);
      await sock.sendMessage(
        remoteJid,
        { text: '⚠️ Gagal mengganti packname stiker. Pastikan pesan yang di-reply benar-benar stiker.' },
        { quoted: msg }
      );
    }
  },
};

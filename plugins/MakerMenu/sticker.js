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
import { createSticker } from '../../lib/sticker.js';

const baileysNamed =
  typeof baileysNs.downloadMediaMessage === 'function' ? baileysNs : baileysNs.default || baileysNs;
const downloadMediaMessage = baileysNamed.downloadMediaMessage;

const ANIMATED_EXT_BY_MIME = {
  'video/mp4': 'mp4',
  'video/3gpp': '3gp',
  'image/gif': 'gif',
};

function getTargetMessage(msg) {
  const contextInfo =
    msg.message?.extendedTextMessage?.contextInfo ||
    msg.message?.imageMessage?.contextInfo ||
    msg.message?.videoMessage?.contextInfo;

  const quoted = contextInfo?.quotedMessage;
  if (quoted && (quoted.imageMessage || quoted.videoMessage)) {
    return {
      message: quoted,
      key: {
        remoteJid: msg.key.remoteJid,
        id: contextInfo.stanzaId,
        participant: contextInfo.participant,
      },
    };
  }

  if (msg.message?.imageMessage || msg.message?.videoMessage) {
    return { message: msg.message, key: msg.key };
  }

  return null;
}

export default {
  name: 'Sticker',
  command: ['sticker', 's', 'stiker'],
  tags: ['MakerMenu'],
  description: 'Membuat stiker dari gambar atau video/GIF pendek (kirim/reply media dengan caption .sticker)',
  owner: false,
  group: false,

  async execute({ sock, msg, config }) {
    const remoteJid = msg.key.remoteJid;

    const target = getTargetMessage(msg);
    if (!target) {
      await sock.sendMessage(
        remoteJid,
        {
          text:
            '⚠️ Kirim atau reply gambar/video/GIF pendek dengan caption/perintah `.sticker`.',
        },
        { quoted: msg }
      );
      return;
    }

    const mediaMessage = target.message.imageMessage || target.message.videoMessage;
    const isVideo = !!target.message.videoMessage;

    if (isVideo && mediaMessage.seconds && mediaMessage.seconds > 10) {
      await sock.sendMessage(
        remoteJid,
        { text: '⚠️ Video/GIF terlalu panjang. Maksimal 10 detik untuk dijadikan stiker.' },
        { quoted: msg }
      );
      return;
    }

    let mediaBuffer;
    try {
      mediaBuffer = await downloadMediaMessage(
        { message: target.message, key: target.key },
        'buffer',
        {}
      );
    } catch (e) {
      console.error('[STICKER ERROR] Gagal mengunduh media:', e);
      await sock.sendMessage(
        remoteJid,
        { text: '⚠️ Gagal mengunduh media. Coba kirim ulang.' },
        { quoted: msg }
      );
      return;
    }

    const sourceExt = isVideo ? ANIMATED_EXT_BY_MIME[mediaMessage.mimetype] || 'mp4' : 'jpg';

    try {
      const stickerBuffer = await createSticker({
        buffer: mediaBuffer,
        isAnimated: isVideo,
        sourceExt,
        packname: config.stickerPackname,
        author: config.stickerAuthor,
      });

      await sock.sendMessage(remoteJid, { sticker: stickerBuffer }, { quoted: msg });
    } catch (e) {
      console.error('[STICKER ERROR] Gagal membuat stiker:', e);
      await sock.sendMessage(
        remoteJid,
        { text: '⚠️ Gagal membuat stiker. Pastikan format media didukung.' },
        { quoted: msg }
      );
    }
  },
};

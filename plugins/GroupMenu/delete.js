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

import { jidListIncludes } from '../../lib/utils.js';

export default {
  name: 'Delete',
  command: ['delete', 'del'],
  tags: ['GroupMenu'],
  description: 'Menghapus pesan yang di-reply (admin grup di grup, siapa saja di private chat)',
  owner: false,
  group: false, // bisa dipakai di grup MAUPUN private chat, dicek manual di bawah

  async execute({ sock, msg, sender }) {
    const remoteJid = msg.key.remoteJid;
    const isGroup = remoteJid.endsWith('@g.us');

    const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
    const quotedKey = contextInfo?.stanzaId
      ? {
          remoteJid,
          id: contextInfo.stanzaId,
          fromMe: false,
          ...(isGroup && contextInfo.participant ? { participant: contextInfo.participant } : {}),
        }
      : null;

    if (!quotedKey) {
      await sock.sendMessage(
        remoteJid,
        { text: '⚠️ Reply pesan yang mau dihapus, lalu ketik `.delete`.' },
        { quoted: msg }
      );
      return;
    }
      
    const botJidDigits = (sock?.user?.id || '').split(':')[0].split('@')[0];
    const quotedParticipantDigits = contextInfo.participant
      ? contextInfo.participant.split('@')[0]
      : null;

    quotedKey.fromMe = isGroup
      ? !!quotedParticipantDigits && quotedParticipantDigits === botJidDigits
      : !quotedParticipantDigits;

    if (isGroup) {
      const metadata = await sock.groupMetadata(remoteJid).catch(() => null);
      const admins = (metadata?.participants || [])
        .filter((p) => p.admin === 'admin' || p.admin === 'superadmin')
        .map((p) => p.id);

      if (!jidListIncludes(admins, sender)) {
        await sock.sendMessage(remoteJid, { text: '❌ Perintah ini khusus admin grup.' }, { quoted: msg });
        return;
      }
    }

    try {
      await sock.sendMessage(remoteJid, { delete: quotedKey });
    } catch (e) {
      console.error('[DELETE ERROR]', e);
      await sock.sendMessage(
        remoteJid,
        {
          text:
            '⚠️ Gagal menghapus pesan tersebut.\n' +
            (isGroup
              ? 'Pastikan bot masih admin di grup ini.'
              : 'Di private chat, bot hanya bisa menghapus pesannya sendiri untuk semua orang.'),
        },
        { quoted: msg }
      );
    }
  },
};

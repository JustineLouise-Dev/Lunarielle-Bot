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

import { jidListIncludes, resolveBotParticipant } from '../../lib/utils.js';

function normalizeNumberToJid(raw) {
  const digits = raw.replace(/[^0-9]/g, '');
  if (!digits) return null;
  return `${digits}@s.whatsapp.net`;
}

async function getGroupAdmins(sock, groupJid) {
  const metadata = await sock.groupMetadata(groupJid);
  const admins = metadata.participants
    .filter((p) => p.admin === 'admin' || p.admin === 'superadmin')
    .map((p) => p.id);
  return { metadata, admins };
}

export default {
  name: 'Add',
  command: ['add'],
  tags: ['GroupMenu'],
  description: 'Menambahkan member ke grup lewat nomor WhatsApp (khusus admin grup)',
  owner: false,
  group: true,

  async execute({ sock, msg, args, sender }) {
    const remoteJid = msg.key.remoteJid;

    if (!remoteJid.endsWith('@g.us')) {
      await sock.sendMessage(remoteJid, { text: '❌ Perintah ini hanya bisa dipakai di dalam grup.' }, { quoted: msg });
      return;
    }

    const { metadata, admins } = await getGroupAdmins(sock, remoteJid).catch(() => ({ metadata: null, admins: [] }));

    if (!jidListIncludes(admins, sender)) {
      await sock.sendMessage(remoteJid, { text: '❌ Perintah ini khusus admin grup.' }, { quoted: msg });
      return;
    }

    console.log('[ADD DEBUG] sock.user =', JSON.stringify({ id: sock?.user?.id, lid: sock?.user?.lid, phoneNumber: sock?.user?.phoneNumber }));
    const botParticipant = metadata ? await resolveBotParticipant(sock, metadata, sender) : null;
    console.log('[ADD DEBUG] botParticipant ditemukan:', JSON.stringify(botParticipant), botParticipant ? '(via Contact-field match / signalRepository / fallback eliminasi)' : '(TIDAK DITEMUKAN sama sekali)');
    const botIsAdmin = botParticipant?.admin === 'admin' || botParticipant?.admin === 'superadmin';
    if (!botIsAdmin) {
      await sock.sendMessage(remoteJid, { text: '❌ Bot harus dijadikan admin dulu untuk bisa menambahkan member.' }, { quoted: msg });
      return;
    }

    if (!args[0]) {
      await sock.sendMessage(
        remoteJid,
        { text: '⚠️ Sertakan nomor WhatsApp yang mau ditambahkan.\nContoh: `.add 6281234567890`' },
        { quoted: msg }
      );
      return;
    }

    const targetJid = normalizeNumberToJid(args[0]);
    if (!targetJid) {
      await sock.sendMessage(remoteJid, { text: '⚠️ Format nomor tidak valid.' }, { quoted: msg });
      return;
    }

    try {
      const result = await sock.groupParticipantsUpdate(remoteJid, [targetJid], 'add');
      const status = result?.[0]?.status;

      if (status === '200' || status === 200) {
        await sock.sendMessage(
          remoteJid,
          { text: `✅ Berhasil menambahkan @${targetJid.split('@')[0]} ke grup.`, mentions: [targetJid] },
          { quoted: msg }
        );
      } else if (status === '403') {
        const inviteCode = await sock.groupInviteCode(remoteJid).catch(() => null);
        const inviteText = inviteCode
          ? `⚠️ Nomor @${targetJid.split('@')[0]} tidak bisa ditambahkan langsung (pengaturan privasi).\nKirim link ini ke orangnya: https://chat.whatsapp.com/${inviteCode}`
          : `⚠️ Nomor @${targetJid.split('@')[0]} tidak bisa ditambahkan langsung (pengaturan privasi).`;
        await sock.sendMessage(remoteJid, { text: inviteText, mentions: [targetJid] }, { quoted: msg });
      } else {
        await sock.sendMessage(
          remoteJid,
          { text: `⚠️ Gagal menambahkan @${targetJid.split('@')[0]} (status: ${status || 'tidak diketahui'}).`, mentions: [targetJid] },
          { quoted: msg }
        );
      }
    } catch (e) {
      console.error('[ADD ERROR]', e);
      await sock.sendMessage(remoteJid, { text: '⚠️ Gagal menambahkan member. Pastikan bot masih admin.' }, { quoted: msg });
    }
  },
};

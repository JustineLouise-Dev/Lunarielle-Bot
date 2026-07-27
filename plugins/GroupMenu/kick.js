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

import { jidListIncludes, resolveBotParticipant, resolveParticipantJid } from '../../lib/utils.js';

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
  name: 'Kick',
  command: ['kick'],
  tags: ['GroupMenu'],
  description: 'Mengeluarkan member dari grup (khusus admin grup)',
  owner: false,
  group: true,

  async execute({ sock, msg, args, sender }) {
    const remoteJid = msg.key.remoteJid;
    console.log('[KICK DEBUG] execute() dipanggil. args=', args, 'sender=', sender);

    if (!remoteJid.endsWith('@g.us')) {
      console.log('[KICK DEBUG] bukan grup, keluar.');
      await sock.sendMessage(remoteJid, { text: '❌ Perintah ini hanya bisa dipakai di dalam grup.' }, { quoted: msg });
      return;
    }

    const { metadata, admins } = await getGroupAdmins(sock, remoteJid).catch((e) => {
      console.log('[KICK DEBUG] getGroupAdmins gagal:', e?.message);
      return { metadata: null, admins: [] };
    });
    console.log('[KICK DEBUG] admins ditemukan:', admins);

    if (!jidListIncludes(admins, sender)) {
      console.log('[KICK DEBUG] JALUR: sender bukan admin -> kirim "khusus admin grup"');
      await sock.sendMessage(remoteJid, { text: '❌ Perintah ini khusus admin grup.' }, { quoted: msg });
      return;
    }

    console.log('[KICK DEBUG] sock.user =', JSON.stringify({ id: sock?.user?.id, lid: sock?.user?.lid, phoneNumber: sock?.user?.phoneNumber }));
    const botParticipant = metadata ? await resolveBotParticipant(sock, metadata, sender) : null;
    console.log('[KICK DEBUG] botParticipant ditemukan:', JSON.stringify(botParticipant), botParticipant ? '(via Contact-field match / signalRepository / fallback eliminasi)' : '(TIDAK DITEMUKAN sama sekali)');
    const botIsAdmin = botParticipant?.admin === 'admin' || botParticipant?.admin === 'superadmin';
    console.log('[KICK DEBUG] botIsAdmin =', botIsAdmin);
    if (!botIsAdmin) {
      console.log('[KICK DEBUG] JALUR: bot bukan admin -> kirim "Bot harus dijadikan admin dulu"');
      await sock.sendMessage(remoteJid, { text: '❌ Bot harus dijadikan admin dulu untuk bisa mengeluarkan member.' }, { quoted: msg });
      return;
    }
    
    const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
    const mentioned = contextInfo?.mentionedJid || [];
    const repliedParticipant = contextInfo?.participant;

    let targetJid = mentioned[0] || repliedParticipant || (args[0] ? normalizeNumberToJid(args[0]) : null);
    console.log('[KICK DEBUG] targetJid resolved =', targetJid);

    if (!targetJid) {
      console.log('[KICK DEBUG] JALUR: tidak ada target -> kirim "Tag member..."');
      await sock.sendMessage(
        remoteJid,
        { text: '⚠️ Tag member yang mau dikeluarkan, reply pesannya, atau ketik nomornya.\nContoh: `.kick @user` / `.kick 6281234567890`' },
        { quoted: msg }
      );
      return;
    }

    if (jidListIncludes(admins, targetJid)) {
      console.log('[KICK DEBUG] JALUR: target adalah admin -> kirim "Tidak bisa mengeluarkan admin grup"');
      await sock.sendMessage(remoteJid, { text: '❌ Tidak bisa mengeluarkan admin grup.' }, { quoted: msg });
      return;
    }
    
    const resolvedTargetJid = resolveParticipantJid(metadata, targetJid);
    console.log('[KICK DEBUG] resolvedTargetJid =', resolvedTargetJid, '(dari targetJid mentah:', targetJid, ')');

    try {
      console.log('[KICK DEBUG] memanggil groupParticipantsUpdate...');
      const result = await sock.groupParticipantsUpdate(remoteJid, [resolvedTargetJid], 'remove');
      console.log('[KICK DEBUG] hasil groupParticipantsUpdate =', JSON.stringify(result));
      const status = result?.[0]?.status;
      
      if (status === '200' || status === 200) {
        await sock.sendMessage(
          remoteJid,
          { text: `✅ Berhasil mengeluarkan @${resolvedTargetJid.split('@')[0]} dari grup.`, mentions: [resolvedTargetJid] },
          { quoted: msg }
        );
      } else {
        await sock.sendMessage(
          remoteJid,
          {
            text: `⚠️ Gagal mengeluarkan @${resolvedTargetJid.split('@')[0]} (status: ${status || 'tidak diketahui'}).\nCoba lagi, atau pastikan bot & target masih benar-benar berada di grup ini.`,
            mentions: [resolvedTargetJid],
          },
          { quoted: msg }
        );
      }
    } catch (e) {
      console.error('[KICK ERROR]', e);
      await sock.sendMessage(remoteJid, { text: '⚠️ Gagal mengeluarkan member. Pastikan bot masih admin.' }, { quoted: msg });
    }
  },
};

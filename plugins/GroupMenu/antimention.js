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
import { getGroupSetting, setGroupSetting } from '../../lib/groupSettings.js';

async function getGroupAdmins(sock, groupJid) {
  const metadata = await sock.groupMetadata(groupJid);
  const admins = metadata.participants
    .filter((p) => p.admin === 'admin' || p.admin === 'superadmin')
    .map((p) => p.id);
  return { metadata, admins };
}

export default {
  name: 'AntiMention',
  command: ['antimention'],
  tags: ['GroupMenu'],
  description: 'Aktif/nonaktifkan penghapusan otomatis pesan mention grup/tag-all di grup (khusus admin grup)',
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

    const sub = (args[0] || '').toLowerCase();

    if (!sub) {
      const current = getGroupSetting(remoteJid, 'antiMention', false);
      await sock.sendMessage(
        remoteJid,
        {
          text:
            `🛡️ Anti-Mention saat ini: ${current ? '*AKTIF* ✅' : '*NONAKTIF* ❌'}\n\n` +
            'Ketik `.antimention on` untuk mengaktifkan, atau `.antimention off` untuk menonaktifkan.',
        },
        { quoted: msg }
      );
      return;
    }

    if (sub !== 'on' && sub !== 'off') {
      await sock.sendMessage(
        remoteJid,
        { text: '⚠️ Gunakan `.antimention on` atau `.antimention off`.' },
        { quoted: msg }
      );
      return;
    }

    const enable = sub === 'on';

    if (enable) {
      const botParticipant = metadata ? await resolveBotParticipant(sock, metadata, sender) : null;
      const botIsAdmin = botParticipant?.admin === 'admin' || botParticipant?.admin === 'superadmin';
      if (!botIsAdmin) {
        await sock.sendMessage(
          remoteJid,
          { text: '❌ Bot harus dijadikan admin dulu supaya bisa menghapus pesan mention/tag-all secara otomatis.' },
          { quoted: msg }
        );
        return;
      }
    }

    setGroupSetting(remoteJid, 'antiMention', enable);

    await sock.sendMessage(
      remoteJid,
      {
        text: enable
          ? '✅ Anti-Mention *diaktifkan*. Pesan yang mention banyak member sekaligus atau men-tag grup ini di status akan otomatis dihapus.'
          : '✅ Anti-Mention *dinonaktifkan*.',
      },
      { quoted: msg }
    );
  },
};

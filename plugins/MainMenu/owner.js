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
export default {
  name: 'Owner',
  command: ['owner'],
  tags: ['MainMenu'],
  description: 'Mengirim kontak owner bot',
  owner: false,

  async execute({ sock, msg, config }) {
    const vcard =
      'BEGIN:VCARD\n' +
      'VERSION:3.0\n' +
      `FN:${config.ownerName}\n` +
      `TEL;type=CELL;type=VOICE;waid=${config.ownerNumber}:+${config.ownerNumber}\n` +
      'END:VCARD';

    await sock.sendMessage(
      msg.key.remoteJid,
      {
        contacts: {
          displayName: config.ownerName,
          contacts: [{ vcard }],
        },
      },
      { quoted: msg }
    );
  },
};

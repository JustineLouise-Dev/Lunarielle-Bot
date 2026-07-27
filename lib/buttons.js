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
export function quickReplyButton(displayText, id) {
  return {
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({ display_text: displayText, id }),
  };
}

export function urlButton(displayText, url) {
  return {
    name: 'cta_url',
    buttonParamsJson: JSON.stringify({ display_text: displayText, url }),
  };
}

export async function sendWithButtons(sock, jid, text, buttons, options = {}) {
  const { quoted, footer, title } = options;

  try {
    const interactive = {
      body: { text },
      footer: footer ? { text: footer } : undefined,
      header: title ? { title, hasMediaAttachment: false } : undefined,
      nativeFlowMessage: {
        buttons,
      },
      contextInfo: {},
    };

    if (quoted) {
      interactive.contextInfo.stanzaId = quoted.key.id;
      interactive.contextInfo.participant = quoted.key.participant || quoted.key.remoteJid;
      interactive.contextInfo.quotedMessage = quoted.message || quoted;
    }

    const relayResult = await sock.relayMessage(jid, { interactiveMessage: interactive }, {});
    return { key: { id: relayResult, fromMe: true, remoteJid: jid } };
  } catch (err) {
    try {
      const legacyButtons = buttons
        .filter((b) => b.name === 'quick_reply')
        .map((b) => {
          const parsed = JSON.parse(b.buttonParamsJson);
          return {
            buttonId: parsed.id,
            buttonText: { displayText: parsed.display_text },
            type: 1,
          };
        });

      if (legacyButtons.length > 0) {
        return await sock.sendMessage(jid, { text, footer, buttons: legacyButtons, headerType: 1 }, { quoted });
      }
      throw err;
    } catch (err2) {
      return await sock.sendMessage(jid, { text }, { quoted });
    }
  }
}

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

import { getGroupSetting } from './groupSettings.js';

const MENTION_THRESHOLD = 5;

const NOTICE_GROUP_STATUS_MENTION =
  '🚫 Grup ini melarang mention grup dalam status. Pesan tersebut otomatis dihapus.';
const NOTICE_MASS_MENTION =
  '🚫 Grup ini melarang tag/mention banyak member sekaligus. Pesan tersebut otomatis dihapus.';

export async function handleAntiMention({ sock, msg, isOwner }) {
  const remoteJid = msg?.key?.remoteJid;
  if (!remoteJid || !remoteJid.endsWith('@g.us')) return false;
  if (msg.key.fromMe) return false;
  if (isOwner) return false;

  if (!getGroupSetting(remoteJid, 'antiMention', false)) return false;
  
  const isGroupStatusMention = !!msg.message?.groupStatusMentionMessage;
  
  const contextInfo =
    msg.message?.extendedTextMessage?.contextInfo ||
    msg.message?.imageMessage?.contextInfo ||
    msg.message?.videoMessage?.contextInfo ||
    msg.message?.conversation?.contextInfo;

  const mentionedJid = contextInfo?.mentionedJid || [];
  const isMassMention = mentionedJid.length >= MENTION_THRESHOLD;

  if (!isGroupStatusMention && !isMassMention) return false;

  console.log(
    `[ANTI-MENTION] Terdeteksi di ${remoteJid}: groupStatusMention=${isGroupStatusMention}, ` +
    `massMention=${isMassMention} (jumlah mention=${mentionedJid.length})`
  );

  try {
    await sock.sendMessage(remoteJid, { delete: msg.key });
    
    const notice = isGroupStatusMention ? NOTICE_GROUP_STATUS_MENTION : NOTICE_MASS_MENTION;
    await sock.sendMessage(remoteJid, { text: notice }).catch((e) => {
      console.error('[ANTI-MENTION ERROR] Gagal mengirim pesan penjelasan:', e?.message || e);
    });

    return true;
  } catch (e) {
    console.error('[ANTI-MENTION ERROR] Gagal menghapus pesan mention:', e?.message || e);
    return false;
  }
}

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
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function extractInteractiveResponseId(message) {
  const raw = message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson;
  if (!raw) return '';
  try {
    const parsed = JSON.parse(raw);
    return parsed?.id || '';
  } catch {
    return '';
  }
}

export function extractText(message) {
  if (!message) return '';
  return (
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    message.videoMessage?.caption ||
    message.buttonsResponseMessage?.selectedButtonId ||
    message.listResponseMessage?.singleSelectReply?.selectedRowId ||
    message.templateButtonReplyMessage?.selectedId ||
    extractInteractiveResponseId(message) ||
    ''
  );
}

export function getSender(msg) {
  return msg.key.participant || msg.key.remoteJid;
}

export function getSenderCandidates(msg) {
  const key = msg.key || {};
  const candidates = [
    key.participant,
    key.remoteJid,
    key.remoteJidAlt,
    key.participantPn,
    key.senderPn,
    key.participantAlt, 
  ].filter(Boolean);
  return [...new Set(candidates)];
}

export function isOwnerMessage(msg, ownerNumber) {
  const targetDigits = String(ownerNumber || '').replace(/[^0-9]/g, '');
  const matchedByNumber =
    !!targetDigits &&
    getSenderCandidates(msg).some((jid) => {
      const digits = String(jid).split('@')[0].replace(/[^0-9]/g, '');
      return digits === targetDigits;
    });

  if (matchedByNumber) return true;
  if (msg?.key?.fromMe === true) return true;
  return false;
}

export async function resolveOwnerLid(sock, ownerNumber) {
  try {
    const lidMapping = sock?.signalRepository?.lidMapping;
    if (!lidMapping || typeof lidMapping.getLIDForPN !== 'function') return null;
    const pnJid = `${ownerNumber}@s.whatsapp.net`;
    const lid = await lidMapping.getLIDForPN(pnJid);
    return lid || null;
  } catch {
    return null;
  }
}

export function isOwnerMessageWithLid(msg, ownerNumber, ownerLid) {
  if (isOwnerMessage(msg, ownerNumber)) return true;
  if (!ownerLid) return false;

  const ownerLidDigits = String(ownerLid).split('@')[0];
  return getSenderCandidates(msg).some((jid) => String(jid).split('@')[0] === ownerLidDigits);
}

export function jidDigits(jid) {
  const beforeServer = String(jid || '').split('@')[0];
  const beforeDeviceId = beforeServer.split(':')[0];
  return beforeDeviceId.replace(/[^0-9]/g, '');
}

export function jidListIncludes(list, jid) {
  const target = jidDigits(jid);
  if (!target) return false;
  return (list || []).some((item) => jidDigits(item) === target);
}

export async function resolveBotParticipant(sock, metadata, excludeJid = null) {
  const botDigitsSet = new Set(
    [sock?.user?.id, sock?.user?.lid, sock?.user?.phoneNumber]
      .map(jidDigits)
      .filter(Boolean)
  );

  const participants = metadata?.participants || [];

  if (botDigitsSet.size > 0) {
    const byContactFields = participants.find((p) => {
      const participantDigits = [p.id, p.lid, p.phoneNumber].map(jidDigits).filter(Boolean);
      return participantDigits.some((d) => botDigitsSet.has(d));
    });
    if (byContactFields) return byContactFields;
  }
  
  try {
    const lidMapping = sock?.signalRepository?.lidMapping;
    const rawId = sock?.user?.id;
    if (lidMapping && typeof lidMapping.getLIDForPN === 'function' && rawId) {
      const pnDigits = jidDigits(rawId);
      if (pnDigits) {
        const lid = await lidMapping.getLIDForPN(`${pnDigits}@s.whatsapp.net`);
        const lidDigits = jidDigits(lid);
        if (lidDigits) {
          const byResolvedLid = participants.find((p) =>
            [p.id, p.lid, p.phoneNumber].map(jidDigits).filter(Boolean).includes(lidDigits)
          );
          if (byResolvedLid) return byResolvedLid;
        }
      }
    }
  } catch {
  }
  
  const admins = participants.filter((p) => p.admin === 'admin' || p.admin === 'superadmin');
  if (excludeJid) {
    const excludeDigits = jidDigits(excludeJid);
    const remaining = admins.filter((p) => jidDigits(p.id) !== excludeDigits);
    if (remaining.length === 1) return remaining[0];
  }

  return null;
}

export function resolveParticipantJid(metadata, candidateJid) {
  const targetDigits = jidDigits(candidateJid);
  if (!targetDigits) return candidateJid;

  const participants = metadata?.participants || [];
  const match = participants.find((p) => jidDigits(p.id) === targetDigits);
  return match?.id || candidateJid;
}

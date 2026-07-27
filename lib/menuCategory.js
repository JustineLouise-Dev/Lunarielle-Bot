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
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const CATEGORY_BUTTON_PREFIX = '_cat:'; // dipakai submenu.execute untuk tombol "Kembali"
export const BACK_BUTTON_ID = '_cat:__back__';

function sortTags(tags) {
  return [...tags].sort((a, b) => {
    if (a === 'MainMenu') return -1;
    if (b === 'MainMenu') return 1;
    return a.localeCompare(b);
  });
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts = [];
  if (d) parts.push(`${d}h`); // h = "hari"
  if (h) parts.push(`${h}j`); // j = "jam"
  if (m) parts.push(`${m}m`);
  if (!d && !h) parts.push(`${s}d`); // d = "detik", hanya ditampilkan untuk durasi pendek
  return parts.length ? parts.join(' ') : '0d';
}

function buildSummaryBody(config, grouped, tags) {
  const emojiMap = config.categoryEmoji || {};
  const totalCommands = tags.reduce((sum, t) => sum + grouped[t].length, 0);
  const uptime = formatUptime(process.uptime());
  const now = new Date();
  const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  let text = '';
  text += `✦ *${config.botName}* ✦\n`;
  text += `Halo, selamat datang! 👋\n\n`;

  text += `👤 Owner   ·  ${config.ownerName}\n`;
  text += `🕐 Waktu   ·  ${timeStr} WIB\n`;
  text += `📦 Menu    ·  ${tags.length} kategori · ${totalCommands} perintah\n`;
  text += `⏱️ Uptime  ·  ${uptime}\n`;
  text += `┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n`;

  text += `*Pilih kategori:*\n`;
  for (const tag of tags) {
    const emoji = emojiMap[tag] || '📂';
    const count = grouped[tag].length;
    text += `${emoji}  ${tag}  ·  ${count} cmd\n`;
  }

  text += `\n_Tekan *View List* di bawah untuk membuka kategori._\n`;
  text += `┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n`;
  text += `✦ ${config.footer} ✦`;
  return text;
}

function buildCategoryDetailBody(config, grouped, tag) {
  const emojiMap = config.categoryEmoji || {};
  const emoji = emojiMap[tag] || '📂';
  const plugins = grouped[tag] || [];
  const prefix = config.prefix;

  let text = `${emoji} *${tag}*\n`;
  text += `${plugins.length} perintah tersedia\n`;
  text += `┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n`;

  plugins.forEach((plugin, i) => {
    const num = i + 1;
    const cmdList = plugin.commands.map((c) => `${prefix}${c}`).join(' / ');
    const lock = plugin.owner ? ' 🔒' : '';
    text += `*${num}.* \`${cmdList}\`${lock}\n`;
    text += `   ↳ _${plugin.description}_\n\n`;
  });

  text += `┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n`;
  text += `✦ ${config.footer} ✦`;
  return text;
}

async function buildThumbnailImageMessage(sock, config, prepareWAMessageMedia) {
  if (!config.menuThumbnail) return undefined;

  const thumbPath = path.isAbsolute(config.menuThumbnail)
    ? config.menuThumbnail
    : path.join(__dirname, '..', config.menuThumbnail);

  if (!fs.existsSync(thumbPath)) {
    console.log(
      `[MENU] File thumbnail "${thumbPath}" belum ada — .menu dikirim tanpa gambar header. ` +
      `Taruh gambar di path itu (lihat assets/README.md) untuk mengaktifkan.`
    );
    return undefined;
  }

  try {
    const buffer = fs.readFileSync(thumbPath);
    const { imageMessage } = await prepareWAMessageMedia(
      { image: buffer },
      { upload: sock.waUploadToServer }
    );
    return imageMessage;
  } catch (e) {
    console.error('[MENU] Gagal upload thumbnail:', e);
    return undefined;
  }
}

function buildBaseContextInfo(config, msg) {
  const ctx = {};
  if (msg) {
    ctx.stanzaId = msg.key.id;
    ctx.participant = msg.key.participant || msg.key.remoteJid;
    ctx.quotedMessage = msg.message;
  }

  const nf = config.newsletterForward || {};
  if (nf.enabled) {
    ctx.forwardingScore = 19;
    ctx.isForwarded = true;
    ctx.forwardedNewsletterMessageInfo = {
      newsletterJid: nf.newsletterJid,
      newsletterName: nf.newsletterName,
      serverMessageId: nf.serverMessageId,
    };
  }
  return ctx;
}

function buildMainMenuUrlButtons(config) {
  const links = config.links || {};
  const buttons = [];

  if (links.groupUrl) {
    buttons.push({
      name: 'cta_url',
      buttonParamsJson: JSON.stringify({
        display_text: '👥 Grup',
        url: links.groupUrl,
        merchant_url: links.groupUrl,
      }),
    });
  }

  if (links.newsletterUrl) {
    buttons.push({
      name: 'cta_url',
      buttonParamsJson: JSON.stringify({
        display_text: '📢 Channel',
        url: links.newsletterUrl,
        merchant_url: links.newsletterUrl,
      }),
    });
  }
  
  buttons.push({
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({
      display_text: '👑 Owner',
      id: 'owner_contact',
    }),
  });

  return buttons;
}

export async function sendMainMenu(sock, jid, msg, config, handler, deps) {
  const grouped = handler.getMenuGrouped();
  const tags = sortTags(Object.keys(grouped));
  const emojiMap = config.categoryEmoji || {};

  const bodyText = buildSummaryBody(config, grouped, tags);
  const imageMessage = await buildThumbnailImageMessage(sock, config, deps.prepareWAMessageMedia);
  
  const bottomSheetButtons = tags.map((tag) => {
    const emoji = emojiMap[tag] || '📂';
    return {
      name: 'quick_reply',
      buttonParamsJson: JSON.stringify({
        display_text: `${emoji} ${tag}`,
        id: `${config.prefix}menu ${tag} --content`,
      }),
    };
  });

  const interactive = {
    header: {
      title: '',
      hasMediaAttachment: !!imageMessage,
      ...(imageMessage ? { imageMessage } : {}),
    },
    body: { text: bodyText },
    footer: { text: `Created by ${config.creatorName || config.ownerName}` },
    nativeFlowMessage: {
      buttons: buildMainMenuUrlButtons(config).concat([
        {
          name: 'single_select',
          buttonParamsJson: JSON.stringify({ has_multiple_buttons: true }),
        },
      ]),
      messageParamsJson: JSON.stringify({
        bottom_sheet: {
          in_thread_buttons_limit: 5,
          list_title: 'All Tag',
          button_title: 'View List',
        },
      }),
    },
    contextInfo: buildBaseContextInfo(config, msg),
  };
  
  interactive.nativeFlowMessage.buttons.push(...bottomSheetButtons);

  const relayResult = await sock.relayMessage(jid, { interactiveMessage: interactive }, {});
  return { key: { id: relayResult, fromMe: true, remoteJid: jid } };
}

export async function sendCategoryDetail(sock, jid, msg, config, handler, tag, deps) {
  const grouped = handler.getMenuGrouped();
  if (!grouped[tag]) {
    return sendMainMenu(sock, jid, msg, config, handler, deps);
  }

  const bodyText = buildCategoryDetailBody(config, grouped, tag);

  const interactive = {
    body: { text: bodyText },
    footer: { text: `Created by ${config.creatorName || config.ownerName}` },
    nativeFlowMessage: {
      buttons: [
        {
          name: 'quick_reply',
          buttonParamsJson: JSON.stringify({ display_text: '⬅️ Kembali ke Menu', id: `${config.prefix}menu` }),
        },
      ],
    },
    contextInfo: buildBaseContextInfo(config, msg),
  };

  const relayResult = await sock.relayMessage(jid, { interactiveMessage: interactive }, {});
  return { key: { id: relayResult, fromMe: true, remoteJid: jid } };
}

export async function handleCategoryButton({ sock, jid, msg, text, config, handler, deps }) {
  if (!text.startsWith(CATEGORY_BUTTON_PREFIX)) return false;

  const tag = text.slice(CATEGORY_BUTTON_PREFIX.length);
  if (tag === '__back__') {
    await sendMainMenu(sock, jid, msg, config, handler, deps);
  } else {
    await sendCategoryDetail(sock, jid, msg, config, handler, tag, deps);
  }
  return true;
}

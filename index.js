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

/*!-======[ Mudules Imports ]======-!*/
import readline from 'readline';
import fs from 'fs';
import chalk from 'chalk';
import pino from 'pino';
import * as baileysNs from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';

import { Connecting } from './systemConnext.js';
import { session, owner, cfg, sleep, config } from './config.js';
import handler from './module/handler.js';
import { extractText, getSender, isOwnerMessageWithLid, resolveOwnerLid } from './lib/utils.js';
import { handleAntiMention } from './lib/antiMention.js';
import { listGroupsWithSetting } from './lib/groupSettings.js';
import { handleCategoryButton } from './lib/menuCategory.js';
import { installRelayInjection, installSendMessageOverride } from './lib/relayInjection.js';
import { richLog } from './lib/logger.js';

const baileysNamed =
  typeof baileysNs.useMultiFileAuthState === 'function'
    ? baileysNs
    : baileysNs.default || baileysNs;

const makeWASocket = baileysNamed.makeWASocket || baileysNamed.default || baileysNs.default || baileysNs;
const useMultiFileAuthState = baileysNamed.useMultiFileAuthState;
const DisconnectReason = baileysNamed.DisconnectReason;
const getContentType = baileysNamed.getContentType;
const Browsers = baileysNamed.Browsers;
const makeCacheableSignalKeyStore = baileysNamed.makeCacheableSignalKeyStore;
const fetchLatestBaileysVersion = baileysNamed.fetchLatestBaileysVersion;
const generateWAMessageContent = baileysNamed.generateWAMessageContent;
const generateMessageIDV2 = baileysNamed.generateMessageIDV2;
const prepareWAMessageMedia = baileysNamed.prepareWAMessageMedia;

if (typeof useMultiFileAuthState !== 'function') {
  console.error(
    'FATAL: useMultiFileAuthState tidak ditemukan di package @whiskeysockets/baileys.\n' +
    'Kemungkinan penyebab:\n' +
    '  1. node_modules belum lengkap ter-install — jalankan: rm -rf node_modules package-lock.json && npm install\n' +
    '  2. Versi baileys yang ter-install tidak kompatibel — cek dengan: npm ls @whiskeysockets/baileys\n' +
    '  3. Sedang memakai package "baileys" (tanpa scope) alih-alih "@whiskeysockets/baileys" — pastikan package.json konsisten.'
  );
  process.exit(1);
}

let logger = pino({ level: process.env.LOG_LEVEL || 'warn' });
let Exp;

let rl;
function getRL() {
  if (!rl) {
    rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  }
  return rl;
}
const question = (text) => new Promise((resolve) => getRL().question(text, resolve));
function closeRL() {
  if (rl) {
    rl.close();
    rl = undefined;
  }
}

const groupNameCache = new Map(); // jid -> { name, expiresAt }
const GROUP_NAME_TTL = 5 * 60 * 1000;
async function getGroupNameCached(sock, jid) {
  const cached = groupNameCache.get(jid);
  if (cached && Date.now() < cached.expiresAt) return cached.name;
  try {
    const meta = await sock.groupMetadata(jid);
    const name = meta?.subject || jid.split('@')[0];
    groupNameCache.set(jid, { name, expiresAt: Date.now() + GROUP_NAME_TTL });
    return name;
  } catch {
    const fallback = jid.split('@')[0];
    groupNameCache.set(jid, { name: fallback, expiresAt: Date.now() + 30_000 });
    return fallback;
  }
}

async function launch() {
  try {
    const credsPath = `${session}/creds.json`;
    if (fs.existsSync(session) && !fs.existsSync(credsPath)) {
      fs.rmSync(session, { recursive: true, force: true });
    }

    if (!fs.existsSync(credsPath)) {
      let quest = `\n${chalk.red.bold('╭──────────────────────────────────────────────────────╮')}\n${chalk.red.bold('│')} ${chalk.bold('❗️ Anda belum memiliki session ❗️')} ${chalk.red.bold('│')}\n${chalk.red.bold('╰──────────────────────────────────────────────────────╯')}\n            \n${chalk.green('🏷 Pilih salah satu dari opsi berikut untuk menautkan perangkat:')}\n${chalk.blue('▪︎ qr')}\n${chalk.blue('▪︎ pairing')}\n\n${chalk.yellow('* Ketik salah satu dari opsi di atas, contoh:')} ${chalk.blue.bold('pairing')}\n\n${chalk.yellow('Please type here: ')}`;

      const opsi = (await question(quest)).trim().toLowerCase();
      if (opsi === 'pairing') {
        global.pairingCode = true;
      } else if (opsi === 'qr') {
        global.pairingCode = false;
      } else {
        console.log('Pilihan opsi tidak tersedia, default ke QR.');
        global.pairingCode = false;
      }
    } else {
      // session sudah ada, ikuti preferensi config.json kalau ada
      global.pairingCode = !!config.usePairingCode;
    }

    let { state, saveCreds } = await useMultiFileAuthState(session);
    
    let waVersion;
    try {
      const versionInfo = await Promise.race([
        fetchLatestBaileysVersion(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000)),
      ]);
      waVersion = versionInfo.version;
      console.log(
        chalk.gray(
          `[WA VERSION] Memakai versi ${waVersion.join('.')} ${versionInfo.isLatest ? '(terbaru)' : '(fallback, kemungkinan sudah tidak terbaru)'}`
        )
      );
    } catch (e) {
      console.log(
        chalk.yellow(
          '[WA VERSION] Gagal mengambil versi terbaru (timeout/koneksi bermasalah), memakai default bawaan baileys. ' +
          'Kalau koneksi gagal dengan error 405, coba jalankan ulang bot saat koneksi internet lebih stabil.'
        )
      );
    }

    Exp = makeWASocket({
      logger,
      version: waVersion,
      browser: Browsers.ubuntu('Chrome'),
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
      },
      retryRequestDelayMs: 5000,
      maxMsgRetryCount: 2,
      getMessage: async () => undefined,
      generateHighQualityLinkPreview: true,
      syncFullHistory: false,
    });
    
    installRelayInjection(Exp, config);
    installSendMessageOverride(Exp, { generateWAMessageContent, generateMessageIDV2, getContentType });

    // ---- Pairing code flow ----
    if (global.pairingCode && !Exp.authState.creds.registered) {
      await sleep(1000);
      let phoneNumber = config.pairingNumberFixed;
      if (!phoneNumber) {
        phoneNumber = await question(chalk.yellow('Masukkan nomor WhatsApp bot (contoh 62812xxxx): '));
      }
      phoneNumber = phoneNumber.replace(/[+ -]/g, '');

      const customCode = config.customPairingCode || undefined;
      const validCustomCode =
        customCode && /^[A-Za-z0-9]{8}$/.test(customCode) ? customCode : undefined;
      if (customCode && !validCustomCode) {
        console.log(
          chalk.red(
            `customPairingCode "${customCode}" tidak valid: harus persis 8 karakter alfanumerik (A-Z/0-9). Menggunakan kode acak dari WhatsApp.`
          )
        );
      }

      let code;
      try {
        code = validCustomCode
          ? await Exp.requestPairingCode(phoneNumber, validCustomCode)
          : await Exp.requestPairingCode(phoneNumber);
      } catch (err) {
        console.log(
          chalk.red(
            'Gagal meminta pairing code — koneksi ke server WhatsApp terputus sebelum kode ' +
            'diterima. Ini biasanya karena jaringan tidak stabil.'
          )
        );
        console.log('Mencoba lagi dalam 5 detik...');
        closeRL();
        setTimeout(() => launch(), 5000);
        return;
      }

      console.log(
        chalk.bold.rgb(255, 136, 0)(
          `\n  ╭────────────────────────────╮\n  │  ${chalk.yellow('Your Pairing Code:')} ${chalk.greenBright(code)}  │\n  ╰────────────────────────────╯\n            `
        )
      );
    }
    
    closeRL();
    
    let ownerLid = null;

    Exp.ev.on('connection.update', async (update) => {
      await Connecting({ update, Exp, Boom, DisconnectReason, sleep, launch });
      if (update.connection === 'open') {
        ownerLid = await resolveOwnerLid(Exp, config.ownerNumber);
        richLog.sys(
          ownerLid
            ? `[OWNER LID] Berhasil resolusi LID owner: ${ownerLid}`
            : '[OWNER LID] Gagal resolusi LID owner (metode belum tersedia / owner belum pernah ' +
              'chat bot ini) — perintah owner tetap bisa dipakai lewat deteksi nomor/fromMe biasa.'
        );
      }
    });

    Exp.ev.on('creds.update', saveCreds);

    Exp.ev.on('messages.upsert', async ({ type, messages }) => {
      console.log(chalk.gray(`[UPSERT] type=${type} jumlah=${messages?.length ?? 0}`));

      if (type !== 'notify' && type !== 'append') return;

      for (const msg of messages) {
        try {
          const remoteJid = msg?.key?.remoteJid;
          const isMessage = msg?.message;
          const isStubType = msg?.messageStubType;
          
          if (!(isMessage || isStubType)) continue;

          if (remoteJid === 'status@broadcast') {
            if (cfg.reactsw.on) {
              let { emojis } = cfg.reactsw;
              await Exp.sendMessage(
                remoteJid,
                {
                  react: {
                    key: msg.key,
                    text: emojis[Math.floor(Math.random() * emojis.length)],
                  },
                },
                {
                  statusJidList: [
                    msg.key.participant,
                    Exp.user.id.split(':')[0] + '@s.whatsapp.net',
                  ],
                }
              );
            } else if (cfg.autoreadsw === true) {
              await Exp.readMessages([msg.key]);
              let typ = getContentType(msg.message);
              console.log(
                /protocolMessage/i.test(typ)
                  ? `${msg.key.participant.split('@')[0]} Deleted story❗`
                  : 'View user stories : ' + msg.key.participant.split('@')[0]
              );
            }
            continue;
          }

          if (!isMessage) continue;

          const text = extractText(msg.message).trim();
          
          console.log(
            chalk.gray(
              `[DEBUG MSG] fromMe=${msg.key.fromMe} tipe=${Object.keys(msg.message || {}).join(',')} text="${text}"`
            )
          );
          
          if (text && !text.startsWith('menu_shortcut:') && text !== 'owner_contact' && !text.startsWith('_cat:')) {
            const groupName = remoteJid.endsWith('@g.us')
              ? await getGroupNameCached(Exp, remoteJid)
              : null;
            richLog.message(remoteJid, msg.pushName, text, groupName);
          }
          
          const isOwnerForAntiMention = isOwnerMessageWithLid(msg, config.ownerNumber, ownerLid);
          const wasMentionDeleted = await handleAntiMention({ sock: Exp, msg, isOwner: isOwnerForAntiMention }).catch((e) => {
            console.log(chalk.red('[ANTI-MENTION ERROR]'));
            console.error(e);
            return false;
          });
          if (wasMentionDeleted) continue;
          
          if (text.startsWith('menu_shortcut:')) {
            const aliasCmd = text.slice('menu_shortcut:'.length);
            const aliasPlugin = handler.findCommand(aliasCmd);
            if (aliasPlugin) {
              const sender = getSender(msg);
              await aliasPlugin.module.execute({
                sock: Exp,
                msg,
                args: [],
                text: `${config.prefix}${aliasCmd}`,
                command: aliasCmd,
                config,
                handler,
                isOwner: isOwnerMessageWithLid(msg, config.ownerNumber, ownerLid),
                sender,
              }).catch((e) => {
                console.log(chalk.red(`[SHORTCUT BUTTON ERROR] "${aliasCmd}"`));
                console.error(e);
              });
            }
            continue;
          }
          
          if (text === 'owner_contact') {
            const ownerJid = `${config.ownerNumber}@s.whatsapp.net`;
            const vcard =
              'BEGIN:VCARD\n' +
              'VERSION:3.0\n' +
              `FN:${config.ownerName}\n` +
              `ORG:${config.botName};\n` +
              `TEL;type=CELL;type=VOICE;waid=${config.ownerNumber}:+${config.ownerNumber}\n` +
              'END:VCARD';

            await Exp.sendMessage(
              remoteJid,
              {
                contacts: {
                  displayName: config.ownerName,
                  contacts: [{ vcard }],
                },
              },
              { quoted: msg }
            ).catch((e) => {
              console.log(chalk.red('[OWNER CONTACT BUTTON ERROR]'));
              console.error(e);
            });
            continue;
          }
          
          const handledCategory = await handleCategoryButton({
            sock: Exp,
            jid: remoteJid,
            msg,
            text,
            config,
            handler,
            deps: { prepareWAMessageMedia },
          }).catch((e) => {
            console.log(chalk.red('[CATEGORY BUTTON ERROR]'));
            console.error(e);
            return false;
          });
          if (handledCategory) continue;

          // ---- Dispatch ke sistem plugin modular ----
          if (!text.startsWith(config.prefix)) continue;

          const withoutPrefix = text.slice(config.prefix.length).trim();
          const [cmdRaw, ...args] = withoutPrefix.split(/\s+/);
          const cmd = (cmdRaw || '').toLowerCase();
          if (!cmd) continue;

          const plugin = handler.findCommand(cmd);
          console.log(
            chalk.gray(
              `[DEBUG CMD] cmd="${cmd}" plugin_ditemukan=${!!plugin} total_command_terdaftar=${handler.commandIndex.size}`
            )
          );
          if (!plugin) {
            const groupNameNf = remoteJid.endsWith('@g.us')
              ? await getGroupNameCached(Exp, remoteJid)
              : null;
            richLog.notFound(remoteJid, msg.pushName, cmd, groupNameNf);
            continue;
          }

          const sender = getSender(msg);
          const isOwner = isOwnerMessageWithLid(msg, config.ownerNumber, ownerLid);

          if (plugin.meta.owner) {
            console.log(
              chalk.gray(
                `[DEBUG OWNER CHECK] cmd="${cmd}" isOwner=${isOwner} fromMe=${msg.key.fromMe} ` +
                `remoteJid="${msg.key.remoteJid}" participant="${msg.key.participant || ''}" ` +
                `remoteJidAlt="${msg.key.remoteJidAlt || ''}" participantPn="${msg.key.participantPn || ''}" ` +
                `senderPn="${msg.key.senderPn || ''}" ownerLid(cache)="${ownerLid || ''}" ` +
                `ownerNumber(config)="${config.ownerNumber}"`
              )
            );
          }

          if (plugin.meta.owner && !isOwner) {
            await Exp.sendMessage(remoteJid, { text: '❌ Perintah ini khusus owner.' }, { quoted: msg });
            continue;
          }

          console.log(chalk.gray(`[DEBUG CMD] memanggil execute() untuk "${cmd}"...`));
          const groupNameCmd = remoteJid.endsWith('@g.us')
            ? await getGroupNameCached(Exp, remoteJid)
            : null;
          richLog.cmd(remoteJid, msg.pushName, cmd, text, groupNameCmd);
          try {
            await plugin.module.execute({
              sock: Exp,
              msg,
              args,
              text,
              command: cmd,
              config,
              handler,
              isOwner,
              sender,
            });
            console.log(chalk.gray(`[DEBUG CMD] execute() untuk "${cmd}" SELESAI tanpa error.`));
            richLog.success(remoteJid, msg.pushName, cmd, groupNameCmd);
          } catch (pluginErr) {
            console.log(chalk.red(`[PLUGIN RUNTIME ERROR] "${cmd}" (${plugin.path}):`));
            console.error(pluginErr);
            richLog.error(remoteJid, msg.pushName, cmd, pluginErr.message, groupNameCmd);
            await Exp.sendMessage(
              remoteJid,
              { text: `⚠️ Terjadi error saat menjalankan perintah *${cmd}*.` },
              { quoted: msg }
            ).catch(() => {});
          }
        } catch (outerErr) {
          console.log(chalk.red('[MESSAGE LOOP ERROR]'));
          console.error(outerErr);
        }
      }
    });

    Exp.ev.on('call', async ([c]) => {
      let { from, id, status } = c;
      if (status !== 'offer') return;

      let { block, reject } = cfg.call;
      if (reject) {
        await Exp.rejectCall(id, from);
        await Exp.sendMessage(from, { text: '⚠️JANGAN TELFON❗' });
      }
      if (block) {
        let text =
          '`⚠️KAMU TELAH DI BLOKIR!⚠️`' +
          '\n- *Menelfon tidak diizinkan karena sangat mengganggu aktivitas kami*' +
          '\n> _Untuk membuka blokir, silahkan hubungi owner!_';
        await Exp.sendMessage(from, { text });
        if (owner) await Exp.sendContacts({ id: from }, owner);
        await sleep(2000);
        await Exp.updateBlockStatus(from, 'block');
      }
    });
  } catch (error) {
    console.error(error);
  }
}

async function main() {
  console.log(chalk.cyan.bold(`\n=== ${config.botName} ===`));
  const groupsWithAntiMention = listGroupsWithSetting('antiMention');
  if (groupsWithAntiMention.length > 0) {
    console.log(
      chalk.green(
        `[STARTUP] Anti-Mention aktif di ${groupsWithAntiMention.length} grup: ${groupsWithAntiMention.join(', ')}`
      )
    );
  } else {
    console.log(
      chalk.yellow(
        '[STARTUP] Anti-Mention belum aktif di grup manapun (data/groupSettings.json kosong/baru). ' +
        'Kalau ini tidak sesuai ekspektasi (mis. baru saja update file bot & sebelumnya sudah pernah ' +
        'diaktifkan), jalankan ulang `.antimention on` di grup yang bersangkutan.'
      )
    );
  }

  await handler.scanAll();
  handler.watch();
  await launch();
}

main();

process.on('uncaughtException', (e) => {
  console.log(chalk.red('[UNCAUGHT EXCEPTION]'));
  console.error(e);
});
process.on('unhandledRejection', (e) => {
  console.log(chalk.red('[UNHANDLED REJECTION]'));
  console.error(e);
});

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
import chalk from 'chalk';
import fs from 'fs';
import { session, spinner } from './config.js';

let spinnerInterval = null;
let retry405Count = 0;
const MAX_405_RETRIES = 5;

const Connecting = async ({
  update,
  Exp,
  Boom,
  DisconnectReason,
  sleep,
  launch,
}) => {
  let i = 0;
  spinnerInterval =
    spinnerInterval ||
    setInterval(() => {
      process.stdout.write(`\r${spinner[i++]}`);
      if (i === spinner.length) i = 0;
    }, 150);

  const { connection, lastDisconnect, receivedPendingNotifications, qr } =
    update;

  console.log(
    chalk.gray(`[DEBUG UPDATE] keys: ${Object.keys(update).join(', ')}`)
  );

  if (receivedPendingNotifications && !Exp.authState?.creds?.myAppStateKeyId) {
    console.log('Flushed');
    Exp.ev.flush();
  }

  if (connection) {
    console.log(
      chalk.yellow.bold('【 CONNECTION 】') + ' -> ',
      chalk.cyan.bold(connection)
    );
  }
  
  if (qr) {
    try {
      const qrcode = (await import('qrcode-terminal')).default;
      qrcode.generate(qr, { small: true });
    } catch (e) {
      console.log(chalk.yellow('QR diterima, tapi qrcode-terminal tidak tersedia untuk menampilkan.'));
    }
  }

  if (connection === 'close') {
    let err = lastDisconnect?.error;
    let statusCode = new Boom(err)?.output?.statusCode;
    console.log(chalk.red.bold(`[DEBUG DISCONNECT] statusCode: ${statusCode}`));
    console.log(chalk.red(`[DEBUG DISCONNECT ERROR]`), err);

    switch (statusCode) {
      case 405:
        retry405Count++;
        if (retry405Count > MAX_405_RETRIES) {
          console.log(
            chalk.red.bold(
              `Gagal konek berulang kali (405) setelah ${MAX_405_RETRIES}x percobaan.`
            )
          );
          console.log(
            chalk.red(
              'Kemungkinan penyebab: koneksi internet tidak stabil, atau server WhatsApp ' +
              'sedang bermasalah. Coba lagi beberapa saat lagi, atau periksa koneksi internetmu.'
            )
          );
          clearInterval(spinnerInterval);
          process.exit(1);
        }
        console.log(
          chalk.red(
            `Gagal konek (405 Method Not Allowed), percobaan ${retry405Count}/${MAX_405_RETRIES}. ` +
            'Ini biasanya berarti versi protokol WhatsApp Web yang dipakai sudah usang, ' +
            'atau ada gangguan jaringan sesaat.'
          )
        );
        try {
          const isRegistered = Exp.authState?.creds?.registered;
          if (!isRegistered && fs.existsSync(session)) {
            fs.rmSync(session, { recursive: true, force: true });
            console.log(chalk.gray('[SESSION] Membersihkan sisa session pairing yang gagal sebelum retry.'));
          }
        } catch (e) {}
        console.log(
          'Mencoba lagi dengan mengambil versi WhatsApp Web terbaru dalam 5 detik...'
        );
        clearInterval(spinnerInterval);
        setTimeout(() => launch(), 5000);
        break;
      case 418:
        console.log('Koneksi terputus, mencoba menghubungkan kembali🔄');
        clearInterval(spinnerInterval);
        setTimeout(() => launch(), 5000);
        break;
      case DisconnectReason.connectionReplaced:
        console.log('Koneksi lain telah menggantikan, silakan tutup koneksi ini terlebih dahulu');
        clearInterval(spinnerInterval);
        process.exit();
        break;
      case DisconnectReason.loggedOut:
      case 401:
        console.log('Perangkat keluar, silakan lakukan pemindaian ulang🔄');
        try {
          if (fs.existsSync(session)) {
            fs.rmSync(session, { recursive: true, force: true });
          }
        } catch (e) {}
        clearInterval(spinnerInterval);
        process.exit();
        break;
      case 502:
      case 503:
        console.log('Terjadi kesalahan, menghubungkan kembali🔄');
        clearInterval(spinnerInterval);
        setTimeout(() => launch(), 5000);
        break;
      case 515:
        console.log('Koneksi mencapai batas, harap muat ulang🔄');
        clearInterval(spinnerInterval);
        setTimeout(() => launch(), 5000);
        break;
      default:
        console.log('Terjadi kesalahan, menghubungkan kembali🔄');
        clearInterval(spinnerInterval);
        setTimeout(() => launch(), 5000);
    }
  }

  if (connection === 'open') {
    retry405Count = 0;
    await sleep(1500);
    clearInterval(spinnerInterval);
    console.log('Terhubung✔️');
  }
};

export { Connecting };

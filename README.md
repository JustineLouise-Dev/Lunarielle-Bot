# LUNAR BOT — WhatsApp Bot (Baileys)

Bot WhatsApp berbasis [Baileys](https://github.com/WhiskeySockets/Baileys) dengan sistem plugin, dukungan login QR Code maupun Pairing Code, serta fitur stiker, meme, gitclone, fetch URL, code-to-image, dan lainnya.

> © 2026 Justine Louise. Lihat header lisensi di masing-masing file untuk ketentuan penggunaan.

---

## Daftar Isi

- [Kebutuhan Sistem](#kebutuhan-sistem)
- [Instalasi di Termux (Android)](#instalasi-di-termux-android)
- [Instalasi di VPS / Linux (Ubuntu, Debian)](#instalasi-di-vps--linux-ubuntu-debian)
- [Instalasi di macOS](#instalasi-di-macos)
- [Konfigurasi (`config.json`)](#konfigurasi-configjson)
- [Menjalankan Bot](#menjalankan-bot)
- [Menjalankan Terus-Menerus (Background)](#menjalankan-terus-menerus-background)
- [Struktur Folder](#struktur-folder)
- [Menambah Plugin](#menambah-plugin)
- [Troubleshooting](#troubleshooting)

---

## Kebutuhan Sistem

| Komponen | Versi Minimal | Keterangan |
|---|---|---|
| Node.js | 18.x atau lebih baru | Wajib, `type: module` (ESM) |
| npm | Bawaan Node.js | Untuk instalasi dependency |
| ffmpeg | Build dengan `--enable-libfreetype` | **Wajib** untuk `.smeme`. Lihat catatan di bawah |
| git | Opsional | Memudahkan update lewat `git pull` |

> ⚠️ **Catatan penting soal ffmpeg:** fitur `.smeme` (stiker meme dengan teks) memakai filter `drawtext`, yang butuh ffmpeg build lengkap (dengan `libfreetype`). Package npm `ffmpeg-static` yang otomatis terpasang **tidak** menyertakan `drawtext`, jadi bot akan otomatis mencari **ffmpeg sistem** terlebih dahulu (`pkg install ffmpeg` / `apt install ffmpeg`) sebelum fallback ke `ffmpeg-static`. Fitur lain (`.sticker`, `.brat`, `.swm`, `.gitclone`, `.get`, `.c2i`) tidak butuh `drawtext` dan tetap berfungsi walau hanya mengandalkan `ffmpeg-static`.

---

## Instalasi di Termux (Android)

1. **Update paket & pasang dependency dasar**
   ```bash
   pkg update -y && pkg upgrade -y
   pkg install -y nodejs-lts git ffmpeg
   ```

2. **Izinkan akses penyimpanan (opsional, untuk keperluan file)**
   ```bash
   termux-setup-storage
   ```

3. **Clone atau salin project ke Termux**
   ```bash
   cd ~
   git clone <url-repo-anda> lunar-bot
   cd lunar-bot
   ```
   Atau, jika project dikirim sebagai `.zip`, pindahkan ke Termux lalu:
   ```bash
   unzip LB_updated_channel_with_tools.zip
   cd bot
   ```

4. **Install dependency Node.js**
   ```bash
   npm install
   ```

5. **Cek ffmpeg mendukung `drawtext`** (untuk fitur `.smeme`)
   ```bash
   ffmpeg -filters | grep drawtext
   ```
   Jika baris `drawtext` muncul, aman. Jika kosong, install ulang: `pkg install ffmpeg`.

6. **Jalankan bot**
   ```bash
   node index.js
   ```
   Pilih metode login (QR Code atau Pairing Code) sesuai instruksi di terminal.

7. **Agar tetap berjalan setelah Termux ditutup**, gunakan `tmux`:
   ```bash
   pkg install -y tmux
   tmux new -s lunarbot
   node index.js
   # Tekan Ctrl+B lalu D untuk keluar dari sesi tanpa menghentikan bot
   # Untuk kembali: tmux attach -t lunarbot
   ```

   Alternatif: gunakan `termux-wake-lock` supaya Android tidak mematikan proses saat layar mati:
   ```bash
   termux-wake-lock
   ```

---

## Instalasi di VPS / Linux (Ubuntu, Debian)

1. **Update paket & pasang Node.js (lewat NodeSource, direkomendasikan untuk versi terbaru)**
   ```bash
   sudo apt update && sudo apt upgrade -y
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs git ffmpeg
   ```

2. **Verifikasi versi**
   ```bash
   node -v   # pastikan v18 ke atas
   ffmpeg -filters | grep drawtext   # pastikan ada output
   ```

3. **Clone atau upload project**
   ```bash
   cd ~
   git clone <url-repo-anda> lunar-bot
   cd lunar-bot/bot
   ```

4. **Install dependency**
   ```bash
   npm install
   ```

5. **Jalankan bot**
   ```bash
   node index.js
   ```

6. **Jalankan sebagai service (direkomendasikan untuk VPS)** — lihat bagian [Menjalankan Terus-Menerus](#menjalankan-terus-menerus-background) untuk opsi `pm2` atau `systemd`.

---

## Instalasi di macOS

1. **Pasang Homebrew** (jika belum ada): https://brew.sh
2. **Pasang dependency**
   ```bash
   brew install node ffmpeg git
   ```
3. **Lanjutkan seperti langkah di VPS/Linux** (clone, `npm install`, `node index.js`).

---

## Konfigurasi (`config.json`)

Sebelum menjalankan bot pertama kali, sesuaikan `config.json` di root folder `bot/`:

```json
{
    "prefix": ".",
    "prefixes": [".", "#", "!"],
    "noprefix": false,

    "owner": ["6282245186794"],
    "ownerName": "Nama Anda",

    "session": "./session",

    "botName": "NAMA BOT ANDA",
    "channelUrl": "",

    "pesan": { ... },

    "starmedia": {
        "workerUrl": "https://your-worker-url",
        "clientApiKey": ""
    }
}
```

| Field | Keterangan |
|---|---|
| `prefix` / `prefixes` | Awalan command, boleh lebih dari satu |
| `noprefix` | `true` jika ingin bot merespons tanpa awalan sama sekali |
| `owner` | Array nomor WhatsApp (format `62xxxxxxxxxxx`, tanpa `+`) yang dianggap owner |
| `session` | Folder penyimpanan sesi login (jangan dihapus kecuali ingin login ulang) |
| `botName` | Nama bot, dipakai di berbagai balasan |
| `channelUrl` | Terkunci lewat kode (`LOCKED_KEYS` di `settings.js`), edit manual di file ini |

> Nomor developer/owner untuk fitur `.developer`, `.dev`, `.creator`, `.owner` diatur terpisah di `lib/creatorInfo.js` (`CREATOR_CONTACTS`), bukan di `config.json`.

---

## Menjalankan Bot

```bash
cd bot
node index.js
```

Saat pertama kali dijalankan, bot akan meminta metode login:

1. **Pairing Code** — masukkan nomor WhatsApp, lalu masukkan kode yang muncul di menu **Perangkat Tertaut** WhatsApp Anda.
2. **QR Code** — pindai kode QR yang muncul di terminal lewat **Perangkat Tertaut** WhatsApp.

Setelah berhasil login, sesi tersimpan di folder `session/` (sesuai `config.json`) sehingga tidak perlu login ulang di percobaan berikutnya, selama folder tersebut tidak dihapus.

---

## Menjalankan Terus-Menerus (Background)

### Opsi 1 — PM2 (direkomendasikan untuk VPS)

```bash
npm install -g pm2
pm2 start index.js --name lunar-bot
pm2 save
pm2 startup   # ikuti instruksi yang muncul agar otomatis jalan saat reboot
```

Perintah berguna lainnya:
```bash
pm2 logs lunar-bot       # lihat log realtime
pm2 restart lunar-bot    # restart bot
pm2 stop lunar-bot       # hentikan bot
```

> ⚠️ Bot ini meminta input interaktif (pilihan metode login, nomor telepon) di awal lewat `readline`. Untuk pertama kali, jalankan `node index.js` secara manual (bukan lewat pm2) hingga sesi berhasil dibuat, baru pindahkan ke pm2 untuk proses berjalan seterusnya.

### Opsi 2 — tmux / screen (Termux atau VPS ringan)

```bash
tmux new -s lunarbot
node index.js
# Ctrl+B lalu D untuk detach
```

### Opsi 3 — systemd (VPS, setelah sesi login pertama berhasil)

Buat file `/etc/systemd/system/lunar-bot.service`:

```ini
[Unit]
Description=Lunar WhatsApp Bot
After=network.target

[Service]
Type=simple
WorkingDirectory=/path/ke/folder/bot
ExecStart=/usr/bin/node index.js
Restart=on-failure
User=namauser

[Install]
WantedBy=multi-user.target
```

Aktifkan:
```bash
sudo systemctl daemon-reload
sudo systemctl enable lunar-bot
sudo systemctl start lunar-bot
sudo systemctl status lunar-bot
```

---

## Struktur Folder

```
bot/
├── index.js              # Entry point, koneksi Baileys & login
├── settings.js            # Loader config.json
├── config.json             # Konfigurasi bot
├── lib/                   # Helper inti (handler, wrapper, sticker, meme, brat, dll)
├── db/                    # Penyimpanan JSON lokal (request, report, thumbnail)
├── plugins/
│   ├── bot/               # Fitur umum bot
│   ├── channel/           # Fitur channel WhatsApp
│   ├── help/               # Menu, ping, creator, owner, dll
│   ├── interactive/       # Game & interaksi
│   └── tools/              # sticker, brat, smeme, swm, gitclone, get, c2i
├── assets/fonts/           # Font untuk brat.js & meme.js
├── termux-worker/          # Worker terpisah untuk starmedia (yt-dlp)
└── session/                # Sesi login WhatsApp (auto-generate)
```

---

## Menambah Plugin

Setiap file di `plugins/**/*.js` diekspor sebagai `default`, mendukung dua gaya:

**Gaya fungsi:**
```js
export default async function namaCommand(m, { conn, args, text, command, config }) {
    return m.reply('Halo!')
}
namaCommand.command = 'halo'
namaCommand.alias = ['hi']
namaCommand.category = 'lainnya'
```

**Gaya object (dipakai mayoritas plugin `tools/`):**
```js
export default {
    command: 'halo',
    alias: ['hi'],
    category: 'lainnya',
    description: 'Menyapa pengguna.',
    typing: true,
    async execute(m, { conn, args, config }) {
        return m.reply('Halo!')
    }
}
```

Letakkan file baru di subfolder `plugins/` yang sesuai kategori — loader (`lib/handler.js`) akan memuatnya otomatis saat bot start, tanpa perlu didaftarkan manual.

---

## Troubleshooting

| Masalah | Kemungkinan Penyebab & Solusi |
|---|---|
| `.smeme` gagal / error ffmpeg | ffmpeg tidak punya filter `drawtext`. Jalankan `ffmpeg -filters \| grep drawtext`; jika kosong, install ffmpeg penuh (`pkg install ffmpeg` / `apt install ffmpeg`), jangan hanya andalkan `ffmpeg-static` dari npm |
| Bot tidak merespons sama sekali | Cek `prefix`/`prefixes` di `config.json`, dan pastikan `session/` berisi sesi yang valid (belum logout dari HP) |
| Perlu login ulang terus | Hapus folder `session/` lalu jalankan ulang `node index.js` untuk memulai sesi baru |
| `npm install` gagal di Termux | Pastikan `pkg install nodejs-lts` (bukan `nodejs` versi eksperimental) dan `python`/`build-essential` bila ada modul native yang gagal compile |
| `@napi-rs/canvas` gagal load (untuk `.brat`) | Modul ini prebuilt binary; pastikan arsitektur perangkat didukung (arm64/x64). Jika gagal di Termux, cek versi Node.js terpasang kompatibel |
| Fitur `.developer`/`.owner` tidak mengirim kontak | Pastikan `lib/creatorInfo.js` versi terbaru (payload `{ contacts: {...} }`, bukan `{ contactMessage }`) sudah terpasang — versi lama menyebabkan error "invalid media type" |
| Bot berhenti sendiri di VPS | Jalankan lewat `pm2` atau `systemd` (lihat bagian [Menjalankan Terus-Menerus](#menjalankan-terus-menerus-background)) agar otomatis restart saat crash |

---

## Lisensi

Proyek ini disediakan untuk penggunaan personal dan edukasi. Penggunaan komersial, penjualan ulang, atau distribusi untuk keuntungan dilarang tanpa izin tertulis dari pembuat. Lihat header hak cipta di masing-masing file source untuk ketentuan lengkap.

**© 2026 Justine Louise. All Rights Reserved.**
**® Powered By Zapo-js**

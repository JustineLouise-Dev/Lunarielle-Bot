# Lunarielle Bot

WhatsApp bot berbasis [Baileys](https://github.com/WhiskeySockets/Baileys) dengan sistem plugin modular (hot reload), menu interaktif bertombol, dan beberapa fitur moderasi grup — termasuk penghapusan otomatis pesan mention/tag-all.

## ✨ Fitur

- **Koneksi fleksibel** — login via QR code atau pairing code, auto-reconnect, auto-block panggilan masuk.
- **Sistem plugin modular** — cukup taruh file baru di `plugins/<Kategori>/`, otomatis terdeteksi tanpa restart bot (hot reload).
- **Menu interaktif bertombol** — `.menu` menampilkan gambar header + bottom sheet kategori ala WhatsApp native, bukan menu teks polos.
- **Anti-Mention** — hapus otomatis pesan yang mention banyak member sekaligus (tag-all) maupun status WhatsApp yang men-tag grup, lengkap dengan pesan penjelasan ke grup setelah dihapus.
- **Pembuat stiker** — ubah gambar maupun video/GIF pendek jadi stiker WhatsApp (termasuk stiker animasi), dengan packname & author yang otomatis tertanam di setiap stiker.
- **Moderasi grup** — add, kick, dan delete pesan (khusus admin grup).
- **Statistik sistem** — cek RAM, CPU, dan runtime bot langsung dari chat (khusus owner).

## 📋 Requirement

- [Node.js](https://nodejs.org) v18 ke atas
- npm
- Nomor WhatsApp aktif untuk dipasangkan ke bot

> Fitur stiker memakai `sharp` (konversi gambar) dan `ffmpeg-static` (konversi video/GIF ke stiker animasi). Keduanya sudah termasuk di `npm install`, tidak perlu install ffmpeg terpisah di sistem.

## 🚀 Instalasi

```bash
git clone 
cd 
npm install
```

### Konfigurasi

Salin/edit `config.json` dan sesuaikan minimal bagian berikut sebelum menjalankan bot:

```json
{
  "botName": "Nama Bot Kamu",
  "ownerName": "Nama Kamu",
  "ownerNumber": "62xxxxxxxxxxx",
  "prefix": ".",
  "usePairingCode": true,
  "stickerPackname": "Nama Pack Stiker Kamu",
  "stickerAuthor": "Nama Kamu"
}
```

> ⚠️ **Jangan commit `config.json` dengan nomor WhatsApp, link grup, atau JID channel asli ke repository publik.** Ganti dulu nilai-nilai tersebut dengan placeholder, atau pindahkan data sensitif ke `.env` / gunakan `.gitignore` sebelum push.

### Menjalankan bot

```bash
npm start
```

Saat pertama kali dijalankan, kamu akan diminta memilih metode login:

- **`qr`** — pindai QR code yang muncul di terminal lewat WhatsApp di HP.
- **`pairing`** — masukkan nomor WhatsApp, lalu masukkan kode pairing yang diberikan WhatsApp ke perangkat bot.

Sesi login tersimpan di folder `session/` supaya tidak perlu login ulang setiap kali bot direstart.

## 📁 Struktur folder

```
index.js                 # Entry point: koneksi, pairing/QR, dispatch ke plugin
systemConnext.js         # Handler connection.update (reconnect, render QR)
config.js                # Loader config.json + helper tambahan
config.json               # Pengaturan utama bot
module/handler.js         # Plugin loader + hot reload
lib/
  utils.js                # Helper umum (extractText, getSender, dll)
  buttons.js               # Helper membangun & mengirim pesan bertombol
  menuCategory.js           # Logic .menu (daftar kategori & submenu)
  relayInjection.js          # Suntik tombol Menu/Owner ke semua balasan bot
  groupSettings.js            # Penyimpanan pengaturan per-grup (mis. Anti-Mention)
  antiMention.js                # Deteksi & hapus otomatis pesan mention/tag-all
  sticker.js                      # Konversi media ke stiker webp + metadata packname/author
plugins/
  MainMenu/                # .menu, .owner
  GroupMenu/                # .add, .kick, .delete, .antimention
  MakerMenu/                 # .sticker
  OwnerMenu/                   # .stats
data/                     # Data persisten (pengaturan grup, dll) — dibuat otomatis
assets/                   # Aset media (thumbnail menu, dll)
```

## 🔌 Menambah command baru

Buat file baru di `plugins/<KategoriBaru>/nama-perintah.js`:

```js
export default {
  name: 'Nama Fitur',
  command: ['contoh'],        // trigger: .contoh
  tags: ['KategoriBaru'],      // opsional, default ambil dari nama folder
  description: 'Deskripsi singkat',
  owner: false,                 // true = hanya owner yang bisa pakai
  group: false,                  // true = hanya bisa dipakai di grup

  async execute({ sock, msg, args, text, sender, isOwner, config }) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Halo!' }, { quoted: msg });
  },
};
```

File otomatis terdeteksi dan dimuat tanpa perlu restart bot. Tambahkan emoji kategori baru di `config.json` → `categoryEmoji` supaya tampil rapi di `.menu` (kalau tidak diisi, dipakai emoji 📂 default).

## 🛡️ Perintah Anti-Mention

| Perintah | Keterangan |
|---|---|
| `.antimention` | Menampilkan status Anti-Mention saat ini di grup |
| `.antimention on` | Mengaktifkan penghapusan otomatis pesan mention/tag-all (bot harus admin) |
| `.antimention off` | Menonaktifkan fitur ini |

Saat aktif, bot otomatis menghapus:
- Pesan yang mention banyak member grup sekaligus (tag-all)
- Status WhatsApp yang men-tag grup tersebut

Setelah pesan dihapus, bot mengirim pesan penjelasan singkat ke grup agar member tahu alasannya.

## 🎨 Perintah Sticker

| Perintah | Keterangan |
|---|---|
| `.sticker` / `.s` / `.stiker` | Membuat stiker dari gambar atau video/GIF yang dikirim/di-reply |
| `.swm <text>` | Mengganti packname stiker yang di-reply |

**`.sticker`** — cara pakai:
1. Kirim gambar atau video/GIF pendek dengan caption `.sticker`, **atau**
2. Reply gambar/video/GIF yang sudah ada di chat dengan perintah `.sticker`.

Video/GIF didukung sebagai stiker animasi, dengan durasi maksimal 10 detik. Setiap stiker yang dibuat otomatis membawa metadata **packname** dan **author** sesuai `stickerPackname` dan `stickerAuthor` di `config.json`.

**`.swm`** — reply sebuah stiker (statis maupun animasi) dengan `.swm <text>` untuk mengganti packname-nya. Format packname yang dihasilkan selalu `<Nama Bot> - <text>`, contoh:

```
.swm Cinta Damai
```

akan menghasilkan packname `Lunarielle Bot - Cinta Damai` (nama bot diambil dari `botName` di `config.json`). Author stiker tetap memakai `stickerAuthor` di `config.json`. Gambar/animasi stiker tidak diproses ulang — hanya metadata packname-nya yang diganti, jadi kualitas dan animasi asli tetap terjaga.

## 📄 Lisensi

[MIT](LICENSE)

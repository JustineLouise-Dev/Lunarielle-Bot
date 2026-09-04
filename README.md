# Lunarielle Bot

Bot WhatsApp yang ditenagai oleh [zapo-js](https://github.com/bangsulbotz/zapo-js) — dibangun dengan fokus pada kecepatan dan efisiensi, ini adalah project fork dari zapo-js.

> ⚠️ **Disclaimer**: Software ini disediakan hanya untuk penggunaan personal dan edukasi. Penggunaan komersial, penjualan kembali, atau distribusi untuk keuntungan dilarang keras tanpa izin tertulis dari pembuatnya. Hormati hasil kerja developer — jangan hapus atau ubah catatan hak cipta, dan jangan klaim project ini sebagai milik sendiri.

---

## 📢 Info Update

Bergabunglah ke [saluran WhatsApp resmi](https://whatsapp.com/channel/0029VbDwkes84OmBLbb1FY1M) untuk mendapatkan informasi terbaru tentang update skrip dan fitur-fitur yang tersedia. Jika ingin mendapatkan fitur terbaru, silakan bergabung ke saluran tersebut.

---

## ✨ Fitur

- **8 kategori fitur** — Channel, Convert, Grup, Help, Interactive, Owner, Search, Tools
- Sistem menu interaktif dengan tombol native WhatsApp (`interactiveMessage` / `nativeFlowMessage`)
- Auto-load plugin dari folder `plugins/` (mendukung hot reload)
- Penyimpanan sesi & data menggunakan SQLite (`@zapo-js/store-sqlite`)
- Dukungan pairing code untuk login tanpa scan QR
- Fitur interaktif (game, tools, converter, dsb.) yang dapat dikembangkan lewat plugin

---

## 📦 Prasyarat

- **Node.js** v20 atau lebih baru (disarankan v24+)
- **npm** (atau Bun, jika ingin menggunakan runtime Bun)
- Nomor WhatsApp aktif yang akan dijadikan bot

---

## 🚀 Instalasi

1. **Clone repository**

   ```bash
   git clone https://github.com/JustineLouise-Dev/Lunarielle-Bot
   cd Lunarielle-Bot
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

   Proses `postinstall` akan otomatis menjalankan `patch.js` untuk menambal file internal `zapo-js` (`node_modules/zapo-js/dist/**`) agar mendukung custom nodes pada pesan. Ini normal dan wajib dilakukan agar bot berjalan dengan benar.

3. **Konfigurasi bot**

   Edit file [`config.json`](./config.json) sesuai kebutuhan:

   ```json
   {
     "usePairingCode": true,
     "customPairing": "JVSTL1VZ",
     "noprefix": true,
     "self": false,

     "ownerName": "NamaOwner",
     "owner": "62812xxxxxxx",
     "botName": "NamaBot",
     "botNumber": "62812xxxxxxx",

     "jidGroup": "1234@g.us",
     "channelUrl": "https://whatsapp.com/channel/xxxxxxxxxxxx",

     "prefixes": [".", "#", "!", "/"]
   }
   ```

   | Key              | Keterangan                                                                 |
   |------------------|------------------------------------------------------------------------------|
   | `usePairingCode` | `true` untuk login via kode pairing, `false` untuk scan QR                   |
   | `customPairing`  | Kode pairing custom (8 karakter, opsional)                                   |
   | `noprefix`       | `true` jika bot merespons tanpa prefix perintah                              |
   | `owner`          | Nomor WhatsApp owner (format internasional tanpa `+`)                        |
   | `botName`        | Nama bot yang ditampilkan pada menu                                          |
   | `channelUrl`     | Link channel WhatsApp resmi (dipakai pada tombol menu)                       |
   | `prefixes`       | Daftar prefix perintah yang dikenali bot                                     |

4. **Jalankan bot**

   ```bash
   npm start
   ```

   Saat pertama kali dijalankan:
   - Jika `usePairingCode: true`, bot akan menampilkan **kode pairing** di terminal — masukkan kode tersebut lewat *Linked Devices* di aplikasi WhatsApp.
   - Jika `usePairingCode: false`, bot akan menampilkan **QR code** untuk dipindai.

   Sesi login akan tersimpan otomatis di folder `session/` (SQLite) sehingga tidak perlu login ulang setiap restart.

---

## 📁 Struktur Folder

```
├── config.json          # Konfigurasi utama bot
├── settings.js          # Loader & helper konfigurasi
├── index.js             # Entry point aplikasi
├── handler.js           # Command dispatcher
├── patch.js             # Patch otomatis untuk zapo-js (dijalankan saat postinstall)
├── db/                  # Layer database (SQLite): contacts, thumbnails, dsb.
├── lib/                 # Helper & utilitas internal (loader plugin, wrapper, dsb.)
├── src/                 # Koneksi socket, handler pesan & event grup
├── patches/             # File patch tambahan untuk dependency pihak ketiga
└── plugins/
    ├── channel/          # Fitur channel WhatsApp
    ├── convert/          # Fitur konversi media/format
    ├── grup/             # Fitur pengelolaan grup
    ├── help/             # Menu bantuan (menu, viewlist, help, dsb.)
    ├── interactive/      # Game & widget interaktif
    ├── owner/            # Fitur khusus owner bot
    ├── search/           # Fitur pencarian
    └── tools/            # Perkakas/utilitas lain
```

### Menambahkan plugin baru

Buat file `.js` di dalam folder kategori yang sesuai (mis. `plugins/tools/contoh.js`) dengan struktur:

```js
export default {
  command: 'contoh',
  alias: ['cth'],
  category: 'tools',
  description: 'Deskripsi singkat fitur ini.',
  typing: true,

  async execute(m, { sock, plugins, args }) {
    return m.reply('Halo dari plugin baru!')
  }
}
```

Plugin akan otomatis terdeteksi oleh `lib/loadPlugins.js` tanpa perlu didaftarkan manual, dan langsung muncul pada `.menu <kategori>` sesuai nilai `category` yang didefinisikan.

---

## 🖥️ Deploy ke VPS / Server

1. Pastikan Node.js dan `git` sudah terpasang di server.
2. Clone repository dan install dependency seperti langkah di atas.
3. Jalankan bot di background menggunakan process manager, misalnya [PM2](https://pm2.keymetrics.io/):

   ```bash
   npm install -g pm2
   pm2 start index.js --name lunarielle-bot
   pm2 save
   pm2 startup
   ```

4. Cek log kapan saja dengan:

   ```bash
   pm2 logs lunarielle-bot
   ```

---

## 🔒 Catatan Keamanan

- **Jangan commit folder `session/`** ke repository — folder ini berisi kredensial sesi WhatsApp yang bersifat rahasia.
- Jangan bagikan `customPairing` atau isi `config.json` yang memuat nomor pribadi ke publik.
- Disarankan menambahkan `.gitignore` berikut sebelum push ke GitHub:

  ```gitignore
  node_modules/
  session/
  store/
  *.db
  *.db-shm
  *.db-wal
  .env
  ```

---

## 📜 Lisensi

© 2026 Justine Louise. All Rights Reserved.
® Powered by [Zapo-js](https://github.com/bangsulbotz/zapo-js)

Software ini disediakan untuk penggunaan personal dan edukasi. Dilarang menjual, mendistribusikan ulang untuk keuntungan, atau mengklaim project ini sebagai karya sendiri tanpa izin tertulis dari penulis.

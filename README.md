# Discord Auto Task Bot - AI Powered 🤖

Bot Discord menggunakan Node.js dan discord.js yang memiliki fitur auto chat dan auto reply dengan **OpenAI API atau OpenAI-compatible services** (seperti Dashscope/DeepSeek). Bot ini akan bertingkah seperti manusia normal yang bisa ngobrol natural tentang berbagai topik!

## 🎯 Fitur Utama

### 1. **OpenAI/DeepSeek AI-Powered Conversation** ⭐
- Bot merespons dengan OpenAI API atau OpenAI-compatible services (Dashscope/DeepSeek) untuk percakapan natural
- Bisa ngobrol tentang berbagai topik: teknologi, gaming, makanan, hiburan, kehidupan sehari-hari
- Menyimpan history percakapan untuk kontek yang lebih baik
- Personality: Casual friendly Indonesian person yang suka ikut nimbrung ngobrol

### 2. **Auto Chat** 💬
- Bot otomatis mengirim pesan di channel tanpa perlu dipancing
- Menggunakan AI untuk generate respon natural
- Interval dapat disesuaikan (default: 60 detik)

### 3. **Auto Reply** 📬
- Bot otomatis membalas setiap pesan dari user
- Respond seperti manusia dengan bahasa Indonesia kasual
- Tidak butuh command/perintah khusus - langsung ngobrol natural

### 4. **Auto Join Voice Channel** 🎤
- Bot otomatis join voice channel saat start
- Cukup set `AUTO_VOICE_CHANNEL_ID` di `.env`
- Tetap di voice channel selama bot online

### 5. **Fallback Mode** 🔧
- Kalau API key tidak ada, bot tetap jalan dengan template responses
- Bagus untuk testing atau kalau mau hemat API cost

## 🚀 Persiapan

### 1. Buat Discord Bot

1. Buka [Discord Developer Portal](https://discord.com/developers/applications)
2. Klik "New Application" dan beri nama (misal: "linux")
3. Masuk ke menu "Bot"
4. Klik "Add Bot"
5. Copy token bot (akan dibutuhkan di .env)
6. **PENTING**: Aktifkan "MESSAGE CONTENT INTENT" di bagian Privileged Gateway Intents

### 2. Invite Bot ke Server

Di tab "OAuth2" → "URL Generator":
- Pilih scopes: `bot`
- Pilih permissions minimal:
  - `Send Messages`
  - `Read Message History`
  - `Send Messages in Threads`
  - `Connect` (untuk voice channel)
  - `Speak` (untuk voice channel)
- Copy URL dan buka di browser
- Pilih server dan authorize

### 3. Dapatkan Channel ID

1. Di Discord Desktop/Web, masuk ke User Settings → Advanced
2. Aktifkan "Developer Mode"
3. Klik kanan pada channel yang diinginkan untuk bot chat/reply
4. Pilih "Copy Channel ID"

### 4. Dapatkan OpenAI API Key atau OpenAI-Compatible Service

Untuk menggunakan OpenAI API:
1. Daftar di [OpenAI](https://openai.com/)
2. Buat API key di [API Keys page](https://platform.openai.com/api-keys)

Untuk menggunakan OpenAI-compatible services (Dashscope/DeepSeek):
1. Daftar di [Dashscope](https://www.aliyun.com/product/dashscope) (DeepSeek)
2. Buat API key di dashscope console

## Instalasi

```bash
# git clone https://github.com/keks12pp/discord-bot.git
Masuk ke folder project
cd discord-bot

# Install dependencies
npm install
```

## Konfigurasi

1. Copy `.env.example` ke `.env` dan ubah dengan nilai yang sesuai:

```env
DISCORD_TOKEN=your_bot_token_here
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
AUTO_CHAT_CHANNEL_ID=your_channel_id_here
AUTO_VOICE_CHANNEL_ID=your_voice_channel_id_here
AUTO_CHAT_INTERVAL=60
AI_PROVIDER=openai
BOT_NAME=linux
BOT_PERSONALITY=casual friendly Indonesian person who knows many topics, likes to join conversations, and responds naturally like a real person
```

**Note**: Isi `AUTO_CHAT_CHANNEL_ID` jika ingin bot aktif auto chat. Kosongkan jika hanya ingin bot reply saat dimention/chat. Isi `AUTO_VOICE_CHANNEL_ID` jika ingin bot auto join voice channel saat start.

**Untuk OpenAI-compatible services (Dashscope/DeepSeek):**
```
OPENAI_API_KEY=your_dashscope_api_key_here
OPENAI_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
OPENAI_MODEL=deepseek-v3.2
AI_PROVIDER=openai
```

## Menjalankan Bot

```bash
# Masuk ke folder project
cd discord-bot

# Mode production
npm start

# Mode development (auto-reload saat ada perubahan)
npm run dev
```

## Cara Kerja Bot

### Auto Chat
Bot akan otomatis kirim pesan setiap interval yang ditentukan:
- Menggunakan AI untuk generate pesan natural
- Atau pakai pre-written messages jika AI gagal respond

### Auto Reply
Setiap kali ada orang chat di channel, bot akan:
1. Baca pesan user
2. Proses dengan OpenAI/DeepSeek AI (atau fallback template)
3. Balas dengan respon natural seperti manusia
4. Simpan conversation history untuk konteks

### Contoh Interaksi
```
User: halo bro apa kabar
Bot: Halo juga rek! Alhamdulillah baik nih, lagi apa sekarang?

User: gue lagi pusing banget sama project yang deadline besok
Bot: Waduh valid feeling! Deadline emang nyebelin tapi pasti bisa diselesaikan kok. Lo udah sejauh mana progressnya? Maybe I can help brainstorm something!

User: thanks bro
Bot: Sip sip! Sama-sama ya. Semangat terus buat projectnya, pasti lancar jaya! 🙌
```

## Struktur File

```
discord-bot/
├── index.js          # Main bot code dengan OpenAI AI integration
├── package.json      # Project dependencies
├── .env.example      # Template environment variables
├── .env              # Your actual env vars
├── .gitignore        # Git ignore rules
└── README.md         # This file
```

## Customization

### Ubah Personality Bot
Edit `BOT_PERSONALITY` di `.env`:
```env
BOT_PERSONALITY=sassy funny Indonesian programmer who loves coffee and tech talks
```

### Tambah Auto Chat Topics
Edit array `autoChatMessages` atau `randomTopics` di `index.js`

### Ubah Response Style
Edit `systemPrompt` di fungsi `generateAIResponse()` untuk mengubah cara bot menjawab

## Tips Penggunaan

1. **Test dulu tanpa AUTO_CHAT_CHANNEL_ID**: Biarkan kosong untuk test reply functionality
2. **Hemat API Cost**: Naikkan `AUTO_CHAT_INTERVAL` biar nggak terlalu sering chat
3. **Multi Channel**: Clone config untuk support multiple channels
4. **Conversation Memory**: History tersimpan selama bot running (reset saat restart)
5. **Voice Channel**: Set `AUTO_VOICE_CHANNEL_ID` jika ingin bot selalu online di voice channel

## Troubleshooting

### Bot tidak login
- ❌ Token salah → Cek di Discord Developer Portal
- ❌ MESSAGE_CONTENT INTENT belum aktif → Enable di Bot settings

### Bot tidak bisa reply
- ❌ Permission kurang → Add `Send Messages`, `Read Message History`
- ❌ Bot tidak ada di server → Re-invite dengan OAuth2 URL

### Auto chat tidak jalan
- ❌ Channel ID salah → Copy ulang dengan Developer Mode
- ❌ Bot tidak akses channel → Check channel permissions

### Voice channel tidak join
- ❌ `AUTO_VOICE_CHANNEL_ID` kosong → Isi dengan ID voice channel
- ❌ Permission `Connect` atau `Speak` tidak ada → Update permission invite bot
- ❌ Channel ID bukan voice channel → Pastikan ID channel adalah voice channel
- ❌ Bot tidak punya akses ke channel → Check channel permissions

### AI response error
- ❌ OpenAI API Key salah → Generate baru di OpenAI atau Dashscope
- ❌ OPENAI_BASE_URL salah → Gunakan URL yang sesuai dengan provider API Anda
- ❌ OPENAI_MODEL tidak sesuai → Pastikan model yang dipilih sesuai dengan API provider
- ❌ Quota exceeded → Tunggu atau upgrade plan
- ⚠️ Fallback mode aktif → Bot tetap jalan dengan template responses

## Catatan Penting

⚠️ **Security**: File `.env` SUDAH berisi credentials. Jangan commit ke git!

💡 **Best Practice**: 
- Start dengan interval panjang (120s+) untuk testing
- Monitor API usage di dashboard OpenAI atau Dashscope
- Keep bot personality consistent untuk better UX

---

**Created by linux** 🐧 | Happy chatting!

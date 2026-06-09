const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const OpenAI = require('openai');
require('dotenv').config();

// Buat instance client Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [Partials.Channel]
});

// Inisialisasi OpenAI dengan konfigurasi dari environment
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || undefined
});

// Konfigurasi bot
const config = {
    token: process.env.DISCORD_TOKEN,
    autoChatChannelId: process.env.AUTO_CHAT_CHANNEL_ID,
    autoVoiceChannelId: process.env.AUTO_VOICE_CHANNEL_ID,
    autoChatInterval: parseInt(process.env.AUTO_CHAT_INTERVAL) || 60,
    openaiApiKey: process.env.OPENAI_API_KEY,
    aiProvider: process.env.AI_PROVIDER || 'openai',
    botName: process.env.BOT_NAME || 'linux',
    personality: process.env.BOT_PERSONALITY || 'casual friendly Indonesian person who knows many topics, likes to join conversations, is knowledgeable about technology, life, and everyday topics. Responds naturally like a real human, uses Indonesian slang, emojis sometimes, and shows personality.'
};

// Simple in-memory conversation history per user
const conversationHistory = {};

// Topic categories untuk referensi AI
const topicCategories = {
    technology: ['program', 'coding', 'kode', 'tech', 'teknologi', 'komputer', 'laptop', 'hp', 'internet', 'website', 'app', 'software', 'hardware', 'ai', 'artificial intelligence'],
    gaming: ['game', 'main game', 'genshin', 'valorant', 'mlbb', 'mobile legends', 'pubg', 'fortnite', 'minecraft', 'steam'],
    entertainment: ['film', 'musik', 'lagu', 'anime', 'drama', 'netflix', 'youtube', 'tiktok', 'instagram'],
    food: ['makan', 'ngemil', 'lapar', 'resepmasak', 'masak', 'kuliner', 'kue', 'nasi', 'ayam'],
    daily: ['pagi', 'siang', 'malam', 'tidur', 'bangun', 'kerja', 'sekolah', 'kuliah', 'belajar', 'libur'],
    emotion: ['senang', 'sedih', 'marah', 'kecewa', 'bahagia', 'stres', 'lelah', 'capek', 'bosan']
};

// Auto chat messages yang lebih natural
const autoChatMessages = [
    "gue baru tau ternyata ada shortcut vscode yang bikin hidup jadi lebih mudah wkwk",
    " kalian udah coba AI yang baru rilis? Kocak juga sih responnya",
    "gue lagi dengerin lagu terus nemu beat yang keren banget rek",
    "hari ini cuaca bagus-bagus aja, cocok buat WFH sambil ngopi ☕",
    "tau nggak, ternyata ada framework javascript yang baru yang katanya lebih cepat dari yang lain",
    "gue tadi mau ngerjain project terus ketemu bug yg nyebelin banget hahaha",
    "akhirnya weekend juga! punya rencana apa guys?",
    "kalian suka nonton anime apa? gue lagi nyari rekomendasi nih",
    "git push --force itu dosa ya? 😅",
    "gue baru beli kopi di warung sebelah, enaaak banget!",
    "stack overflow adalah penyelamat hidup programmer sih menurut gue",
    "kalian timIndonesiabang atau tim English buat diskusi tech?",
    "tadi gue nemu tutorial yang jelasin konsep async/await dengan baik banget",
    "weekend begini seharusnya coding tapi malahscroll TikTok seharian 🤣",
    "gue suka banget sama vibe komunitas Indo di discord-discord tech",
    "tahu nggak kenapa programer suka gelap? soalnya mereka takut light bugs wkwk",
    "gue lagi belajar bahasa programming baru, seru banget padahal pusingnya ampun",
    "coffee shop dekat rumah gue mulai ramai lagi sejak pandemi berakhir",
    "kalian pernah ga sih ngerasa code yang ditulis sendiri 1 minggu lalu nggak ngerti? *raise hand*",
    "gue harap someday bisa kerja remotely sambil keliling Indonesia",
    "slime rng juga seru buat diobrolin, kadang suka bikin kesel tapi juga lucu",
    "roblox sekarang udah jauh berkembang ya, banyak game keren yang dibuat usernya",
];

// Event listener saat bot ready
client.once('ready', () => {
    console.log(`🤖 Bot ${config.botName} telah online!`);
    console.log(`• Personality: ${config.personality}`);
    console.log(`• Auto chat interval: ${config.autoChatInterval} detik`);
    console.log(`• AI Provider: ${config.aiProvider}`);
    
    // Auto join voice channel jika diatur
    if (config.autoVoiceChannelId) {
        joinVoiceChannelOnReady();
    } else {
        console.log('• Voice channel: Tidak diatur');
    }
    
    // Mulai auto chat jika channel ID tersedia dan API key ada
    if (config.autoChatChannelId && config.openaiApiKey && config.aiProvider === 'openai') {
        startAutoChat();
    } else if (!config.openaiApiKey && config.aiProvider === 'openai') {
        console.warn('⚠️ OpenAI API key tidak ditemukan. Mode fallback activated.');
    }
});

// Fungsi untuk auto join voice channel saat bot siap
async function joinVoiceChannelOnReady() {
    try {
        const channel = await client.channels.fetch(config.autoVoiceChannelId);
        if (channel && channel.isVoiceBased()) {
            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
            });
            console.log(`🎤 Join voice channel: ${channel.name} (${channel.guild.name})`);
            
            // Handle disconnection / cleanup
            connection.on('stateChange', (oldState, newState) => {
                if (newState.status === 'disconnected') {
                    console.log('🎤 Disconnected from voice channel');
                }
            });
        } else {
            console.warn(`⚠️ Voice channel dengan ID ${config.autoVoiceChannelId} tidak ditemukan atau bukan voice channel.`);
        }
    } catch (error) {
        console.error('[Voice Error] Gagal join voice channel:', error.message);
    }
}

// Fungsi untuk mendapatkan random item dari array
function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Fungsi untuk extract mention dari message
function stripMentions(content, botId) {
    return content.replace(/<@!?[\d]+>/g, '').trim();
}

// Fungsi untuk classify topik pesan
function classifyTopic(message) {
    const lowerMessage = message.toLowerCase();
    for (const [category, keywords] of Object.entries(topicCategories)) {
        if (keywords.some(keyword => lowerMessage.includes(keyword))) {
            return category;
        }
    }
    return 'general';
}

// Fallback response generator (tanpa AI)
function generateFallbackResponse(message, username) {
    const lowerMessage = message.toLowerCase();
    const category = classifyTopic(message);
    
    const fallbackResponses = {
        technology: [
            `Wah menarik tuh soal teknologi! Gue juga suka banget kalau bahas ini. Lagi explore apa gitu?`,
            `Tech vibes! Gue tadi juga baca tentang perkembangan AI, gila sih progresnya cepet banget`,
            `Oohhh gue ngerti banget nih! Teknologi emang nggak ada habisnya buat dipelajari`,
            `Bener banget! Di bidang tech kita harus selalu upgrade skill biar nggak ketinggalan`
        ],
        gaming: [
            `Ayo gas gaming session! Mau main apa nih?`,
            `Gaming emang therapy terbaik sih pas capek kerja/kuliah`,
            `Tau dong game bugar otak vs game bugar tangan? Wkwk`,
            `Gue kadang suka lupa waktu kalo udah maen game, sampe subuh😅`
        ],
        entertainment: [
            `Entertainment vibes! Lagi nonton/dengerin apa sekarang?`,
            `Kalau gue suka banget discovery konten-konten baru di YT/TikTok`,
            `Entertainment is life bro! Tanpa musik/film hidup rasanya sepi`,
            `Ada rekomendasi film/lagu yang bagus nggak? Gue lagi butuh refreshment`
        ],
        food: [
            `FOOD TALK! Ini favorit gue, siap-siap bahas makan-makan wkwk`,
            `Lapar gue dengerin nih 😂 Lagi pengen makan apa?`,
            `Masak-masak itu meditasi buat gue, relax banget kan hasilnya juga bisa dimakan`,
            `Indonesia punya kuliner yang kaya banget, sayang kalau nggak dieksplor`
        ],
        daily: [
            `Daily grind vibes! Semangat terus ya!`,
            `Hari biasa tapi tetep produktif, that's what I call life!`,
            `Kadang hari yang biasa aja justru yang paling enak, nggak terlalu hectic`,
            `Balance between work and chill itu penting banget sih`
        ],
        emotion: [
            `Eh eh eits, cerita dong lengkapnya. Gue dengerin kok!`,
            `Valid feeling! Kadang kita cuma perlu somebody to listen ya`,
            `I feel you bro/kak/kwan... *random* Semua bakal baik-baik aja!`,
            `Human feelings! Emosi itu wajar, jangan ditahan terus`
        ],
        general: [
            `Interesing! Terus gimana ceritanya?`,
            `Oh iya juga ya! Ada perspective lain nih`,
            `Wkwk bener juga! Gue setuju banget`,
            `Wait wait, ini menarik. Jelasin lebih detail dong!`,
            `Hmm oke, kalau menurut gue sih... tapi lo dulu mah!`,
            `hallo ${config.botName}! Gimana kabarnya? Apa yang lagi lo pikirin?`,
            `Yoiyoi! Ada apa nih?`,
            `Ngomong-ngomong, lo tau nggak sih... *random fact*`,
            `Santai dulu, cerita aja. Siapa tau gue bisa kasih perspective`,
            `Kok jadi bahs ini sih? Tapi interesting btw, lanjutkan!`,
            `hallo ${config.botName}! Selamat welcome di server ini!`
        ]
    };
    
    return getRandomItem(fallbackResponses[category] || fallbackResponses.general);
}

// Generate AI-powered response menggunakan OpenAI
async function generateAIResponse(message, username, channelId) {
    try {
        // Initialize conversation history for this user/channel if not exists
        const convoKey = `${channelId}-${username}`;
        if (!conversationHistory[convoKey]) {
            conversationHistory[convoKey] = [];
        }
        
        // Build the prompt with personality
        const systemPrompt = `Kamu adalah ${config.botName}, seseorang yang kasual dan ramah orang Indonesia yang tahu banyak hal tentang berbagai topik termasuk teknologi, kehidupan sehari-hari, hiburan, makanan, dan lainnya. Kamu suka ikut nimbrung dalam percakapan secara natural dan merespons seperti manusia asli. Gunakan bahasa Indonesia dengan gaya santai, pakai slang "gue/lo", kadang-kadang pakai emoji, dan tunjukkan ketertarikan Genuine pada percakapan. Bersikaplah membantu, lucu kalau cocok, dan jangan terlalu robotik atau formal.`;
        
        // Build conversation context from history
        let messages = [
            { role: 'system', content: systemPrompt }
        ];
        
        const history = conversationHistory[convoKey].slice(-6); // Keep last 6 exchanges
        
        if (history.length > 0) {
            for (const msg of history) {
                messages.push({ 
                    role: msg.role === 'user' ? 'user' : 'assistant', 
                    content: msg.content 
                });
            }
        }
        
        // Add current message
        messages.push({ role: 'user', content: message });
        
        // Call OpenAI API dengan model dari environment
        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: messages,
            temperature: 0.7,
            max_tokens: 500
        });
        
        const aiResponse = completion.choices[0].message.content;
        
        // Update history
        conversationHistory[convoKey].push({ role: 'user', content: message });
        conversationHistory[convoKey].push({ role: 'assistant', content: aiResponse });
        
        return aiResponse;
    } catch (error) {
        console.error('[AI Error]', error.message);
        return null;
    }
}

// Fungsi auto chat
async function startAutoChat() {
    setInterval(async () => {
        try {
            const channel = await client.channels.fetch(config.autoChatChannelId);
            if (channel && channel.isTextBased()) {
                let messageToSend;
                
                // Try AI response first
                if (config.openaiApiKey && config.aiProvider === 'openai') {
                    try {
                        const randomTopics = [
                            "apa kabar hari ini?",
                            "gue baru tau ada fitur baru di Discord, keren banget",
                            "lumayan lah productivity hari ini, walaupun ada yang stuck juga",
                            "kira-kira 5 tahun lagi teknologi akan ke mana ya?",
                            "pengen deh suatu hari bisa kerja sambil traveling"
                        ];
                        const randomMessage = getRandomItem(randomTopics);
                        
                        const aiResponse = await generateAIResponse(randomMessage, config.botName, config.autoChatChannelId);
                        if (aiResponse) {
                            messageToSend = aiResponse;
                        } else {
                            messageToSend = getRandomItem(autoChatMessages);
                        }
                    } catch (e) {
                        messageToSend = getRandomItem(autoChatMessages);
                    }
                } else {
                    messageToSend = getRandomItem(autoChatMessages);
                }
                
                await channel.send(messageToSend);
                console.log(`[Auto Chat] Posted: ${messageToSend}`);
            }
        } catch (error) {
            console.error('[Auto Chat Error]', error.message);
        }
    }, config.autoChatInterval * 1000);
}

// Event listener saat ada pesan baru
client.on('messageCreate', async (message) => {
    // Ignore bot's own messages
    if (message.author.bot) return;
    
    // Ignore sistem messages
    if (!message.content) return;
    
    const username = message.author.username;
    const cleanContent = stripMentions(message.content, client.user.id);
    
    console.log(`[${username}] ${message.channel.name}: ${message.content}`);
    
    try {
        let reply;
        
        // Check if using OpenAI
        if (config.openaiApiKey && config.aiProvider === 'openai') {
            // Use AI for intelligent response
            reply = await generateAIResponse(cleanContent, username, message.channelId);
            
            if (!reply) {
                // Fallback to simple response if AI fails
                reply = generateFallbackResponse(cleanContent, username);
            }
        } else {
            // Fallback mode without AI
            reply = generateFallbackResponse(cleanContent, username);
        }
        
        // Reply with mention (if not DM)
        if (message.guild) {
            await message.reply(`${reply}`);
        } else {
            await message.reply(`${reply}`);
        }
        
        console.log(`[Bot Reply] ${reply}`);
    } catch (error) {
        console.error('[Reply Error]', error.message);
    }
});

// Login ke Discord
client.login(config.token).catch(error => {
    console.error('[Login Error] Gagal login bot:', error.message);
    console.log('Pastikan DISCORD_TOKEN sudah benar di file .env');
});

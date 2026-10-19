import { Artist, DashboardStats, Genre, Playlist, Track, User } from '../types';

export const INITIAL_GENRES: Genre[] = [
  { id: 'g1', name: 'Synthwave & Electronic', color: 'from-fuchsia-600 to-indigo-600', trackCount: 1420, description: 'Retro-futuristic beats, analog synths, and neon nocturnal vibes.' },
  { id: 'g2', name: 'Lo-Fi Chill & Study', color: 'from-amber-500 to-rose-600', trackCount: 980, description: 'Cozy tape-saturated beats to relax, study, and unwind.' },
  { id: 'g3', name: 'Pop & Modern Hits', color: 'from-pink-500 to-purple-600', trackCount: 2310, description: 'Catchy hooks, vibrant anthems, and chart-topping favorites.' },
  { id: 'g4', name: 'Hip-Hop & Trap', color: 'from-emerald-500 to-teal-700', trackCount: 1840, description: 'Deep 808s, rhythmic flows, and urban sonic storytelling.' },
  { id: 'g5', name: 'Indie & Alternative', color: 'from-cyan-500 to-blue-700', trackCount: 1120, description: 'Atmospheric guitars, raw lyrics, and authentic indie artistry.' },
  { id: 'g6', name: 'R&B & Neo-Soul', color: 'from-violet-600 to-purple-800', trackCount: 890, description: 'Silky smooth vocal runs, warm basslines, and soulful harmonies.' },
  { id: 'g7', name: 'Rock & Metal', color: 'from-red-600 to-orange-700', trackCount: 1350, description: 'Overdriven riffs, heavy drums, and high-octane energy.' },
  { id: 'g8', name: 'Ambient & Meditative', color: 'from-teal-400 to-emerald-600', trackCount: 640, description: 'Expansive soundscapes, calming drones, and mindful frequencies.' },
];

export const INITIAL_ARTISTS: Artist[] = [
  {
    id: 'art-1',
    name: 'Aether Echoes',
    bio: 'Pioneering ambient electronic producer from Reykjavik, weaving analog modular synthesizers with deep cinematic soundscapes.',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    monthlyListeners: 1845200,
    verified: true,
    genres: ['Synthwave & Electronic', 'Ambient & Meditative'],
    albumsCount: 4,
    tracksCount: 38,
    followed: true,
  },
  {
    id: 'art-2',
    name: 'Solaris Drift',
    bio: 'Tokyo-based lo-fi duo crafting sunset rhythms, nostalgic jazz chords, and vinyl warmth for night owls worldwide.',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    monthlyListeners: 2420100,
    verified: true,
    genres: ['Lo-Fi Chill & Study', 'Indie & Alternative'],
    albumsCount: 6,
    tracksCount: 52,
    followed: false,
  },
  {
    id: 'art-3',
    name: 'Nova Eclipse',
    bio: 'Grammy-nominated synth-pop singer and songwriter known for explosive hooks, soaring falsettos, and neon visual storytelling.',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    monthlyListeners: 4980300,
    verified: true,
    genres: ['Pop & Modern Hits', 'Synthwave & Electronic'],
    albumsCount: 3,
    tracksCount: 41,
    followed: true,
  },
  {
    id: 'art-4',
    name: 'Kaelen Vance',
    bio: 'London neo-soul and alt R&B innovator blending velvety vintage Rhodes keys with future-bass percussion.',
    coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=1200&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    monthlyListeners: 1240900,
    verified: true,
    genres: ['R&B & Neo-Soul', 'Hip-Hop & Trap'],
    albumsCount: 2,
    tracksCount: 24,
    followed: false,
  },
  {
    id: 'art-5',
    name: 'Midnight Horizon',
    bio: 'Heavy atmospheric alternative rock quintet known for wall-of-sound distortion and anthemic festival choruses.',
    coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
    monthlyListeners: 890400,
    verified: false,
    genres: ['Rock & Metal', 'Indie & Alternative'],
    albumsCount: 5,
    tracksCount: 46,
    followed: false,
  },
];

export const INITIAL_TRACKS: Track[] = [
  {
    id: 'trk-1',
    title: 'Neon Skyline',
    artist: 'Aether Echoes',
    artistId: 'art-1',
    album: 'Odyssey 2084',
    duration: 218,
    audioUrl: 'https://actions.google.com/sounds/v1/science_fiction/scifi_hum.ogg',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80',
    genre: 'Synthwave & Electronic',
    plays: 1428900,
    likes: 98400,
    releaseYear: 2024,
    explicit: false,
    lyrics: `[Verse 1]
Starlight reflecting on the mirror glass
City lights racing as the shadows pass
Digital heartbeats keeping in the groove
Tell me there is nowhere else that you would choose

[Chorus]
Under the neon skyline, we come alive
Through the electric pulse, we survive
Hands on the wheel and the road ahead is clear
Nothing can touch us when the night is here

[Verse 2]
Signals transmitting from another phase
Lost in the glow of a phosphor haze
Every frequency aligns in harmony
Echoes of tomorrow set our spirits free

[Chorus]
Under the neon skyline, we come alive
Through the electric pulse, we survive
Hands on the wheel and the road ahead is clear
Nothing can touch us when the night is here`
  },
  {
    id: 'trk-2',
    title: 'Midnight Rain In Shibuya',
    artist: 'Solaris Drift',
    artistId: 'art-2',
    album: 'Coffee & Raindrops',
    duration: 174,
    audioUrl: 'https://actions.google.com/sounds/v1/weather/light_rain.ogg',
    coverUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=600&q=80',
    genre: 'Lo-Fi Chill & Study',
    plays: 2314000,
    likes: 184200,
    releaseYear: 2024,
    explicit: false,
    lyrics: `[Instrumental Intro with Vinyl Crackle]

Drops tap gently against the steamed window
Umbrellas drift through Shibuya crossing below
Tape loops slowly rolling in the cassette deck
Warm tea cooling by my side

[Melodic Lo-Fi Rhodes Solo]

Time slows down when the rain begins to fall
Thoughts soften into watercolor memories
Lost in the quiet frequency of the night`
  },
  {
    id: 'trk-3',
    title: 'Starlight Gravity',
    artist: 'Nova Eclipse',
    artistId: 'art-3',
    album: 'Supernova Deluxe',
    duration: 195,
    audioUrl: 'https://actions.google.com/sounds/v1/science_fiction/teleport_whoosh.ogg',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    genre: 'Pop & Modern Hits',
    plays: 4120300,
    likes: 312000,
    releaseYear: 2024,
    explicit: false,
    lyrics: `[Intro]
Catch me if you can
Before I fall into orbit again

[Verse 1]
Pulling me closer with a single glance
We are caught up in a cosmic dance
Weightless and higher than the stratosphere
All of my doubts simply disappear

[Chorus]
It is starlight gravity, pulling you and me
Deeper than the ocean, wild and free
Can not fight the force when the rhythm starts to beat
Starlight gravity, sweep me off my feet!`
  },
  {
    id: 'trk-4',
    title: 'Velvet Confessions',
    artist: 'Kaelen Vance',
    artistId: 'art-4',
    album: 'After 2AM',
    duration: 242,
    audioUrl: 'https://actions.google.com/sounds/v1/science_fiction/deep_laser.ogg',
    coverUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=600&q=80',
    genre: 'R&B & Neo-Soul',
    plays: 890300,
    likes: 64100,
    releaseYear: 2023,
    explicit: true,
    lyrics: `[Verse 1]
Late night whispering into the microphone
Room dim, phone silenced, completely alone
Every word I couldn't say in the daytime light
Unravels on velvet sheets tonight

[Chorus]
Velvet confessions, spilling from my soul
You took the fragments and you made them whole
No more disguises, no more pretending
This is the chapter with the perfect ending`
  },
  {
    id: 'trk-5',
    title: 'Cascading Echoes',
    artist: 'Midnight Horizon',
    artistId: 'art-5',
    album: 'Seismic',
    duration: 268,
    audioUrl: 'https://actions.google.com/sounds/v1/science_fiction/alien_hum.ogg',
    coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=600&q=80',
    genre: 'Rock & Metal',
    plays: 620400,
    likes: 48900,
    releaseYear: 2024,
    explicit: false,
    lyrics: `[Verse 1]
Thunder rumbling through the mountain pass
Fragments shattering like tempered glass
Stand tall when the tremors begin to shake
Count every single vow we refused to break

[Chorus]
Cascading echoes across the canyon wall
We rise stronger every time we fall
Ignite the embers, let the anthem roar
We are not backing down anymore!`
  },
  {
    id: 'trk-6',
    title: 'Deep Focus Flow',
    artist: 'Solaris Drift',
    artistId: 'art-2',
    album: 'Synapse Sessions',
    duration: 182,
    audioUrl: 'https://actions.google.com/sounds/v1/weather/gentle_stream_in_the_forest.ogg',
    coverUrl: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=600&q=80',
    genre: 'Lo-Fi Chill & Study',
    plays: 1780000,
    likes: 139000,
    releaseYear: 2024,
    explicit: false,
    lyrics: `[Deep Chill Ambient Meditation]
Focus your mind, breathe in the steady tempo
No distractions, just smooth progression
Code, design, create, flow`
  },
  {
    id: 'trk-7',
    title: 'Cyberpunk Odyssey',
    artist: 'Aether Echoes',
    artistId: 'art-1',
    album: 'Odyssey 2084',
    duration: 205,
    audioUrl: 'https://actions.google.com/sounds/v1/science_fiction/spaceship_pass_by.ogg',
    coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    genre: 'Synthwave & Electronic',
    plays: 910200,
    likes: 72000,
    releaseYear: 2024,
    explicit: false,
    lyrics: `Accelerating down the cybernetic highway
Visions of Chrome and Hologram dreams
We are the pulse of tomorrow`
  },
  {
    id: 'trk-8',
    title: 'Summer Twilight',
    artist: 'Nova Eclipse',
    artistId: 'art-3',
    album: 'Golden Hour Anthem',
    duration: 189,
    audioUrl: 'https://actions.google.com/sounds/v1/weather/gentle_waves_beach.ogg',
    coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    genre: 'Pop & Modern Hits',
    plays: 3510000,
    likes: 275000,
    releaseYear: 2024,
    explicit: false,
    lyrics: `Golden sand between our toes
Where the summer breeze blows
Laughing till the sun goes down
Best feeling in this town`
  }
];

export const INITIAL_PLAYLISTS: Playlist[] = [
  {
    id: 'pl-1',
    title: 'Synthwave Neon Drive',
    description: 'High-speed analog synths, retro arpeggios, and nighttime cyberpunk energy.',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80',
    creatorName: 'SoundWave Curators',
    creatorId: 'usr-admin',
    isPublic: true,
    trackCount: 3,
    tracks: [INITIAL_TRACKS[0], INITIAL_TRACKS[6], INITIAL_TRACKS[2]],
    createdAt: '2024-01-15'
  },
  {
    id: 'pl-2',
    title: 'Midnight Coding & Chill',
    description: 'Binaural lo-fi beats, gentle raindrops, and ambient warm chords for maximum productivity.',
    coverUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=600&q=80',
    creatorName: 'DevBeats',
    creatorId: 'usr-1',
    isPublic: true,
    trackCount: 2,
    tracks: [INITIAL_TRACKS[1], INITIAL_TRACKS[5]],
    createdAt: '2024-02-10'
  },
  {
    id: 'pl-3',
    title: 'Top 50 Global Hits',
    description: 'The hottest tracks trending across the world right now on SoundWave.',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
    creatorName: 'SoundWave Official',
    creatorId: 'usr-admin',
    isPublic: true,
    trackCount: 4,
    tracks: [INITIAL_TRACKS[2], INITIAL_TRACKS[7], INITIAL_TRACKS[0], INITIAL_TRACKS[3]],
    createdAt: '2024-03-01'
  },
  {
    id: 'pl-4',
    title: 'Soul & Late Night Moods',
    description: 'Silky smooth vocals and intimate neo-soul grooves for evening unwinding.',
    coverUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=600&q=80',
    creatorName: 'Ivan Jayasooriya',
    creatorId: 'usr-1',
    isPublic: false,
    trackCount: 2,
    tracks: [INITIAL_TRACKS[3], INITIAL_TRACKS[4]],
    createdAt: '2024-03-12'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    username: 'ivanj',
    email: 'ivanjayasooriya03@gmail.com',
    fullName: 'Ivan Jayasooriya',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    role: 'ADMIN',
    isBanned: false,
    plan: 'Premium HiFi',
    favoriteGenres: ['Synthwave & Electronic', 'Lo-Fi Chill & Study', 'Pop & Modern Hits'],
    totalHoursListened: 142.5,
    topArtist: 'Aether Echoes',
    createdAt: '2023-11-10'
  },
  {
    id: 'usr-2',
    username: 'sarah_beats',
    email: 'sarah.k@example.com',
    fullName: 'Sarah Jenkins',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    role: 'USER',
    isBanned: false,
    plan: 'Free',
    favoriteGenres: ['Pop & Modern Hits', 'Indie & Alternative'],
    totalHoursListened: 48.2,
    topArtist: 'Nova Eclipse',
    createdAt: '2024-01-20'
  },
  {
    id: 'usr-3',
    username: 'marcus_audio',
    email: 'marcus.producer@example.com',
    fullName: 'Marcus Sterling',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&q=80',
    role: 'ARTIST',
    isBanned: false,
    plan: 'Premium HiFi',
    favoriteGenres: ['R&B & Neo-Soul', 'Hip-Hop & Trap'],
    totalHoursListened: 312.0,
    topArtist: 'Kaelen Vance',
    createdAt: '2023-09-15'
  },
  {
    id: 'usr-4',
    username: 'alex_spammer',
    email: 'banned.user@example.com',
    fullName: 'Alex Vance (Flagged)',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    role: 'USER',
    isBanned: true,
    banReason: 'Repeated copyright violations and automated stream botting activities.',
    bannedAt: '2024-03-08',
    plan: 'Free',
    favoriteGenres: ['Rock & Metal'],
    totalHoursListened: 12.0,
    topArtist: 'Midnight Horizon',
    createdAt: '2024-02-01'
  }
];

export const INITIAL_DASHBOARD_STATS: DashboardStats = {
  totalUsers: 248920,
  activeStreams: 18450,
  totalTracks: 45210,
  totalArtists: 1840,
  platformRevenue: 52400,
  dailyPlays: [
    { day: 'Mon', plays: 128400, streams: 9800 },
    { day: 'Tue', plays: 142100, streams: 11200 },
    { day: 'Wed', plays: 156300, streams: 12800 },
    { day: 'Thu', plays: 168900, streams: 14100 },
    { day: 'Fri', plays: 215400, streams: 17800 },
    { day: 'Sat', plays: 248900, streams: 20100 },
    { day: 'Sun', plays: 232000, streams: 18450 },
  ],
  genreBreakdown: [
    { genre: 'Synthwave & Electronic', percentage: 32, color: '#6366f1' },
    { genre: 'Pop & Modern Hits', percentage: 28, color: '#ec4899' },
    { genre: 'Lo-Fi Chill & Study', percentage: 18, color: '#f59e0b' },
    { genre: 'Hip-Hop & Trap', percentage: 14, color: '#10b981' },
    { genre: 'Rock & Indie', percentage: 8, color: '#06b6d4' },
  ],
  recentActivities: [
    { id: 'act-1', type: 'upload', description: 'New single "Neon Skyline" uploaded by Aether Echoes', timestamp: '10m ago', user: 'Aether Echoes' },
    { id: 'act-2', type: 'user', description: 'New subscriber upgraded to Premium HiFi', timestamp: '24m ago', user: 'Sarah Jenkins' },
    { id: 'act-3', type: 'verify', description: 'Artist badge verified for Kaelen Vance', timestamp: '1h ago', user: 'Admin Ivan' },
    { id: 'act-4', type: 'ban', description: 'User account "alex_spammer" restricted due to terms violation', timestamp: '3h ago', user: 'Admin Ivan' },
    { id: 'act-5', type: 'stream', description: 'Milestone reached: 10M total plays this month', timestamp: '5h ago' },
  ]
};

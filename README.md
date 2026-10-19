# HarmoniQ 🎵

> **HarmoniQ** is a premier, high-fidelity music streaming platform designed with a modern dark-mode aesthetic, decoupled Listener and Admin Backstage portals, an interactive audio engine with synced lyrics and queue drawers, and full REST API compatibility with a Spring Boot backend.

[![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Spring Boot Compatible](https://img.shields.io/badge/Spring_Boot-3_REST_API-6db33f?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)

---

## 🌟 Key Features

### 🎧 1. Listener Experience (User Portal)
- **Editorial Home Showcase**: Daily mixes, trending releases, quick-play shelves, and featured artist highlights.
- **Search & Explore**: Instant multi-category search across tracks, artists, albums, and colorful genre mood tiles.
- **Artists Directory & Profile**: Follow/unfollow artists, verified artist badges, discography, and listener statistics.
- **Personal Library**:
  - **Custom Playlists**: Create, edit, and curate playlists with custom cover artwork.
  - **Liked Songs**: Dedicated favorites collection with instant search and one-click shuffle play.
  - **Recently Played**: Automatically tracked and synchronized with `RecentSongController`.
- **HarmoniQ AI DJ & Sound Assistant**: AI-powered music recommendation assistant connected to Spring Boot `ChatController`.
- **User Profile**: Listening habit metrics, hours streamed, audio quality presets (FLAC 24-bit Hi-Fi), and profile editor.

### 🛡️ 2. Admin Backstage Portal
- **Operations Dashboard**: Real-time KPI metrics (active streams, registered listeners, catalog size, royalties), daily stream volume bar charts, and activity audit feed.
- **Music Catalog Management**: Full CRUD operations for audio tracks, audio URL / Cloudinary streams, album metadata, and lyrics.
- **Artist Roster Management**: Verify creator badges, manage artist profiles, and audit monthly listeners.
- **User Accounts Management**: Manage permissions, assign roles (`USER`, `ADMIN`), and review listen history.
- **Banned Accounts & Appeals**: Security suspension management, infraction review, and official `BanAppealDTO` processing.
- **Genre Taxonomies**: Add and customize music genres with gradient color badges and track counts.

### 🎚️ 3. High-Fidelity Audio Engine
- **Persistent Player Bar**: Play/pause, track scrubbing with timestamp formatting, repeat modes (`off`, `all`, `one`), shuffle, and volume slider with mute toggle.
- **Queue Drawer**: Live view of currently playing track and upcoming queue with reorder and clear options.
- **Synced Lyrics Drawer**: Ambient blurred cover backdrop with karaoke-style synchronized lyrics.
- **Fullscreen Visualizer**: Expanded vinyl display with atmospheric radial glow.
- **Resilient Web Audio Fallback**: Built-in harmonic synthesizer engine so audio previews play smoothly even if remote CDN streams are offline.

---

## 🔌 Spring Boot Backend Integration

HarmoniQ is engineered to integrate directly with the Spring Boot backend (`com.ijse.gdse73.harmoniq_backend`). All requests target the `/api/v1/*` routes and automatically unwrap the standard `APIResponse<T>` envelope (`{ code, message, data }`).

| Controller | Endpoints | Method | Request Payload |
| :--- | :--- | :--- | :--- |
| **`AuthController`** | `/api/v1/auth/signin` | `POST` | `SignInDTO` (`email`, `password`) |
| | `/api/v1/auth/signup` | `POST` | `SignUpDTO` (`name`, `email`, `password`, `role`) |
| **`MusicController`** | `/api/v1/music/all` | `GET` | — |
| | `/api/v1/music/save` | `POST` | `MusicDTO` (`title`, `artist`, `album`, `duration`, `audioUrl`, `coverUrl`, `genreId`, `lyrics`, `explicit`) |
| | `/api/v1/music/update/{id}` | `PUT` | `MusicDTO` updates |
| | `/api/v1/music/delete/{id}` | `DELETE` | Path parameter |
| | `/api/v1/music/search?query=` | `GET` | Query parameter |
| **`ArtistController`** | `/api/v1/artist/all` | `GET` | — |
| | `/api/v1/artist/save` | `POST` | `ArtistDTO` (`name`, `bio`, `avatarUrl`, `coverUrl`, `genres`, `verified`) |
| **`FollowedArtistController`** | `/api/v1/followed-artist/save` | `POST` | `FollowedArtistDTO` (`userId`, `artistId`) |
| **`PlaylistController`** | `/api/v1/playlist/all` | `GET` | — |
| | `/api/v1/playlist/save` | `POST` | `PlaylistDTO` (`name`, `title`, `description`, `coverUrl`, `userId`) |
| **`PlaylistSongController`** | `/api/v1/playlist-song/save` | `POST` | `PlaylistSongDTO` (`playlistId`, `musicId`, `songId`) |
| | `/api/v1/playlist-song/delete/{plId}/{songId}` | `DELETE` | Path parameters |
| **`LikedSongController`** | `/api/v1/liked-song/all/{userId}` | `GET` | Path parameter |
| | `/api/v1/liked-song/save` | `POST` | `LikedOrRecentSongDTO` (`userId`, `musicId`, `songId`) |
| **`RecentSongController`** | `/api/v1/recent-song/save` | `POST` | `LikedOrRecentSongDTO` (`userId`, `musicId`) |
| | `/api/v1/recent-song/all/{userId}` | `GET` | Path parameter |
| **`GenreController`** | `/api/v1/genre/all` | `GET` | — |
| | `/api/v1/genre/save` | `POST` | `GenreDTO` (`name`, `color`, `description`) |
| **`UserController`** | `/api/v1/user/all` | `GET` | — |
| | `/api/v1/user/update/{id}` | `PUT` | `UserDTO` updates |
| **`UserBanController`** | `/api/v1/ban/all` | `GET` | — |
| | `/api/v1/ban/save` | `POST` | `BanUserDTO` (`userId`, `reason`, `adminId`) |
| | `/api/v1/ban/unban/{userId}` | `POST` | Path parameter |
| | `/api/v1/ban/appeal` | `POST` | `BanAppealDTO` (`userId`, `username`, `reason`) |
| **`EmailController`** | `/api/v1/email/send-otp` | `POST` | `EmailDataDTO` (`email`, `recipient`) |
| | `/api/v1/email/verify-otp` | `POST` | `ValidateOtpDTO` (`otp`, `email`) |
| | `/api/v1/email/reset-password` | `POST` | `ResetPasswordDTO` (`otp`, `newPassword`) |
| **`ActivityController`** | `/api/v1/activity/all` | `GET` | — |
| **`ChatController`** | `/api/v1/chat` | `POST` | `{ message, prompt }` |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)
- *(Optional)* HarmoniQ Spring Boot backend running locally on port `8080`

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/your-username/harmoniq.git
cd harmoniq
npm install
```

### 2. Environment Variables (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## 🌐 Deploying to Vercel

HarmoniQ is pre-configured for zero-friction Vercel deployments:

1. Push your repository to **GitHub**.
2. Import the repository into **Vercel**.
3. Vercel automatically detects the Vite framework and builds using:
   - `.npmrc` (`legacy-peer-deps=true`)
   - `vercel.json` (SPA client-side routing rewrites)
4. Set any custom environment variables if needed, then click **Deploy**.

---

## 📁 Project Structure

```
harmoniq/
├── .npmrc                         # Peer dependency resolution configuration
├── vercel.json                    # Vercel deployment & SPA rewrite routing
├── index.html                     # HTML5 entry point with HarmoniQ typography
├── package.json                   # Dependencies and build scripts
├── vite.config.ts                 # Vite + Tailwind CSS plugins
├── src/
│   ├── main.tsx                   # React root entry point
│   ├── App.tsx                    # Portal router (Listener vs Admin Backstage)
│   ├── index.css                  # Global styles, scrollbar & equalizer keyframes
│   ├── types/
│   │   └── index.ts               # Spring Boot entities, DTOs & Portal types
│   ├── services/
│   │   ├── api.ts                 # Resilient Spring Boot REST client & health checker
│   │   └── mockData.ts            # High-fidelity mock catalog & fallback metrics
│   ├── context/
│   │   ├── AudioContext.tsx       # Audio engine with HTML5 Audio & synthesized backup
│   │   ├── AuthContext.tsx        # Authentication session & portal switcher
│   │   └── ThemeContext.tsx       # Dark & Light mode controller
│   ├── components/
│   │   ├── HarmoniQLogo.tsx       # Realistic vector soundwave logo
│   │   ├── UserSidebar.tsx        # Listener-only navigation sidebar
│   │   ├── AdminSidebar.tsx       # Backstage operations sidebar
│   │   ├── Navbar.tsx             # Listener top navigation & search
│   │   ├── AdminNavbar.tsx        # Backstage header bar
│   │   ├── PlayerBar.tsx          # Persistent bottom audio player
│   │   ├── QueueDrawer.tsx        # Play queue drawer
│   │   ├── LyricsModal.tsx        # Synchronized lyrics drawer
│   │   ├── FullscreenPlayer.tsx   # Immersive fullscreen vinyl visualizer
│   │   └── BackendConfigModal.tsx # Spring Boot URL & health ping modal
│   └── views/
│       ├── UserHomeView.tsx       # Listener home & shelves
│       ├── SearchPageView.tsx     # Filterable search & genre cards
│       ├── PlaylistsView.tsx      # Playlist catalog & creator modal
│       ├── PlaylistDetailView.tsx # Playlist tracks management
│       ├── LikedSongsView.tsx     # Favorite songs library
│       ├── ArtistsView.tsx        # Artist discovery directory
│       ├── ArtistProfileView.tsx  # Artist profile & popular tracks
│       ├── UserProfileView.tsx    # Listening stats & profile editor
│       ├── AIChatView.tsx         # HarmoniQ AI DJ recommendation assistant
│       ├── AdminDashboardView.tsx # Operations analytics & charts
│       ├── MusicManagementView.tsx# Catalog track upload & edit
│       ├── ArtistManagementView.tsx# Artist roster & badge verification
│       ├── UserManagementView.tsx # User moderation & role assignments
│       ├── BannedUsersView.tsx    # Banned accounts audit & unban
│       ├── GenreManagementView.tsx# Genre taxonomy configuration
│       ├── BanPageView.tsx        # Account restricted notice & appeal form
│       └── AuthViews.tsx          # Listener & Admin login / signup / OTP recovery
```

---

## 📄 License

This project is open-source under the [Apache-2.0 License](LICENSE).

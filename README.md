# THE KHABAR EXPRESS

**THE KHABAR EXPRESS** is a premium, high-performance news and blog platform built with a modern tech stack. It features a sophisticated design, robust admin management, and optimized user experiences.

---

## 🌟 Key Features

### 🗞️ Modern Reading Experience
- **Dynamic Content Blocks**: sophisticated layouts including Trending Now, Top Stories, Editors' Picks, and Industry Updates.
- **Versatile Blog Cards**: Multiple card variants (Hero, Compact, Horizontal, Trending) tailored for different sections of the site.
- **Infinite Scrolling**: Smooth "Load More" functionality in category and archive pages for uninterrupted browsing.
- **Advanced Search**: A powerful "Command Center" search dialog with real-time results.

### 🔐 Robust Admin Dashboard
- **Comprehensive Management**: Centralized hub for managing Blogs, Users, Contributors, and Task Lists.
- **URL-Synced Navigation**: Dashboard tabs are synchronized with URL query parameters, enabling persistent states and shareable deep links.
- **Status Workflows**: Streamlined blog approval process (Pending -> Approved/Rejected).
- **Engagement Metrics**: Track views and engagement directly from the dashboard row views.

### ⚡ Performance & Reliability
- **Smart Caching**: Implemented a 15-day localStorage caching system for tags and other frequently accessed data to reduce API latency.
- **Global Error Handling**: Robust Error Boundary system to catch runtime exceptions and provide branded recovery options.
- **Premium Loading States**: Custom skeleton loaders for all major components to ensure a smooth perceived performance.
- **SEO Optimized**: Fully integrated Schema.org structured data, meta tags, and refined heading hierarchies.

### 🎨 Design & Aesthetics
- **Premium Look**: A blend of modern typography (Inter & Serif), glassmorphism effects, and subtle micro-animations.
- **Dark Mode Ready**: Semantic theme tokens used throughout for consistent appearance across light and dark modes.
- **Responsive Architecture**: Fully mobile-responsive layouts from complex admin grids to reading-focused blog pages.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (React)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Data Fetching**: [SWR](https://swr.vercel.app/) (Stale-While-Revalidate)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/sou842/THE_KHABAR_EXPRESS.git
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the root directory and add your configuration (API endpoints, database URIs, etc.).

4. **Run the development server**:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📸 Screenshots

### Home Page Architecture
![Home Page Overview](<img width="2880" height="10472" alt="screencapture-thekhabarexpress-2026-03-04-13_05_59" src="https://github.com/user-attachments/assets/d6e43388-b1b2-45d6-9d4e-c321ea8a5fd8" />
)
*The modern, high-contrast home page featuring dynamic story blocks.*

### Blog Page
![Blog Page] (<img width="2880" height="8594" alt="screencapture-thekhabarexpress-blog-spacex-successfully-launches-next-gen-starlink-v3-satellites-2026-03-04-13_06_57" src="https://github.com/user-attachments/assets/d2682140-31d1-4be5-bdf0-67d626a54408" />)

*The centralized management hub with URL-synced tabs.*

---

## 🛡️ Error Handling

We take reliability seriously. The platform includes:
- **`ErrorBoundary`**: Catches client-side crashes and shows a recovery UI.
- **`ErrorState`**: A reusable component for branded error messaging.
- **`errorUtils`**: Centralized logging and API error normalization.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

Developed with ❤️ by the **Khabar Express Team**.

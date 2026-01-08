# GyanAI - Anime Study Assistant

A responsive, Anime-themed AI study helper built with React, Vite, and the Google Gemini API.

## 🚀 Features
- **Anime Persona:** A lively 3D-style avatar that reacts to context (thinking, happy, speaking).
- **Subject Mastery:** Specialized in Math, Science, Bangla, and English.
- **Visual Learning:** Upload images for analysis.
- **Voice Interaction:** Live audio session capabilities.
- **Step-by-Step Logic:** Explains the "How" and "Why" behind every answer.

## 🛠️ Setup & Deployment

### Prerequisites
1. Node.js installed.
2. A Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/).

### Local Development
1. Clone the repo.
2. Create a `.env` file in the root directory:
   ```env
   API_KEY=your_google_api_key_here
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the dev server:
   ```bash
   npm run dev
   ```

### ☁️ Deploy to Vercel

1. **Push to GitHub/GitLab:** Push this code to a repository.
2. **Import to Vercel:** Go to Vercel dashboard and add a new project from your repository.
3. **Environment Variables (Important!):**
   - In the Vercel deployment screen, find **Environment Variables**.
   - Add a new variable:
     - **Name:** `API_KEY`
     - **Value:** Your actual Gemini API Key.
4. **Deploy:** Click deploy. Vercel will automatically detect Vite and build the project.

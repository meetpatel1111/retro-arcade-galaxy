# Retro Arcade Galaxy 👾

Welcome to Retro Arcade Galaxy, your portal to classic arcade fun with a modern, futuristic twist! This is a web-based collection of minigames designed to be fun, engaging, and nostalgic, enhanced with modern AI-powered features.

## ✨ Features

-   **A Growing Collection of Games**: Play timeless classics like Snake, Tic-Tac-Toe, Pong, Minesweeper, and more.
-   **AI Game Master**: Get fun, retro-style banter and commentary from an AI Game Master after each game, complete with audio.
-   **AI-Powered Difficulty Adjustment**: Let the AI dynamically adjust the game's difficulty based on your performance.
-   **AI Minigame Suggestions**: Get creative new minigame ideas based on your playing history.
-   **High Score Leaderboards**: Compete for the top spot on the leaderboard for each game. Your scores are saved locally in your browser.
-   **Responsive Design**: Play on your desktop, laptop, or mobile device with keyboard and touch support.

## 🕹️ Games Included

- Quick Reaction
- Sliding Puzzle
- Snake
- Whack-a-Mole
- Tic-Tac-Toe
- Connect Four
- Pong
- Minesweeper
- Memory Match
- Word Scramble

## 🛠️ Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (React)
-   **AI**: [Google's Genkit](https://firebase.google.com/docs/genkit)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (version 18 or higher)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd retro-arcade-galaxy
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of your project and add your Gemini API key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).
    ```
    GEMINI_API_KEY=your_api_key_here
    ```

### Running the Application

1.  **Start the development server:**
    ```bash
    npm run dev
    ```
    This will start the Next.js application on `http://localhost:9002`.

2.  **Start the Genkit development server:**
    In a separate terminal, run the following command to start the Genkit AI flows inspector.
    ```bash
    npm run genkit:dev
    ```
    You can view the Genkit developer UI at `http://localhost:4000`.

Now you can open your browser and navigate to `http://localhost:9002` to play the games!

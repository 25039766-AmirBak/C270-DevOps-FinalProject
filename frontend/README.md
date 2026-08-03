<!-- Chevrez -->
# SharePlate - Food Surplus Redistribution Platform

SharePlate is a full-stack web application engineered by LaunchLab Team 1. Our mission is to bridge the gap between food surplus and scarcity in Singapore by connecting food donors directly with beneficiaries and volunteer drivers.

## 🚀 Features
* **Interactive Map:** Real-time visibility of active food donations across Singapore.
* **Smart Roles:** Tailored UI experiences for Donors, Beneficiaries, and Volunteers.
* **AI Assistant:** Integrated Google Gemini LLM to help users navigate food safety guidelines and platform features.
* **Live Impact Metrics:** Real-time tracking of meals rescued and active community volunteers.

## 🛠️ Tech Stack
* **Frontend:** React.js, React Router v6
* **Backend:** Node.js, Express.js (REST API)
* **AI Integration:** `@google/genai` (Gemini 2.5 Flash)
* **Styling:** Custom CSS Variables & Grid Layouts

## ⚙️ How to Run Locally

### 1. Start the Backend Server
Navigate to the backend directory, configure your environment variables, and start the server:
\`\`\`bash
cd backend
npm install
npm run dev
\`\`\`
*(Note: You must have a valid `.env` file with `GEMINI_API_KEY` to use the Chatbot)*

### 2. Start the Frontend Application
Navigate to the frontend directory and start the React server:
\`\`\`bash
cd frontend
npm install
npm start
\`\`\`
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

---
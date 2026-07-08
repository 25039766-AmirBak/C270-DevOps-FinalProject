# C270-DevOps-FinalProject
Team 1 Final Project
# 🍽️ SharePlate

SharePlate is a MERN stack web application that connects food donors with organisations requesting surplus food. The platform aims to reduce food waste by making food donations easier to manage and distribute.

## Features

- Browse available food donations
- Filter donations by location
- Submit food requests
- View submitted food requests
- AI chatbot powered by Google Gemini
- Responsive homepage with navigation and information pages

## Tech Stack

### Frontend
- React.js
- CSS

### Backend
- Node.js
- Express.js

### Database
- MongoDB Atlas
- Mongoose

### AI
- Google Gemini API

## Project Structure

```
client/
├── components/
├── global.css
├── requestsystem.css
└── App.js

server/
├── models/
├── routes/
├── server.js
└── .env
```

## API Endpoints

### Donations

```
GET /api/donations
```

Returns all available food donations.

### Requests

```
GET /api/requests
```

Returns all submitted food requests.

```
POST /api/requests
```

Creates a new food request.

### AI Chatbot

```
POST /api/chat
```

Sends a message to the SharePlate AI Assistant and returns a response.

## Authors

Developed as part of a Food Donation Management System project using the MERN Stack.

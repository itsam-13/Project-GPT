# ChatGPT Backend (Project-GPT)

A Node.js and Express backend API for a ChatGPT clone application. It provides user authentication, real-time AI conversational chat using Google Gemini, WebSocket capabilities via Socket.IO, database interaction with MongoDB (Mongoose), and message persistence.

---

## 🚀 Features Implemented

- **User Authentication**:
  - Registration (`POST /api/auth/register`) with hashed passwords using `bcryptjs`.
  - Login (`POST /api/auth/login`) with JWT token signed and stored in HTTP cookies (`cookie-parser`).
  - Authentication middleware (`authUser`) protecting secured routes.
- **Chat Management**:
  - Create new chat threads (`POST /api/chat/`) linked to the authenticated user.
- **Google Gemini AI Integration**:
  - Powered by `@google/genai` using the `gemini-2.5-flash` model.
  - Multi-turn conversation awareness (maintains recent chat history context).
- **Real-Time Communication (Socket.IO)**:
  - Secure Socket.IO connection middleware supporting JWT from Cookies, Auth payload, Authorization headers, or Query parameters.
  - Real-time `ai-message` handling: stores user prompts, fetches chat history context, triggers Gemini AI, persists AI responses, and streams back `ai-response`.
- **Database & Message Persistence**:
  - MongoDB connection using `mongoose` with custom DNS configuration.
  - Message schema storing conversation history with role tagging (`user` vs `model`).

---

## 🛠️ Tech Stack & Dependencies

| Technology                       | Purpose                                         |
| -------------------------------- | ----------------------------------------------- |
| **Node.js & Express.js**   | Server framework & API routes                   |
| **MongoDB & Mongoose**     | NoSQL Database & ORM                            |
| **Socket.IO**              | Real-time bi-directional WebSockets connection  |
| **@google/genai**          | Google Gemini Generative AI SDK                 |
| **JSONWebToken (JWT)**     | User session management & authentication tokens |
| **BcryptJS**               | Secure password hashing                         |
| **Cookie & Cookie-Parser** | HTTP cookie parsing and extraction              |
| **Dotenv**                 | Environment variable management                 |
| **Nodemon**                | Development server hot-reloading                |

---

## 📁 Project Structure

```text
ChatGpt-Backend/
├── .env                       # Environment variables (Mongo URL, JWT Secret, Gemini Key)
├── .gitignore                 # Files to ignore in Git
├── package.json               # Project dependencies and scripts
├── server.js                  # Entry point (HTTP server, DB connection & Socket initializer)
└── src/
    ├── app.js                 # Express app initialization & middleware configuration
    ├── database/
    │   └── db.js              # MongoDB database connection configuration
    ├── Sockets/
    │   └── sockets.server.js  # Socket.IO authentication, connection & AI event handlers
    ├── Services/
    │   └── ai.services.js     # Google Gemini AI integration service
    ├── Middlewares/
    │   └── auth.middleware.js # Middleware for protecting HTTP routes via JWT
    ├── models/
    │   ├── user.model.js      # User schema (email, fullname, password)
    │   ├── chat.model.js      # Chat schema (user reference, title, lastActive)
    │   └── msg.model.js       # Message schema (chat, user, content, role)
    ├── controllers/
    │   ├── auth.controller.js # Logic for user registration & login
    │   └── chat.controller.js # Logic for creating and managing chats
    └── routes/
        ├── auth.routes.js     # Auth API endpoint definitions
        └── chat.routes.js     # Chat API endpoint definitions
```

---

## 🔑 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
MONGO_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/ChatGPT
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
```

---

## ⚙️ Installation & Setup

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/itsam-13/Project-GPT.git
   cd ChatGpt-Backend
   ```
2. **Install Dependencies**:

   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env` file and supply `MONGO_URL`, `JWT_SECRET`, and `GEMINI_API_KEY`.
4. **Run the Development Server**:

   ```bash
   npm run dev
   ```

   The server will run on `http://localhost:3000`.

---

## 🔌 HTTP API Endpoints

### Authentication Routes (`/api/auth`)

| Method   | Endpoint               | Description                            | Auth Required |
| -------- | ---------------------- | -------------------------------------- | ------------- |
| `POST` | `/api/auth/register` | Register a new user                    | ❌ No         |
| `POST` | `/api/auth/login`    | Login user & receive HTTP cookie token | ❌ No         |

#### Register Request Body:

```json
{
  "email": "user@example.com",
  "fullName": {
    "firstName": "John",
    "lastName": "Doe"
  },
  "password": "yourpassword"
}
```

#### Login Request Body:

```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

---

### Chat Routes (`/api/chat`)

| Method   | Endpoint       | Description               | Auth Required         |
| -------- | -------------- | ------------------------- | --------------------- |
| `POST` | `/api/chat/` | Create a new chat session | ✅ Yes (Cookie / JWT) |

#### Create Chat Request Body:

```json
{
  "title": "Discussion on Node.js"
}
```

---

## ⚡ Socket.IO Real-Time AI Chat

### 1. Connection & Authentication

Clients can authenticate via any of the following methods during handshake:

- **Auth Payload**: `{ auth: { token: "YOUR_JWT_TOKEN" } }`
- **Cookies**: `Cookie: token=YOUR_JWT_TOKEN`
- **Authorization Header**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **Query Parameter**: `?token=YOUR_JWT_TOKEN`

### 2. Client-Side Implementation Example

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  auth: {
    token: "YOUR_JWT_TOKEN"
  },
  withCredentials: true
});

socket.on("connect", () => {
  console.log("Connected to AI Socket server:", socket.id);
});

// Send a message to AI
socket.emit("ai-message", {
  chat: "66d1234567890abcdef12345", // Chat ObjectId
  content: "Explain asynchronous programming in JavaScript"
});

// Listen for AI Response
socket.on("ai-response", (data) => {
  console.log("AI Response:", data.content);
  console.log("Chat ID:", data.chat);
});

// Listen for Errors
socket.on("ai-error", (err) => {
  console.error("AI Error:", err.message);
});
```

### 3. Events Summary

| Event           | Direction        | Payload                               | Description                                       |
| --------------- | ---------------- | ------------------------------------- | ------------------------------------------------- |
| `ai-message`  | Client ➔ Server | `{ chat: string, content: string }` | Sends a prompt to the AI within a chat thread     |
| `ai-response` | Server ➔ Client | `{ chat: string, content: string }` | Returns the generated Gemini AI response          |
| `ai-error`    | Server ➔ Client | `{ chat: string, message: string }` | Emitted when an error occurs during AI generation |

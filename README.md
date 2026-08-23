# ChatGPT Backend (Project-GPT)

A Node.js and Express backend API for a ChatGPT clone application. It provides user authentication, real-time WebSocket capabilities using Socket.IO, database interaction with MongoDB (Mongoose), and chat management endpoints.

---

## 🚀 Features Implemented

- **User Authentication**:
  - Registration (`POST /api/auth/register`) with hashed passwords using `bcryptjs`.
  - Login (`POST /api/auth/login`) with JWT token signed and stored in HTTP cookies (`cookie-parser`).
  - Authentication middleware (`authUser`) protecting secured routes.
- **Chat Management**:
  - Create new chat threads (`POST /api/chat/`) linked to the authenticated user.
- **Real-Time Communication**:
  - Integrated `Socket.IO` server running alongside the HTTP server for real-time bi-directional events.
- **Database Connection**:
  - MongoDB connection using `mongoose` with custom DNS server configuration (`8.8.8.8`, `1.1.1.1`) for smooth SRV lookup resolving.

---

## 🛠️ Tech Stack & Dependencies

| Technology | Purpose |
| --- | --- |
| **Node.js & Express.js** | Server framework & API routes |
| **MongoDB & Mongoose** | NoSQL Database & ORM |
| **Socket.IO** | Real-time WebSockets connection |
| **JSONWebToken (JWT)** | User session management & auth tokens |
| **BcryptJS** | Secure password hashing |
| **Cookie-Parser** | Extracting tokens from HTTP cookies |
| **Dotenv** | Environment variable management |
| **Nodemon** | Development server hot-reloading |

---

## 📁 Project Structure

```text
ChatGpt-Backend/
├── .env                       # Environment variables (Mongo URL, JWT Secret)
├── .gitignore                 # Files to ignore in Git
├── package.json               # Project dependencies and scripts
├── server.js                  # Entry point (HTTP server, DB connection & Socket initializer)
└── src/
    ├── app.js                 # Express app initialization & middleware configuration
    ├── database/
    │   └── db.js              # MongoDB database connection configuration
    ├── Sockets/
    │   └── sockets.server.js  # Socket.IO connection & event handlers
    ├── Middlewares/
    │   └── auth.middleware.js # Middleware for protecting routes via JWT
    ├── models/
    │   ├── user.model.js      # User schema (email, fullname, password)
    │   └── chat.model.js      # Chat schema (user reference, title, lastActive)
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
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
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
   Create `.env` file and set `MONGO_URL` and `JWT_SECRET`.

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:3000`.

---

## 🔌 API Endpoints Summary

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Register a new user | ❌ No |
| `POST` | `/api/auth/login` | Login user & receive HTTP cookie token | ❌ No |

#### Register Request Body example:
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

#### Login Request Body example:
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

---

### Chat Routes (`/api/chat`)
| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `POST` | `/api/chat/` | Create a new chat session | ✅ Yes (Cookie Token) |

#### Create Chat Request Body example:
```json
{
  "title": "New Chat Thread"
}
```

---

## ⚡ Socket.IO Real-Time Events

The backend initializes a `Socket.IO` server listening on the main HTTP server:
- Connection Handler: Logs new active WebSocket connections (`socket.id`).

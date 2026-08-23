require("dotenv").config()
const app = require("./src/app")
const connectDB = require('./src/database/db')
const initSocketServer = require('./src/Sockets/sockets.server')
const httpServer = require("http").createServer(app);

connectDB();
initSocketServer(httpServer);


httpServer.listen(3000, () => {
    console.log("Server is running at port 3000")
})


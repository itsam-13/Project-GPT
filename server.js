require("dotenv").config()
const app = require("./src/app")
const connectDB = require('./src/database/db')
const authRoutes = require('./src/routes/auth.routes')


connectDB();

app.use('/api/auth',authRoutes)


app.listen(3000,()=>{
    console.log("Server is runing at port 3000")
})

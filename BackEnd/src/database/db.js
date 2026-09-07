const mongoose = require("mongoose");
const dns = require('dns');
const { log } = require('console');

dns.setServers(
    ['8.8.8.8',
        '1.1.1.1']
)



async function connectDB(){
    try{
        await mongoose.connect(process.env.MONGO_URL)
        console.log("MongoDB connected")
    }catch(error){
        console.log(error)
        
    }
}

module.exports = connectDB
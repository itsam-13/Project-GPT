const mongoose = require('mongoose')

const msgSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat'
    },
    content: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'model'],
        required: true
    }
}, 
    {
        timestamps: true
    }
)

const msgModel = mongoose.model('Msg', msgSchema);

module.exports = msgModel;
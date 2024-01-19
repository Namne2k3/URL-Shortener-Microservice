const mongoose = require('mongoose')

const UrlSchema = new mongoose.Schema({
    original_url: {
        type: String,
        required: true,
    },
    short_url: {
        type: Number,
        required: true
    }
})

const URL = mongoose.model('URL', UrlSchema) || mongoose.model['URL']

module.exports = URL
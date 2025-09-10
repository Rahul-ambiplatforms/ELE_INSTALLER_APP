const mongoose = require('mongoose');

const eleFlv = new mongoose.Schema({
    prourl: {
        type: String,
    },
    streamname: {
        type: String,
    },
    servername: {
        type: String
    },
    url2: {
        type: String
    },
    Date: {
        type: Date,
        default: Date.now()
    }
});

const EleFlv = mongoose.model('ele-flv-data', eleFlv);

module.exports = EleFlv;  

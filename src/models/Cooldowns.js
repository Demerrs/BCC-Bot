const { Schema, model } = require('mongoose');

const cooldownSchema = new Schema({
    commandName: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    guildId: {
        type: Number,
        required: true,
    },
    endsAt: {
        type: Number,
        required: true,
    },
});

module.exports = model('cooldown', cooldownSchema);

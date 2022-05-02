const mongoose = require("mongoose")

const likedSchema = mongoose.Schema({
    tweet_id: {
        type: String,
        required: [true, "Please insert the tweet_id field"]
    },
    user_id: {
        type: String,
        required: [true, "Please insert the user_id field"]
    }
},
{
    timestamps: true
})

module.exports = mongoose.model('LikedTweets', likedSchema)
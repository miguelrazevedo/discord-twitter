const mongoose = require("mongoose")

const tweetSchema = mongoose.Schema({
    tweet_id: {
        type: String,
        required: [true, "Please insert the tweet_id field"]
    },
    retweet_count: {
        type: Number,
        required: [true, "Please insert the retweet_count field"]
    },
    reply_count: {
        type: Number,
        required: [true, "Please insert the reply_count field"]
    },
    like_count: {
        type: Number,
        required: [true, "Please insert the like_count field"]
    },
    quote_count: {
        type: Number,
        required: [true, "Please insert the quote_count field"]
    },
    text: {
        type: String,
        required: [true, "Please insert the text field"]
    }
},
{
    timestamps: true
})

module.exports = mongoose.model('Tweet', tweetSchema)
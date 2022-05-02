const formatTweetsArray = (array) => {
    let formatted = []

    array.forEach((tweet) => {
        const newObject = {
            "tweet_id": tweet.id,
            "retweet_count": tweet.public_metrics.retweet_count,
            "reply_count": tweet.public_metrics.reply_count,
            "like_count": tweet.public_metrics.like_count,
            "quote_count": tweet.public_metrics.quote_count
        }
        formatted.push(newObject)
    })


    return formatted // Example: [ {tweet_id, retweet_count, reply_count, like_count, quote_count}, ...]
}

module.exports = {
    formatTweetsArray: formatTweetsArray
}
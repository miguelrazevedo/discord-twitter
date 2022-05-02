const { default: axios } = require("axios")
const dotenv = require("dotenv").config()
const mysql = require("mysql")
const { formatTweetsArray } = require("./assets/assets")
const connectDB = require("./assets/db")
const Tweets = require("./Models/tweetModel")
const Liked = require("./Models/liked_tweetsModel")
const { TwitterApi } = require('twitter-api-v2');
const { TwitterApiRateLimitPlugin } = require('@twitter-api-v2/plugin-rate-limit') 

// Constant variables
const twitter_account_id = process.env.TWITTER_ACCOUNT_ID
const twitter_bearer_token = process.env.TWITTER_BEARER_TOKEN


const rateLimitPlugin = new TwitterApiRateLimitPlugin()
const appOnlyClient = new TwitterApi(twitter_bearer_token, { plugins: [rateLimitPlugin]});
const client = appOnlyClient.v2;




const getTweets = async () => {
    try {
        const userTimeline = await client.userTimeline(twitter_account_id, { "max_results": 100, "tweet.fields": "public_metrics" })

        // Get all the tweets until there are no more results available 
        // or until rate limit is hit
        let tweets = []
        for await (const tweet of userTimeline) {
            tweets.push({
                "tweet_id": tweet.id,
                "retweet_count": tweet.public_metrics.retweet_count,
                "reply_count": tweet.public_metrics.reply_count,
                "like_count": tweet.public_metrics.like_count,
                "quote_count": tweet.public_metrics.quote_count
            })
        }

        if (tweets.length > 0) {
            const tweetsDB = await Tweets.bulkWrite(
                tweets.map((tweet) => {
                    return ({
                        updateOne: {
                            filter: { tweet_id: tweet.tweet_id },
                            update: { $set: tweet },
                            upsert: true
                        }
                    })
                })
            )
            console.log("Tweets added")
        }
        else {
            console.log("No tweets found")
        }
    } catch (error) {
        console.log("__ERROR__")
        if (error.rateLimitError && error.rateLimit) {
            console.log(`You just hit the rate limit! Limit for this endpoint is ${error.rateLimit.limit} requests!`);
        }
    }
}



const getLikes = async () => {

    // Get the tweets that have at least 1 like from the DB
    const likedTweets = await Tweets.find({ like_count: { $gte: 1 } })

    
    // If there are liked tweets
    if (likedTweets.length > 0) {

        for (const tweet of likedTweets) {
            try {
                const usersPaginated = await client.tweetLikedBy(tweet.tweet_id, { asPaginator: true, "max_results": 100 } )
                // console.log(`--- Tweet ${tweet.tweet_id} ---\nRemaining Requests: ${usersPaginated.rateLimit.remaining}`)
                for await (const user of usersPaginated) {
                    const obj = { tweet_id: tweet.tweet_id, user_id: user.id }
                    const likedDB = await Liked.updateOne({ tweet_id: tweet.tweet_id, user_id: user.id }, obj, { upsert: true, setDefaultsOnInsert: true })             
                }     
                  
            } catch (error) {
                // If there's an error thrown by Twitter's API, wait 16 minutes (15 of cooldown + 1 to make sure)
                // Retry again the last request
                console.log("__ERROR__")
                if (error.rateLimitError && error.rateLimit) {
                    console.log(`You just hit the rate limit! Limit for this endpoint is ${error.rateLimit.limit} requests!`);

                    const resetTimeout = error.rateLimit.reset * 1000; // convert to ms time instead of seconds time
                    const timeToWait = resetTimeout - Date.now();
                    console.log("Waiting 16 minutes " + timeToWait)

                    await sleep(960000)
                    
                    const usersPaginated = await client.tweetLikedBy(tweet.tweet_id, { asPaginator: true, "max_results": 100 } )
                    // console.log(`--- Tweet ${tweet.tweet_id} ---\nRemaining Requests: ${usersPaginated.rateLimit.remaining}`)
                    for await (const user of usersPaginated) {
                        const obj = { tweet_id: tweet.tweet_id, user_id: user.id }
                        const likedDB = await Liked.updateOne({ tweet_id: tweet.tweet_id, user_id: user.id }, obj, { upsert: true, setDefaultsOnInsert: true })             
                    }  
                }
            }
            
        }

    }
    else {
        console.log("No liked Tweets")
    }

}




const getUserbyUsername = async (username) => {
    let user 
    await client.userByUsername(username).then((userRes) => user = userRes)

    return user
}

function sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time))
}

module.exports = {
    getUserbyUsername: getUserbyUsername
}



/*
// Get all the tweets and add/update them into the database
const getTweets = async () => {
    let responses = []

    let hasNextPage = false
    let nextPageToken = ""

    // Get the first 100 tweets (Twitter API is limited to 100 per request)
    await axios.get(`https://api.twitter.com/2/users/${twitter_account_id}/tweets`, {
        headers: {
            "Authorization": `Bearer ${twitter_bearer_token}`
        },
        params: {
            "max_results": 100,
            "tweet.fields": "public_metrics"
        }
    }).then((res) => {
        // If there's any results
        if (res.data.meta.result_count > 0) {
            responses.push(res.data.data)

            // If the response has next_token field, it means there's still more tweets to check
            if (res.data.meta.next_token) {
                hasNextPage = true
                nextPageToken = res.data.meta.next_token
            }
        }
    }).catch((err) => {
        // If there's an error, it's not possible to make more requests
        if (err.response) {
            hasNextPage = false
        }
    })

    // Get the rest of the tweets
    while (hasNextPage) {
        await axios.get(`https://api.twitter.com/2/users/${twitter_account_id}/tweets`, {
            headers: {
                "Authorization": `Bearer ${twitter_bearer_token}`
            },
            params: {
                "max_results": 100,
                "tweet.fields": "public_metrics",
                "pagination_token": nextPageToken
            }
        }).then((res) => {
            // If there's any results
            if (res.data.meta.result_count > 0) {
                responses.push(res.data.data)

                // If the response has next_token field, it means there's still more tweets to check
                if (res.data.meta.next_token) {
                    hasNextPage = true
                    nextPageToken = res.data.meta.next_token
                }
                // If there's no next_token field, set the flag to false to stop making requests
                else {
                    hasNextPage = false
                }
            }
        }).catch((err) => {
            // If there's an error, it's not possible to make more requests
            if (err.response) {
                hasNextPage = false
            }
        })
    }

    // If there's at least one tweet, format the response
    if (responses.length > 0) {
        const tweetsArray = formatTweetsArray(responses)

        const tweetsDB = await Tweets.bulkWrite(
            tweetsArray.map((tweet) => {
                return ({
                    updateOne: {
                        filter: { tweet_id: tweet.tweet_id },
                        update: { $set: tweet },
                        upsert: true
                    }
                })
            })
        )

        console.log("Tweets Added")

    }
    else {
        console.log("\nNo tweets found!")
    }
}
*/
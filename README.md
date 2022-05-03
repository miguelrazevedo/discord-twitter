# Discord-Twitter

This discord bot is currently checking how many tweets a user liked/retweeted in a specific Twitter account with [Node Twitter API V2](https://github.com/PLhery/node-twitter-api-v2)

### Installation

```sh
cd ./repository
npm install
# or
yarn install
```

### Setting variables
To make this bot work, you'll need to set up some variables first, you can create a `.env` file inside the root of your repository with the following variables as an example:

```sh
# TWITTER
TWITTER_ACCOUNT_ID="string"
TWITTER_BEARER_TOKEN="string"

# MONGO DB
MONGO_URI="string"

# DISCORD
DISCORD_TOKEN="string"
GUILD_ID="string"
ADMIN_ROLE_ID="string"
```

### Database (MongoDB)
The DB system used for this project was MongoDB through Mongoose package.

### Twitter
To get the Twitter API Bearer token you'll need to register on Twitter Developers website, create an app and copy your `Bearer Token`.

To get the account id, you'll need to use endpoint `https://api.twitter.com/2/users/by/username/:username` using your username which will return the following JSON (if the user exists):

```json
{
    "data": {
        "id": "id_String",
        "name": "name_String",
        "username": "username_String"
    }
}
```

# Discord
The same thing goes for Discord, you'll need to create an app on Discord Developers website and genereate a token.  

To get the Guild ID, you'll need to enable Developer Mode on your Discord by going to `Settings -> Advanced -> Developer Mode`. After that right click on your Discord Server on your list and select `Copy ID` and set it in your `config.json` file.

You might be wondering, what's a guild? In Discord.js, a guild is considered a server. For example an `user guild array is an array with all the users that joined that Discord server.`

You'll also need to the same thing for the Admin role, since there's also some commands that only admins can run. Just go to `Server Settings -> Roles -> Right click on the Admin role -> Copy ID` and set it in your `.env` file as well.

And that's it!

## Discord commands (explanation)

#### Likes
The `/likes *username*` command will check and return how many tweets a user has liked on the Exothium's twitter page.

#### Retweets
The `/retweets *username*` command will check and return how many times a user retweeted Exothium's tweets.

#### Get Tweets
The `!getTweets` command can only be run by an Admin. This command will insert all the tweets into the Database.

#### Get Likes
The `!getLikes` command can only be run by an Admin. This command will insert all the users that have liked Exothium's tweets into the Database.

#### Get Retweets
The `!getRetweets` command can only be run by an Admin. This command will insert all the users that have retweeted Exothium's tweets into the Database.
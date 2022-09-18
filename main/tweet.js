const twitter = require("twitter-api-v2");
const stream = require("./stream");
const EventEmitter = require("events");
const emitter = new EventEmitter();

const client = new twitter.TwitterApi({
  appKey: process.env["twitter_consumer_key"],
  appSecret: process.env["twitter_consumer_secret"],
  accessToken: process.env["twitter_access_token_key"],
  accessSecret: process.env["twitter_access_token_secret"],
});

module.exports = {
  /**
   * Post tweet.
   * @param {string} text
   * @return {Promise<twitter.TweetV2PostTweetResult>} Tweet data
   */
  async tweet(text) {
    try {
      return await client.v2.tweet(text);
    } catch (error) {
      let date = new Date(
        Date.now() + (new Date().getTimezoneOffset() + 9 * 60) * 60 * 1000
      );
      let dateString =
        date.getFullYear() +
        "/" +
        ("0" + (date.getMonth() + 1)).slice(-2) +
        "/" +
        ("0" + date.getDate()).slice(-2) +
        " " +
        ("0" + date.getHours()).slice(-2) +
        ":" +
        ("0" + date.getMinutes()).slice(-2) +
        ":" +
        ("0" + date.getSeconds()).slice(-2);
      await client.v2.tweet(
        `ツイート中にエラーが発生しました。 \n ${dateString}`
      );
      return error;
    }
  },

  async getTimeline() {
    let timeLine = await client.v2.homeTimeline({
      exclude: "replies",
    });

    return timeLine.tweets;
  },

  async getUserTimeline(user) {
    let timeLine = await client.v2.userTimeline(user, {
      exclude: "replies",
      max_results: 30,
    });

    return timeLine.tweets;
  },

  /**
   *
   * @param {string} tweetId
   * @return {Promise<twitter.TweetV2SingleResult>}
   */
  async getTweet(tweetId) {
    return await client.v2.singleTweet(tweetId, {
      expansions: ["author_id"],
      "tweet.fields": "source",
    });
  },

  event: emitter,

  async reply(text, tweetId) {
    try {
      await client.v2.reply(text, tweetId);
    } catch (e) {}
  },

  async like(tweetId) {
    let userId = (await client.v2.userByUsername("thinkingService")).data.id;
    await client.v2.like(userId, tweetId);
  },

  async updateBio(text) {
    await client.v1.updateAccountProfile({ description: text });
  },

  async getTrends() {
    return await client.v1.trendsAvailable();
  },
};

stream.on(
  "replied",
  /** @param {twitter.TweetV2SingleResult} tweet */ (tweet) => {
    emitter.emit("replied", tweet);
    console.log("replied");
  }
);

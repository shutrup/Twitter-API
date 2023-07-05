const express = require('express')
const Tweet = require('../models/tweet')

// New Router
const router = new express.Router()

const auth = require('../middleware/auth')

// Post Tweet Router
router.post('/tweets', auth, async (req, res) => {
    const tweet = new Tweet({
        ...req.body,
        user: req.user._id
    })

    try {
        await tweet.save()
        res.status(201).send(tweet)
    } catch (error) {
        res.status(400).send(error)
    }
});

// Fetch All Tweets
router.get('/tweets', async (req, res) => {
    try {
        const tweets = await Tweet.find()
        res.status(200).send(tweets)
    } catch (error) {
        res.status(500).send(error)
    }
});

module.exports = router
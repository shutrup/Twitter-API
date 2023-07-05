const express = require('express')
const multer  = require('multer')
const sharp  = require('sharp')
const Tweet = require('../models/tweet')

// New Router
const router = new express.Router()

const auth = require('../middleware/auth')


// Helpers

const upload = multer({
    limits: {
        fileSize: 100000000
    }
})

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

// Add Image to Tweet Route
router.post('/uploadTweetImage/:id', auth, upload.single('upload'), async (req, res) => {
    const tweet = await Tweet.findOne({ _id: req.params.id })

    if (!tweet) {
        throw new Error('Cannof find the tweet')
    }

    const buffer = await sharp(req.file.buffer).resize({ width: 350, height: 350}).png().toBuffer()
    tweet.image = buffer
    await tweet.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
});

// Fetch All Tweets
router.get('/tweets', async (req, res) => {
    try {
        const tweets = await Tweet.find()
        res.send(tweets)
    } catch (error) {
        res.status(500).send(error)
    }
});

// Fetch Tweet Image
router.get('/tweets/:id/image', async (req, res) => {
    try {
        const tweet = await Tweet.findById(req.params.id)

        if (!tweet || !tweet.image) {
            throw new Error('Tweet image doesnt exist')
        }

        res.set('Content-Type', 'image/jpg')
        res.send(tweet.image)
    } catch (error) {
        res.status(400).send(error)
    }
});

// Like Tweet Function

router.put('/tweets/:id/like', auth, async (req, res) => {
    try {
        const tweet = await Tweet.findById(req.params.id)
        if (!tweet.likes.includes(req.user.id)) {
            await tweet.updateOne({ $push: { likes: req.user.id } })
            res.status(200).json('tweet has been liked')
        }
        else {
            res.status(403).json('you have already likes this tweet')
        }
    }
    catch (error) {
        res.status(500).json(error)   
    }
});

// UnLike Tweet Function
router.put('/tweets/:id/unlike', auth, async (req, res) => {
    try {
        const tweet = await Tweet.findById(req.params.id)
        if (tweet.likes.includes(req.user.id)) {
            await tweet.updateOne({ $pull: { likes: req.user.id } })
            res.status(200).json('tweet has been unliked')
        }
        else {
            res.status(403).json('you have already unlike this tweet')
        }
    }
    catch (error) {
        res.status(500).json(error)   
    }
});

module.exports = router
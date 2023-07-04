const express = require('express')
const User = require('../models/user')
const multer  = require('multer')
const sharp  = require('sharp')
const auth  = require('../middleware/auth')
const e = require('express')

// Original Router
const router = new express.Router()


// Helpers

const upload = multer({
    limits: {
        fileSize: 100000000
    }
})

// Enpoints
// Create a new user
router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        res.status(201).send(user)
    } catch (error) {
        res.status(400).send(error)
    }
})

// Delete User Router
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)

        if (!user) {
            return res.status(400).send('')
        }

        res.send('User delete')
    } catch (error) {
        res.status(500).send(error)
    }
});

// Fetch the users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({})
        res.send(users)
    } catch (error) {
        res.status(500).send(e)
    }
});

// Login Users Routers
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (error) {
        res.status(500).send(error)
    }
});

// Fetch a single user 
router.get('/users/:id', async (req, res) => {
    try {
        const _id = req.params.id
        const user = await User.findById(_id)

        if (!user) {
            return res.status(404).send('')
        }

        res.send(user)
    } catch (error) {
        res.status(500).send(error)
    }
});

// Post (Upload) User Profile Image
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250}).png().toBuffer()

    if (req.user.avatar != null) {
        req.user.avatar = null
        req.user.avatarExists = false
    }

    req.user.avatar = buffer
    req.user.avatarExists = true
    await req.user.save()

    res.send(buffer)
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message})
});

// Fetch User profile image
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error('The user doesnt exist')
        }

        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar)
    } catch (error) {
        res.status(404).send(error)
    }
});

// Router for Following
router.put('/users/:id/follow', auth, async (req, res) => {
    if (req.user.id != req.params.id) {
        try {
            const user = await User.findById(req.params.id)
            if (!user.followers.includes(req.user.id)) {
                await user.updateOne({ $push: { followers: req.user.id } })
                await req.user.updateOne({ $push: { followings: req.params.id } })
                res.status(200).json('user has been followed')
            } 
            else {
                res.status(403).json('you already follow this user')
            }
        } 
        catch (error) {
            res.status(500).json(error)
        }
    }
    else {
        res.status(403).json('you cannot follow yourself')
    }
});

// Unfollow User 
router.put('/users/:id/unfollow', auth, async (req, res) => {
    if (req.user.id != req.params.id) {
        try {
            const user = await User.findById(req.params.id)

            if (user.followers.includes(req.user.id)) {
                await user.updateOne({ $pull: { followers: req.user.id } })
                await req.user.updateOne({ $pull: { followings: req.params.id } })
                res.status(200).json('user has been unfollowed')
            }
            else {
                res.status(403).json('you dont unfollow this user')
            }
        } catch (error) {
            res.status(500).json(error)
        }
    } 
    else {
        res.status(403).json('you cannot unfollow yourself')
    }
});

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdate = ['name', 'email', 'password', 'website', 'bio', 'location']

    const isValidOperations = updates.every((update) => allowedUpdate.includes(update))

    if (!isValidOperations) [
        res.status(400).send({
            error: 'invalid request!'
        })
    ]

    try {
        const user = req.user 
        updates.forEach((update) => {user[update] = req.body[update]})
        await user.save()

        res.send(user)
    } 
    catch (error) {
        res.status(400).send(error)
    }
});

module.exports = router


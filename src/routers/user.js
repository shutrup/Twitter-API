const express = require('express')
const User = require('../models/user')
const multer  = require('multer')
const sharp  = require('sharp')
const auth  = require('../middleware/auth')

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

module.exports = router


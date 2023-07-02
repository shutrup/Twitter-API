const express = require('express')
const User = require('../models/user')

// Original Router
const router = new express.Router()

// Enpoints
router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        res.status(201).send(user)
    } catch (error) {
        res.status(400).send(error)
    }
})

module.exports = router


const express = require('express')
const Notification = require('../models/notification')
const auth = require('../middleware/auth')

// New Router
const router = new express.Router()

router.post('/notification', auth, async (req, res) => {
    const notification = new Notification({ 
        ...req.body,
        user: req.user._id
     })

     try {
        await notification.save()
        res.status(201).send(notification)
     } catch (error) {
        res.status(400).send(error)
     }

});

router.get('/notification', async (req, res) => {
    try {
        const notification = await Notification.find({})
        res.send(notification)
    } catch (error) {
        res.status(500).send(error)
    }
});

router.get('/notification/:id', async (req, res) => {

    const _id = req.params.id;

    try {
        const notification = await Notification.find({ notReceiverId: _id })
        res.send(notification)
    } catch (error) {
        res.status(500).send(error)
    }
});

module.exports = router



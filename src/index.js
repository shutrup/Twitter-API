const express = require("express");
// const Tweet = require('./models/tweet')

require('./db/mongoose')
const app = express();

const userRouter = require('./routers/user')

const port = process.env.PORT || 3000;

app.use(userRouter)

app.listen(port, () => {
    console.log('Server is up on the port ' + port);
})
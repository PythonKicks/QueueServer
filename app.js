const express = require('express');
const app = express();
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const pollingRoutes = require('./api/routes/polling');
const gameRoutes = require('./api/routes/game');
const frontendRoutes = require('./frontend');

const CONNECT_URL = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_CONNECT_STR}`;

mongoose.connect(
    CONNECT_URL,
    {
        auth: {
            user: process.env.MONGO_USER,
            password: process.env.MONGO_PASS
        },
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    },
    function(err, client) {
        if (err) {
            console.log(err);
            process.exit(1);
        }
        else {
            console.log('Connected to Mongo DB');
        }
    }
)

app.use(morgan('dev'));
app.use(global.cookieParser(process.env.COOKIE_SECRET));

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization, User-Agent'
    );

    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'POST');
        res.status(200).json({});
    }
    else {
        next();
    }
});


app.use('/', frontendRoutes);
app.use('/api', bodyParser.json());
app.use('/api/poll', pollingRoutes);
app.use('/api/game', gameRoutes);

app.use(function(error, req, res, next) {
    console.log('Uncaught error: '+JSON.stringify({
        'request': req.body,
        'error': error.message
    }, null, 4));
    res.status(500);
    res.json({
        param: process.env.MONGO_USER,
        message: 'Invalid'
    })
});

module.exports = app;

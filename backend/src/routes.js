const express = require('express');

const routes = express.Router();

routes.get('/', (req, res) => {
    return res.json({ message: `hello ${req.query.name}` });
});

routes.post('/devs', (req, res) => {
    console.log(req.body);
    return res.json(req.body);
});

module.exports = routes;
'use strict';

const express = require('express');
const router = new express.Router();
const appConfig = require('../config/defaults/config').app;

function handle() {
  router.get('/', (req, res) => {
    res.status(404).render('error', { title: `${appConfig.title} - Error` });
  });
  return router;
}

module.exports = handle;

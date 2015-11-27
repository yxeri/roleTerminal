'use strict';

const express = require('express');
const router = new express.Router();

function handle() {
  router.get('/', function(req, res) {
    res.status(404).render('error', { title: 'Organica Oracle v4.0 - Error' });
  });
  return router;
}

module.exports = handle;

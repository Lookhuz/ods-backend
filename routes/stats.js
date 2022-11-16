const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const getStats = async (req, res, next) => {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'stats.json'));
    const stats = JSON.parse(data);
    const item = stats.find(ods => ods.id === Number(req.params.id));
    if (!item) {
      const err = new Error('ODS stats not found');
      err.status = 404;
      throw err;
    }
    res.json(item);
  } catch (e) {
    next(e);
  }
};
router
  .route('/api/v1/stats/:id')
  .get(getStats);
module.exports = router;

const createStats = async (req, res, next) => {
    try {
      const data = fs.readFileSync(statsFilePath);
      const stats = JSON.parse(data);
      const newStats = {
        id: req.body.id,
        value: req.body.value,
      };
      stats.push(newStats);
      fs.writeFileSync(statsFilePath, JSON.stringify(stats));
      res.status(201).json(newStats);
    } catch (e) {
      next(e);
    }
  };

  router
    .route('/api/v1/stats')
    .post(createStats);

const updateStats = async (req, res, next) => {
    try {
    const data = fs.readFileSync(statsFilePath);
    const stats = JSON.parse(data);
    const item = stats.find(ods => ods.id === Number(req.params.id));
    if (!item) {
      const err = new Error('ODS stats not found');
      err.status = 404;
      throw err;
    }
    const newStatsData = {
      id: req.body.id,
      value: req.body.value,
    };
    const newStats = stats.map(ods => {
      if (ods.id === Number(req.params.id)) {
        return newStatsData;
      } else {
        return ods;
      }
    });
    fs.writeFileSync(statsFilePath, JSON.stringify(newStats));
    res.status(200).json(newStatsData);
  } catch (e) {
    next(e);
  }
};

router
  .route('/api/v1/stats/:id')
  .put(updateStats);

const deleteStats = async (req, res, next) => {
  try {
    const data = fs.readFileSync(statsFilePath);
    const stats = JSON.parse(data);
    const item = stats.find(ods => ods.id === Number(req.params.id));
    if (!item) {
      const err = new Error('ODS stats not found');
      err.status = 404;
      throw err;
    }
    const newStats = stats.map(ods => {
      if (ods.id === Number(req.params.id)) {
        return null;
      } else {
        return ods;
      }
    })
    .filter(ods => ods !== null);
    fs.writeFileSync(statsFilePath, JSON.stringify(newStats));
    res.status(200).end();
  } catch (e) {
    next(e);
  }
};

router
  .route('/api/v1/stats/:id')
  .delete(deleteStats);
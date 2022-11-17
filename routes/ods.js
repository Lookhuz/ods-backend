const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const getSummary = (cities) => {
  if (cities.length <= 0) {
    const err = new Error('ODS stats not found');
    err.status = 404;
    throw err;
  }
  const zeros = new Array(cities[0].ods.length).fill(0);
  const sum = cities.reduce((ods, city) => city.ods.map((n, i) => n + ods[i]), zeros);
  const mean = sum.map((n) => n / cities.length);
  return mean;
}

const getStats = async (req, res, next) => {
  try {
    const cities = JSON.parse(fs.readFileSync(path.join(__dirname, 'cities.json')));

    const summary = getSummary(cities);
    const byRegion = 0;
    const byState = 0;
    const byCity = 0;
    const ods = {
      summary,
      byRegion,
      byState,
      byCity,
    }
    res.json(ods);
  } catch (e) {
    next(e);
  }
};
router
  .route('/api/v1/ods')
  .get(getStats);
module.exports = router;
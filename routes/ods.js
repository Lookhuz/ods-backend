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

const getByCity = (cities) => {
  return cities.map((city) => {
    const name = city.name;
    const ods = city.ods.reduce((prev, cur) => {
      return prev + cur;
    }, 0) / city.ods.length;
    return {
      name,
      ods,
    }
  });
}

const getByState = () => {
  return 0;
}

const getByRegion = () => {
  return 0;
}


const getStats = async (req, res, next) => {
  try {
    const cities = JSON.parse(fs.readFileSync(path.join(__dirname, 'cities.json')));

    const summary = getSummary(cities);
    const byCity = getByCity(cities);
    const byState = getByState();
    const byRegion = getByRegion();
    const ods = {
      summary,
      byCity,
      byState,
      byRegion,
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
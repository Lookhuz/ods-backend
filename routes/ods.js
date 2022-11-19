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

const getStateById = (states, id) => {
  const statesFound = states.filter((state) => state.id === id);
  if (statesFound.length <= 0) {
    return null;
  }
  return statesFound[0];
}

const getByCity = (cities, states) => {
  return cities.map((city) => {
    const name = city.name;
    const ods = city.ods.reduce((prev, cur) => {
      return prev + cur;
    }, 0) / city.ods.length;
    const state = getStateById(states, city.state);
    return {
      name,
      ods,
      state: {
        name: state.name,
        abbreviation: state.abbreviation,
      },
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
    const states = JSON.parse(fs.readFileSync(path.join(__dirname, 'states.json')));

    const summary = getSummary(cities);
    const city = getByCity(cities, states);
    const state = getByState();
    const region = getByRegion();
    const ods = {
      summary,
      city,
      state,
      region,
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
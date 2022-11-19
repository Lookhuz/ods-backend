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

const calcAverage = (ods) => {
  if (ods.length === 0) {
    return null;
  }
  return ods.reduce((prev, cur) => {
    return prev + cur;
  }, 0) / ods.length;
}

const getCityOds = (city, states) => {
  const name = city.name;
  const ods = calcAverage(city.ods);
  const state = getStateById(states, city.state);
  return {
    name,
    ods,
    state: {
      name: state.name,
      abbreviation: state.abbreviation,
    },
  }
}

const getCitiesOds = (cities, states) => {
  return cities.map((city) => getCityOds(city, states));
}

const getStateOds = (state, cities) => {
  const name = state.name;
  const abbreviation = state.abbreviation;
  const citiesFound = cities.filter((city) => city.state === state.id);
  const citiesOdsValues = citiesFound.map((city) => calcAverage(city.ods));
  const ods = calcAverage(citiesOdsValues);
  return {
    name,
    abbreviation,
    ods,
  }
}

const getStatesOds = (states, cities) => {
  return states.map((state) => getStateOds(state, cities));
}

const getRegionOds = (region, states, cities) => {
  const name = region.name;
  const statesFound = states.filter((state) => state.region === region.id);
  const statesOdsValues = statesFound.map((state) => getStateOds(state, cities).ods);
  const ods = calcAverage(statesOdsValues);
  return {
    name,
    ods,
  }
}

const getRegionsOds = (regions, states, cities) => {
  return regions.map((region) => getRegionOds(region, states, cities));
}


const getStats = async (req, res, next) => {
  try {
    const cities = JSON.parse(fs.readFileSync(path.join(__dirname, 'cities.json')));
    const states = JSON.parse(fs.readFileSync(path.join(__dirname, 'states.json')));
    const regions = JSON.parse(fs.readFileSync(path.join(__dirname, 'regions.json')));

    const summary = getSummary(cities);
    const citiesOds = getCitiesOds(cities, states);
    const statesOds = getStatesOds(states, cities);
    const regionsOds = getRegionsOds(regions, states, cities);
    const ods = {
      summary,
      cities: citiesOds,
      states: statesOds,
      regions: regionsOds,
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
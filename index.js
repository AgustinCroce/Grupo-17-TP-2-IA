'use strict';

require('dotenv').load();
const fs        = require('fs');
const flights   = require('./flights.json');
const Genetical = require('genetical');

function getRandomIntInclusive(a, b) {
    const min = Math.ceil(a);
    const max = Math.floor(b);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateTrip() {
    return [
        getRandomIntInclusive(0, 15),
        getRandomIntInclusive(0, 15),
        getRandomIntInclusive(0, 15),
        getRandomIntInclusive(0, 15),
        getRandomIntInclusive(0, 15),
        getRandomIntInclusive(0, 15)
    ];
}

function fitnessEvaluator(candidate, callback) {
    const total = candidate.trip.reduce((total, number, index) => {
        const flight     = flights[(index + 1).toString()][number];
        const cost       = flight.cost;
        const flightCost = flight.flightHours * 250;
        const stopCost   = flight.stopHours * 850;
        return total + (cost + flightCost + stopCost);
    }, 0);

    callback(null, total);
}

const options = {
    populationSize:           process.env.POPULATION_SIZE,
    populationFactory:        populationFactory,
    selectionStrategy:        Genetical[process.env.SELECTION],
    selectionStrategyOptions: {
        tournamentSelection: 0.50
    },
    terminationCondition: terminationCondition,
    fitnessEvaluator:     fitnessEvaluator,
    natural:              false,
    evolutionStrategy:    [Genetical.CROSSOVER, Genetical.MUTATION],
    evolutionOptions:     {
        crossover:           crossover,
        mutate:              mutate,
        mutationProbability: parseFloat(process.env.MUTATION_PROBABILITY)
    }
};

function populationFactory(population, populationSize, generator, callback) {
    return callback(null, {
        trip: generateTrip()
    });
}

function crossoverMultipoint(parent1, parent2, multipoint) {
    let last   = 0;
    let child1 = {
        trip: []
    };
    let child2 = {
        trip: []
    };

    multipoint.forEach((point) => {
        child1.trip        = child1.trip.concat(parent1.trip.slice(last, point));
        child2.trip        = child2.trip.concat(parent2.trip.slice(last, point));
        [parent1, parent2] = [parent2, parent1];
        last               = point;
    });

    if (last !== parent1.trip.length) {
        child1.trip = child1.trip.concat(parent1.trip.slice(last, parent1.trip.length));
        child2.trip = child2.trip.concat(parent2.trip.slice(last, parent2.trip.length));
    }

    return [child1, child2];
}

function crossoverRandom(parent1, parent2, generator) {
    let child1 = {
        trip: []
    };
    let child2 = {
        trip: []
    };

    parent1.trip.forEach((_, i) => {
        if (generator.random() <= 0.5) {
            child1.trip.push(parent1.trip[i]);
            child2.trip.push(parent2.trip[i]);
        } else {
            child1.trip.push(parent2.trip[i]);
            child2.trip.push(parent1.trip[i]);
        }
    });

    return [child1, child2]
}

function crossoverMask(parent1, parent2, mask) {
    let child1 = {
        trip: []
    };
    let child2 = {
        trip: []
    };

    mask.split('').forEach((element, i) => {
        if (element === '1') {
            child1.trip.push(parent1.trip[i]);
            child2.trip.push(parent2.trip[i]);
        } else {
            child1.trip.push(parent2.trip[i]);
            child2.trip.push(parent1.trip[i]);
        }
    });

    return [child1, child2]
}

function crossover(parent1, parent2, points, generator, callback) {
    switch (process.env.CROSSOVER) {
        case 'MULTIPOINT':
            return callback(crossoverMultipoint(parent1, parent2, JSON.parse(process.env.MULTIPOINT)));
        case 'MASK':
            return callback(crossoverMask(parent1, parent2, process.env.MASK));
        case 'RANDOM':
            return callback(crossoverRandom(parent1, parent2, generator));
        default:
            throw new Error('Wrong crossover');
    }
}

function mutate(candidate, mutationProbability, generator, callback) {
    if (generator.random() < mutationProbability) {
        const tripNumber = getRandomIntInclusive(0, 5);
        const trip       = getRandomIntInclusive(0, 15);

        candidate.trip[tripNumber] = trip;
        return callback(candidate);
    }

    return callback(candidate);
}

function terminationCondition(stats) {
    fs.appendFileSync(process.env.FILE, `${stats.generation},${stats.minimum},${stats.maximum},${stats.bestCandidate.trip},${stats.mean},${stats.standardDeviaton}` + '\n');
    return (stats.bestScore === 0) || stats.generation === parseInt(process.env.RUNS_NUMBER);
}

const algorithm = new Genetical(options);

const header = 'generation,minimum,maximum,best,mean,standarDeviation\n';

fs.writeFileSync(process.env.FILE, header);

algorithm.solve(function(bestCandidate, generation) {
    console.log('Best Candidate', bestCandidate, 'Generation', generation);
});
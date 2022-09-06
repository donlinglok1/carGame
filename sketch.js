// Find my blog at https://codeheir.com/
// I do a lot of p5.js stuff that might interest you!

// genetic algorithm
// const TURN_MAX = 0.5; // 360 * 0.5 = 180
// const POPULATION_COUNT = 5000;
// const SPEED = 6;

// neural network
const TURN_MAX = 0.05; // 360 * 0.05 = 18
const POPULATION_COUNT = 500;
const SPEED = 2;

const mutationRate = 0.05;

const SHOW_CHECKPOINTS = false;

let population = [];
let matingPool = [];

let generationCount = 0;

let track;
let carImg;

let isFinished = false;
let checkpoints;

let best = null;
var lookupI;
var lookupTable;

let trackPixels;

function preload() {
  loadJSON("checkpoints.json", setupCheckpoints);
  track = loadImage('track1.png');
  carImg = loadImage('car.png');
}

function setupCheckpoints(points) {
  checkpoints = new Checkpoints(points);
}

function setup() {
  createCanvas(800, 800);

  for (lookupI = 1e6, lookupTable = []; lookupI--;) {
    lookupTable.push(random(-TURN_MAX, TURN_MAX));
  }
  for (let i = 0; i < POPULATION_COUNT; i++) {
    population.push(new Car());
  }
  tf.setBackend('cpu');
}

function lookup() {
  return ++lookupI >= lookupTable.length ? lookupTable[lookupI = 0] : lookupTable[lookupI];
}

function draw() {
  image(track, 0, 0);

  if (frameCount === 1) {
    loadPixels();
  }
  isFinished = true;
  for (let car of population) {
    if (car.alive) {
      isFinished = false;
      break;
    }
  }

  if (!isFinished) {
    checkWallCollisions();

    for (let car of population) {
      if (car.alive) {
        car.update();
        car.draw();

        // if (checkpoints.hit(car)) {
        //   car.currentCheckpoint++;
        // }
      }
    }

    checkpoints.draw();

    textSize(20);
    text(`Best age: ${best && best.age ? best.age : 0}`, 25, height - 110);
    // text(`Best Distance: ${best && best.currentCheckpoint ? best.currentCheckpoint : 0}`, 25, height - 80);
    text(`Generation: ${generationCount}`, 25, height - 50);
    text(`Population: ${population.length} Mutation Rate: ${mutationRate * 100}%`, 25, height - 20);
  } else {
    for (let car of population) {
      car.calcFitness();
    }
    for (lookupI = 1e6, lookupTable = []; lookupI--;) {
      lookupTable.push(random(-TURN_MAX, TURN_MAX));
    }
    naturalSelection();
    generate();
    generationCount++;
  }
}

function checkWallCollisions() {
  for (let car of population) {
    let pixelRgb = get(car.pos.x, car.pos.y);
    if (pixelRgb[0] !== 147 && pixelRgb[0] !== 110) {
      car.alive = false;
    }
  }
}

function naturalSelection() {
  matingPool = [];
  let bestCount = 0;
  for (let car of population) {
    let n = floor(car.fitness * 100);
    if (n > bestCount) {
      bestCount = n;
      best = car;
    }
    if (n == 0) {
      n = 1;
    }
    for (let i = 0; i < n; i++) {
      matingPool.push(car);
    }
  }

  if (best) {
    for (let i = 0; i < bestCount * 40; i++) {
      matingPool.push(best);
    }
  }
}

function generate() {
  // genetic algorithm
  // for (let i = 0; i < POPULATION_COUNT; i++) {
  //   let mummyIndex = floor(random(matingPool.length));
  //   let daddyIndex = floor(random(matingPool.length));

  //   let mummy = matingPool[mummyIndex];
  //   let daddy = matingPool[daddyIndex];

  //   let child = mummy.crossover(daddy);
    //   child.genotype.mutate(mutationRate);
  //   population[i] = child;
  // }
  // if (best) {
  //   population[0].genotype = best.genotype; // always have the previous best with 0 mutations
    // population[0].wasBest = true;
  // }

  // neural network
  for (let i = 0; i < POPULATION_COUNT; i++) {
    let index = floor(random(matingPool.length));
    let chosen = matingPool[index];
    let clonedBrain = chosen.brain.copy();
    let car = new Car();
    car.brain = clonedBrain;
    car.brain.mutate(mutationRate);
    population[i] = car;
  }
  if (best) {
    population[0].brain = best.brain; // always have the previous best with 0 mutations
    population[0].wasBest = true;
  }
}

function mousePressed() {
  checkpoints.create(mouseX, mouseY);
}

function keyPressed() {
  if (keyCode === 83) {
    checkpoints.save();
  } else if (keyCode === 88) {
    saveJSON(best.brain.model, 'best.json');
  } else {
    checkpoints.delete();
  }
}
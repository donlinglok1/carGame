// Find my blog at https://codeheir.com/
// I do a lot of p5.js stuff that might interest you!

// genetic algorithm
const POPULATION_COUNT = 500;
let population;
let matingPool = [];
let generationCount = 0;
let best = null;
let bestFitness = -1;

// deep learning
const DL_POPULATION_COUNT = 50;
let dl_population;
let dl_matingPool = [];
let dl_generationCount = 0;
let dl_best = null;
let dl_bestFitness = -1;

let trackImg;
let carImg;
let dl_carImg;

let checkpoints;
const DEBUG_CHECKPOINTS = false;

function preload() {
  loadJSON("checkpoints.json", setupCheckpoints);
  trackImg = loadImage('track1.png');
  carImg = loadImage('car.png');
  dl_carImg = loadImage('dl_car.png');

  loadJSON(location.protocol + '//' + window.location.host + '/Genetic/best_dna.json', genCar);

  getDLCar();
}

function setupCheckpoints(points) {
  checkpoints = new Checkpoints(points);
}

function setup() {
  createCanvas(800, 800);
}

function genCar(bestDna) {
  population = [];

  genDNATable();
  for (let i = 0; i < POPULATION_COUNT; i++) {
    let car = new GeneticCar();
    if (bestDna != null) {
      car.dna.load(bestDna.genes);
    } else {
      car.dna.gen(100);
    }
    population.push(car);
  }
  naturalSelection();
}

async function getDLCar() {
  dl_population = [];

  // load pre-train model
  let model = await tf.loadLayersModel(location.protocol + '//' + window.location.host + '/DeepLearning/best_model.json');
  for (let i = 0; i < DL_POPULATION_COUNT; i++) {
    dl_population.push(new DeepLearningCar(model));
  }
  tf.setBackend('cpu');
}

function draw() {
  // draw track
  image(trackImg, 0, 0);

  // preload
  if (frameCount === 1) {
    loadPixels();
  }

  // check finish
  let isGeneticFinished = true;
  for (let car of population) {
    if (car.alive) {
      isGeneticFinished = false;
      break;
    }
  }

  if (!isGeneticFinished) { // game is playing
    population.forEach((car) => {
      if (car.alive) {
        // check is car hit the wall
        try {
          let pixelRgb = get(car.pos.x, car.pos.y);
          if (pixelRgb[0] !== 147 && pixelRgb[0] !== 110) {
            car.alive = false;
            car.calcFitness();
            if (random(1) < 0.5) // some have pre crossover
              car.preDNA = crossover(car);
          }
        } catch (error) {
        }
      }
    });

    checkpoints.draw();

    population.forEach((car) => {
      if (car.alive) {
        car.update();
        car.draw();

        if (checkpoints.hit(car)) {
          car.currentCheckpoint++;
        }
      }
    });

    // show status
    textSize(20);
    if (best) {
      text(`Best checkpoint & fitness: ${best.currentCheckpoint} ${best.fitness}`, 25, height - 110);
      text(`Best age: ${best.age}`, 25, height - 80);
    }
    text(`Generation: ${generationCount}`, 25, height - 50);
    text(`Population: ${population.length} Mutation: ${MUTATION_RATE}`, 25, height - 20);
  } else { // game end
    naturalSelection();
    reproduceAll();

    generationCount++;
  }

  let isDLFinished = true;
  for (let car of dl_population) {
    if (car.alive) {
      isDLFinished = false;
      break;
    }
  }

  if (!isDLFinished) { // game is playing
    dl_population.forEach((car) => {
      if (car.alive) {
        // check is car hit the wall
        let pixelRgb = get(car.pos.x, car.pos.y);
        if (pixelRgb[0] !== 147 && pixelRgb[0] !== 110) {
          car.alive = false;
          car.calcFitness();
        }
      }
    });

    dl_population.forEach((car) => {
      if (car.alive) {
        car.update();
        car.draw();
      }
    });

    // show status
    textSize(20);
    if (dl_best) {
      text(`DL Best age: ${dl_best.age}`, 325, height - 80);
    }
    text(`DL Generation: ${dl_generationCount}`, 325, height - 50);
    text(`DL Population: ${dl_population.length} Mutation: ${DL_MUTATION_RATE}`, 325, height - 20);
  } else { // game end
    dl_naturalSelection();
    dl_reproduceAll();

    dl_generationCount++;
  }
}

function naturalSelection() {
  matingPool = []; // empty pool
  population.forEach((car) => {
    if (car.fitness > bestFitness) { // find the best
      bestFitness = car.fitness;
      best = car;
    }
    // add a small chance for mating
    matingPool.push(car);
  });

  if (best) {
    // add a big chance for mating
    for (let i = 0; i < POPULATION_COUNT * NATURAL_SELECTION_CHANCE; i++) {
      matingPool.push(best);
    }
  }
}

function dl_naturalSelection() {
  dl_matingPool = []; // empty pool
  dl_population.forEach((car) => {
    if (car.fitness > dl_bestFitness) { // find the best
      dl_bestFitness = car.fitness;
      dl_best = car;
    }
    // add a small chance for mating
    dl_matingPool.push(car);
  });

  if (dl_best) {
    // add a big chance for mating
    for (let i = 0; i < DL_POPULATION_COUNT * DL_NATURAL_SELECTION_CHANCE; i++) {
      dl_matingPool.push(dl_best);
    }
  }
}

function crossover(mummy) {
  let daddyIndex = floor(random(matingPool.length));
  let daddy = matingPool[daddyIndex];

  return mummy.dna.crossover(daddy.dna, daddy.age);
}

function reproduceAll() {
  for (let i = 0; i < POPULATION_COUNT; i++) {
    let mummyIndex = floor(random(matingPool.length));
    let mummy = matingPool[mummyIndex];

    let child = new GeneticCar();
    if (mummy.preDNA != null) { // skip pre crossover
      child.dna = mummy.preDNA;
    } else {
      child.dna = crossover(mummy);
    }
    population[i] = child;
  }

  // debug
  if (best) {
    population[0].dna = best.dna; // always have 1 previous best
  }
}

function dl_reproduceAll() {
  for (let i = 0; i < DL_POPULATION_COUNT; i++) {
    let historyIndex = floor(random(dl_matingPool.length));
    let history = dl_matingPool[historyIndex];

    let future = new DeepLearningCar(history.experience.copy().model);
    future.experience.mutate();
    dl_population[i] = future;
  }

  // debug
  if (dl_best) {
    dl_population[0].experience = dl_best.experience; // always have 1 previous best
  }
}

function mousePressed() {
  checkpoints.create(mouseX, mouseY);
}

function keyPressed() {
  console.log(key);
  if (key == 's' || key == 'S') {
    checkpoints.save();
  } else if (key === 'Backspace') {
    checkpoints.delete();
  } else if (key === 'Enter') {
    if (best)
      saveJSON(best.dna, 'best_dna.json');
    if (dl_best)
      dl_best.experience.model.save('downloads://best_model');
  }
}
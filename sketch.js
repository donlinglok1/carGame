// Find my blog at https://codeheir.com/
// I do a lot of p5.js stuff that might interest you!

// genetic algorithm
const POPULATION_COUNT = 1000;
let population = [];
let matingPool = [];
let generationCount = 0;
let best = null;
let bestFitness = -1;

// deep learning
const DL_POPULATION_COUNT = 100;
let dl_population = [];
let dl_matingPool = [];
let dl_generationCount = 0;
let dl_best = null;
let dl_bestFitness = -1;

let trackImg;
let carImg;

let checkpoints;
const DEBUG_CHECKPOINTS = false;

function preload() {
  loadJSON("checkpoints.json", setupCheckpoints);
  trackImg = loadImage('track1.png');
  carImg = loadImage('car.png');
}

function setupCheckpoints(points) {
  checkpoints = new Checkpoints(points);
}

async function setup() {
  createCanvas(800, 800);

  // gen car
  genDNATable();
  for (let i = 0; i < POPULATION_COUNT; i++) {
    let car = new GeneticCar();
    car.dna.gen(100);
    population.push(car);
  }

  // gen car
  // load pre-train model
  const model = await tf.loadLayersModel('http://127.0.0.1:8887/DeepLearning/best_model.json');
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
    text(`Best age (fitness): ${best && best.age ? best.age : 0} ${best && best.fitness ? best.fitness : 0}`, 25, height - 110);
    text(`Best Distance: ${best && best.currentCheckpoint ? best.currentCheckpoint : 0}`, 25, height - 80);
    text(`Generation: ${generationCount}`, 25, height - 50);
    text(`Population: ${population.length} Mutation Rate: ${MUTATION_RATE * 100}%`, 25, height - 20);
  } else { // game end
    naturalSelection();
    reproduce();

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
    text(`DL Best age: ${dl_best && dl_best.age ? dl_best.age : 0}`, 525, height - 80);
    text(`DL Generation: ${dl_generationCount}`, 525, height - 50);
    text(`DL Population: ${dl_population.length} Mutation Rate: ${DL_MUTATION_RATE * 100}%`, 525, height - 20);
  } else { // game end
    dl_naturalSelection();
    dl_reproduce();

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
    for (let i = 0; i < POPULATION_COUNT * 2; i++) {
      matingPool.push(best);
    }
  }
}

function reproduce() {
  for (let i = 0; i < POPULATION_COUNT; i++) {
    let mummyIndex = floor(random(matingPool.length));
    let daddyIndex = floor(random(matingPool.length));

    let mummy = matingPool[mummyIndex];
    let daddy = matingPool[daddyIndex];

    let child = new GeneticCar();
    child.dna = mummy.dna.crossover(daddy.dna, daddy.age);
    child.dna.mutate();
    population[i] = child;
  }

  // debug
  if (best) {
    population[0].genotype = best.genotype; // always have 1 previous best
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
    for (let i = 0; i < DL_POPULATION_COUNT * 2; i++) {
      dl_matingPool.push(dl_best);
    }
  }
}

function dl_reproduce() {
  for (let i = 0; i < DL_POPULATION_COUNT; i++) {
    let historyIndex = floor(random(dl_matingPool.length));
    let history = dl_matingPool[historyIndex];

    let future = new DeepLearningCar();
    if (history != null) {
      future.experience = history.experience.copy();
    }
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
  if (key == 's' || key == 'S') {
    checkpoints.save();
  } else if (key === 'Backspace') {
    checkpoints.delete();
  } else if (key === 'Enter') {
    if (best)
      saveJSON(best.genotype, 'best_genotype.json');
    if (dl_best)
      dl_best.experience.model.save('downloads://best_model');
  }
}
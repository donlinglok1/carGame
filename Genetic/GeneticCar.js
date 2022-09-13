const MAX_TURN_ANGLE = 0.05; // 360 * 0.05 = 18
const SPEED = 2;

let DNATotal;
let DNATable;

function genDNATable() {
  for (DNATotal = 1e6, DNATable = []; DNATotal--;) {
    DNATable.push(random(-MAX_TURN_ANGLE, MAX_TURN_ANGLE));
  }
}

function lookup() {
  return ++DNATotal >= DNATable.length ? DNATable[DNATotal = 0] : DNATable[DNATotal];
}

class GeneticCar extends Car {
  constructor() {
    super();
    this.img = carImg;
    this.dna = new DNA();
    this.currentCheckpoint = 0;
    this.preDNA = null;
  }

  update() {
    this.pos.x -= SPEED * cos(this.angle);
    this.pos.y -= SPEED * sin(this.angle);

    this.angle += this.dna.genes[this.age];
    this.age++;
  }

  draw() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);
    imageMode(CENTER);
    image(this.img, 0, 0, this.r + 10, this.r);
    pop();
  }

  calcFitness() {
    this.fitness = map(this.currentCheckpoint, 0, 169, 0, 1);
    this.fitness = pow(this.fitness, 4);
    this.fitness = this.fitness + this.age;
  }
}
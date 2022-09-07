class GeneticCar extends Car {
  constructor() {
    super();
    this.dna = new DNA();
    this.currentCheckpoint = 0;
  }

  draw() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);
    imageMode(CENTER);
    image(carImg, 0, 0, this.r + 10, this.r);
    pop();
  }

  update() {
    this.pos.x -= SPEED * cos(this.angle);
    this.pos.y -= SPEED * sin(this.angle);

    this.angle += this.dna.genes[this.age];
    this.age++;
  }

  calcFitness() {
    this.fitness = map(this.currentCheckpoint, 0, 169, 0, 1);
    this.fitness = pow(this.fitness, 4);
  }
}
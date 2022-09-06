class Car {
  constructor() {
    this.carImg = carImg;
    // genetic
    // this.genotype = new DNA(bestAge); // slow
    // neural network
    this.brain = new NeuralNetwork(4, 8, 2);
    this.s1 = createVector(width / 2 - 40, height - 325);
    this.s0 = createVector(width / 2, height - 325);
    this.s2 = createVector(width / 2, height - 325);

    this.r = 15;
    this.age = 0;
    this.pos = createVector(width / 2, height - 325);
    this.angle = 0;
    this.alive = true;
    // this.currentCheckpoint = 0;
  }

  draw() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);
    if (this.wasBest) {
      tint(0, 255, 100);
    }
    imageMode(CENTER);
    image(carImg, 0, 0, this.r + 10, this.r);
    pop();
    // neural network
    push();
    noStroke();
    fill(100, 255, 100);
    circle(this.s2.x, this.s2.y, 2);
    circle(this.s1.x, this.s1.y, 2);
    circle(this.s0.x, this.s0.y, 2);
    pop();
  }

  update() {
    this.pos.x -= SPEED * cos(this.angle);
    this.pos.y -= SPEED * sin(this.angle);
    // genetic
    // this.angle += this.genotype.genes[this.age];
    // neural network
    this.s1.x = this.pos.x - 30 * cos(this.angle);
    this.s1.y = this.pos.y - 30 * sin(this.angle);

    this.s0.x = this.pos.x - 25 * cos(this.angle + PI / 2);
    this.s0.y = this.pos.y - 25 * sin(this.angle + PI / 2);

    this.s2.x = this.pos.x - 25 * cos(this.angle - PI / 2);
    this.s2.y = this.pos.y - 25 * sin(this.angle - PI / 2);
    this.think();

    this.age++;
  }
  // neural network
  think() {
    let frontCollision = 0;
    const index = 4 * (floor(this.s1.y) * width + floor(this.s1.x));
    if (pixels && pixels[index] != 110 && pixels[index + 1] != 111 && pixels[index + 2] != 114) {
      frontCollision = 1;
    }

    let rightCollision = 0;
    const indexRight = 4 * (floor(this.s0.y) * width + floor(this.s0.x));
    if (pixels && pixels[indexRight] != 110 && pixels[indexRight + 1] != 111 && pixels[indexRight + 2] != 114) {
      rightCollision = 1;
    }

    let leftCollision = 0;
    const indexLeft = 4 * (floor(this.s2.y) * width + floor(this.s2.x));
    if (pixels && pixels[indexLeft] != 110 && pixels[indexLeft + 1] != 111 && pixels[indexLeft + 2] != 114) {
      leftCollision = 1;
    }

    let inputs = [this.angle, frontCollision, rightCollision, leftCollision]

    const result = this.brain.predict(inputs);

    if (result[0] > result[1]) {
      this.angle += TURN_MAX;
    } else {
      this.angle -= TURN_MAX;
    }
  }

  calcFitness() {
    // genetic
    // this.fitness = map(this.currentCheckpoint, 0, 20, 0, 1);
    // this.fitness = pow(this.fitness, 4);
    // neural network
    this.fitness = map(this.age, 0, 100, 0, 1);
    this.fitness = pow(this.fitness, 4);
  }
  // genetic
  // crossover(daddy_car) {
  //   let childCar = new Car();
  //   childCar.genotype = this.genotype.crossover(daddy_car.genotype);
  //   return childCar;
  // }
}
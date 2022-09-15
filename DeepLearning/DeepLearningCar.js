const DL_MAX_TURN_ANGLE = 0.05; // 360 * 0.05 = 18
const DL_SPEED = 2;

class DeepLearningCar extends Car {
  constructor(model) {
    super();
    this.img = dl_carImg;
    if (model && model != undefined) {
      this.experience = new DeepLearning(4, 8, 2, model);
    } else {
      this.experience = new DeepLearning(4, 8, 2, null);
    }

    this.s1 = createVector(width / 2 - 40, height - 325);
    this.s0 = createVector(width / 2, height - 325);
    this.s2 = createVector(width / 2, height - 325);
  }

  update() {
    this.pos.x -= DL_SPEED * cos(this.angle);
    this.pos.y -= DL_SPEED * sin(this.angle);

    this.s1.x = this.pos.x - 30 * cos(this.angle);
    this.s1.y = this.pos.y - 30 * sin(this.angle);

    this.s0.x = this.pos.x - 25 * cos(this.angle + PI / 2);
    this.s0.y = this.pos.y - 25 * sin(this.angle + PI / 2);

    this.s2.x = this.pos.x - 25 * cos(this.angle - PI / 2);
    this.s2.y = this.pos.y - 25 * sin(this.angle - PI / 2);
    this.think();

    this.age++;
  }

  draw() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);
    imageMode(CENTER);
    image(this.img, 0, 0, this.r + 10, this.r);
    pop();

    push();
    noStroke();
    fill(100, 255, 100);
    circle(this.s2.x, this.s2.y, 2);
    circle(this.s1.x, this.s1.y, 2);
    circle(this.s0.x, this.s0.y, 2);
    pop();
  }

  calcFitness() {
    this.fitness = map(this.age, 0, 100, 0, 1);
    this.fitness = pow(this.fitness, 4);
  }

  think() {
    let frontCollision = 0;
    let index = 4 * (floor(this.s1.y) * width + floor(this.s1.x));
    if (pixels && pixels[index] != 110 && pixels[index + 1] != 111 && pixels[index + 2] != 114) {
      frontCollision = 1;
    }

    let rightCollision = 0;
    let indexRight = 4 * (floor(this.s0.y) * width + floor(this.s0.x));
    if (pixels && pixels[indexRight] != 110 && pixels[indexRight + 1] != 111 && pixels[indexRight + 2] != 114) {
      rightCollision = 1;
    }

    let leftCollision = 0;
    let indexLeft = 4 * (floor(this.s2.y) * width + floor(this.s2.x));
    if (pixels && pixels[indexLeft] != 110 && pixels[indexLeft + 1] != 111 && pixels[indexLeft + 2] != 114) {
      leftCollision = 1;
    }

    let inputs = [this.angle, frontCollision, rightCollision, leftCollision];

    let result = this.experience.predict(inputs);

    if (result[0] > result[1]) {
      this.angle += DL_MAX_TURN_ANGLE;
    } else {
      this.angle -= DL_MAX_TURN_ANGLE;
    }
  }
}
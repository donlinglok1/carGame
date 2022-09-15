class Checkpoints {
  constructor(points) {
    this.checkpoints = [];
    if (points) {
      this.checkpoints = points;
    }
    this.r = 20;
  }

  create(x, y) {
    this.checkpoints.push({ x, y });
  }

  delete() {
    this.checkpoints.pop();
  }

  draw() {
    if (!DEBUG_CHECKPOINTS) return;
    this.checkpoints.forEach((checkpoint) => {
      circle(checkpoint.x, checkpoint.y, this.r);
    });
  }

  hit(car) {
    if (this.checkpoints.length <= car.currentCheckpoint) return;
    let checkpoint = this.checkpoints[car.currentCheckpoint];

    return dist(car.pos.x, car.pos.y, checkpoint.x, checkpoint.y) <= this.r + car.r;
  }

  save() {
    saveJSON(this.checkpoints, 'checkpoints.json');
  }

}
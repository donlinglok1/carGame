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
    if (!SHOW_CHECKPOINTS) return;
    for (let checkpoint of this.checkpoints) {
      circle(checkpoint.x, checkpoint.y, this.r);
    }
  }

  hit(car) {
    if (this.checkpoints.length <= car.currentCheckpoint) return;
    let checkpoint = this.checkpoints[car.currentCheckpoint];

    if (dist(car.pos.x, car.pos.y, checkpoint.x, checkpoint.y) <= this.r + car.r) {
      return true;
    }
    return false;
  }

  save() {
    saveJSON(this.checkpoints, 'points.json');
  }

}
class DNA {

  constructor(bestAge) {
    this.genes = [];
    for (let j = 0; j < bestAge * 3; j++) { // depends on age
      // s[j] = random(-TURN_MAX, TURN_MAX);
      this.genes[j] = lookup();
    }
  }

  crossover(daddy, bestAge) {
    let child = new DNA(bestAge);

    let midpoint = floor(random(this.genes.length));

    for (let i = 0; i < this.genes.length; i++) {
      if (i > midpoint) {
        child.genes[i] = this.genes[i]; //mommy genes
      }
      else {
        child.genes[i] = daddy.genes[i];
      }
    }
    return child;
  }

  mutate(rate) {
    //   for (let i = myFrameCount-400; i < this.genes.length; i++) {
    for (let i = 0; i < this.genes.length; i++) {
      if (random(1) < rate) {
        // this.genes[i] = random(-TURN_MAX, TURN_MAX);
        this.genes[i] = lookup();
      }
    }
  }
}
const MUTATION_RATE = 0.05;
const NATURAL_SELECTION_CHANCE = 6; // 600%

class DNA {
  gen(age) {
    this.genes = [];
    for (let j = 0; j < age * 5; j++) { // less move for faster speed
      this.genes.push(lookup());
    }
  }

  load(genes) {
    this.genes = genes;
  }

  crossover(partner, partner_age) {
    let newDNA = new DNA();
    newDNA.genes = [...this.genes];

    // let midpoint = floor(random(0, this.genes.length));
    let midpoint = 0.5;

    for (let i = 0; i < newDNA.genes.length; i++) {
      if (random(1) < midpoint)
        newDNA.genes[i] = partner.genes[i]; // add partner genes
    }

    for (let j = newDNA.genes.length; j < partner_age * 5; j++) { // less move for faster speed
      newDNA.genes.push(lookup());
    }

    // mutate
    let tempGenes = this.mutate([...newDNA.genes]);
    newDNA.genes = tempGenes;

    return newDNA;
  }

  mutate(genes) {
    for (let i = 0; i < genes.length; i++) {
      if (random(1) < MUTATION_RATE) {
        genes[i] = lookup();
      }
    }

    return genes;
  }
}
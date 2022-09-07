const MAX_TURN_ANGLE = 0.05; // 360 * 0.05 = 18
const SPEED = 2;
const MUTATION_RATE = 0.05;

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

class DNA {
  constructor() {
  }

  gen(age) {
    this.genes = [];
    for (let j = 0; j < age * 5; j++) { // less move for faster speed
      this.genes.push(lookup());
    }
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

    return newDNA;
  }

  mutate() {
    for (let i = 0; i < this.genes.length; i++) {
      if (random(1) < MUTATION_RATE) {
        this.genes[i] = lookup();
      }
    }
  }
}
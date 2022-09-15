const DL_MUTATION_RATE = 0.05;
const DL_NATURAL_SELECTION_CHANCE = 6; // 600%

class DeepLearning {
  constructor(inputNodes, hiddenNodes, outputNodes, model) {
    if (model && model instanceof tf.Sequential) {
      this.inputNodes = inputNodes;
      this.hiddenNodes = hiddenNodes;
      this.outputNodes = outputNodes;
      this.model = model;
    } else {
      this.inputNodes = inputNodes;
      this.hiddenNodes = hiddenNodes;
      this.outputNodes = outputNodes;
      this.model = this.createModel(tf.sequential());
    }
  }

  createModel(model) {
    let hidden = tf.layers.dense({
      units: this.hiddenNodes,
      inputShape: [this.inputNodes],
      activation: 'sigmoid'
    });

    model.add(hidden);

    let output = tf.layers.dense({
      units: this.outputNodes,
      activation: 'softmax'  // makes sure the values add up to 1
    });

    model.add(output);
    //this.model.compile({});

    return model;
  }

  predict(inputs) {
    let xs = tf.tensor2d([inputs]);
    let ys = this.model.predict(xs);
    let outputs = ys.dataSync();
    //console.log(outputs);
    return outputs;
  }

  copy() {
    let modelCopy = this.createModel(tf.sequential());
    let weights = this.model.getWeights();
    let weightCopies = [];
    for (let i = 0; i < weights.length; i++) {
      weightCopies[i] = weights[i].clone();
    }
    modelCopy.setWeights(weightCopies);
    return new DeepLearning(this.inputNodes, this.hiddenNodes, this.outputNodes, modelCopy);
  }

  mutate() {
    let weights = this.model.getWeights();
    let mutatedWeights = [];

    for (let i = 0; i < weights.length; i++) {
      let tensor = weights[i];
      let shape = weights[i].shape;
      let values = tensor.dataSync().slice();

      for (let j = 0; j < values.length; j++) {
        if (random(1) < DL_MUTATION_RATE) {
          values[j] = values[j] + randomGaussian();
        }
      }

      let newTensor = tf.tensor(values, shape);
      mutatedWeights[i] = newTensor;
    }

    this.model.setWeights(mutatedWeights);
  }

}
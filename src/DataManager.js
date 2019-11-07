
class LogManager {

  constructor(all_data) {
    this.currentStep = 0;
    this.all_data_ordered = this.getData(all_data);
    this.maxStep = this.all_data_ordered.length - 1;

    let session_object = Object.values(all_data).find((x) => x.session === x.id)
    this.data = [session_object];
    this.logs = [];
  }

  getData(data) {
    let session = Object.values(data).find((x) => x.session === x.id)

    return Object.values(data).sort((x) => x.timestamp).map((x) => {
      x.timepassed = (x.timestamp - session.timestamp) / 1000.0;
      if (data[x.parent_id]) {
        if (x.parent_id === session.id && x.module) {
          x.parent = x.module;
        } else {
          x.parent = data[x.parent_id].name;
        }
      }

      if (x.inputs) {
        let params = []
        if (Array.isArray(x.inputs)) {
          for (let i of x.inputs) {
            if (typeof (i) === 'string') {
              let value = `"${i.slice(0, 90)}"`
              if (i.length > 90) {
                value += "..."
              }
              params.push(value)
            } else if (i === null || i === undefined) {
              params.push(i)
            } else if (typeof (i) === 'object') {
              let value = `${JSON.stringify(i).slice(0, 90)}`
              params.push(value)
            } else {
              params.push(typeof (i))
            }
          }
        } else if (typeof (x.inputs) === 'object') {
          let value = `${JSON.stringify(x.inputs).slice(0, 90)}`
          params = [value]
        }
        x.inputs_preview = `(${params.join(', ')})`;
      }

      if (x.outputs) {
        let params = []
        if (Array.isArray(x.outputs)) {
          for (let i of x.outputs) {
            if (typeof (i) === 'string') {
              let value = `"${i.slice(0, 90)}"`
              if (i.length > 90) {
                value += "..."
              }
              params.push(value)
            } else if (i === null || i === undefined) {
              params.push(i)
            } else if (typeof (i) === 'object') {
              let value = `${JSON.stringify(i).slice(0, 90)}`
              params.push(value)
            } else {
              params.push(typeof (i))
            }
          }
        } else if (typeof (x.outputs) === 'object') {
          let value = `${JSON.stringify(x.outputs).slice(0, 90)}`
          params = [value]
        }
        x.outputs_preview = `(${params.join(', ')})`;
      }

      return x;
    });
  }

  getCurrentStep() {
    return this.all_data_ordered[this.currentStep];
  }

  getStep(step) {
    return this.all_data_ordered[step];
  }

  getChildRows(row, rootRows) {
    if (row && !row.id) return []; // prevents invalid records from crashing app
    return (row ? this.data.filter((x) => { return x.parent_id === row.id }) : rootRows)
  }

  nextStep() {
    this.currentStep += 1;

    let newItem = this.all_data_ordered[this.currentStep]

    if (newItem && newItem.type && newItem.type.indexOf("log_") === 0) {
      this.logs.push(this.currentStep + ". " + newItem.name)
    } else {
      this.logs.push("") // easier to slice it after...
    }

    newItem.step = this.currentStep
    this.data.push(newItem)
  };

  previousStep() {
    this.currentStep -= 1;
    this.data.pop();
    this.logs.pop();
  }

  goToStep(value) {
    if (value < this.currentStep) {
      let diff = this.currentStep - value;

      for (let i = 0; i < diff; i++) {
        this.previousStep();
      }
    }

    if (value > this.currentStep) {
      let diff = value - this.currentStep;

      for (let i = 0; i < diff; i++) {
        this.nextStep();
      }
    }
  }

}

export default LogManager;
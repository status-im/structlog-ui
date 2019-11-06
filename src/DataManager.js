
class LogManager {

  constructor(all_data) {
    this.currentStep = 0;
    this.all_data_ordered = Object.values(all_data).sort((x) => x.timestamp)
    this.maxStep = this.all_data_ordered.length - 1;

    let session_object = Object.values(all_data).find((x) => x.session === x.id)
    // should be list of sessions instead

    this.data = [session_object];
    this.logs = [];
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
    if (newItem.type.indexOf("log_") === 0) {
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
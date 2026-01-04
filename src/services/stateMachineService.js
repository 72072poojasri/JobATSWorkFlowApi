const VALID_TRANSITIONS = {
  Applied: ['Screening', 'Rejected'],
  Screening: ['Interview', 'Rejected'],
  Interview: ['Offer', 'Rejected'],
  Offer: ['Hired', 'Rejected'],
  Hired: [],
  Rejected: [],
};

class StateMachineService {
  static isValidTransition(currentStage, newStage) {
    if (currentStage === newStage) {
      return false;
    }
    return VALID_TRANSITIONS[currentStage]?.includes(newStage) || false;
  }

  static getValidNextStages(currentStage) {
    return VALID_TRANSITIONS[currentStage] || [];
  }

  static getAllStages() {
    return Object.keys(VALID_TRANSITIONS);
  }

  static canTransitionToStage(currentStage, targetStage) {
    return this.isValidTransition(currentStage, targetStage);
  }
}

module.exports = StateMachineService;




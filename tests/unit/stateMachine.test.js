const StateMachine = require('../../src/services/stateMachineService');

describe('Application State Machine', () => {
  describe('Valid Transitions', () => {
    test('Applied → Screening should be valid', () => {
      expect(StateMachine.isValidTransition('Applied', 'Screening')).toBe(true);
    });

    test('Applied → Rejected should be valid', () => {
      expect(StateMachine.isValidTransition('Applied', 'Rejected')).toBe(true);
    });

    test('Screening → Interview should be valid', () => {
      expect(StateMachine.isValidTransition('Screening', 'Interview')).toBe(true);
    });

    test('Interview → Offer should be valid', () => {
      expect(StateMachine.isValidTransition('Interview', 'Offer')).toBe(true);
    });

    test('Offer → Hired should be valid', () => {
      expect(StateMachine.isValidTransition('Offer', 'Hired')).toBe(true);
    });

    test('Rejected allowed from any stage before Hired', () => {
      expect(StateMachine.isValidTransition('Interview', 'Rejected')).toBe(true);
      expect(StateMachine.isValidTransition('Offer', 'Rejected')).toBe(true);
    });
  });

  describe('Invalid Transitions', () => {
    test('Applied → Interview should be invalid', () => {
      expect(StateMachine.isValidTransition('Applied', 'Interview')).toBe(false);
    });

    test('Applied → Offer should be invalid', () => {
      expect(StateMachine.isValidTransition('Applied', 'Offer')).toBe(false);
    });

    test('Applied → Hired should be invalid', () => {
      expect(StateMachine.isValidTransition('Applied', 'Hired')).toBe(false);
    });

    test('Hired should have no valid transitions', () => {
      expect(StateMachine.isValidTransition('Hired', 'Rejected')).toBe(false);
      expect(StateMachine.isValidTransition('Hired', 'Offer')).toBe(false);
    });

    test('Rejected should have no valid transitions', () => {
      expect(StateMachine.isValidTransition('Rejected', 'Applied')).toBe(false);
      expect(StateMachine.isValidTransition('Rejected', 'Screening')).toBe(false);
    });

    test('Same stage transition should be invalid', () => {
      expect(StateMachine.isValidTransition('Applied', 'Applied')).toBe(false);
    });
  });

  describe('Get Valid Stages', () => {
    test('Applied should have Screening and Rejected', () => {
      const stages = StateMachine.getValidNextStages('Applied');
      expect(stages).toEqual(['Screening', 'Rejected']);
    });

    test('Screening should have Interview and Rejected', () => {
      const stages = StateMachine.getValidNextStages('Screening');
      expect(stages).toEqual(['Interview', 'Rejected']);
    });

    test('Hired should have no valid transitions', () => {
      const stages = StateMachine.getValidNextStages('Hired');
      expect(stages.length).toBe(0);
    });
  });
});

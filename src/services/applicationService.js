const { Application, ApplicationHistory, Job, User } = require('../models');
const StateMachineService = require('./stateMachineService');
const emailQueue = require('../workers/emailQueue');
const sequelize = require('../config/database');

class ApplicationService {
  static async submitApplication(candidateId, jobId, resumeUrl, coverLetter) {
    const transaction = await sequelize.transaction();
    try {
      // Check if job exists and is open
      const job = await Job.findByPk(jobId, { transaction });
      if (!job || job.status !== 'open') {
        throw new Error('Job not found or is closed');
      }

      // Check for duplicate application
      const existingApp = await Application.findOne({
        where: { candidateId, jobId },
        transaction,
      });
      if (existingApp) {
        throw new Error('You have already applied to this job');
      }

      // Create application
      const application = await Application.create({
        candidateId,
        jobId,
        stage: 'Applied',
        resume: resumeUrl,
        coverLetter,
      }, { transaction });

      // Create history record
      await ApplicationHistory.create({
        applicationId: application.id,
        previousStage: null,
        newStage: 'Applied',
        changedBy: candidateId,
        reason: 'Initial application submission',
      }, { transaction });

      await transaction.commit();

      // Queue email notifications (non-blocking)
      const candidate = await User.findByPk(candidateId);
      const recruiter = await User.findByPk(job.createdBy);

      if (candidate && recruiter) {
        await emailQueue.add('send-application-confirmation', {
          type: 'send-application-confirmation',
          candidateEmail: candidate.email,
          candidateName: candidate.firstName,
          jobTitle: job.title,
        });

        await emailQueue.add('send-new-application-notification', {
          type: 'send-new-application-notification',
          recruiterEmail: recruiter.email,
          recruiterName: recruiter.firstName,
          candidateName: candidate.firstName,
          jobTitle: job.title,
        });
      }

      return application;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async changeApplicationStage(applicationId, newStage, changedByUserId, reason = '') {
    const transaction = await sequelize.transaction();
    try {
      const application = await Application.findByPk(applicationId, {
        include: [{ association: 'job' }, { association: 'candidate' }],
        transaction,
      });

      if (!application) {
        throw new Error('Application not found');
      }

      // Validate state transition
      if (!StateMachineService.isValidTransition(application.stage, newStage)) {
        throw new Error(
          `Invalid transition from ${application.stage} to ${newStage}. Valid transitions: ${StateMachineService.getValidNextStages(application.stage).join(', ')}`
        );
      }

      const previousStage = application.stage;

      // Update application stage
      application.stage = newStage;
      await application.save({ transaction });

      // Create history record
      await ApplicationHistory.create({
        applicationId: application.id,
        previousStage,
        newStage,
        changedBy: changedByUserId,
        reason,
      }, { transaction });

      await transaction.commit();

      // Queue email notifications
      if (application.candidate && application.job) {
        await emailQueue.add('send-stage-change-notification', {
          type: 'send-stage-change-notification',
          candidateEmail: application.candidate.email,
          candidateName: application.candidate.firstName,
          jobTitle: application.job.title,
          newStage,
          previousStage,
        });
      }

      return application;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async getApplicationById(applicationId) {
    return Application.findByPk(applicationId, {
      include: [
        { association: 'candidate', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { association: 'job', attributes: ['id', 'title', 'description'] },
        { association: 'history' },
      ],
    });
  }

  static async getApplicationsByJobId(jobId, stage = null) {
    const where = { jobId };
    if (stage) {
      where.stage = stage;
    }

    return Application.findAll({
      where,
      include: [
        { association: 'candidate', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { association: 'history' },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  static async getCandidateApplications(candidateId) {
    return Application.findAll({
      where: { candidateId },
      include: [
        { association: 'job', attributes: ['id', 'title', 'description', 'status'] },
        { association: 'history' },
      ],
      order: [['createdAt', 'DESC']],
    });
  }
}

module.exports = ApplicationService;

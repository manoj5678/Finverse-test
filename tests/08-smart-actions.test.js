const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config({ path: '.env.test' });

describe('Smart Actions Simulation Tests', () => {
  let sequelize;
  let Application, Alert, Case;

  beforeAll(() => {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false }
      },
      logging: false
    });

    Application = sequelize.define('applications', {
      id: { type: DataTypes.UUID, primaryKey: true },
      customer_id: DataTypes.UUID,
      status: DataTypes.STRING,
      risk_score: DataTypes.INTEGER,
      reviewed_at: DataTypes.DATE,
      reviewed_by: DataTypes.STRING,
      rejection_reason: DataTypes.TEXT
    }, { timestamps: false, tableName: 'applications' });

    Alert = sequelize.define('alerts', {
      id: { type: DataTypes.UUID, primaryKey: true },
      customer_id: DataTypes.UUID,
      status: DataTypes.STRING,
      severity: DataTypes.STRING,
      resolved_at: DataTypes.DATE,
      resolved_by: DataTypes.STRING,
      resolution_notes: DataTypes.TEXT
    }, { timestamps: false, tableName: 'alerts' });

    Case = sequelize.define('cases', {
      id: { type: DataTypes.UUID, primaryKey: true },
      customer_id: DataTypes.UUID,
      alert_id: DataTypes.UUID,
      case_type: DataTypes.STRING,
      priority: DataTypes.STRING,
      status: DataTypes.STRING,
      description: DataTypes.TEXT,
      created_at: DataTypes.DATE
    }, { timestamps: false, tableName: 'cases' });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Application Smart Actions', () => {
    
    test('Simulate: Approve Application', async () => {
      const app = await Application.findOne({
        where: { status: 'in_review' }
      });
      
      if (!app) {
        console.log('No applications in review');
        return;
      }
      
      // Simulate approval action
      await Application.update(
        {
          status: 'approved',
          reviewed_at: new Date(),
          reviewed_by: 'Test Compliance Officer'
        },
        { where: { id: app.id } }
      );
      
      const updated = await Application.findByPk(app.id);
      expect(updated.status).toBe('approved');
      expect(updated.reviewed_by).toBe('Test Compliance Officer');
      console.log('✅ Approval action simulated successfully');
    });

    test('Simulate: Reject Application with reason', async () => {
      const app = await Application.findOne({
        where: { status: 'in_review' }
      });
      
      if (!app) {
        console.log('No applications in review');
        return;
      }
      
      const rejectionReason = 'High-risk jurisdiction - requires additional documentation';
      
      await Application.update(
        {
          status: 'rejected',
          reviewed_at: new Date(),
          reviewed_by: 'Test Compliance Officer',
          rejection_reason: rejectionReason
        },
        { where: { id: app.id } }
      );
      
      const updated = await Application.findByPk(app.id);
      expect(updated.status).toBe('rejected');
      expect(updated.rejection_reason).toBe(rejectionReason);
      console.log('✅ Rejection action simulated successfully');
    });

    test('Simulate: Request More Information', async () => {
      const app = await Application.findOne({
        where: { status: 'in_review' }
      });
      
      if (!app) {
        console.log('No applications in review');
        return;
      }
      
      await Application.update(
        { status: 'more_info' },
        { where: { id: app.id } }
      );
      
      const updated = await Application.findByPk(app.id);
      expect(updated.status).toBe('more_info');
      console.log('✅ Request info action simulated successfully');
    });

  });

  describe('Alert Smart Actions', () => {
    
    test('Simulate: Resolve Alert', async () => {
      const alert = await Alert.findOne({
        where: { status: 'open', severity: 'medium' }
      });
      
      if (!alert) {
        console.log('No open alerts to resolve');
        return;
      }
      
      await Alert.update(
        {
          status: 'resolved',
          resolved_at: new Date(),
          resolved_by: 'Test AML Analyst',
          resolution_notes: 'Transaction verified as legitimate'
        },
        { where: { id: alert.id } }
      );
      
      const updated = await Alert.findByPk(alert.id);
      expect(updated.status).toBe('resolved');
      expect(updated.resolved_by).toBe('Test AML Analyst');
      console.log('✅ Resolve alert action simulated successfully');
    });

    test('Simulate: Escalate Alert to Case', async () => {
      const alert = await Alert.findOne({
        where: { status: 'open', severity: 'critical' }
      });
      
      if (!alert) {
        console.log('No critical alerts to escalate');
        return;
      }
      
      // Create case
      const newCase = await Case.create({
        customer_id: alert.customer_id,
        alert_id: alert.id,
        case_type: 'aml_investigation',
        priority: 'P1',
        status: 'open',
        description: `Escalated from alert ${alert.id}`,
        created_at: new Date()
      });
      
      // Update alert status
      await Alert.update(
        { status: 'under_investigation' },
        { where: { id: alert.id } }
      );
      
      expect(newCase.alert_id).toBe(alert.id);
      const updatedAlert = await Alert.findByPk(alert.id);
      expect(updatedAlert.status).toBe('under_investigation');
      console.log('✅ Escalate to case action simulated successfully');
    });

  });

  describe('Batch Operations', () => {
    
    test('Simulate: Bulk approve low-risk applications', async () => {
      const lowRiskApps = await Application.findAll({
        where: {
          status: 'in_review',
          risk_score: { [Sequelize.Op.lt]: 30 }
        },
        limit: 5
      });
      
      if (lowRiskApps.length === 0) {
        console.log('No low-risk applications to bulk approve');
        return;
      }
      
      const ids = lowRiskApps.map(app => app.id);
      
      await Application.update(
        {
          status: 'approved',
          reviewed_at: new Date(),
          reviewed_by: 'Automated Bulk Approval'
        },
        { where: { id: ids } }
      );
      
      const updated = await Application.findAll({
        where: { id: ids }
      });
      
      expect(updated.every(app => app.status === 'approved')).toBe(true);
      console.log(`✅ Bulk approved ${updated.length} low-risk applications`);
    });

  });

});
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config({ path: '.env.test' });

describe('AML Monitoring Workflow Tests', () => {
  let sequelize;
  let Alert, Case;

  beforeAll(() => {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false }
      },
      logging: false
    });

    Alert = sequelize.define('alerts', {
      id: { type: DataTypes.UUID, primaryKey: true },
      customer_id: DataTypes.UUID,
      alert_type: DataTypes.STRING,
      severity: DataTypes.STRING,
      description: DataTypes.TEXT,
      status: DataTypes.STRING,
      triggered_at: DataTypes.DATE,
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
      resolution: DataTypes.TEXT,
      created_at: DataTypes.DATE,
      closed_at: DataTypes.DATE
    }, { timestamps: false, tableName: 'cases' });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('Alert triage and resolution workflow', async () => {
    // Find an open alert
    const openAlert = await Alert.findOne({
      where: { status: 'open', severity: 'medium' }
    });
    
    if (!openAlert) {
      console.log('No open medium alerts available');
      return;
    }
    
    // Resolve the alert
    await Alert.update(
      {
        status: 'resolved',
        resolved_at: new Date(),
        resolved_by: 'AML Analyst',
        resolution_notes: 'Verified transaction is legitimate business activity'
      },
      { where: { id: openAlert.id } }
    );
    
    const alert = await Alert.findByPk(openAlert.id);
    expect(alert.status).toBe('resolved');
    expect(alert.resolved_at).not.toBeNull();
    expect(alert.resolved_by).toBe('AML Analyst');
  });

  test('Critical alert escalation to case', async () => {
    // Find a critical open alert
    const criticalAlert = await Alert.findOne({
      where: { status: 'open', severity: 'critical' }
    });
    
    if (!criticalAlert) {
      console.log('No critical alerts available');
      return;
    }
    
    // Create a case from the alert
    const newCase = await Case.create({
      customer_id: criticalAlert.customer_id,
      alert_id: criticalAlert.id,
      case_type: 'aml_investigation',
      priority: 'P1',
      status: 'open',
      description: `Escalated from alert: ${criticalAlert.alert_type}`,
      created_at: new Date()
    });
    
    expect(newCase).not.toBeNull();
    expect(newCase.alert_id).toBe(criticalAlert.id);
    expect(newCase.priority).toBe('P1');
    expect(newCase.status).toBe('open');
    
    // Update alert status to under_investigation
    await Alert.update(
      { status: 'under_investigation' },
      { where: { id: criticalAlert.id } }
    );
    
    const updatedAlert = await Alert.findByPk(criticalAlert.id);
    expect(updatedAlert.status).toBe('under_investigation');
  });

  test('Query alerts by severity and age', async () => {
    const [criticalAlerts] = await sequelize.query(`
      SELECT 
        id,
        severity,
        triggered_at,
        EXTRACT(EPOCH FROM (NOW() - triggered_at)) / 3600 as hours_open
      FROM alerts
      WHERE status = 'open' AND severity = 'critical'
      ORDER BY triggered_at ASC
    `);
    
    if (criticalAlerts.length > 0) {
      // Oldest alert should be first
      expect(Number(criticalAlerts[0].hours_open))
        .toBeGreaterThanOrEqual(Number(criticalAlerts[criticalAlerts.length - 1].hours_open));
    }
  });

  test('Case lifecycle: open -> investigating -> closed', async () => {
    const openCase = await Case.findOne({
      where: { status: 'open' }
    });
    
    if (!openCase) {
      console.log('No open cases available');
      return;
    }
    
    // Move to investigating
    await Case.update(
      { status: 'investigating' },
      { where: { id: openCase.id } }
    );
    
    let caseRecord = await Case.findByPk(openCase.id);
    expect(caseRecord.status).toBe('investigating');
    
    // Close the case
    await Case.update(
      { 
        status: 'closed',
        resolution: 'False positive - no further action required',
        closed_at: new Date()
      },
      { where: { id: openCase.id } }
    );
    
    caseRecord = await Case.findByPk(openCase.id);
    expect(caseRecord.status).toBe('closed');
    expect(caseRecord.resolution).toBeDefined();
    expect(caseRecord.closed_at).not.toBeNull();
  });

});
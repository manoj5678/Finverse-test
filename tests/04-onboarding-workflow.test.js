const { Sequelize, DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: '.env.test' });

describe('Onboarding Workflow Integration Tests', () => {
  let sequelize;
  let Application;

  beforeAll(() => {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false }
      },
      logging: false
    });

    Application = sequelize.define('applications', {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      customer_id: DataTypes.UUID,
      status: DataTypes.STRING,
      risk_score: DataTypes.INTEGER,
      submitted_at: DataTypes.DATE,
      reviewed_at: DataTypes.DATE,
      reviewed_by: DataTypes.STRING,
      rejection_reason: DataTypes.TEXT,
      kyc_document_url: DataTypes.STRING,
      kyb_document_url: DataTypes.STRING
    }, { timestamps: false, tableName: 'applications' });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('Complete application approval workflow', async () => {
    // 1. Find a submitted application
    const submittedApp = await Application.findOne({
      where: { status: 'submitted' }
    });
    
    expect(submittedApp).not.toBeNull();
    
    const appId = submittedApp.id;
    
    // 2. Move to in_review
    await Application.update(
      { 
        status: 'in_review',
        reviewed_by: 'Compliance Officer'
      },
      { where: { id: appId } }
    );
    
    let app = await Application.findByPk(appId);
    expect(app.status).toBe('in_review');
    expect(app.reviewed_by).toBe('Compliance Officer');
    
    // 3. Approve application
    await Application.update(
      { 
        status: 'approved',
        reviewed_at: new Date()
      },
      { where: { id: appId } }
    );
    
    app = await Application.findByPk(appId);
    expect(app.status).toBe('approved');
    expect(app.reviewed_at).not.toBeNull();
  });

  test('Application rejection workflow with reason', async () => {
    const submittedApp = await Application.findOne({
      where: { status: 'submitted' }
    });
    
    if (!submittedApp) {
      console.log('No submitted applications available for rejection test');
      return;
    }
    
    const rejectionReason = 'Incomplete documentation provided';
    
    await Application.update(
      { 
        status: 'rejected',
        reviewed_at: new Date(),
        reviewed_by: 'Compliance Officer',
        rejection_reason: rejectionReason
      },
      { where: { id: submittedApp.id } }
    );
    
    const app = await Application.findByPk(submittedApp.id);
    expect(app.status).toBe('rejected');
    expect(app.rejection_reason).toBe(rejectionReason);
    expect(app.reviewed_at).not.toBeNull();
  });

  test('Request more information workflow', async () => {
    const inReviewApp = await Application.findOne({
      where: { status: 'in_review' }
    });
    
    if (!inReviewApp) {
      console.log('No in_review applications available');
      return;
    }
    
    await Application.update(
      { status: 'more_info' },
      { where: { id: inReviewApp.id } }
    );
    
    const app = await Application.findByPk(inReviewApp.id);
    expect(app.status).toBe('more_info');
  });

  test('Applications should have valid foreign key relationships', async () => {
    const [result] = await sequelize.query(`
      SELECT a.id, a.customer_id, c.email
      FROM applications a
      INNER JOIN customers c ON a.customer_id = c.id
      LIMIT 5
    `);
    
    expect(result.length).toBeGreaterThan(0);
    result.forEach(row => {
      expect(row.customer_id).toBeDefined();
      expect(row.email).toBeDefined();
    });
  });

});
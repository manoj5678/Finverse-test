const { Sequelize } = require('sequelize');
require('dotenv').config({ path: '.env.test' });

describe('Database Connection Tests', () => {
  let sequelize;

  beforeAll(() => {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false }
      },
      logging: false
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('Should connect to Supabase database', async () => {
    await expect(sequelize.authenticate()).resolves.not.toThrow();
  });

  test('Should have required tables', async () => {
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const tableNames = tables.map(t => t.table_name);
    
    expect(tableNames).toContain('customers');
    expect(tableNames).toContain('applications');
    expect(tableNames).toContain('alerts');
    expect(tableNames).toContain('cases');
    expect(tableNames).toContain('accounts');
    expect(tableNames).toContain('transactions');
  });

  test('Should have test data in database', async () => {
    const [customers] = await sequelize.query('SELECT COUNT(*) as count FROM customers');
    const [applications] = await sequelize.query('SELECT COUNT(*) as count FROM applications');
    const [alerts] = await sequelize.query('SELECT COUNT(*) as count FROM alerts');
    
    expect(Number(customers[0].count)).toBeGreaterThan(0);
    expect(Number(applications[0].count)).toBeGreaterThan(0);
    expect(Number(alerts[0].count)).toBeGreaterThan(0);
  });

  test('Should query applications with different statuses', async () => {
    const [result] = await sequelize.query(`
      SELECT status, COUNT(*) as count 
      FROM applications 
      GROUP BY status
    `);
    
    expect(result.length).toBeGreaterThan(0);
    
    const statuses = result.map(r => r.status);
    expect(statuses).toContain('submitted');
    expect(statuses).toContain('in_review');
  });

  test('Should query alerts by severity', async () => {
    const [result] = await sequelize.query(`
      SELECT severity, COUNT(*) as count 
      FROM alerts 
      WHERE status = 'open'
      GROUP BY severity
    `);
    
    expect(result.length).toBeGreaterThan(0);
    
    const severities = result.map(r => r.severity);
    expect(['critical', 'high', 'medium', 'low'].some(s => severities.includes(s))).toBe(true);
  });

});
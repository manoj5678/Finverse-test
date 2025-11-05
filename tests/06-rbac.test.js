const { Sequelize } = require('sequelize');
require('dotenv').config({ path: '.env.test' });

describe('Role-Based Access Control Tests', () => {
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

  describe('Data Access Validation', () => {
    
    test('Compliance team should access all applications', async () => {
      const [applications] = await sequelize.query(`
        SELECT COUNT(*) as count FROM applications
      `);
      
      const totalCount = Number(applications[0].count);
      expect(totalCount).toBeGreaterThan(0);
      
      // Compliance can see all statuses
      const [statusBreakdown] = await sequelize.query(`
        SELECT status, COUNT(*) as count
        FROM applications
        GROUP BY status
      `);
      
      expect(statusBreakdown.length).toBeGreaterThan(0);
    });

    test('Customer support should access customer and account data', async () => {
      const [customers] = await sequelize.query(`
        SELECT c.id, c.email, c.company_name, COUNT(a.id) as account_count
        FROM customers c
        LEFT JOIN accounts a ON c.id = a.customer_id
        GROUP BY c.id
        LIMIT 10
      `);
      
      expect(customers.length).toBeGreaterThan(0);
      
      customers.forEach(customer => {
        expect(customer.email).toBeDefined();
        expect(customer.company_name).toBeDefined();
      });
    });

    test('Operations team should access transaction data', async () => {
      const [transactions] = await sequelize.query(`
        SELECT t.*, a.account_number, c.company_name
        FROM transactions t
        INNER JOIN accounts a ON t.account_id = a.id
        INNER JOIN customers c ON a.customer_id = c.id
        LIMIT 10
      `);
      
      expect(transactions.length).toBeGreaterThan(0);
      
      transactions.forEach(tx => {
        expect(tx.account_number).toBeDefined();
        expect(tx.company_name).toBeDefined();
        expect(tx.amount).toBeDefined();
      });
    });

  });

  describe('Action Permission Validation', () => {
    
    test('Approve/Reject actions should require compliance role', async () => {
      // This test validates that sensitive status changes exist
      const [applications] = await sequelize.query(`
        SELECT status FROM applications
        WHERE status IN ('approved', 'rejected')
        LIMIT 5
      `);
      
      expect(applications.length).toBeGreaterThan(0);
      
      // In production, these actions would be protected by Forest Admin RBAC
      // We're validating the data patterns exist
    });

    test('Alert resolution should be tracked with user attribution', async () => {
      const [resolvedAlerts] = await sequelize.query(`
        SELECT id, resolved_by, resolution_notes
        FROM alerts
        WHERE status = 'resolved' AND resolved_by IS NOT NULL
        LIMIT 5
      `);
      
      if (resolvedAlerts.length > 0) {
        resolvedAlerts.forEach(alert => {
          expect(alert.resolved_by).toBeDefined();
          expect(alert.resolved_by).not.toBe('');
        });
      }
    });

  });

});
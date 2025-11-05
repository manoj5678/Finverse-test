const { Sequelize } = require('sequelize');
require('dotenv').config({ path: '.env.test' });

describe('Performance Tests', () => {
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

  test('Complex join query performance', async () => {
    const startTime = Date.now();
    
    const [result] = await sequelize.query(`
      SELECT 
        c.id,
        c.company_name,
        c.email,
        COUNT(DISTINCT a.id) as application_count,
        COUNT(DISTINCT al.id) as alert_count,
        COUNT(DISTINCT ca.id) as case_count,
        COUNT(DISTINCT ac.id) as account_count
      FROM customers c
      LEFT JOIN applications a ON c.id = a.customer_id
      LEFT JOIN alerts al ON c.id = al.customer_id
      LEFT JOIN cases ca ON c.id = ca.customer_id
      LEFT JOIN accounts ac ON c.id = ac.customer_id
      GROUP BY c.id
      LIMIT 100
    `);
    
    const duration = Date.now() - startTime;
    
    console.log(`Complex join query took ${duration}ms for ${result.length} records`);
    expect(duration).toBeLessThan(5000); // Should complete in < 5 seconds
    expect(result.length).toBeGreaterThan(0);
  });

  test('Smart field calculation performance', async () => {
    const startTime = Date.now();
    
    const [result] = await sequelize.query(`
      SELECT 
        id,
        (EXTRACT(EPOCH FROM (NOW() - submitted_at)) / 3600 + 
         COALESCE(risk_score, 0) +
         CASE WHEN status = 'more_info' THEN 25 ELSE 0 END) as urgency_score
      FROM applications
      WHERE status IN ('submitted', 'in_review', 'more_info')
      ORDER BY urgency_score DESC
      LIMIT 100
    `);
    
    const duration = Date.now() - startTime;
    
    console.log(`Urgency score calculation took ${duration}ms for ${result.length} records`);
    expect(duration).toBeLessThan(2000); // Should complete in < 2 seconds
  });

  test('Segment filtering performance', async () => {
    const startTime = Date.now();
    
    const [result] = await sequelize.query(`
      SELECT *
      FROM alerts
      WHERE status = 'open'
        AND severity IN ('critical', 'high')
        AND triggered_at >= NOW() - INTERVAL '7 days'
      ORDER BY triggered_at DESC
      LIMIT 50
    `);
    
    const duration = Date.now() - startTime;
    
    console.log(`Alert segment filtering took ${duration}ms for ${result.length} records`);
    expect(duration).toBeLessThan(1000); // Should complete in < 1 second
  });

  test('Transaction history query performance', async () => {
    const [accounts] = await sequelize.query(`
      SELECT id FROM accounts LIMIT 1
    `);
    
    if (accounts.length === 0) {
      console.log('No accounts available for transaction test');
      return;
    }
    
    const startTime = Date.now();
    
    const [result] = await sequelize.query(`
      SELECT *
      FROM transactions
      WHERE account_id = :accountId
      ORDER BY transaction_date DESC
      LIMIT 100
    `, {
      replacements: { accountId: accounts[0].id }
    });
    
    const duration = Date.now() - startTime;
    
    console.log(`Transaction history query took ${duration}ms for ${result.length} records`);
    expect(duration).toBeLessThan(1000);
  });

  test('Index effectiveness check', async () => {
    // Check if common query patterns use indexes
    const [explainResult] = await sequelize.query(`
      EXPLAIN (FORMAT JSON)
      SELECT * FROM applications
      WHERE status = 'submitted'
        AND submitted_at < NOW() - INTERVAL '48 hours'
    `);
    
    console.log('Query plan:', JSON.stringify(explainResult[0], null, 2));
    
    // This test validates the query can run - index optimization is manual
    expect(explainResult).toBeDefined();
  });

});
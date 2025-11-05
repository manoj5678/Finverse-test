// const { Sequelize } = require('sequelize');
// require('dotenv').config({ path: '.env.test' });

// describe('Demo Preparation Validation', () => {
//   let sequelize;

//   beforeAll(() => {
//     sequelize = new Sequelize(process.env.DATABASE_URL, {
//       dialect: 'postgres',
//       dialectOptions: {
//         ssl: { require: true, rejectUnauthorized: false }
//       },
//       logging: false
//     });
//   });

//   afterAll(async () => {
//     await sequelize.close();
//   });

//   describe('Data Readiness', () => {
    
//     test('Should have diverse application statuses for demo', async () => {
//       const [result] = await sequelize.query(`
//         SELECT status, COUNT(*) as count
//         FROM applications
//         GROUP BY status
//       `);
      
//       const statuses = result.map(r => r.status);
      
//       console.log('\n📊 Application Status Distribution:');
//       result.forEach(r => {
//         console.log(`  ${r.status}: ${r.count}`);
//       });
      
//       expect(statuses).toContain('submitted');
//       expect(statuses).toContain('in_review');
//       expect(statuses).toContain('approved');
//     });

//     test('Should have alerts across all severity levels', async () => {
//       const [result] = await sequelize.query(`
//         SELECT severity, status, COUNT(*) as count
//         FROM alerts
//         GROUP BY severity, status
//         ORDER BY severity, status
//       `);
      
//       console.log('\n🚨 Alert Distribution:');
//       result.forEach(r => {
//         console.log(`  ${r.severity} (${r.status}): ${r.count}`);
//       });
      
//       const severities = [...new Set(result.map(r => r.severity))];
//       expect(severities.length).toBeGreaterThanOrEqual(3);
//     });

//     test('Should have SLA-breaching applications for demo', async () => {
//       const [result] = await sequelize.query(`
//         SELECT 
//           COUNT(*) as count,
//           AVG(EXTRACT(EPOCH FROM (NOW() - submitted_at)) / 3600) as avg_hours_pending
//         FROM applications
//         WHERE status IN ('submitted', 'in_review', 'more_info')
//           AND submitted_at < NOW() - INTERVAL '48 hours'
//       `);
      
//       const count = Number(result[0].count);
//       const avgHours = Number(result[0].avg_hours_pending);
      
//       console.log(`\n⏰ SLA Status:`);
//       console.log(`  Applications >48h: ${count}`);
//       console.log(`  Average hours pending: ${avgHours.toFixed(1)}h`);
      
//       // Ideally we want some SLA breaches to demonstrate the feature
//       if (count === 0) {
//         console.log('  ⚠️  Consider adding older test data for better demo');
//       }
//     });

//     test('Should have complete customer profiles', async () => {
//       const [result] = await sequelize.query(`
//         SELECT 
//           COUNT(*) as total,
//           COUNT(email) as with_email,
//           COUNT(company_name) as with_company,
//           COUNT(country) as with_country
//         FROM customers
//       `);
      
//       const total = Number(result[0].total);
//       const withEmail = Number(result[0].with_email);
      
//       console.log(`\n👥 Customer Data Quality:`);
//       console.log(`  Total customers: ${total}`);
//       console.log(`  With email: ${withEmail} (${(withEmail/total*100).toFixed(1)}%)`);
      
//       expect(withEmail / total).toBeGreaterThan(0.9); // 90%+ should have emails
//     });

//   });

//   describe('Feature Completeness', () => {
    
//     test('Key workflow: Full onboarding pipeline', async () => {
//       const [result] = await sequelize.query(`
//         SELECT 
//           SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as new_submissions,
//           SUM(CASE WHEN status = 'in_review' THEN 1 ELSE 0 END) as under_review,
//           SUM(CASE WHEN status = 'more_info' THEN 1 ELSE 0 END) as pending_info,
//           SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
//           SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
//         FROM applications
//       `);
      
//       const metrics = result[0];
      
//       console.log(`\n✅ Onboarding Pipeline Status:`);
//       console.log(`  New Submissions: ${metrics.new_submissions}`);
//       console.log(`  Under Review: ${metrics.under_review}`);
//       console.log(`  Pending Info: ${metrics.pending_info}`);
//       console.log(`  Approved: ${metrics.approved}`);
//       console.log(`  Rejected: ${metrics.rejected}`);
      
//       // Should have data in at least 3 stages
//       const stagesWithData = Object.values(metrics).filter(v => Number(v) > 0).length;
//       expect(stagesWithData).toBeGreaterThanOrEqual(3);
//     });

//     test('Key workflow: AML monitoring and escalation', async () => {
//       const [alertMetrics] = await sequelize.query(`
//         SELECT 
//           COUNT(*) as total_alerts,
//           SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_alerts,
//           SUM(CASE WHEN severity = 'critical' AND status = 'open' THEN 1 ELSE 0 END) as critical_open
//         FROM alerts
//       `);
      
//       const [caseMetrics] = await sequelize.query(`
//         SELECT 
//           COUNT(*) as total_cases,
//           SUM(CASE WHEN status != 'closed' THEN 1 ELSE 0 END) as active_cases,
//           SUM(CASE WHEN priority = 'P1' THEN 1 ELSE 0 END) as p1_cases
//         FROM cases
//       `);
      
//       console.log(`\n🚨 AML Monitoring Status:`);
//       console.log(`  Total Alerts: ${alertMetrics[0].total_alerts}`);
//       console.log(`  Open Alerts: ${alertMetrics[0].open_alerts}`);
//       console.log(`  Critical Open: ${alertMetrics[0].critical_open}`);
//       console.log(`  Total Cases: ${caseMetrics[0].total_cases}`);
//       console.log(`  Active Cases: ${caseMetrics[0].active_cases}`);
      
//       expect(Number(alertMetrics[0].total_alerts)).toBeGreaterThan(0);
//     });

//     test('Key workflow: Customer support access', async () => {
//       const [result] = await sequelize.query(`
//         SELECT 
//           c.id,
//           c.company_name,
//           c.email,
//           COUNT(DISTINCT ac.id) as account_count,
//           COUNT(DISTINCT t.id) as transaction_count
//         FROM customers c
//         LEFT JOIN accounts ac ON c.id = ac.customer_id
//         LEFT JOIN transactions t ON ac.id = t.account_id
//         GROUP BY c.id
//         HAVING COUNT(DISTINCT ac.id) > 0
//         LIMIT 5
//       `);
      
//       console.log(`\n💼 Customer Support Data:`);
//       console.log(`  Customers with accounts: ${result.length}`);
      
//       if (result.length > 0) {
//         const sampleCustomer = result[0];
//         console.log(`  Sample: ${sampleCustomer.company_name}`);
//         console.log(`    Accounts: ${sampleCustomer.account_count}`);
//         console.log(`    Transactions: ${sampleCustomer.transaction_count}`);
//       }
      
//       expect(result.length).toBeGreaterThan(0);
//     });

//   });

//   describe('Demo Scenario Readiness', () => {
    
//     test('Scenario 1: Review and approve pending applications', async () => {
//       const [result] = await sequelize.query(`
//         SELECT 
//           id,
//           status,
//           risk_score,
//           EXTRACT(EPOCH FROM (NOW() - submitted_at)) / 86400 as days_pending
//         FROM applications
//         WHERE status IN ('submitted', 'in_review')
//         ORDER BY submitted_at ASC
//         LIMIT 3
//       `);
      
//       console.log(`\n📝 Demo Scenario 1: Pending Applications`);
//       console.log(`  Available for demo: ${result.length}`);
      
//       if (result.length > 0) {
//         result.forEach((app, idx) => {
//           console.log(`  ${idx + 1}. Status: ${app.status}, Risk: ${app.risk_score}, Days: ${Number(app.days_pending).toFixed(1)}`);
//         });
//       }
      
//       expect(result.length).toBeGreaterThanOrEqual(1);
//     });

//     test('Scenario 2: Triage critical AML alerts', async () => {
//       const [result] = await sequelize.query(`
//         SELECT 
//           id,
//           alert_type,
//           severity,
//           EXTRACT(EPOCH FROM (NOW() - triggered_at)) / 3600 as hours_open
//         FROM alerts
//         WHERE status = 'open' AND severity IN ('critical', 'high')
//         ORDER BY severity DESC, triggered_at ASC
//         LIMIT 3
//       `);
      
//       console.log(`\n🚨 Demo Scenario 2: Critical AML Alerts`);
//       console.log(`  Available for demo: ${result.length}`);
      
//       if (result.length > 0) {
//         result.forEach((alert, idx) => {
//           console.log(`  ${idx + 1}. ${alert.severity.toUpperCase()}: ${alert.alert_type} (${Number(alert.hours_open).toFixed(1)}h open)`);
//         });
//       }
      
//       expect(result.length).toBeGreaterThanOrEqual(1);
//     });

//     test('Scenario 3: Customer account lookup', async () => {
//       const [result] = await sequelize.query(`
//         SELECT 
//           c.company_name,
//           c.email,
//           a.account_number,
//           a.balance,
//           a.currency,
//           a.status
//         FROM customers c
//         INNER JOIN accounts a ON c.id = a.customer_id
//         WHERE a.status = 'active'
//         ORDER BY a.balance DESC
//         LIMIT 3
//       `);
      
//       console.log(`\n💼 Demo Scenario 3: Customer Accounts`);
//       console.log(`  Available for demo: ${result.length}`);
      
//       if (result.length > 0) {
//         result.forEach((account, idx) => {
//           console.log(`  ${idx + 1}. ${account.company_name}: ${account.currency} ${Number(account.balance).toLocaleString()}`);
//         });
//       }
      
//       expect(result.length).toBeGreaterThanOrEqual(1);
//     });

//   });

//   describe('Demo Performance Check', () => {
    
//     test('Dashboard load time should be acceptable', async () => {
//       const startTime = Date.now();
      
//       await Promise.all([
//         sequelize.query('SELECT COUNT(*) FROM applications WHERE status IN (\'submitted\', \'in_review\')'),
//         sequelize.query('SELECT COUNT(*) FROM alerts WHERE status = \'open\' AND severity = \'critical\''),
//         sequelize.query('SELECT COUNT(*) FROM cases WHERE status != \'closed\'')
//       ]);
      
//       const duration = Date.now() - startTime;
      
//       console.log(`\n⚡ Dashboard Load Performance: ${duration}ms`);
      
//       expect(duration).toBeLessThan(2000); // Should load in < 2 seconds
//     });

//   });

//   test('Final Demo Readiness Summary', async () => {
//     const [summary] = await sequelize.query(`
//       SELECT 
//         (SELECT COUNT(*) FROM customers) as customers,
//         (SELECT COUNT(*) FROM applications) as applications,
//         (SELECT COUNT(*) FROM alerts WHERE status = 'open') as open_alerts,
//         (SELECT COUNT(*) FROM cases WHERE status != 'closed') as active_cases,
//         (SELECT COUNT(*) FROM accounts WHERE status = 'active') as active_accounts,
//         (SELECT COUNT(*) FROM transactions) as transactions
//     `);
    
//     console.log(`\n🎯 Demo Readiness Summary:`);
//     console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
//     console.log(`  ✅ Customers: ${summary[0].customers}`);
//     console.log(`  ✅ Applications: ${summary[0].applications}`);
//     console.log(`  ✅ Open Alerts: ${summary[0].open_alerts}`);
//     console.log(`  ✅ Active Cases: ${summary[0].active_cases}`);
//     console.log(`  ✅ Active Accounts: ${summary[0].active_accounts}`);
//     console.log(`  ✅ Transactions: ${summary[0].transactions}`);
//     console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    
//     // All metrics should have data
//     expect(Number(summary[0].customers)).toBeGreaterThan(0);
//     expect(Number(summary[0].applications)).toBeGreaterThan(0);
//     expect(Number(summary[0].open_alerts)).toBeGreaterThan(0);
//   });

// });

/**
 * SCHEMA-COMPATIBLE Demo Validation Tests
 * 
 * This test suite validates that the database is ready for demo
 * Uses column names that match the ACTUAL database schema
 */

const { Sequelize } = require('sequelize');
require('dotenv').config({ path: '.env.test' });

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false }
  },
  logging: false
});

describe('Demo Preparation Validation', () => {
  
  beforeAll(async () => {
    await sequelize.authenticate();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Data Readiness', () => {
    
    test('Should have diverse application statuses for demo', async () => {
      const [result] = await sequelize.query(`
        SELECT status, COUNT(*) as count
        FROM applications
        GROUP BY status
      `);
      
      const statuses = result.map(r => r.status);
      
      // Should have multiple status types for demo
      expect(statuses.length).toBeGreaterThanOrEqual(3);
      expect(statuses).toContain('submitted');
      expect(statuses).toContain('in_review');
      expect(statuses).toContain('approved');
      
      console.log('\n📊 Application Status Distribution:');
      result.forEach(r => {
        console.log(`  ${r.status}: ${r.count}`);
      });
    });

    test('Should have alerts across all severity levels', async () => {
      const [result] = await sequelize.query(`
        SELECT severity, status, COUNT(*) as count
        FROM alerts
        GROUP BY severity, status
        ORDER BY 
          CASE severity
            WHEN 'critical' THEN 1
            WHEN 'high' THEN 2
            WHEN 'medium' THEN 3
            WHEN 'low' THEN 4
          END,
          status
      `);
      
      const severities = [...new Set(result.map(r => r.severity))];
      
      // Should have all severity levels for demo
      expect(severities).toContain('critical');
      expect(severities).toContain('high');
      expect(severities).toContain('medium');
      expect(severities).toContain('low');
      
      console.log('\n🚨 Alert Distribution:');
      result.forEach(r => {
        console.log(`  ${r.severity} (${r.status}): ${r.count}`);
      });
    });

    test('Should have SLA-breaching applications for demo', async () => {
      const [result] = await sequelize.query(`
        SELECT 
          COUNT(*) as total_pending,
          COUNT(*) FILTER (WHERE submitted_at < NOW() - INTERVAL '48 hours') as over_48h,
          ROUND(AVG(EXTRACT(EPOCH FROM (NOW() - submitted_at)) / 3600), 1) as avg_hours_pending
        FROM applications
        WHERE status IN ('submitted', 'in_review', 'more_info')
      `);
      
      const stats = result[0];
      
      // Should have applications pending >48 hours for SLA demo
      expect(parseInt(stats.over_48h)).toBeGreaterThan(0);
      
      console.log('\n⏰ SLA Status:');
      console.log(`  Applications >48h: ${stats.over_48h}`);
      console.log(`  Average hours pending: ${stats.avg_hours_pending}h`);
    });

    test('Should have complete customer profiles', async () => {
      const [result] = await sequelize.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(email) as with_email,
          COUNT(phone) as with_phone,
          COUNT(CASE 
            WHEN type = 'business' THEN business_name 
            WHEN type = 'individual' THEN COALESCE(first_name, last_name)
          END) as with_name
        FROM customers
      `);
      
      const stats = result[0];
      
      // All customers should have basic info
      expect(parseInt(stats.total)).toBeGreaterThan(0);
      expect(parseInt(stats.with_email)).toBe(parseInt(stats.total));
      // At least 90% should have names (allowing for some incomplete data)
      expect(parseInt(stats.with_name)).toBeGreaterThan(parseInt(stats.total) * 0.9);
      
      console.log('\n👥 Customer Profile Completeness:');
      console.log(`  Total: ${stats.total}`);
      console.log(`  With email: ${stats.with_email}`);
      console.log(`  With phone: ${stats.with_phone}`);
      console.log(`  With name: ${stats.with_name} (${Math.round(stats.with_name / stats.total * 100)}%)`);
    });
  });

  describe('Feature Completeness', () => {
    
    test('Key workflow: Full onboarding pipeline', async () => {
      const [result] = await sequelize.query(`
        SELECT 
          COUNT(*) FILTER (WHERE status = 'submitted') as new_submissions,
          COUNT(*) FILTER (WHERE status = 'in_review') as under_review,
          COUNT(*) FILTER (WHERE status = 'more_info') as pending_info,
          COUNT(*) FILTER (WHERE status = 'approved') as approved,
          COUNT(*) FILTER (WHERE status = 'rejected') as rejected
        FROM applications
      `);
      
      const metrics = result[0];
      
      console.log('\n✅ Onboarding Pipeline Status:');
      console.log(`  New Submissions: ${metrics.new_submissions}`);
      console.log(`  Under Review: ${metrics.under_review}`);
      console.log(`  Pending Info: ${metrics.pending_info}`);
      console.log(`  Approved: ${metrics.approved}`);
      console.log(`  Rejected: ${metrics.rejected}`);
      
      // Should have data in at least 3 stages
      const stagesWithData = Object.values(metrics).filter(v => Number(v) > 0).length;
      expect(stagesWithData).toBeGreaterThanOrEqual(3);
    });

    test('Key workflow: AML monitoring and escalation', async () => {
      const [alertStats] = await sequelize.query(`
        SELECT 
          COUNT(*) as total_alerts,
          COUNT(*) FILTER (WHERE status = 'open') as open_alerts,
          COUNT(*) FILTER (WHERE severity = 'critical' AND status = 'open') as critical_open
        FROM alerts
      `);
      
      const [caseStats] = await sequelize.query(`
        SELECT 
          COUNT(*) as total_cases,
          COUNT(*) FILTER (WHERE status IN ('open', 'in_review')) as active_cases
        FROM cases
      `);
      
      const alerts = alertStats[0];
      const cases = caseStats[0];
      
      console.log('\n🚨 AML Monitoring Status:');
      console.log(`  Total Alerts: ${alerts.total_alerts}`);
      console.log(`  Open Alerts: ${alerts.open_alerts}`);
      console.log(`  Critical Open: ${alerts.critical_open}`);
      console.log(`  Total Cases: ${cases.total_cases}`);
      console.log(`  Active Cases: ${cases.active_cases}`);
      
      // Should have both alerts and cases
      expect(parseInt(alerts.total_alerts)).toBeGreaterThan(0);
      expect(parseInt(alerts.open_alerts)).toBeGreaterThan(0);
      expect(parseInt(cases.total_cases)).toBeGreaterThan(0);
    });

    test('Key workflow: Customer support access', async () => {
      const [result] = await sequelize.query(`
        SELECT 
          c.id,
          CASE 
            WHEN c.type = 'business' THEN c.business_name
            ELSE c.first_name || ' ' || c.last_name
          END as customer_name,
          c.email,
          COUNT(DISTINCT a.id)::integer as account_count,
          COUNT(DISTINCT t.id)::integer as transaction_count
        FROM customers c
        LEFT JOIN accounts a ON c.id = a.customer_id
        LEFT JOIN transactions t ON a.id = t.account_id
        GROUP BY c.id, customer_name, c.email
        HAVING COUNT(DISTINCT a.id) > 0
        LIMIT 5
      `);
      
      console.log('\n🔍 Customer Support Access Sample:');
      result.forEach(r => {
        console.log(`  ${r.customer_name}: ${r.account_count} accounts, ${r.transaction_count} txns`);
      });
      
      // Should have customers with accounts
      expect(result.length).toBeGreaterThan(0);
      expect(parseInt(result[0].account_count)).toBeGreaterThan(0);
    });
  });

  describe('Demo Scenario Readiness', () => {
    
    test('Scenario 1: Review and approve pending applications', async () => {
      const [result] = await sequelize.query(`
        SELECT 
          id,
          status,
          risk_score,
          EXTRACT(EPOCH FROM (NOW() - submitted_at)) / 86400 as days_pending
        FROM applications
        WHERE status IN ('submitted', 'in_review')
        ORDER BY 
          CASE 
            WHEN risk_score > 70 THEN 1
            ELSE 2
          END,
          submitted_at ASC
        LIMIT 3
      `);
      
      console.log('\n📝 Demo Scenario 1: Pending Applications');
      console.log(`  Available for demo: ${result.length}`);
      result.forEach((app, idx) => {
        console.log(`  ${idx + 1}. Status: ${app.status}, Risk: ${app.risk_score}, Days: ${parseFloat(app.days_pending).toFixed(1)}`);
      });
      
      // Should have pending applications for demo
      expect(result.length).toBeGreaterThan(0);
    });

    test('Scenario 2: Triage critical AML alerts', async () => {
      const [result] = await sequelize.query(`
        SELECT 
          id,
          type as alert_type,
          severity,
          status,
          EXTRACT(EPOCH FROM (NOW() - triggered_at)) / 3600 as hours_old,
          details
        FROM alerts
        WHERE severity IN ('critical', 'high')
          AND status = 'open'
        ORDER BY 
          CASE severity
            WHEN 'critical' THEN 1
            WHEN 'high' THEN 2
          END,
          triggered_at ASC
        LIMIT 5
      `);
      
      console.log('\n⚠️ Demo Scenario 2: Critical Alerts');
      console.log(`  Available for demo: ${result.length}`);
      result.forEach((alert, idx) => {
        console.log(`  ${idx + 1}. ${alert.severity}: ${alert.alert_type} (${parseFloat(alert.hours_old).toFixed(1)}h old)`);
      });
      
      // Should have critical/high alerts for demo
      expect(result.length).toBeGreaterThan(0);
    });

    test('Scenario 3: Customer account lookup', async () => {
      const [result] = await sequelize.query(`
        SELECT 
          CASE 
            WHEN c.type = 'business' THEN c.business_name
            ELSE c.first_name || ' ' || c.last_name
          END as customer_name,
          c.email,
          c.type as customer_type,
          a.iban,
          a.status as account_status,
          a.balance_cents::decimal / 100 as balance,
          a.currency,
          COUNT(t.id) as transaction_count
        FROM customers c
        INNER JOIN accounts a ON c.id = a.customer_id
        LEFT JOIN transactions t ON a.id = t.account_id
        WHERE a.status = 'active'
        GROUP BY c.id, customer_name, c.email, c.type, a.id, a.iban, a.status, a.balance_cents, a.currency
        ORDER BY transaction_count DESC
        LIMIT 5
      `);
      
      console.log('\n🏦 Demo Scenario 3: Customer Accounts');
      console.log(`  Available for demo: ${result.length}`);
      result.forEach((customer, idx) => {
        console.log(`  ${idx + 1}. ${customer.customer_name} (${customer.customer_type}): ${customer.currency} ${parseFloat(customer.balance).toFixed(2)}, ${customer.transaction_count} txns`);
      });
      
      // Should have active customer accounts
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Demo Performance Check', () => {
    
    test('Dashboard load time should be acceptable', async () => {
      const startTime = Date.now();
      
      // Simulate dashboard queries
      await Promise.all([
        sequelize.query('SELECT COUNT(*) FROM applications WHERE status = \'submitted\''),
        sequelize.query('SELECT COUNT(*) FROM alerts WHERE status = \'open\' AND severity = \'critical\''),
        sequelize.query('SELECT COUNT(*) FROM cases WHERE status IN (\'open\', \'in_review\')'),
        sequelize.query('SELECT COUNT(*) FROM customers'),
      ]);
      
      const loadTime = Date.now() - startTime;
      
      console.log(`\n⚡ Dashboard Load Performance: ${loadTime}ms`);
      
      // Dashboard should load in under 2 seconds
      expect(loadTime).toBeLessThan(2000);
    });
  });

  test('Final Demo Readiness Summary', async () => {
    const [customerCount] = await sequelize.query('SELECT COUNT(*) as count FROM customers');
    const [applicationCount] = await sequelize.query('SELECT COUNT(*) as count FROM applications');
    const [alertCount] = await sequelize.query('SELECT COUNT(*) as count FROM alerts WHERE status = \'open\'');
    const [caseCount] = await sequelize.query('SELECT COUNT(*) as count FROM cases WHERE status IN (\'open\', \'in_review\')');
    const [accountCount] = await sequelize.query('SELECT COUNT(*) as count FROM accounts WHERE status = \'active\'');
    const [transactionCount] = await sequelize.query('SELECT COUNT(*) as count FROM transactions');
    
    console.log('\n🎯 Demo Readiness Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  ✅ Customers: ${customerCount[0].count}`);
    console.log(`  ✅ Applications: ${applicationCount[0].count}`);
    console.log(`  ✅ Open Alerts: ${alertCount[0].count}`);
    console.log(`  ✅ Active Cases: ${caseCount[0].count}`);
    console.log(`  ✅ Active Accounts: ${accountCount[0].count}`);
    console.log(`  ✅ Transactions: ${transactionCount[0].count}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // All core entities should have data
    expect(parseInt(customerCount[0].count)).toBeGreaterThan(0);
    expect(parseInt(applicationCount[0].count)).toBeGreaterThan(0);
    expect(parseInt(alertCount[0].count)).toBeGreaterThan(0);
    expect(parseInt(caseCount[0].count)).toBeGreaterThan(0);
  });
});
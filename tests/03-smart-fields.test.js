const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config({ path: '.env.test' });

describe('Smart Fields Calculation Tests', () => {
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

  describe('Applications Smart Fields', () => {
    
    test('daysPending calculation should be accurate', async () => {
      const [applications] = await sequelize.query(`
        SELECT 
          id,
          submitted_at,
          EXTRACT(EPOCH FROM (NOW() - submitted_at)) / 86400 as days_pending
        FROM applications
        WHERE status IN ('submitted', 'in_review', 'more_info')
        LIMIT 10
      `);
      
      expect(applications.length).toBeGreaterThan(0);
      
      applications.forEach(app => {
        expect(app.days_pending).toBeGreaterThanOrEqual(0);
        expect(typeof app.days_pending).toBe('string'); // Postgres returns string
      });
    });

    test('urgencyScore calculation should prioritize old + high-risk apps', async () => {
      const [applications] = await sequelize.query(`
        SELECT 
          id,
          risk_score,
          submitted_at,
          status,
          (EXTRACT(EPOCH FROM (NOW() - submitted_at)) / 3600 + 
           COALESCE(risk_score, 0) +
           CASE WHEN status = 'more_info' THEN 25 ELSE 0 END) as urgency_score
        FROM applications
        WHERE status IN ('submitted', 'in_review', 'more_info')
        ORDER BY urgency_score DESC
        LIMIT 5
      `);
      
      expect(applications.length).toBeGreaterThan(0);
      
      // Verify urgency scores are in descending order
      for (let i = 0; i < applications.length - 1; i++) {
        expect(Number(applications[i].urgency_score))
          .toBeGreaterThanOrEqual(Number(applications[i + 1].urgency_score));
      }
    });

    test('SLA status badge calculation', async () => {
      const [applications] = await sequelize.query(`
        SELECT 
          id,
          submitted_at,
          EXTRACT(EPOCH FROM (NOW() - submitted_at)) / 3600 as hours_pending,
          CASE 
            WHEN EXTRACT(EPOCH FROM (NOW() - submitted_at)) / 3600 < 36 THEN '🟢 On Track'
            WHEN EXTRACT(EPOCH FROM (NOW() - submitted_at)) / 3600 < 48 THEN '🟡 SLA Warning'
            ELSE '🔴 SLA Breached'
          END as sla_status
        FROM applications
        WHERE status IN ('submitted', 'in_review', 'more_info')
      `);
      
      expect(applications.length).toBeGreaterThan(0);
      
      applications.forEach(app => {
        const hoursPending = Number(app.hours_pending);
        
        if (hoursPending < 36) {
          expect(app.sla_status).toBe('🟢 On Track');
        } else if (hoursPending < 48) {
          expect(app.sla_status).toBe('🟡 SLA Warning');
        } else {
          expect(app.sla_status).toBe('🔴 SLA Breached');
        }
      });
    });

  });

  describe('Alerts Smart Fields', () => {
    
    test('hoursInQueue calculation should be accurate', async () => {
      const [alerts] = await sequelize.query(`
        SELECT 
          id,
          triggered_at,
          EXTRACT(EPOCH FROM (NOW() - triggered_at)) / 3600 as hours_in_queue
        FROM alerts
        WHERE status = 'open'
        LIMIT 10
      `);
      
      expect(alerts.length).toBeGreaterThan(0);
      
      alerts.forEach(alert => {
        expect(Number(alert.hours_in_queue)).toBeGreaterThanOrEqual(0);
      });
    });

    test('priorityScore calculation should prioritize critical + old alerts', async () => {
      const [alerts] = await sequelize.query(`
        SELECT 
          id,
          severity,
          triggered_at,
          (CASE severity
            WHEN 'critical' THEN 1000
            WHEN 'high' THEN 500
            WHEN 'medium' THEN 200
            ELSE 50
          END + EXTRACT(EPOCH FROM (NOW() - triggered_at)) / 3600) as priority_score
        FROM alerts
        WHERE status = 'open'
        ORDER BY priority_score DESC
        LIMIT 10
      `);
      
      expect(alerts.length).toBeGreaterThan(0);
      
      // Verify priority scores are in descending order
      for (let i = 0; i < alerts.length - 1; i++) {
        expect(Number(alerts[i].priority_score))
          .toBeGreaterThanOrEqual(Number(alerts[i + 1].priority_score));
      }
    });

    test('responseSLA calculation by severity', async () => {
      const [alerts] = await sequelize.query(`
        SELECT 
          id,
          severity,
          triggered_at,
          EXTRACT(EPOCH FROM (NOW() - triggered_at)) / 3600 as hours_open,
          CASE 
            WHEN severity = 'critical' AND EXTRACT(EPOCH FROM (NOW() - triggered_at)) / 3600 > 4 THEN '🔴 Overdue'
            WHEN severity = 'critical' AND EXTRACT(EPOCH FROM (NOW() - triggered_at)) / 3600 > 3 THEN '🟡 Due Soon'
            WHEN severity = 'high' AND EXTRACT(EPOCH FROM (NOW() - triggered_at)) / 3600 > 24 THEN '🔴 Overdue'
            WHEN severity = 'high' AND EXTRACT(EPOCH FROM (NOW() - triggered_at)) / 3600 > 18 THEN '🟡 Due Soon'
            ELSE '🟢 On Time'
          END as response_sla
        FROM alerts
        WHERE status = 'open' AND severity IN ('critical', 'high')
        LIMIT 20
      `);
      
      expect(alerts.length).toBeGreaterThan(0);
      
      alerts.forEach(alert => {
        const hoursOpen = Number(alert.hours_open);
        
        if (alert.severity === 'critical') {
          if (hoursOpen > 4) {
            expect(alert.response_sla).toBe('🔴 Overdue');
          } else if (hoursOpen > 3) {
            expect(alert.response_sla).toBe('🟡 Due Soon');
          } else {
            expect(alert.response_sla).toBe('🟢 On Time');
          }
        }
      });
    });

  });

});
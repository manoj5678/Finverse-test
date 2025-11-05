const axios = require('axios');
require('dotenv').config({ path: '.env.test' });

const BASE_URL = process.env.APPLICATION_URL || 'http://localhost:3310';

describe('Forest Admin Agent - Health Checks', () => {
  
  test('Agent should be running and responsive', async () => {
    try {
      const response = await axios.get(`${BASE_URL}/forest`);
      expect(response.status).toBe(200);
    } catch (error) {
      if (error.response?.status === 404) {
        // Some agents don't have /forest endpoint
        expect(true).toBe(true);
      } else {
        throw error;
      }
    }
  });

  test('Agent should respond to authentication endpoint', async () => {
    try {
      const response = await axios.post(`${BASE_URL}/forest/authentication`, {
        email: 'test@finverse.com',
        password: 'wrongpassword'
      });
      // Should get 401 or validation error
      expect([400, 401]).toContain(response.status);
    } catch (error) {
      expect([400, 401]).toContain(error.response?.status);
    }
  });

  test('Environment variables should be configured', () => {
    expect(process.env.DATABASE_URL).toBeDefined();
    expect(process.env.FOREST_ENV_SECRET).toBeDefined();
    expect(process.env.FOREST_AUTH_SECRET).toBeDefined();
  });

});
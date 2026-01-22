/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

describe('API Integration Tests', () => {
  let app: any;
  let AuthService: any;
  let AgentService: any;
  const TEST_SECRET = 'test-secret-123';

  beforeAll(async () => {
    vi.resetModules();

    process.env.JWT_SECRET = TEST_SECRET;

    vi.doMock('@src/services/AuthService', () => ({
      login: vi.fn(),
    }));
    
    vi.doMock('@src/services/AgentService', () => ({
      post: vi.fn(),
      get: vi.fn(),
    }));

    const express = await import('express');
    const apiRouter = await import('@src/routes/apiRouter');
    
    AuthService = await import('@src/services/AuthService');
    AgentService = await import('@src/services/AgentService');

    const _app = express.default();
    _app.use(express.default.json());
    _app.use('/api', apiRouter.default);
    app = _app;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Authentication
  describe('POST /api/login', () => {
    it('should return 200 and a token on valid credentials', async () => {
      vi.mocked(AuthService.login).mockResolvedValue({ 
        status: 'success', 
        token: 'fake-jwt-token' 
      });

      const res = await request(app)
        .post('/api/login')
        .send({ email: 'test@slush.org', password: 'password123' });

      expect(res.body).toEqual({ status: 'success', token: 'fake-jwt-token' });
      expect(res.status).toBe(200);
    });

    it('should return 400 for invalid input schema', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ email: 'not-an-email' }); 

      expect(res.status).toBe(400);
    });
  });

  // Agent
  describe('POST /api/agent', () => {
    const validToken = jwt.sign({ id: 1 }, TEST_SECRET);

    it('should return 401 if no token provided', async () => {
      const res = await request(app).post('/api/agent').send({ message: 'Hello' });
      expect(res.status).toBe(401);
    });

    it('should return 200 and messages on success', async () => {
      const mockResponse = [{ role: 'assistant', content: 'Hello Founder!' }];
      vi.mocked(AgentService.post).mockResolvedValue(mockResponse);

      const res = await request(app)
        .post('/api/agent')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ message: 'Hello AI' });

      expect(res.status).toBe(200);
      expect(res.body.messages).toEqual(mockResponse);
    });
  });

  // Assessment
  describe('GET /api/assessments', () => {
    const validToken = jwt.sign({ id: 1 }, TEST_SECRET);

    it('should return assessments and pagination cursor', async () => {
      const mockAssessments = Array(9).fill({ startup_name: 'Test Startup' });
      vi.mocked(AgentService.get).mockResolvedValue(mockAssessments);

      const res = await request(app)
        .get('/api/assessments?cursor=0')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.assessments).toHaveLength(9);
    });
  });
});
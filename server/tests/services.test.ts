/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';

describe('AuthService', () => {
  let AuthService: any;
  let mockExecute: any;

  beforeAll(async () => {
    vi.resetModules();
    process.env.JWT_SECRET = 'test-secret';

    mockExecute = vi.fn();

    const mockQueryBuilder = {
      select: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      executeTakeFirstOrThrow: mockExecute,
    };

    vi.doMock('@src/database', () => ({
      db: {
        selectFrom: vi.fn(() => mockQueryBuilder),
      }
    }));

    vi.doMock('bcrypt', () => ({
      compare: vi.fn(),
      hash: vi.fn(),
    }));

    AuthService = await import('@src/services/AuthService');
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockExecute.mockReset(); 
  });

  it('should return token on valid login', async () => {
    mockExecute.mockResolvedValue({ 
      id: 1, 
      password: 'hashed_password' 
    });
    
    const bcryptMock = await import('bcrypt');
    vi.mocked(bcryptMock.compare).mockResolvedValue(true as any);

    const result = await AuthService.login({ 
      email: 'test@slush.org', 
      password: 'real_password' 
    });

    expect(result.status).toBe('success');
    expect(result.token).toBeDefined();
  });

  it('should return error status on invalid password', async () => {
    mockExecute.mockResolvedValue({ 
      id: 1, 
      password: 'hashed_password' 
    });

    const bcryptMock = await import('bcrypt');
    vi.mocked(bcryptMock.compare).mockResolvedValue(false as any);

    const result = await AuthService.login({ 
      email: 'test@slush.org', 
      password: 'wrong_password' 
    });

    expect(result.status).toBe('error');
  });

  it('should return error status if user not found', async () => {
    mockExecute.mockRejectedValue(new Error('No result'));

    const result = await AuthService.login({ 
      email: 'unknown@slush.org', 
      password: 'any' 
    });

    expect(result.status).toBe('error');
  });
});

describe('AgentService', () => {
    let AgentService: any;
    let mockAgentInvoke: any;
    let mockDbExecute: any;

    beforeAll(async () => {
      vi.resetModules();
      
      mockAgentInvoke = vi.fn();
      mockDbExecute = vi.fn();

      vi.doMock('@src/services/agent', () => ({
        agent: {
          invoke: mockAgentInvoke
        }
      }));

      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        execute: mockDbExecute,
      };

      vi.doMock('@src/database', () => ({
        db: { selectFrom: vi.fn(() => mockQueryBuilder) }
      }));

      AgentService = await import('@src/services/AgentService');
    });

    beforeEach(() => { 
      vi.clearAllMocks(); 
      mockAgentInvoke.mockReset();
      mockDbExecute.mockReset();
    });

    it('post() should invoke the agent and return messages', async () => {
      const aiResponse = { 
        messages: [{ role: 'assistant', content: 'Hello!' }] 
      };
      mockAgentInvoke.mockResolvedValue(aiResponse);

      const result = await AgentService.post({ 
        message: 'Hi Agent', 
        userId: '1' 
      });

      expect(mockAgentInvoke).toHaveBeenCalledWith(
        { messages: [{ role: 'user', content: 'Hi Agent' }] },
        { configurable: { thread_id: '1', user_id: '1' } }
      );

      expect(result).toEqual(aiResponse.messages);
    });

    it('get() should query the database with pagination', async () => {
      const mockData = [{ startup_name: 'Test Startup', analysis: 'Good' }];
      mockDbExecute.mockResolvedValue(mockData);

      const result = await AgentService.get({ 
        userId: '1', 
        cursor: '0' 
      });

      expect(mockDbExecute).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });
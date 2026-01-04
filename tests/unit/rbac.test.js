const RBACMiddleware = require('../../src/middleware/rbacMiddleware');

describe('RBAC Middleware', () => {
  describe('requireRole', () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        user: {
          userId: 'test-user-123',
          role: 'candidate',
          email: 'test@example.com',
        },
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    test('Should allow access for authorized role', () => {
      const middleware = RBACMiddleware('candidate');
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('Should deny access for unauthorized role', () => {
      const middleware = RBACMiddleware('recruiter');
      middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('Access denied') })
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('Should allow access for multiple authorized roles', () => {
      const middleware = RBACMiddleware('recruiter', 'candidate', 'hiring_manager');
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    test('Should deny access when user is not authenticated', () => {
      req.user = null;
      const middleware = RBACMiddleware('candidate');
      middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'User not authenticated' })
      );
    });
  });
});

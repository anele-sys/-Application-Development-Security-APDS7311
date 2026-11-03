const jwt = require('jsonwebtoken');

jest.mock('../src/models/User', () => ({
  findById: jest.fn()
}));

const User = require('../src/models/User');
const {
  authenticateToken,
  requireRole
} = require('../src/middleware/authMiddleware');
const { generateToken } = require('../src/utils/jwt');
const { sanitiseString } = require('../src/utils/validators');

const createResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis()
});

describe('Authentication and authorization security controls', () => {
  const originalSecret = process.env.JWT_SECRET;
  const originalExpiry = process.env.JWT_EXPIRES_IN;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'role-3-test-secret';
    process.env.JWT_EXPIRES_IN = '1h';
  });

  afterAll(() => {
    if (originalSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalSecret;
    }

    if (originalExpiry === undefined) {
      delete process.env.JWT_EXPIRES_IN;
    } else {
      process.env.JWT_EXPIRES_IN = originalExpiry;
    }
  });

  test('rejects a protected request without a bearer token', async () => {
    const req = { headers: {} };
    const res = createResponse();
    const next = jest.fn();

    await authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Authentication token is required'
    }));
    expect(next).not.toHaveBeenCalled();
  });

  test('rejects an expired token', async () => {
    const token = jwt.sign(
      { id: 'user-1' },
      process.env.JWT_SECRET,
      { algorithm: 'HS256', expiresIn: -1 }
    );
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = createResponse();

    await authenticateToken(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Invalid or expired authentication token'
    }));
  });

  test('rejects a token signed with an unapproved algorithm', async () => {
    const token = jwt.sign(
      { id: 'user-1' },
      process.env.JWT_SECRET,
      { algorithm: 'HS512', expiresIn: '1h' }
    );
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = createResponse();

    await authenticateToken(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(User.findById).not.toHaveBeenCalled();
  });

  test('accepts a valid HS256 token and loads the current user', async () => {
    const token = generateToken({
      id: 'user-1',
      email: 'client@example.com',
      role: 'client'
    });
    User.findById.mockResolvedValue({
      id: 'user-1',
      name: 'Client User',
      email: 'client@example.com',
      role: 'client'
    });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = createResponse();
    const next = jest.fn();

    await authenticateToken(req, res, next);

    expect(User.findById).toHaveBeenCalledWith('user-1');
    expect(req.user).toEqual({
      id: 'user-1',
      name: 'Client User',
      email: 'client@example.com',
      role: 'client'
    });
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('returns 403 when an authenticated user has the wrong role', () => {
    const req = { user: { id: 'user-1', role: 'client' } };
    const res = createResponse();
    const next = jest.fn();

    requireRole('admin')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('allows an authenticated user with an approved role', () => {
    const req = { user: { id: 'admin-1', role: 'admin' } };
    const res = createResponse();
    const next = jest.fn();

    requireRole('admin')(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe('Input sanitisation controls', () => {
  test('removes script elements and raw angle brackets', () => {
    const input = '  <script>alert("xss")</script><b>Safe title</b>  ';

    expect(sanitiseString(input)).toBe('bSafe title/b');
  });

  test('rejects non-string input instead of forwarding an object', () => {
    expect(sanitiseString({ $ne: null })).toBe('');
  });
});

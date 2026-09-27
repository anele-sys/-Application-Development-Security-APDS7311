jest.mock('../src/models/Gig', () => ({
  find: jest.fn()
}));

const Gig = require('../src/models/Gig');
const { getMyGigs } = require('../src/controllers/gigController');

describe('getMyGigs', () => {
  test('returns all gigs belonging to the authenticated freelancer', async () => {
    const ownerId = 'freelancer-123';
    const gigs = [
      { _id: 'gig-1', owner: ownerId, status: 'inactive' },
      { _id: 'gig-2', owner: ownerId, status: 'active' }
    ];
    const query = {
      populate: jest.fn(),
      sort: jest.fn().mockResolvedValue(gigs)
    };
    query.populate.mockReturnValue(query);
    Gig.find.mockReturnValue(query);

    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    await getMyGigs({ user: { id: ownerId } }, response, jest.fn());

    expect(Gig.find).toHaveBeenCalledWith({ owner: ownerId });
    expect(query.populate).toHaveBeenCalledWith('owner', 'name email');
    expect(query.sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      success: true,
      count: 2,
      gigs
    });
  });
});
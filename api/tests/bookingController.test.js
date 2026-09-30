jest.mock('../src/models/Booking', () => ({
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
}));

jest.mock('../src/models/Gig', () => ({
  findById: jest.fn(),
}));

const Booking = require('../src/models/Booking');
const Gig = require('../src/models/Gig');
const {
  createBooking,
  getClientBookings,
  getFreelancerBookings,
  getBookingById,
} = require('../src/controllers/bookingController');

describe('Booking Controller Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createBooking', () => {
    test('rejects booking when gig does not exist', async () => {
      Gig.findById.mockResolvedValue(null);

      const req = {
        body: { gigId: 'gig-nonexistent' },
        user: { id: 'client-1', role: 'client' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      const next = jest.fn();

      await createBooking(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'The requested gig does not exist',
        })
      );
    });

    test('prevents freelancer from booking their own gig', async () => {
      Gig.findById.mockResolvedValue({
        _id: 'gig-1',
        title: 'Logo Design',
        price: 500,
        status: 'active',
        owner: 'user-same-id',
      });

      const req = {
        body: { gigId: 'gig-1' },
        user: { id: 'user-same-id', role: 'client' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      const next = jest.fn();

      await createBooking(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'You cannot book your own freelance service listing',
        })
      );
    });

    test('creates booking and simulated transaction successfully', async () => {
      Gig.findById.mockResolvedValue({
        _id: 'gig-1',
        title: 'Fullstack App',
        price: 3500,
        status: 'active',
        owner: 'freelancer-2',
      });

      const createdMock = { _id: 'booking-new' };
      Booking.create.mockResolvedValue(createdMock);

      const populatedQuery = {
        populate: jest.fn().mockReturnThis(),
      };
      // final populate chain resolves the populated document
      populatedQuery.populate
        .mockReturnValueOnce(populatedQuery)
        .mockReturnValueOnce(populatedQuery)
        .mockResolvedValue({
          _id: 'booking-new',
          price: 3500,
          status: 'in_progress',
          transaction: { transactionId: 'TXN-TEST', status: 'completed', amount: 3500 },
          gig: { title: 'Fullstack App' },
          client: { name: 'Client Alice' },
          freelancer: { name: 'Freelancer Bob' },
        });

      Booking.findById.mockReturnValue(populatedQuery);

      const req = {
        body: { gigId: 'gig-1', requirements: 'Build an API', paymentMethod: 'simulated_card' },
        user: { id: 'client-alice', role: 'client' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      const next = jest.fn();

      await createBooking(req, res, next);

      expect(Booking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          client: 'client-alice',
          freelancer: 'freelancer-2',
          gig: 'gig-1',
          price: 3500,
          requirements: 'Build an API',
          transaction: expect.objectContaining({
            amount: 3500,
            currency: 'ZAR',
            status: 'completed',
          }),
        })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Booking created and payment simulated successfully',
        })
      );
    });
  });

  describe('getClientBookings', () => {
    test('returns client bookings with summary spend metrics', async () => {
      const mockBookings = [
        { _id: 'b1', price: 1000, status: 'in_progress' },
        { _id: 'b2', price: 1500, status: 'completed' },
      ];

      const query = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockBookings),
      };
      Booking.find.mockReturnValue(query);

      const req = { user: { id: 'client-1' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await getClientBookings(req, res, jest.fn());

      expect(Booking.find).toHaveBeenCalledWith({ client: 'client-1' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          count: 2,
          stats: {
            totalSpend: 2500,
            totalBookings: 2,
            activeBookings: 1,
            completedBookings: 1,
          },
        })
      );
    });
  });

  describe('getFreelancerBookings', () => {
    test('returns freelancer bookings with total earned metrics', async () => {
      const mockBookings = [
        { _id: 'b1', price: 2000, status: 'completed' },
        { _id: 'b2', price: 500, status: 'cancelled' },
      ];

      const query = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockBookings),
      };
      Booking.find.mockReturnValue(query);

      const req = { user: { id: 'freelancer-1' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await getFreelancerBookings(req, res, jest.fn());

      expect(Booking.find).toHaveBeenCalledWith({ freelancer: 'freelancer-1' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          count: 2,
          stats: {
            totalEarned: 2000, // Cancelled order excluded from earnings
            totalOrders: 2,
            activeOrders: 0,
            completedOrders: 1,
          },
        })
      );
    });
  });
});

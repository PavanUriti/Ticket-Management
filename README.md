# Bus Ticket Management

This repository contains the backend implementation of a Bus Ticket Management using Node.js, Express.js, MongoDB. The platform allows administrators to manage user registration, and bus registration. It also provides APIs for admin registration, customer registration, login and tickets booking.

API Endpoints:

// POST endpoint to register a new User(Admin/Customer)
userRouter.post('/register', userController.registration);

// POST endpoint for user login(Admin/Customer)
userRouter.post('/login', userController.login);

// POST endpoint to register a new bus (accessible only to admin users)
busRouter.post('/', adminOnly, busController.registerNewBus);

// POST endpoint to reset tickets for a bus (accessible only to admin users)
busRouter.post('/reset-tickets', adminOnly, busController.resetTickets);

// PUT endpoint to update ticket status for a bus
busRouter.put('/:id/ticket/update', busController.updateTicketStatus);

// GET endpoint to retrieve tickets for a bus by status
busRouter.get('/:id/ticket?', busController.getTicketsByStatus);

// POST endpoint to retrieve the status of tickets for a bus
busRouter.post('/:id/ticket/status', busController.getTicketsStatus);

// POST endpoint to retrieve booking details for a bus (accessible only to admin users)
busRouter.post('/:id/ticket/bookings', adminOnly, busController.getBookingDetails);


Attaching Postman Collection APIs.

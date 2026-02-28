/**
 * @file OpenAPI 3.0 specification for CineNest API
 * @module swagger
 */

import type { OpenAPIV3 } from 'openapi-types';

// ── Reusable schemas ───────────────────────────────────────────────────────────

const PaginationSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    total:       { type: 'integer', example: 100 },
    page:        { type: 'integer', example: 1 },
    limit:       { type: 'integer', example: 20 },
    totalPages:  { type: 'integer', example: 5 },
  },
};

const ErrorSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    message: { type: 'string', example: 'An error occurred' },
    code:    { type: 'string', example: 'VALIDATION_ERROR' },
  },
};

const BookingSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    id:               { type: 'string', format: 'uuid' },
    bookingRef:       { type: 'string', example: 'CNB-20240301-ABCD' },
    status:           { type: 'string', enum: ['pending', 'confirmed', 'cancelled', 'completed'] },
    date:             { type: 'string', format: 'date', example: '2024-03-15' },
    durationType:     { type: 'string', enum: ['standard', 'short'] },
    numAdults:        { type: 'integer', example: 2 },
    numChildren:      { type: 'integer', example: 1 },
    occasion:         { type: 'string', example: 'birthday' },
    occasionName:     { type: 'string', example: 'Arjun' },
    baseAmount:       { type: 'integer', example: 1499 },
    addonsAmount:     { type: 'integer', example: 500 },
    foodAmount:       { type: 'integer', example: 300 },
    cakeAmount:       { type: 'integer', example: 450 },
    totalAmount:      { type: 'integer', example: 2749 },
    advancePaid:      { type: 'integer', example: 700 },
    createdAt:        { type: 'string', format: 'date-time' },
  },
};

const TheaterSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    id:                 { type: 'string', format: 'uuid' },
    name:               { type: 'string', example: 'Platinum' },
    slug:               { type: 'string', example: 'hitec-city-platinum' },
    screenSize:         { type: 'string', example: '150-inch' },
    screenResolution:   { type: 'string', example: '4K' },
    soundSystem:        { type: 'string', example: 'Dolby Atmos 7.1' },
    maxCapacity:        { type: 'integer', example: 10 },
    baseCapacity:       { type: 'integer', example: 4 },
    basePrice:          { type: 'integer', example: 1499 },
    shortSlotPrice:     { type: 'integer', example: 999 },
    extraAdultPrice:    { type: 'integer', example: 200 },
    extraChildPrice:    { type: 'integer', example: 150 },
    allowExtraPersons:  { type: 'boolean' },
    coupleOnly:         { type: 'boolean' },
    description:        { type: 'string' },
    images:             { type: 'array', items: { type: 'string', format: 'uri' } },
    youtubeUrl:         { type: 'string', format: 'uri', nullable: true },
    isActive:           { type: 'boolean' },
    sortOrder:          { type: 'integer' },
    location: {
      type: 'object',
      properties: {
        id:   { type: 'string', format: 'uuid' },
        name: { type: 'string', example: 'Hitec City' },
        slug: { type: 'string', example: 'hitec-city' },
      },
    },
  },
};

const CouponSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    id:               { type: 'string', format: 'uuid' },
    code:             { type: 'string', example: 'SAVE200' },
    discountType:     { type: 'string', enum: ['flat', 'percentage'] },
    discountValue:    { type: 'integer', example: 200 },
    minBookingAmount: { type: 'integer', example: 1000 },
    maxUses:          { type: 'integer', example: 100 },
    usedCount:        { type: 'integer', example: 12 },
    expiresAt:        { type: 'string', format: 'date', nullable: true },
    isActive:         { type: 'boolean' },
    createdAt:        { type: 'string', format: 'date-time' },
  },
};

// ── Main spec document ────────────────────────────────────────────────────────

export const swaggerSpec: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'CineNest API',
    version: '1.0.0',
    description: `
## CineNest Private Theater Booking Platform

REST API for managing private theater bookings, customer authentication, payments, reviews, and admin operations.

### Authentication
- **Customer routes** use \`Authorization: Bearer <customer_jwt>\`
- **Admin routes** use \`Authorization: Bearer <admin_jwt>\`

Get a customer token via \`POST /api/auth/otp/verify\`.
Get an admin token via \`POST /api/auth/admin/login\`.
    `.trim(),
    contact: {
      name: 'CineNest Support',
      email: 'support@cinenest.com',
    },
  },
  servers: [
    { url: 'http://localhost:4000', description: 'Local development' },
    { url: 'https://api.cinenest.com', description: 'Production' },
  ],
  tags: [
    { name: 'Health',         description: 'Server health check' },
    { name: 'Auth',           description: 'Customer OTP + Admin login' },
    { name: 'Theaters',       description: 'Theater listing and slot availability' },
    { name: 'Bookings',       description: 'Create and manage bookings' },
    { name: 'Payments',       description: 'Razorpay payment integration' },
    { name: 'Reviews',        description: 'Customer reviews' },
    { name: 'Admin — Dashboard',  description: 'Admin dashboard statistics' },
    { name: 'Admin — Bookings',   description: 'Admin booking management' },
    { name: 'Admin — Theaters',   description: 'Admin theater CRUD' },
    { name: 'Admin — Reviews',    description: 'Admin review moderation' },
    { name: 'Admin — Coupons',    description: 'Admin coupon / offer management' },
    { name: 'Admin — Error Logs', description: 'Application error log viewer' },
    { name: 'Admin — Settings',   description: 'Site-wide configuration' },
  ],
  components: {
    securitySchemes: {
      CustomerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Customer JWT returned from POST /api/auth/otp/verify',
      },
      AdminAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Admin JWT returned from POST /api/auth/admin/login',
      },
    },
    schemas: {
      Error:      ErrorSchema,
      Pagination: PaginationSchema,
      Booking:    BookingSchema,
      Theater:    TheaterSchema,
      Coupon:     CouponSchema,
    },
    responses: {
      Unauthorized: {
        description: 'Missing or invalid authentication token',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      Forbidden: {
        description: 'Insufficient permissions',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      NotFound: {
        description: 'Resource not found',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      ValidationError: {
        description: 'Request validation failed',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
    },
  },
  paths: {

    // ── Health ───────────────────────────────────────────────────────────────

    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        operationId: 'healthCheck',
        responses: {
          '200': {
            description: 'Server is running',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status:    { type: 'string', example: 'ok' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ── Auth ─────────────────────────────────────────────────────────────────

    '/api/auth/otp/send': {
      post: {
        tags: ['Auth'],
        summary: 'Send OTP to customer phone',
        operationId: 'sendOtp',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['phone'],
                properties: {
                  phone: { type: 'string', example: '+919876543210', description: 'E.164 or 10-digit Indian number' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'OTP sent successfully via WhatsApp',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'OTP sent successfully' },
                    data:    { type: 'object', properties: { expiresInSeconds: { type: 'integer', example: 300 } } },
                  },
                },
              },
            },
          },
          '422': { $ref: '#/components/responses/ValidationError' },
          '429': { description: 'Rate limit exceeded — max 5 OTP requests per 15 min' },
        },
      },
    },

    '/api/auth/otp/verify': {
      post: {
        tags: ['Auth'],
        summary: 'Verify OTP and get customer JWT',
        operationId: 'verifyOtp',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['phone', 'otp'],
                properties: {
                  phone: { type: 'string', example: '+919876543210' },
                  otp:   { type: 'string', example: '482619', minLength: 6, maxLength: 6 },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Authentication successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        token:    { type: 'string', description: 'Customer JWT — include as Bearer token in subsequent requests' },
                        customer: {
                          type: 'object',
                          properties: {
                            id:    { type: 'string', format: 'uuid' },
                            phone: { type: 'string' },
                            name:  { type: 'string', nullable: true },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': { description: 'Invalid or expired OTP', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '422': { $ref: '#/components/responses/ValidationError' },
        },
      },
    },

    '/api/auth/admin/login': {
      post: {
        tags: ['Auth'],
        summary: 'Admin email + password login',
        operationId: 'adminLogin',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email:    { type: 'string', format: 'email', example: 'admin@cinenest.com' },
                  password: { type: 'string', minLength: 8, example: 'Admin@123' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        token: { type: 'string', description: 'Admin JWT' },
                        admin: {
                          type: 'object',
                          properties: {
                            id:    { type: 'string', format: 'uuid' },
                            email: { type: 'string' },
                            role:  { type: 'string', enum: ['super_admin', 'manager', 'staff'] },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '429': { description: 'Too many login attempts' },
        },
      },
    },

    // ── Theaters ──────────────────────────────────────────────────────────────

    '/api/theaters/locations': {
      get: {
        tags: ['Theaters'],
        summary: 'List all active locations',
        operationId: 'getLocations',
        responses: {
          '200': {
            description: 'List of locations',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id:                  { type: 'string', format: 'uuid' },
                          name:                { type: 'string', example: 'Hitec City' },
                          slug:                { type: 'string', example: 'hitec-city' },
                          address:             { type: 'string' },
                          googleMapsUrl:       { type: 'string', format: 'uri' },
                          googleMapsEmbedUrl:  { type: 'string', format: 'uri' },
                          latitude:            { type: 'number' },
                          longitude:           { type: 'number' },
                          googleRating:        { type: 'number', example: 4.8 },
                          googleReviewCount:   { type: 'integer', example: 320 },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/api/theaters': {
      get: {
        tags: ['Theaters'],
        summary: 'List all active theaters',
        operationId: 'getTheaters',
        parameters: [
          { name: 'locationId', in: 'query', schema: { type: 'string', format: 'uuid' }, description: 'Filter by location' },
        ],
        responses: {
          '200': {
            description: 'Array of theaters',
            content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/Theater' } } } } } },
          },
        },
      },
    },

    '/api/theaters/{id}': {
      get: {
        tags: ['Theaters'],
        summary: 'Get a single theater by ID or slug',
        operationId: 'getTheater',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Theater UUID or slug' },
        ],
        responses: {
          '200': {
            description: 'Theater detail',
            content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Theater' } } } } },
          },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    '/api/theaters/{id}/slots': {
      get: {
        tags: ['Theaters'],
        summary: 'Get slot availability for a theater on a given date',
        operationId: 'getTheaterSlots',
        parameters: [
          { name: 'id',   in: 'path',  required: true, schema: { type: 'string', format: 'uuid' } },
          { name: 'date', in: 'query', required: true, schema: { type: 'string', format: 'date', example: '2024-03-15' }, description: 'YYYY-MM-DD' },
        ],
        responses: {
          '200': {
            description: 'Slot availability list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id:          { type: 'string', format: 'uuid' },
                          slotName:    { type: 'string', example: 'Morning' },
                          startTime:   { type: 'string', example: '09:00' },
                          endTime:     { type: 'string', example: '12:00' },
                          isAvailable: { type: 'boolean' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '422': { $ref: '#/components/responses/ValidationError' },
        },
      },
    },

    // ── Bookings ──────────────────────────────────────────────────────────────

    '/api/bookings': {
      post: {
        tags: ['Bookings'],
        summary: 'Create a new booking',
        operationId: 'createBooking',
        security: [{ CustomerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['theaterId', 'timeSlotId', 'bookingDate', 'duration', 'occasion', 'guestCount', 'customerName'],
                properties: {
                  theaterId:      { type: 'string', format: 'uuid' },
                  timeSlotId:     { type: 'string', format: 'uuid' },
                  bookingDate:    { type: 'string', format: 'date', example: '2024-03-15' },
                  duration:       { type: 'string', enum: ['standard', 'short'] },
                  occasion:       { type: 'string', example: 'birthday' },
                  occasionName:   { type: 'string', example: 'Ravi' },
                  guestCount:     { type: 'integer', minimum: 1, maximum: 20, example: 4 },
                  extraAdults:    { type: 'integer', minimum: 0, example: 0 },
                  extraChildren:  { type: 'integer', minimum: 0, example: 1 },
                  customerName:   { type: 'string', example: 'Ravi Kumar' },
                  customerEmail:  { type: 'string', format: 'email' },
                  couponCode:     { type: 'string', example: 'SAVE200' },
                  addons: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['addonId', 'quantity'],
                      properties: {
                        addonId:  { type: 'string', format: 'uuid' },
                        quantity: { type: 'integer', minimum: 1 },
                      },
                    },
                  },
                  foodItems: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['foodItemId', 'quantity'],
                      properties: {
                        foodItemId: { type: 'string', format: 'uuid' },
                        quantity:   { type: 'integer', minimum: 1 },
                      },
                    },
                  },
                  cakeId:          { type: 'string', format: 'uuid' },
                  specialRequests: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Booking created — proceed to payment',
            content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Booking' } } } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '409': { description: 'Slot already booked', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '422': { $ref: '#/components/responses/ValidationError' },
          '429': { description: 'Too many booking attempts' },
        },
      },
    },

    '/api/bookings/my': {
      get: {
        tags: ['Bookings'],
        summary: 'Get current customer\'s bookings',
        operationId: 'getMyBookings',
        security: [{ CustomerAuth: [] }],
        parameters: [
          { name: 'page',   in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'confirmed', 'cancelled', 'completed'] } },
        ],
        responses: {
          '200': {
            description: 'Paginated list of customer bookings',
            content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/Booking' } }, pagination: { $ref: '#/components/schemas/Pagination' } } } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    '/api/bookings/validate-coupon': {
      post: {
        tags: ['Bookings'],
        summary: 'Validate a coupon code',
        operationId: 'validateCoupon',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['code', 'bookingAmount'],
                properties: {
                  code:          { type: 'string', example: 'SAVE200' },
                  bookingAmount: { type: 'number', example: 1499 },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Coupon valid',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        discountAmount: { type: 'integer', example: 200 },
                        finalAmount:    { type: 'integer', example: 1299 },
                        coupon:         { $ref: '#/components/schemas/Coupon' },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': { description: 'Invalid, expired, or minimum not met', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    '/api/bookings/{id}': {
      get: {
        tags: ['Bookings'],
        summary: 'Get a single booking by ID',
        operationId: 'getBooking',
        security: [{ CustomerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': { description: 'Booking detail', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Booking' } } } } } },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    '/api/bookings/{id}/cancel': {
      post: {
        tags: ['Bookings'],
        summary: 'Cancel a booking (customer)',
        operationId: 'cancelBooking',
        security: [{ CustomerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': { description: 'Booking cancelled', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' } } } } } },
          '400': { description: 'Cannot cancel — booking already completed or past window' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ── Payments ──────────────────────────────────────────────────────────────

    '/api/payments/razorpay/order': {
      post: {
        tags: ['Payments'],
        summary: 'Create a Razorpay payment order for a booking',
        operationId: 'createRazorpayOrder',
        security: [{ CustomerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['bookingId'],
                properties: {
                  bookingId: { type: 'string', format: 'uuid' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Razorpay order created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        orderId:  { type: 'string', example: 'order_ABC123' },
                        amount:   { type: 'integer', example: 70000, description: 'In paise' },
                        currency: { type: 'string', example: 'INR' },
                        key:      { type: 'string', description: 'Razorpay publishable key' },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    '/api/payments/razorpay/webhook': {
      post: {
        tags: ['Payments'],
        summary: 'Razorpay webhook callback (called by Razorpay servers)',
        operationId: 'razorpayWebhook',
        description: '**Do not call this endpoint directly.** Razorpay calls it on payment events. Raw body (not JSON parsed) is required for signature verification.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } },
        },
        responses: {
          '200': { description: 'Webhook processed' },
          '400': { description: 'Invalid signature' },
        },
      },
    },

    // ── Reviews ───────────────────────────────────────────────────────────────

    '/api/reviews': {
      get: {
        tags: ['Reviews'],
        summary: 'Get approved public reviews',
        operationId: 'getApprovedReviews',
        parameters: [
          { name: 'page',       in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'theaterId',  in: 'query', schema: { type: 'string', format: 'uuid' }, description: 'Filter by theater' },
          { name: 'rating',     in: 'query', schema: { type: 'integer', minimum: 1, maximum: 5 } },
        ],
        responses: {
          '200': {
            description: 'Approved reviews',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id:           { type: 'string', format: 'uuid' },
                          customerName: { type: 'string' },
                          theaterName:  { type: 'string' },
                          rating:       { type: 'integer', minimum: 1, maximum: 5 },
                          comment:      { type: 'string', nullable: true },
                          photoUrl:     { type: 'string', format: 'uri', nullable: true },
                          adminReply:   { type: 'string', nullable: true },
                          createdAt:    { type: 'string', format: 'date-time' },
                        },
                      },
                    },
                    pagination: { $ref: '#/components/schemas/Pagination' },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/api/reviews/submit': {
      post: {
        tags: ['Reviews'],
        summary: 'Submit a review using a one-time review token',
        operationId: 'submitReview',
        description: 'Customers receive a unique review link via WhatsApp after their experience. The token in the link is used here.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token', 'rating', 'comment'],
                properties: {
                  token:    { type: 'string', description: 'One-time token from WhatsApp review link' },
                  rating:   { type: 'integer', minimum: 1, maximum: 5, example: 5 },
                  comment:  { type: 'string', minLength: 10, maxLength: 1000, example: 'Amazing experience!' },
                  photoUrl: { type: 'string', format: 'uri' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Review submitted — pending approval' },
          '400': { description: 'Invalid or already-used token' },
          '422': { $ref: '#/components/responses/ValidationError' },
        },
      },
    },

    // ── Admin — Dashboard ─────────────────────────────────────────────────────

    '/api/admin/dashboard/stats': {
      get: {
        tags: ['Admin — Dashboard'],
        summary: 'Today\'s KPI stats',
        operationId: 'getDashboardStats',
        security: [{ AdminAuth: [] }],
        responses: {
          '200': {
            description: 'Dashboard statistics',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        todayBookings:    { type: 'integer', example: 8 },
                        todayRevenue:     { type: 'integer', example: 11200 },
                        pendingReviews:   { type: 'integer', example: 3 },
                        totalCustomers:   { type: 'integer', example: 247 },
                        monthlyRevenue:   { type: 'integer', example: 148000 },
                        occupancyRate:    { type: 'number', example: 78.5 },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    '/api/admin/dashboard/upcoming': {
      get: {
        tags: ['Admin — Dashboard'],
        summary: 'Upcoming bookings for today and tomorrow',
        operationId: 'getUpcomingBookings',
        security: [{ AdminAuth: [] }],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, maximum: 50 } },
        ],
        responses: {
          '200': {
            description: 'Upcoming bookings list',
            content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/Booking' } } } } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    // ── Admin — Bookings ──────────────────────────────────────────────────────

    '/api/admin/bookings': {
      get: {
        tags: ['Admin — Bookings'],
        summary: 'List all bookings with filters',
        operationId: 'adminListBookings',
        security: [{ AdminAuth: [] }],
        parameters: [
          { name: 'page',      in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit',     in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'status',    in: 'query', schema: { type: 'string', enum: ['pending', 'confirmed', 'cancelled', 'completed'] } },
          { name: 'theaterId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'date',      in: 'query', schema: { type: 'string', format: 'date' }, description: 'Filter by booking date (YYYY-MM-DD)' },
          { name: 'search',    in: 'query', schema: { type: 'string' }, description: 'Search by booking ref or customer phone' },
        ],
        responses: {
          '200': {
            description: 'Paginated bookings',
            content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/Booking' } }, pagination: { $ref: '#/components/schemas/Pagination' } } } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    '/api/admin/bookings/{id}': {
      get: {
        tags: ['Admin — Bookings'],
        summary: 'Get full booking detail',
        operationId: 'adminGetBooking',
        security: [{ AdminAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': { description: 'Full booking detail', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Booking' } } } } } },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    '/api/admin/bookings/{id}/status': {
      patch: {
        tags: ['Admin — Bookings'],
        summary: 'Update booking status',
        operationId: 'updateBookingStatus',
        security: [{ AdminAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['confirmed', 'completed', 'cancelled'] },
                  notes:  { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Status updated' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    '/api/admin/bookings/{id}/cancel': {
      post: {
        tags: ['Admin — Bookings'],
        summary: 'Admin cancel a booking',
        operationId: 'adminCancelBooking',
        security: [{ AdminAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { reason: { type: 'string' } },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Booking cancelled by admin' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ── Admin — Theaters ──────────────────────────────────────────────────────

    '/api/admin/theaters': {
      get: {
        tags: ['Admin — Theaters'],
        summary: 'List all theaters (including inactive)',
        operationId: 'adminListTheaters',
        security: [{ AdminAuth: [] }],
        responses: {
          '200': { description: 'All theaters', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/Theater' } } } } } } },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
      post: {
        tags: ['Admin — Theaters'],
        summary: 'Create a new theater',
        operationId: 'createTheater',
        security: [{ AdminAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['locationId', 'name', 'slug', 'screenSize', 'screenResolution', 'soundSystem', 'maxCapacity', 'basePrice', 'shortSlotPrice', 'extraAdultPrice', 'extraChildPrice', 'description', 'images'],
                properties: {
                  locationId:         { type: 'string', format: 'uuid' },
                  name:               { type: 'string' },
                  slug:               { type: 'string' },
                  screenSize:         { type: 'string' },
                  screenResolution:   { type: 'string' },
                  soundSystem:        { type: 'string' },
                  maxCapacity:        { type: 'integer' },
                  baseCapacity:       { type: 'integer', default: 4 },
                  basePrice:          { type: 'integer' },
                  shortSlotPrice:     { type: 'integer' },
                  extraAdultPrice:    { type: 'integer' },
                  extraChildPrice:    { type: 'integer' },
                  allowExtraPersons:  { type: 'boolean', default: true },
                  coupleOnly:         { type: 'boolean', default: false },
                  description:        { type: 'string' },
                  images:             { type: 'array', items: { type: 'string', format: 'uri' } },
                  youtubeUrl:         { type: 'string', format: 'uri' },
                  sortOrder:          { type: 'integer', default: 0 },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Theater created', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Theater' } } } } } },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '409': { description: 'Slug already exists' },
        },
      },
    },

    '/api/admin/theaters/{id}': {
      get: {
        tags: ['Admin — Theaters'],
        summary: 'Get theater detail',
        operationId: 'adminGetTheater',
        security: [{ AdminAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Theater detail', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Theater' } } } } } },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      put: {
        tags: ['Admin — Theaters'],
        summary: 'Update a theater',
        operationId: 'updateTheater',
        security: [{ AdminAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Theater' } } },
        },
        responses: {
          '200': { description: 'Theater updated' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Admin — Theaters'],
        summary: 'Delete (soft-delete) a theater',
        operationId: 'deleteTheater',
        security: [{ AdminAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Theater deactivated' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ── Admin — Reviews ───────────────────────────────────────────────────────

    '/api/admin/reviews': {
      get: {
        tags: ['Admin — Reviews'],
        summary: 'List reviews by status',
        operationId: 'adminListReviews',
        security: [{ AdminAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'approved', 'rejected'], default: 'pending' } },
          { name: 'page',   in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit',  in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          '200': { description: 'Reviews list', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { type: 'object' } }, pagination: { $ref: '#/components/schemas/Pagination' } } } } } },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    '/api/admin/reviews/{id}/approve': {
      post: {
        tags: ['Admin — Reviews'],
        summary: 'Approve a review',
        operationId: 'approveReview',
        security: [{ AdminAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: { type: 'object', properties: { adminReply: { type: 'string', description: 'Optional admin response shown publicly' } } },
            },
          },
        },
        responses: {
          '200': { description: 'Review approved' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    '/api/admin/reviews/{id}/reject': {
      post: {
        tags: ['Admin — Reviews'],
        summary: 'Reject a review',
        operationId: 'rejectReview',
        security: [{ AdminAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Review rejected' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ── Admin — Coupons ───────────────────────────────────────────────────────

    '/api/admin/coupons': {
      get: {
        tags: ['Admin — Coupons'],
        summary: 'List all coupons',
        operationId: 'listCoupons',
        security: [{ AdminAuth: [] }],
        responses: {
          '200': { description: 'All coupons', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/Coupon' } } } } } } },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
      post: {
        tags: ['Admin — Coupons'],
        summary: 'Create a new coupon',
        operationId: 'createCoupon',
        security: [{ AdminAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['code', 'discountType', 'discountValue', 'maxUses'],
                properties: {
                  code:             { type: 'string', example: 'SAVE200' },
                  discountType:     { type: 'string', enum: ['flat', 'percentage'] },
                  discountValue:    { type: 'integer', example: 200 },
                  minBookingAmount: { type: 'integer', default: 0 },
                  maxUses:          { type: 'integer', example: 100, description: '0 = unlimited' },
                  expiresAt:        { type: 'string', format: 'date', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Coupon created', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Coupon' } } } } } },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '409': { description: 'Coupon code already exists' },
        },
      },
    },

    '/api/admin/coupons/{id}/disable': {
      post: {
        tags: ['Admin — Coupons'],
        summary: 'Disable a coupon',
        operationId: 'disableCoupon',
        security: [{ AdminAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Coupon disabled' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ── Admin — Error Logs ────────────────────────────────────────────────────

    '/api/admin/error-logs': {
      get: {
        tags: ['Admin — Error Logs'],
        summary: 'Paginated application error logs',
        operationId: 'listErrorLogs',
        security: [{ AdminAuth: [] }],
        parameters: [
          { name: 'page',     in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit',    in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'severity', in: 'query', schema: { type: 'string', enum: ['critical', 'error', 'warning', 'info'] } },
        ],
        responses: {
          '200': {
            description: 'Error logs',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id:            { type: 'string', format: 'uuid' },
                          errorCode:     { type: 'string' },
                          severity:      { type: 'string' },
                          message:       { type: 'string' },
                          requestPath:   { type: 'string' },
                          requestMethod: { type: 'string' },
                          requestId:     { type: 'string' },
                          createdAt:     { type: 'string', format: 'date-time' },
                          errorMaster: {
                            type: 'object',
                            properties: {
                              message:     { type: 'string' },
                              severity:    { type: 'string' },
                              category:    { type: 'string' },
                              isRetryable: { type: 'boolean' },
                            },
                          },
                        },
                      },
                    },
                    pagination: { $ref: '#/components/schemas/Pagination' },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    // ── Admin — Settings ──────────────────────────────────────────────────────

    '/api/admin/settings': {
      get: {
        tags: ['Admin — Settings'],
        summary: 'Get all site settings as key-value map',
        operationId: 'getSettings',
        security: [{ AdminAuth: [] }],
        responses: {
          '200': {
            description: 'Settings map',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      additionalProperties: { type: 'string' },
                      example: {
                        site_name:          'CineNest',
                        support_phone:      '+919876543210',
                        advance_amount:     '700',
                        cancellation_hours: '24',
                      },
                    },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
      put: {
        tags: ['Admin — Settings'],
        summary: 'Update site settings (super_admin only)',
        operationId: 'updateSettings',
        security: [{ AdminAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['key', 'value'],
                  properties: {
                    key:   { type: 'string', example: 'advance_amount' },
                    value: { type: 'string', example: '800' },
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Settings saved' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
  },
};

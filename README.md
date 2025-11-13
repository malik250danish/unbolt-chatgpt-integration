# UnBolt ChatGPT Integration

This is the ChatGPT integration for UnBolt locksmith services. Users can book locksmith services directly through ChatGPT.

## Features

- 🚗 Car lockout services
- 🔑 Key programming
- 🏠 Home lockout services
- 🏢 Commercial lock services
- 💳 Secure checkout
- 📱 Real-time tracking

## API Endpoints

All endpoints follow the ChatGPT Apps SDK specification:

- `GET /v1/services` - Get available services
- `POST /v1/quotes` - Create a service quote
- `GET /v1/vehicles/taxonomy` - Get vehicle information
- `POST /v1/quotes/:id/reprice` - Update quote with add-ons
- `POST /v1/quotes/:id/promo` - Apply promo codes
- `POST /v1/bookings` - Create a booking
- `POST /v1/bookings/:id/checkout` - Start checkout process
- `GET /v1/bookings/:id` - Get booking status

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Open http://localhost:3000

## Deployment

### Heroku

```bash
git push heroku main
```

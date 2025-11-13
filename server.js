require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Get base URL for dynamic configuration
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Mock database
let quotes = [];
let bookings = [];

// 1. GET /v1/services
app.get('/v1/services', (req, res) => {
  console.log('📞 GET /v1/services called');
  
  const services = {
    services: [
      {
        id: "auto_lockout",
        name: "Car Lockout",
        category: "automobile",
        base_price: 79.99,
        description: "Emergency car lockout service - we'll get you back in your vehicle"
      },
      {
        id: "key_programming", 
        name: "Key Programming",
        category: "automobile", 
        base_price: 129.99,
        description: "Program new keys and key fobs"
      },
      {
        id: "home_lockout",
        name: "Home Lockout",
        category: "residential",
        base_price: 89.99,
        description: "Residential lockout service"
      },
      {
        id: "commercial_lockout",
        name: "Commercial Lockout", 
        category: "commercial",
        base_price: 99.99,
        description: "Business and commercial lockout service"
      }
    ]
  };
  
  res.json(services);
});

// 2. POST /v1/quotes
app.post('/v1/quotes', (req, res) => {
  console.log('📞 POST /v1/quotes called:', req.body);
  
  const { service_id, address, vehicle_make, vehicle_model, vehicle_year, key_type } = req.body;
  
  const basePrices = {
    'auto_lockout': 79.99,
    'key_programming': 129.99,
    'home_lockout': 89.99,
    'commercial_lockout': 99.99
  };
  
  const quote = {
    id: "quote_" + Date.now(),
    service_id,
    total_price: basePrices[service_id] || 99.99,
    base_price: basePrices[service_id] || 99.99,
    service_fee: 15.00,
    eta_minutes: 45,
    address,
    vehicle_info: { make: vehicle_make, model: vehicle_model, year: vehicle_year },
    key_type: key_type || 'standard'
  };
  
  quotes.push(quote);
  res.json(quote);
});

// 3. GET /v1/vehicles/taxonomy
app.get('/v1/vehicles/taxonomy', (req, res) => {
  console.log('📞 GET /v1/vehicles/taxonomy called');
  
  res.json({
    makes: ["Toyota", "Honda", "Ford", "Chevrolet", "BMW", "Mercedes", "Hyundai", "Kia"],
    models: {
      "Toyota": ["Camry", "Corolla", "RAV4", "Highlander", "Tacoma"],
      "Honda": ["Accord", "Civic", "CR-V", "Pilot", "Odyssey"],
      "Ford": ["F-150", "Explorer", "Escape", "Mustang", "Focus"],
      "Chevrolet": ["Silverado", "Equinox", "Malibu", "Tahoe", "Camaro"]
    },
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024]
  });
});

// 4. POST /v1/quotes/:id/reprice
app.post('/v1/quotes/:id/reprice', (req, res) => {
  console.log('📞 POST /v1/quotes/:id/reprice called:', req.params.id, req.body);
  
  const { id } = req.params;
  const { add_ons } = req.body;
  
  const quote = quotes.find(q => q.id === id);
  if (!quote) {
    return res.status(404).json({ error: "Quote not found" });
  }
  
  let addonPrice = 0;
  if (add_ons && add_ons.includes('remote')) addonPrice += 25;
  if (add_ons && add_ons.includes('ignition_repair')) addonPrice += 50;
  if (add_ons && add_ons.includes('lockout')) addonPrice += 20;
  
  quote.total_price = quote.base_price + addonPrice;
  quote.add_ons = add_ons;
  
  res.json(quote);
});

// 5. POST /v1/quotes/:id/promo
app.post('/v1/quotes/:id/promo', (req, res) => {
  console.log('📞 POST /v1/quotes/:id/promo called:', req.params.id, req.body);
  
  const { id } = req.params;
  const { promo_code } = req.body;
  
  const quote = quotes.find(q => q.id === id);
  if (!quote) {
    return res.status(404).json({ error: "Quote not found" });
  }
  
  let discount = 0;
  if (promo_code === "UNBOLT10") discount = 10;
  if (promo_code === "UNBOLT20") discount = 20;
  
  const discountAmount = (quote.total_price * discount) / 100;
  const finalPrice = quote.total_price - discountAmount;
  
  res.json({
    ...quote,
    promo_code,
    discount_percent: discount,
    discount_amount: parseFloat(discountAmount.toFixed(2)),
    final_price: parseFloat(finalPrice.toFixed(2))
  });
});

// 6. POST /v1/bookings
app.post('/v1/bookings', (req, res) => {
  console.log('📞 POST /v1/bookings called:', req.body);
  
  const { quote_id, customer, scheduled_time } = req.body;
  
  const booking = {
    id: "booking_" + Date.now(),
    quote_id,
    status: "confirmed",
    customer,
    scheduled_time: scheduled_time || new Date().toISOString(),
    technician_eta: 30,
    tracking_url: `${BASE_URL}/track/#${Date.now()}`,
    checkout_url: `${BASE_URL}/checkout/#${Date.now()}`
  };
  
  bookings.push(booking);
  res.json(booking);
});

// 7. POST /v1/bookings/:id/checkout
app.post('/v1/bookings/:id/checkout', (req, res) => {
  console.log('📞 POST /v1/bookings/:id/checkout called:', req.params.id);
  
  const { id } = req.params;
  
  // Simulate Stripe checkout URL
  res.json({
    checkout_url: `${BASE_URL}/success?booking_id=${id}`,
    payment_intent: "pi_test_" + Date.now(),
    status: "checkout_created"
  });
});

// 8. GET /v1/bookings/:id
app.get('/v1/bookings/:id', (req, res) => {
  console.log('📞 GET /v1/bookings/:id called:', req.params.id);
  
  const { id } = req.params;
  const booking = bookings.find(b => b.id === id);
  
  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }
  
  // Simulate status progression
  const statuses = ["confirmed", "technician_assigned", "technician_enroute", "arrived", "completed"];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  
  res.json({
    ...booking,
    status: randomStatus,
    technician_name: "John Smith",
    technician_phone: "+1-555-0123",
    current_eta: Math.floor(Math.random() * 30) + 5,
    technician_location: {
      lat: 40.7128 + (Math.random() - 0.5) * 0.01,
      lng: -74.0060 + (Math.random() - 0.5) * 0.01
    }
  });
});

// Serve AI plugin manifest
app.get('/.well-known/ai-plugin.json', (req, res) => {
  res.sendFile(path.join(__dirname, '.well-known', 'ai-plugin.json'));
});

app.get('/.well-known/openapi.yaml', (req, res) => {
  res.sendFile(path.join(__dirname, '.well-known', 'openapi.yaml'));
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/track', (req, res) => {
  res.send(`
    <html>
      <head><title>UnBolt Tracking</title></head>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h1>📱 UnBolt Tracking Page</h1>
        <p>This simulates the mobile tracking interface</p>
        <div style="background: #f0f8ff; padding: 15px; border-radius: 8px;">
          <h3>Booking Status: In Progress</h3>
          <p>Technician: John Smith</p>
          <p>ETA: 15 minutes</p>
          <p>Status: On the way</p>
        </div>
        <br>
        <a href="/" style="color: #007bff;">← Back to Test Interface</a>
      </body>
    </html>
  `);
});

app.get('/success', (req, res) => {
  res.send(`
    <html>
      <head><title>Payment Successful</title></head>
      <body style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
        <h1 style="color: #28a745;">✅ Payment Successful!</h1>
        <p>Thank you for your booking with UnBolt</p>
        <div style="background: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p>A technician will arrive shortly</p>
          <p>Booking ID: ${req.query.booking_id || 'N/A'}</p>
        </div>
        <a href="/" style="color: #007bff;">← Back to Test Interface</a>
      </body>
    </html>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 UnBolt ChatGPT Server running on ${BASE_URL}`);
  console.log(`📚 API Documentation: ${BASE_URL}/.well-known/openapi.yaml`);
  console.log(`🔧 Test Interface: ${BASE_URL}`);
  console.log(`❤️  Health Check: ${BASE_URL}/health`);
});
let currentQuoteId = null;
let currentBookingId = null;

// Detect base URL dynamically
const BASE_URL = window.location.origin;

// Update displayed base URL
document.getElementById("base-url").textContent = BASE_URL;

function log(message, type = "info") {
  const logDiv = document.getElementById("api-log");
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = document.createElement("div");
  logEntry.innerHTML = `<span class="${type}">[${timestamp}] ${message}</span>`;
  logDiv.appendChild(logEntry);
  logDiv.scrollTop = logDiv.scrollHeight;
}

async function apiCall(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

  log(`➡️ Calling: ${endpoint}`);

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    log(`✅ Success: ${endpoint}`);
    return data;
  } catch (error) {
    log(`❌ Error: ${endpoint} - ${error.message}`, "error");
    throw error;
  }
}

// 1. Get Services
async function getServices() {
  try {
    const data = await apiCall("/v1/services");
    document.getElementById("services-result").textContent = JSON.stringify(
      data,
      null,
      2
    );
    log(`📋 Found ${data.services.length} services`);
  } catch (error) {
    document.getElementById("services-result").textContent =
      "Error: " + error.message;
  }
}

// 2. Create Quote
async function createQuote() {
  const serviceId = document.getElementById("serviceSelect").value;
  const address = document.getElementById("address").value;

  if (!address) {
    alert("Please enter an address");
    return;
  }

  try {
    const data = await apiCall("/v1/quotes", {
      method: "POST",
      body: JSON.stringify({
        service_id: serviceId,
        address: address,
        vehicle_make: "Toyota",
        vehicle_model: "Camry",
        vehicle_year: 2022,
        key_type: "proximity",
      }),
    });

    currentQuoteId = data.id;
    document.getElementById("quote-result").textContent = JSON.stringify(
      data,
      null,
      2
    );
    log(`💰 Quote created: ${data.id} - Total: $${data.total_price}`);
  } catch (error) {
    document.getElementById("quote-result").textContent =
      "Error: " + error.message;
  }
}

// 3. Add Services
async function addRemote() {
  if (!currentQuoteId) {
    alert("Please create a quote first");
    return;
  }

  try {
    const data = await apiCall(`/v1/quotes/${currentQuoteId}/reprice`, {
      method: "POST",
      body: JSON.stringify({
        add_ons: ["remote"],
      }),
    });

    document.getElementById("addons-result").textContent = JSON.stringify(
      data,
      null,
      2
    );
    log(`🔑 Added remote key - New total: $${data.total_price}`);
  } catch (error) {
    document.getElementById("addons-result").textContent =
      "Error: " + error.message;
  }
}

async function addIgnitionRepair() {
  if (!currentQuoteId) {
    alert("Please create a quote first");
    return;
  }

  try {
    const data = await apiCall(`/v1/quotes/${currentQuoteId}/reprice`, {
      method: "POST",
      body: JSON.stringify({
        add_ons: ["ignition_repair"],
      }),
    });

    document.getElementById("addons-result").textContent = JSON.stringify(
      data,
      null,
      2
    );
    log(`🔧 Added ignition repair - New total: $${data.total_price}`);
  } catch (error) {
    document.getElementById("addons-result").textContent =
      "Error: " + error.message;
  }
}

async function applyPromo() {
  if (!currentQuoteId) {
    alert("Please create a quote first");
    return;
  }

  try {
    const data = await apiCall(`/v1/quotes/${currentQuoteId}/promo`, {
      method: "POST",
      body: JSON.stringify({
        promo_code: "UNBOLT10",
      }),
    });

    document.getElementById("addons-result").textContent = JSON.stringify(
      data,
      null,
      2
    );
    log(
      `🎉 Applied UNBOLT10 - Discount: $${data.discount_amount} - Final: $${data.final_price}`
    );
  } catch (error) {
    document.getElementById("addons-result").textContent =
      "Error: " + error.message;
  }
}

// 4. Create Booking
async function createBooking() {
  if (!currentQuoteId) {
    alert("Please create a quote first");
    return;
  }

  const name = document.getElementById("customerName").value;
  const phone = document.getElementById("customerPhone").value;

  if (!name || !phone) {
    alert("Please enter your name and phone number");
    return;
  }

  try {
    const data = await apiCall("/v1/bookings", {
      method: "POST",
      body: JSON.stringify({
        quote_id: currentQuoteId,
        customer: {
          name: name,
          phone: phone,
          email: "test@example.com",
        },
        scheduled_time: new Date().toISOString(),
      }),
    });

    currentBookingId = data.id;
    document.getElementById("booking-result").textContent = JSON.stringify(
      data,
      null,
      2
    );
    log(`📅 Booking created: ${data.id} - Status: ${data.status}`);
  } catch (error) {
    document.getElementById("booking-result").textContent =
      "Error: " + error.message;
  }
}

// 5. Checkout & Track
async function startCheckout() {
  if (!currentBookingId) {
    alert("Please create a booking first");
    return;
  }

  try {
    const data = await apiCall(`/v1/bookings/${currentBookingId}/checkout`, {
      method: "POST",
    });

    document.getElementById("checkout-result").textContent = JSON.stringify(
      data,
      null,
      2
    );
    log(`💳 Checkout started - Payment URL: ${data.checkout_url}`);

    // Open checkout in new window
    setTimeout(() => {
      window.open(data.checkout_url, "_blank");
    }, 1000);
  } catch (error) {
    document.getElementById("checkout-result").textContent =
      "Error: " + error.message;
  }
}

async function trackBooking() {
  if (!currentBookingId) {
    alert("Please create a booking first");
    return;
  }

  try {
    const data = await apiCall(`/v1/bookings/${currentBookingId}`);
    document.getElementById("checkout-result").textContent = JSON.stringify(
      data,
      null,
      2
    );
    log(
      `📍 Tracking - Status: ${data.status} - ETA: ${data.current_eta}min - Tech: ${data.technician_name}`
    );
  } catch (error) {
    document.getElementById("checkout-result").textContent =
      "Error: " + error.message;
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  log("🚀 UnBolt ChatGPT Test Interface Loaded");
  log(`🌐 Base URL: ${BASE_URL}`);
  log("💡 Follow the steps above to test the complete booking flow");
});

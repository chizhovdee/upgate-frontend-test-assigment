import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const TOTAL_PRODUCTS = 10000;

// Load base products once and expand them up to TOTAL_PRODUCTS.
const baseProducts = JSON.parse(
  await readFile(join(__dirname, "data.json"), "utf-8"),
);

const products = Array.from({ length: TOTAL_PRODUCTS }, (_, i) => {
  const base = baseProducts[i % baseProducts.length];
  return { ...base, id: i + 1 };
});

const validProductIds = new Set(products.map((product) => product.id));

const PATTERNS = {
  cardNumber: /^\d{16}$/, // 16 digits (spaces stripped on the client)
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  cvv: /^\d{3,4}$/, // 3 or 4 digits
  expire: /^(0[1-9]|1[0-2])\/\d{2}$/, // MM/YY
};

const validatePayment = (payload) => {
  const errors = {};
  for (const field of Object.keys(PATTERNS)) {
    const value = payload?.[field];
    if (typeof value !== "string" || !PATTERNS[field].test(value)) {
      errors[field] = "invalid";
    }
  }

  const productIds = payload?.productIds;
  const hasValidShape =
    Array.isArray(productIds) &&
    productIds.length > 0 &&
    productIds.every((id) => Number.isInteger(id));

  if (!hasValidShape) {
    errors.productIds = "invalid";
    return errors;
  }

  const hasUnknownIds = productIds.some((id) => !validProductIds.has(id));
  if (hasUnknownIds) {
    errors.productIds = "unknown_products";
  }

  return errors;
};

// Probability that any request randomly fails with 503 (unstable network).
const FAILURE_RATE = 0.3;

// Number of WAIT responses to return before SUCCESS (random, >= 3).
const randomWaitTarget = () => 3 + Math.floor(Math.random() * 5); // 3..7

// Counts WAIT responses returned so far, and the target for this session.
let waitCount = 0;
let waitTarget = randomWaitTarget();

const json = (res, status, body) => {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(body));
};

const server = createServer((req, res) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);

  // CORS preflight.
  if (req.method === "OPTIONS") {
    return json(res, 204, {});
  }

  // Any request may randomly fail with 503 to emulate an unstable network.
  if (Math.random() < FAILURE_RATE) {
    return json(res, 503, { error: "Service Unavailable" });
  }

  if (pathname === "/products") {
    return json(res, 200, products);
  }

  if (pathname === "/submit" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      let payload;
      try {
        payload = JSON.parse(body || "{}");
      } catch {
        return json(res, 400, { error: "Invalid JSON" });
      }

      const errors = validatePayment(payload);
      if (Object.keys(errors).length > 0) {
        return json(res, 400, { error: "Validation failed", fields: errors });
      }

      const { cardNumber, email, cvv, expire, productIds } = payload;
      console.log("Payment submitted:", {
        cardNumber,
        email,
        cvv,
        expire,
        productIds,
      });
      // Start a fresh polling session with a new random WAIT target.
      waitCount = 0;
      waitTarget = randomWaitTarget();
      json(res, 200, { ok: true });
    });
    return;
  }

  if (pathname === "/state") {
    // Return WAIT a random number of times (>= 3), then SUCCESS.
    if (waitCount < waitTarget) {
      waitCount += 1;
      return json(res, 200, { action: "WAIT" });
    }

    return json(res, 200, { action: "SUCCESS" });
  }

  return json(res, 404, { error: "Not Found" });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`GET /products -> ${TOTAL_PRODUCTS} products`);
  console.log("GET /state -> state of payment");
});

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const BASE_URL = 'http://localhost:3100';

const orderIds = new Map();
const errorRate = new Rate('errors');
const orderDuration = new Trend('order_duration');
const duplicateCounter = new Counter('duplicate_order_numbers');
const totalOrders = new Counter('total_orders_created');

const MENU_ITEM_ID = 'cmr4q6wrd000abenhmdlwm40p';
const SIZE_OPTION_ID = 'cmr4q6wsf000hbenhkbjxrpu2';
const SIZE_VALUE_ID = 'cmr4q6wsi000jbenhbk8am8id'; // Medium (base price, no upcharge for Latte)

export const options = {
  scenarios: {
    checkout_20: {
      executor: 'per-vu-iterations',
      vus: 20,
      iterations: 1,
      maxDuration: '30s',
      startTime: '0s',
      tags: { batch: '20' },
    },
    checkout_50: {
      executor: 'per-vu-iterations',
      vus: 50,
      iterations: 1,
      maxDuration: '30s',
      startTime: '35s',
      tags: { batch: '50' },
    },
    checkout_100: {
      executor: 'per-vu-iterations',
      vus: 100,
      iterations: 1,
      maxDuration: '30s',
      startTime: '70s',
      tags: { batch: '100' },
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    errors: ['rate<0.05'],
  },
};

export default function () {
  const payload = JSON.stringify({
    cafeSlug: 'demo-coffee',
    type: 'TAKEAWAY',
    items: [
      {
        menuItemId: MENU_ITEM_ID,
        quantity: 1,
        selectedOptions: [
          { optionId: SIZE_OPTION_ID, valueId: SIZE_VALUE_ID },
        ],
      },
    ],
  });

  const res = http.post(`${BASE_URL}/api/orders`, payload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'create_order' },
  });

  orderDuration.add(res.timings.duration);
  totalOrders.add(1);

  if (res.status === 200 || res.status === 201) {
    let body;
    try {
      body = JSON.parse(res.body);
    } catch (e) {
      errorRate.add(1);
      return;
    }

    const orderNumber = body.orderNumber;
    if (orderNumber !== undefined) {
      if (orderIds.has(orderNumber)) {
        duplicateCounter.add(1);
        console.error(`DUPLICATE order number ${orderNumber} (order ${body.orderId})`);
      }
      orderIds.set(orderNumber, body.orderId);
    }

    const ok = check(res, {
      'order created successfully': (r) => r.status === 201,
      'has orderId': (r) => JSON.parse(r.body).orderId !== undefined,
      'has orderNumber': (r) => JSON.parse(r.body).orderNumber !== undefined,
      'status is NEW': (r) => JSON.parse(r.body).status === 'NEW',
    });
    if (!ok) errorRate.add(1);
  } else {
    const ok = check(res, {
      'order rejected with clear error': (r) => {
        try {
          const b = JSON.parse(r.body);
          return b.error && typeof b.error === 'string';
        } catch (e) { return false; }
      },
    });
    if (!ok) errorRate.add(1);
    errorRate.add(1);
    console.error(`Order failed: ${res.status} ${res.body}`);
  }

  sleep(Math.random() * 2);
}

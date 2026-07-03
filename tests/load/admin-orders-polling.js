import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = 'http://localhost:3100';

const errorRate = new Rate('errors');
const pollDuration = new Trend('poll_duration');

const SESSION_COOKIE = 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6ImNtcjRxNndwbDAwMDNiZW5ocGthc2xxYjkiLCJlbWFpbCI6Im93bmVyQGRlbW9jb2ZmZWUuY29tIiwibmFtZSI6IkNhZmUgT3duZXIiLCJyb2xlIjoiQ0FGRV9PV05FUiIsImNhZmVJZCI6ImNtcjRxNndwNjAwMDFiZW5oZmF2Z2lxb2ciLCJpYXQiOjE3ODMwNzMyODMsImV4cCI6MTc4MzE1OTY4M30.D9vDCdBb1ij6m3FKgDTGtdL4hOigrT1RBhzvQedGMtg';

const COOKIE = `session=${SESSION_COOKIE}`;

export const options = {
  scenarios: {
    polling_5: {
      executor: 'constant-vus',
      vus: 5,
      duration: '2m',
      tags: { batch: '5admins' },
    },
    polling_10: {
      executor: 'constant-vus',
      vus: 10,
      duration: '2m',
      startTime: '2m30s',
      tags: { batch: '10admins' },
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    errors: ['rate<0.01'],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/api/admin/orders?activeOnly=true`, {
    headers: { Cookie: COOKIE },
    tags: { name: 'admin_orders_poll' },
  });

  pollDuration.add(res.timings.duration);

  const ok = check(res, {
    'poll returns 200': (r) => r.status === 200,
    'returns orders array': (r) => {
      try {
        const b = JSON.parse(r.body);
        return Array.isArray(b.orders);
      } catch (e) { return false; }
    },
  });
  if (!ok) errorRate.add(1);

  sleep(5);
}

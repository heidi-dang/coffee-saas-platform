import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = 'http://localhost:3100';
const CAFE_SLUG = 'demo-coffee';

const errorRate = new Rate('errors');
const menuBrowserTrend = new Trend('menu_browse_duration');
const menuLoadTrend = new Trend('menu_load_duration');

export const options = {
  stages: [
    { duration: '30s', target: 25 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<3000'],
    errors: ['rate<0.01'],
  },
};

export default function () {
  group('browse cafe page', function () {
    const res1 = http.get(`${BASE_URL}/cafe/${CAFE_SLUG}`, {
      tags: { name: 'cafe_page' },
    });
    menuBrowserTrend.add(res1.timings.duration);
    const ok1 = check(res1, {
      'cafe page returns 200': (r) => r.status === 200,
    });
    if (!ok1) errorRate.add(1);
    sleep(Math.random() * 3 + 1);
  });

  group('load menu page', function () {
    const res2 = http.get(`${BASE_URL}/cafe/${CAFE_SLUG}/order`, {
      tags: { name: 'menu_page' },
    });
    menuLoadTrend.add(res2.timings.duration);
    const ok2 = check(res2, {
      'menu page returns 200': (r) => r.status === 200,
    });
    if (!ok2) errorRate.add(1);
    sleep(Math.random() * 2 + 1);
  });
}

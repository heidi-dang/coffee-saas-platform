# Testing

Three levels:

## Unit Tests

- Money calculation
- Cart calculation
- Option validation
- Tenant helper functions
- Order status transitions

## Integration Tests

- Create order API
- Update order status API
- Menu CRUD API
- Table QR API
- Stripe webhook handler

## E2E Tests (Playwright)

Critical flow:
1. Customer opens QR URL
2. Selects item with customisations
3. Adds to cart
4. Submits pay-at-counter order
5. Sees order confirmation
6. Staff dashboard shows new order
7. Staff updates status through to completed

## Running Tests

```bash
pnpm test
pnpm test:integration
pnpm test:e2e
```

#!/bin/bash

# Simulate a Square 'invoice.payment_made' webhook event to localhost:3000
# IMPORTANT: You must have a subscription in your local DB with a matching 'squareSubscriptionId' for this to work fully.
# If you don't have one, this will just log "Subscription not found" in your server console.

SUB_ID=${1:-YOUR_TEST_SUBSCRIPTION_ID_HERE}

echo "Sending mock Square Webhook to http://localhost:3000/api/webhooks/square..."
echo "Using Subscription ID: $SUB_ID"

curl -X POST http://localhost:3000/api/webhooks/square \
  -H "Content-Type: application/json" \
  -d '{
    "type": "invoice.payment_made",
    "event_id": "test_event_id_'$(date +%s)'",
    "created_at": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
    "data": {
      "type": "invoice",
      "id": "test_invoice_id",
      "object": {
        "invoice": {
          "id": "inv_test_123",
          "subscription_id": "'"$SUB_ID"'",
          "payment_requests": [
            {
              "uid": "pay_req_123",
              "computed_amount_money": {
                "amount": 1000,
                "currency": "USD"
              }
            }
          ]
        }
      }
    }
  }'

echo -e "\n\nRequest sent. Check your Next.js server console for logs."

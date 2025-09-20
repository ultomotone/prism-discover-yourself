import test from "node:test";
import assert from "node:assert/strict";
import {
  buildFacebookDpaPayload,
  buildFacebookPayloadFromService,
  mergePurchaseDetails,
} from "../src/lib/facebook";

test("buildFacebookDpaPayload parses numeric price strings", () => {
  const payload = buildFacebookDpaPayload({
    id: "sku-123",
    name: "Sample",
    price: "$1,200.50",
  });

  assert.equal(payload.content_type, "product");
  assert.deepEqual(payload.content_ids, ["sku-123"]);
  assert.equal(payload.contents[0]?.content_price, 1200.5);
  assert.equal(payload.value, 1200.5);
  assert.equal(payload.currency, "USD");
  assert.equal(payload.contents[0]?.num_items, 1);
});

test("buildFacebookPayloadFromService handles quantity overrides", () => {
  const payload = buildFacebookPayloadFromService(
    {
      id: "service-1",
      title: "Service",
      price: "$29.00",
    },
    2,
  );

  assert.equal(payload.contents[0]?.num_items, 2);
  assert.equal(payload.contents[0]?.content_price, 29);
  assert.equal(payload.value, 58);
});

test("mergePurchaseDetails injects transaction metadata", () => {
  const base = buildFacebookDpaPayload({ id: "sku-1", name: "Test", price: "$10.00" });
  const result = mergePurchaseDetails(base, 20, "usd", {
    transaction_id: "txn_1",
    session_id: "sess",
  });

  assert(result);
  assert.equal(result?.value, 20);
  assert.equal(result?.currency, "USD");
  assert.equal(result?.transaction_id, "txn_1");
  assert.equal(result?.session_id, "sess");
});

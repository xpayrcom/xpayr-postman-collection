import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const collectionPath = new URL("../postman/xpayr_gateway_v1.postman_collection.json", import.meta.url);
const environmentPath = new URL("../postman/xpayr_gateway_v1.postman_environment.json", import.meta.url);
const collectionText = await readFile(collectionPath, "utf8");
const environmentText = await readFile(environmentPath, "utf8");
const collection = JSON.parse(collectionText);
const environment = JSON.parse(environmentText);

assert.equal(collection.info?.schema, "https://schema.getpostman.com/json/collection/v2.1.0/collection.json");
assert.ok(Array.isArray(collection.item) && collection.item.length > 0, "Collection must contain requests");

const values = Object.fromEntries(environment.values.map(({ key, value }) => [key, value]));
assert.equal(values.base_url, "https://xpayr.com/api/v1");
assert.equal(values.bearer_token, "", "Published environment must not contain an API key");

const combined = `${collectionText}\n${environmentText}`;
assert.equal(combined.includes("3web3.shop"), false, "Legacy host is forbidden");
assert.equal(/\b(?:sk|ag)_(?:test|live)_[A-Za-z0-9_-]{12,}\b/.test(combined), false, "Credential-like value detected");
const hex64Values = combined.match(/\b(?:0x)?[a-fA-F0-9]{64}\b/g) ?? [];
assert.ok(
  hex64Values.every((value) => /^0x1{64}$/.test(value)),
  "Unexpected 32-byte value detected; only the documented all-ones transaction-hash placeholder is allowed",
);

console.log(`Postman assets OK (${collection.item.length} top-level groups)`);

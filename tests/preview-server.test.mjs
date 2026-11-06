import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test, { after, before } from "node:test";
import { createPreviewServer } from "../scripts/preview-server.mjs";

let root;
let server;
let origin;

before(async () => {
  root = await mkdtemp(path.join(os.tmpdir(), "agency-preview-"));
  await mkdir(path.join(root, "assets", "css"), { recursive: true });
  await mkdir(path.join(root, "empty"), { recursive: true });
  await writeFile(path.join(root, "index.html"), "<!doctype html><title>Agency preview</title>");
  await writeFile(path.join(root, "assets", "css", "styles.css"), "body { margin: 0; }");
  await writeFile(path.join(root, "contact.php"), "<?php echo 'must not be served';");
  await writeFile(path.join(root, "secret.txt"), "outside the web root");
  server = createPreviewServer({ root });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  origin = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  if (server?.listening) {
    await new Promise((resolve) => server.close(resolve));
  }
  if (root) await rm(root, { recursive: true, force: true });
});

test("serves the homepage with an HTML content type", async () => {
  const response = await fetch(`${origin}/`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /text\/html/);
  assert.match(await response.text(), /Agency preview/);
});

test("serves nested assets with the expected content type", async () => {
  const response = await fetch(`${origin}/assets/css/styles.css`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /text\/css/);
  assert.match(await response.text(), /margin: 0/);
});

test("does not execute or disclose PHP source", async () => {
  const response = await fetch(`${origin}/contact.php`);
  assert.equal(response.status, 501);
  assert.doesNotMatch(await response.text(), /must not be served/);
});

test("does not expose directory listings", async () => {
  const response = await fetch(`${origin}/empty/`);
  assert.equal(response.status, 404);
});

test("rejects hidden paths and traversal attempts", async () => {
  const hidden = await fetch(`${origin}/.git/config`);
  assert.equal(hidden.status, 404);
  const traversal = await fetch(`${origin}/%2e%2e/secret.txt`);
  assert.notEqual(traversal.status, 200);
  assert.doesNotMatch(await traversal.text(), /outside the web root/);
});

test("rejects methods other than GET and HEAD", async () => {
  const response = await fetch(`${origin}/`, { method: "POST" });
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "GET, HEAD");
});

test("supports HEAD without returning a response body", async () => {
  const response = await fetch(`${origin}/`, { method: "HEAD" });
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "");
});

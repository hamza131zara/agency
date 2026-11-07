import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile, access } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { buildNetlifySite } from "../scripts/build-netlify.mjs";

async function createFixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), "sdc-netlify-build-"));
  await mkdir(path.join(root, "assets", "css"), { recursive: true });
  await mkdir(path.join(root, "services"), { recursive: true });
  await mkdir(path.join(root, "scripts"), { recursive: true });
  await writeFile(path.join(root, "index.html"), '<!doctype html><head><title>Agency — Home</title><meta property="og:title" content="Agency — Home"><link rel="icon" type="image/svg+xml" href="assets/favicon.svg"></head><a class="brand"><span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="brand-name">AGENCY<span>.</span><small>SOFTWARE · AI · DESIGN</small></span></a><a class="brand footer-brand"><span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="brand-name">AGENCY<span>.</span><small>SOFTWARE · AI · DESIGN</small></span></a><span class="atlas-hub-mark">A.</span><footer>© <span id="year"></span> Agency. All rights reserved.</footer><form id="inquiry-form" action="contact.php" method="post"><input name="website"><button type="submit">Prepare inquiry</button></form>');
  await writeFile(
    path.join(root, "contact.html"),
    '<form id="inquiry-form" action="contact.php" method="post" novalidate><input name="website"><button type="submit">Send</button></form><p>The form submits to the PHP endpoint on the website. The official recipient address must be configured on the hosting server before messages can be sent.</p>'
  );
  await writeFile(path.join(root, "contact.php"), "<?php echo 'private PHP source';");
  await writeFile(path.join(root, "config.example.php"), "<?php return ['secret' => 'example'];");
  await writeFile(path.join(root, ".htaccess"), "Options -Indexes");
  await writeFile(path.join(root, "README.md"), "Internal project notes");
  await writeFile(path.join(root, "robots.txt"), "User-agent: *");
  await writeFile(path.join(root, "sitemap.xml"), "<urlset />");
  await writeFile(path.join(root, "_headers"), "/*\n  X-Content-Type-Options: nosniff");
  await writeFile(path.join(root, "assets", "css", "styles.css"), "body { margin: 0; }");
  await writeFile(path.join(root, "services", "software.html"), "<h1>Software</h1>");
  await writeFile(path.join(root, "scripts", "internal.mjs"), "throw new Error('must not be copied')");
  return root;
}

test("builds a static Netlify artifact without PHP, private config or developer files", async () => {
  const root = await createFixture();
  const outputDirectory = path.join(root, "dist");
  try {
    const result = await buildNetlifySite({ root, outputDirectory });
    assert.equal(result.phpFilesPublished, 0);
    assert.equal(result.rootPages, 2);
    const homepage = await readFile(path.join(outputDirectory, "index.html"), "utf8");
    assert.match(homepage, /<title>SDC — Home<\/title>/);
    assert.match(homepage, /property="og:title" content="SDC — Home"/);
    assert.ok(homepage.includes('<img class="brand-logo" src="/assets/brand/sdc-logo.svg"'));
    assert.ok(homepage.includes('<img class="brand-logo brand-logo-footer" src="/assets/brand/sdc-logo-footer.svg"'));
    assert.match(await readFile(path.join(outputDirectory, "assets", "brand", "sdc-logo-footer.svg"), "utf8"), /fill="#ffffff"/);
    assert.ok(homepage.includes('<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">'));
    assert.ok(homepage.includes('theme-color" content="#fcfaf6"'));
    assert.match(homepage, /<span class="atlas-hub-mark">SDC<\/span>/);
    assert.match(homepage, /© <span id="year"><\/span> SDC\. All rights reserved/);
    assert.doesNotMatch(homepage, /AGENCY<span>/);
    assert.match(homepage, /<form id="inquiry-form"[^>]*name="sdc-home-inquiry"/);
    assert.match(homepage, /data-netlify="true"/);
    assert.match(homepage, /data-delivery="netlify"/);
    assert.match(homepage, /netlify-honeypot="website"/);
    assert.match(homepage, /name="form-name" value="sdc-home-inquiry"/);
    assert.ok(homepage.includes('action="/"'));
    assert.doesNotMatch(homepage, /action="contact\\.php"/);
    assert.match(await readFile(path.join(outputDirectory, "assets", "css", "styles.css"), "utf8"), /margin: 0/);
    assert.match(await readFile(path.join(outputDirectory, "services", "software.html"), "utf8"), /Software/);
    assert.match(await readFile(path.join(outputDirectory, "robots.txt"), "utf8"), /User-agent/);
    assert.match(await readFile(path.join(outputDirectory, "_headers"), "utf8"), /nosniff/);

    const contact = await readFile(path.join(outputDirectory, "contact.html"), "utf8");
    assert.match(contact, /name="sdc-contact-inquiry"/);
    assert.match(contact, /data-netlify="true"/);
    assert.match(contact, /data-delivery="netlify"/);
    assert.match(contact, /netlify-honeypot="website"/);
    assert.match(contact, /name="form-name" value="sdc-contact-inquiry"/);
    assert.match(contact, /action="\/"/);
    assert.match(contact, /hosted form service/);
    assert.doesNotMatch(contact, /action="contact\.php"/);

    const homeFormName = homepage.match(/<form[^>]*name="([^"]+)"/)?.[1];
    const contactFormName = contact.match(/<form[^>]*name="([^"]+)"/)?.[1];
    assert.ok(homeFormName && contactFormName && homeFormName !== contactFormName, "homepage and contact forms must have unique Netlify names");

    for (const forbidden of ["contact.php", "config.example.php", ".htaccess", "README.md", "scripts/internal.mjs"]) {
      await assert.rejects(access(path.join(outputDirectory, forbidden)));
    }
    const builtContact = await readFile(path.join(outputDirectory, "contact.html"), "utf8");
    assert.doesNotMatch(builtContact, /private PHP source|REPLACE_WITH|Internal project notes/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("fails closed when the source contact form is missing", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "sdc-netlify-missing-form-"));
  const outputDirectory = path.join(root, "dist");
  try {
    await writeFile(path.join(root, "index.html"), "<h1>SDC</h1>");
    await writeFile(path.join(root, "contact.html"), "<h1>No contact form</h1>");
    await assert.rejects(
      buildNetlifySite({ root, outputDirectory }),
      /cannot find the #inquiry-form/
    );
    await assert.rejects(access(outputDirectory));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

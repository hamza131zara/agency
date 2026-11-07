import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = fileURLToPath(new URL("../", import.meta.url));
const STATIC_DIRECTORIES = ["assets", "products", "services", "work"];
const STATIC_ROOT_FILES = new Set(["_headers", "robots.txt", "sitemap.xml"]);

function configureSdcBranding(html) {
  const logo = '<span class="sdc-brand-lockup"><img class="sdc-brand-image" src="/assets/brand/sdc-logo.webp" alt="" aria-hidden="true" width="512" height="578" fetchpriority="high"><span class="sdc-brand-wordmark"><strong>SOFTWARE</strong><strong>DAMAGE</strong><strong>CONTROL</strong><small>DIGITAL ENGINEERING AGENCY</small></span></span>';
  const footerLogo = '<span class="sdc-brand-lockup sdc-brand-lockup--footer"><img class="sdc-brand-image" src="/assets/brand/sdc-logo.webp" alt="" aria-hidden="true" width="512" height="578" loading="lazy" decoding="async"><span class="sdc-brand-wordmark"><strong>SOFTWARE</strong><strong>DAMAGE</strong><strong>CONTROL</strong><small>DIGITAL ENGINEERING AGENCY</small></span></span>';
  let result = html.replace(
    /(<a\b(?=[^>]*\bclass=["'][^"']*\bfooter-brand\b[^"']*["'])[^>]*>)[\s\S]*?(<\/a>)/g,
    `$1${footerLogo}$2`
  );
  result = result.replace(
    /<span class="brand-mark" aria-hidden="true">[\s\S]*?<\/span>\s*<span class="brand-name">AGENCY<span>\.<\/span><small>SOFTWARE\s*·\s*AI\s*·\s*DESIGN<\/small><\/span>/g,
    logo
  );
  result = result.replace(
    /<span class="brand-name">AGENCY<span>\.<\/span><small>SOFTWARE\s*·\s*AI\s*·\s*DESIGN<\/small><\/span>/g,
    '<span class="brand-name">SDC<span>.</span><small>SOFTWARE DAMAGE CONTROL</small></span>'
  );
  result = result.replace(/(<title[^>]*>)([\s\S]*?)(<\/title>)/i, (whole, open, title, close) =>
    open + title.replace(/\bAgency\b/g, "SDC") + close
  );
  result = result.replace(/(<meta\s+property=["']og:title["']\s+content=["'])([^"']*)(["'][^>]*>)/i, (whole, open, title, close) =>
    open + title.replace(/\bAgency\b/g, "SDC") + close
  );
  result = result.replace(/(©\s*<span id="year"><\/span>\s*)Agency(\. All rights reserved\.)/i, "$1SDC$2");
  result = result.replace('<span class="atlas-hub-mark">A.</span>', '<span class="atlas-hub-mark">SDC</span>');
  if (/<link rel="icon"[^>]*>/i.test(result)) {
    result = result.replace(/<link rel="icon"[^>]*>/i, '<link rel="icon" type="image/webp" href="/assets/favicon.webp">');
  } else {
    result = result.replace(/(<head\b[^>]*>)/i, '$1<link rel="icon" type="image/webp" href="/assets/favicon.webp">');
  }
  if (/<meta name="theme-color"/i.test(result)) {
    result = result.replace(/<meta name="theme-color" content="[^"]*">/i, '<meta name="theme-color" content="#FCFAF6">');
  } else {
    result = result.replace(/(<head\b[^>]*>)/i, '$1<meta name="theme-color" content="#fcfaf6">');
  }
  return result;
}

async function assembleOwnerSuppliedBrandAssets(outputRoot) {
  const sourceDirectory = path.join(outputRoot, "assets", "brand", "source-parts");
  async function decodeParts(prefix) {
    const names = (await readdir(sourceDirectory))
      .filter((name) => name.startsWith(prefix + "-") && name.endsWith(".b64"))
      .sort();
    if (!names.length) throw new Error(`Missing owner-supplied ${prefix} image source parts.`);
    let encoded = "";
    for (const name of names) encoded += (await readFile(path.join(sourceDirectory, name), "utf8")).trim();
    const bytes = Buffer.from(encoded, "base64");
    if (bytes.length < 100) throw new Error(`Owner-supplied ${prefix} image did not decode correctly.`);
    if (bytes.subarray(0, 4).toString("ascii") !== "RIFF" || bytes.subarray(8, 12).toString("ascii") !== "WEBP") {
      throw new Error(`Owner-supplied ${prefix} asset is not a valid WebP image.`);
    }
    return bytes;
  }
  const [logoBytes, faviconBytes] = await Promise.all([decodeParts("logo"), decodeParts("favicon")]);
  await writeFile(path.join(outputRoot, "assets", "brand", "sdc-logo.webp"), logoBytes);
  await writeFile(path.join(outputRoot, "assets", "favicon.webp"), faviconBytes);
  await rm(sourceDirectory, { recursive: true, force: true });
}

function setAttribute(tag, name, value) {
  const attribute = new RegExp(`\\s+${name}=(?:"[^"]*"|'[^']*'|[^\\s>]+)`, "i");
  const encoded = `${name}="${value}"`;
  return attribute.test(tag) ? tag.replace(attribute, ` ${encoded}`) : tag.replace(/>$/, ` ${encoded}>`);
}

function configureNetlifyContactForm(html, { required = false, formName = "sdc-project-inquiry" } = {}) {
  const formPattern = /<form\b(?=[^>]*\bid=["']inquiry-form["'])[^>]*>/i;
  const match = html.match(formPattern);
  if (!match) {
    if (required) {
      throw new Error("Netlify build cannot find the #inquiry-form element in contact.html.");
    }
    return html;
  }

  let openingTag = match[0];
  openingTag = setAttribute(openingTag, "name", formName);
  openingTag = setAttribute(openingTag, "method", "post");
  openingTag = setAttribute(openingTag, "action", "/");
  openingTag = setAttribute(openingTag, "data-netlify", "true");
  openingTag = setAttribute(openingTag, "data-delivery", "netlify");
  openingTag = setAttribute(openingTag, "netlify-honeypot", "website");

  let replacement = openingTag;
  if (!/\bname=["']form-name["']/i.test(html)) {
    replacement += `<input type="hidden" name="form-name" value="${formName}">`;
  }

  let result = html.replace(formPattern, replacement);
  result = result.replace(
    "The form submits to the PHP endpoint on the website. The official recipient address must be configured on the hosting server before messages can be sent.",
    "Your inquiry is processed by the website's hosted form service. Submission acceptance does not guarantee that someone has read or replied to your message."
  );

  return result;
}

export async function buildNetlifySite({ root = PROJECT_ROOT, outputDirectory = path.join(root, "dist") } = {}) {
  const projectRoot = path.resolve(root);
  const outputRoot = path.resolve(outputDirectory);
  const relativeOutput = path.relative(projectRoot, outputRoot);

  if (!relativeOutput || relativeOutput === ".." || relativeOutput.startsWith(`..${path.sep}`) || path.isAbsolute(relativeOutput)) {
    throw new Error("Netlify output directory must be a child of the project root.");
  }

  try {
    await rm(outputRoot, { recursive: true, force: true });
    await mkdir(outputRoot, { recursive: true });
  
    const entries = await readdir(projectRoot, { withFileTypes: true });
    const publicRootFiles = entries
      .filter((entry) => entry.isFile() && (entry.name.toLowerCase().endsWith(".html") || STATIC_ROOT_FILES.has(entry.name)))
      .map((entry) => entry.name);
  
    for (const name of publicRootFiles) {
      await cp(path.join(projectRoot, name), path.join(outputRoot, name));
    }
  
    for (const name of STATIC_DIRECTORIES) {
      const source = path.join(projectRoot, name);
      try {
        await cp(source, path.join(outputRoot, name), { recursive: true, force: true, errorOnExist: false });
      } catch (error) {
        if (error?.code !== "ENOENT") throw error;
      }
    }
  
    await assembleOwnerSuppliedBrandAssets(outputRoot);

    async function transformPublicHtml(directory, relative = "") {
      for (const entry of await readdir(directory, { withFileTypes: true })) {
        const filePath = path.join(directory, entry.name);
        const childRelative = path.posix.join(relative, entry.name);
        if (entry.isDirectory()) {
          await transformPublicHtml(filePath, childRelative);
        } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".html")) {
          let html = await readFile(filePath, "utf8");
          html = configureSdcBranding(html);
          const formName = childRelative === "contact.html" ? "sdc-contact-inquiry" : "sdc-home-inquiry";
          html = configureNetlifyContactForm(html, { required: childRelative === "contact.html", formName });
          await writeFile(filePath, html, "utf8");
        }
      }
    }
    await transformPublicHtml(outputRoot);

    const stylesheet = path.join(outputRoot, "assets", "css", "styles.css");
    try {
      const css = await readFile(stylesheet, "utf8");
      await writeFile(stylesheet, css + "\n/* Fit the SDC text mark inside the existing atlas hub. */\n.atlas-hub-mark { font-size: clamp(13px, 1.25vw, 18px); }\n", "utf8");
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }

    const mainScript = path.join(outputRoot, "assets", "js", "main.js");
    try {
      const script = await readFile(mainScript, "utf8");
      await writeFile(
        mainScript,
        script.replaceAll("AGENCY — PROJECT INQUIRY", "SDC — PROJECT INQUIRY").replaceAll("agency-inquiry-", "sdc-inquiry-"),
        "utf8"
      );
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }

    const forbidden = [];
    async function inspect(directory, relative = "") {
      for (const entry of await readdir(directory, { withFileTypes: true })) {
        const childRelative = path.posix.join(relative, entry.name);
        if (entry.isDirectory()) {
          await inspect(path.join(directory, entry.name), childRelative);
        } else if (/\.(?:php|env)$/i.test(entry.name) || /(^|\/)config(?:\.|$)/i.test(childRelative)) {
          forbidden.push(childRelative);
        }
      }
    }
    await inspect(outputRoot);
  
    if (forbidden.length) {
      await rm(outputRoot, { recursive: true, force: true });
      throw new Error(`Netlify output contains server/private files: ${forbidden.join(", ")}`);
    }
  
    return {
      outputDirectory: outputRoot,
      rootPages: publicRootFiles.filter((name) => name.endsWith(".html")).length,
      copiedDirectories: STATIC_DIRECTORIES.length,
      phpFilesPublished: 0,
    };
  } catch (error) {
    await rm(outputRoot, { recursive: true, force: true });
    throw error;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = await buildNetlifySite();
    console.log(`Netlify static site built at ${result.outputDirectory}`);
    console.log(`Root HTML pages: ${result.rootPages}; PHP/private files published: ${result.phpFilesPublished}`);
    console.log("The static contact form is configured for Netlify Forms.");
  } catch (error) {
    console.error(`Netlify build failed: ${error.message}`);
    process.exitCode = 1;
  }
}

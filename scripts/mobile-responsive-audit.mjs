/**
 * One-off mobile responsive audit — run: node scripts/mobile-responsive-audit.mjs
 */
import { chromium, devices } from "playwright";
import fs from "fs";
import path from "path";

const BASE_URL = process.env.E2E_BASE_URL || "http://localhost:3002";
const OUT_DIR = path.join(process.cwd(), "test-results", "mobile-responsive-audit");

const VIEWPORTS = [
  { name: "iPhone SE", width: 375, height: 667 },
  { name: "iPhone 14", width: 390, height: 844 },
  { name: "Android small", width: 360, height: 640 },
];

const STATIC_PATHS = [
  { path: "/", label: "หน้าแรก" },
  { path: "/cars", label: "รถยนต์" },
  { path: "/blog", label: "บล็อก" },
  { path: "/branches", label: "สาขา" },
  { path: "/contact", label: "ติดต่อ" },
  { path: "/booking", label: "จอง" },
  { path: "/about", label: "เกี่ยวกับ" },
  { path: "/insurance", label: "ประกัน" },
  { path: "/secondhand", label: "มือสอง" },
  { path: "/stories", label: "เรื่องราว" },
  { path: "/login", label: "เข้าสู่ระบบ" },
  { path: "/admin", label: "แอดมิน (redirect)" },
];

async function discoverSlugs(page) {
  const slugs = { car: null, blog: null };
  await page.goto(`${BASE_URL}/cars`, { waitUntil: "networkidle", timeout: 60000 });
  const carHref = await page
    .locator('a[href^="/cars/"]')
    .filter({ hasNot: page.locator('[href="/cars"]') })
    .first()
    .getAttribute("href")
    .catch(() => null);
  if (carHref && /^\/cars\/[^/]+$/.test(carHref)) slugs.car = carHref;

  await page.goto(`${BASE_URL}/blog`, { waitUntil: "networkidle", timeout: 60000 });
  const blogHref = await page
    .locator('a[href^="/blog/"]')
    .filter({ hasNot: page.locator('[href="/blog"]') })
    .first()
    .getAttribute("href")
    .catch(() => null);
  if (blogHref && /^\/blog\/[^/]+$/.test(blogHref)) slugs.blog = blogHref;

  return slugs;
}

async function auditPage(page, urlPath, viewport, label) {
  const issues = [];
  const url = `${BASE_URL}${urlPath}`;

  try {
    const res = await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
    const status = res?.status() ?? 0;
    if (status >= 400) {
      issues.push({ severity: "critical", msg: `HTTP ${status}` });
      return { status: "fail", issues, httpStatus: status };
    }
  } catch (e) {
    issues.push({ severity: "critical", msg: `โหลดไม่สำเร็จ: ${e.message}` });
    return { status: "fail", issues };
  }

  const metrics = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const vw = window.innerWidth;
    const scrollW = Math.max(doc.scrollWidth, body?.scrollWidth ?? 0);
    const overflowPx = scrollW - vw;
    const smallButtons = [];
    document.querySelectorAll("button, a[role='button'], input[type='submit']").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && r.width < 44 && r.height < 44) {
        const text = (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 40);
        if (text) smallButtons.push({ text, w: Math.round(r.width), h: Math.round(r.height) });
      }
    });
    const imgs = [];
    document.querySelectorAll("img").forEach((img) => {
      if (img.naturalWidth > 0 && img.clientWidth > 0 && img.naturalWidth > img.clientWidth * 1.5) {
        const r = img.getBoundingClientRect();
        if (r.right > vw + 2) imgs.push({ alt: img.alt?.slice(0, 30) || "(no alt)", right: Math.round(r.right) });
      }
    });
    const footer = document.querySelector("footer");
    const footerBroken = footer
      ? footer.getBoundingClientRect().width > vw + 4
      : false;
    return {
      overflowPx,
      scrollW,
      vw,
      smallButtons: smallButtons.slice(0, 8),
      imgs: imgs.slice(0, 5),
      footerBroken,
      hasFooter: !!footer,
    };
  });

  if (metrics.overflowPx > 2) {
    issues.push({
      severity: "critical",
      msg: `เลื่อนแนวนอน ${metrics.overflowPx}px (scrollWidth ${metrics.scrollW} > viewport ${metrics.vw})`,
    });
  } else if (metrics.overflowPx > 0) {
    issues.push({
      severity: "warn",
      msg: `overflow เล็กน้อย ${metrics.overflowPx}px`,
    });
  }

  if (metrics.footerBroken) {
    issues.push({ severity: "warn", msg: "Footer กว้างเกิน viewport" });
  }

  if (metrics.imgs.length > 0) {
    issues.push({
      severity: "warn",
      msg: `รูปล้น viewport: ${metrics.imgs.map((i) => i.alt).join(", ")}`,
    });
  }

  if (metrics.smallButtons.length >= 3) {
    issues.push({
      severity: "warn",
      msg: `ปุ่มเล็กกว่า 44px หลายจุด (${metrics.smallButtons.length}+)`,
      detail: metrics.smallButtons,
    });
  }

  // Mobile nav (only on first viewport per page — caller handles)
  let navOk = null;

  const hasCritical = issues.some((i) => i.severity === "critical");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const status = hasCritical ? "fail" : hasWarn ? "warn" : "pass";

  return { status, issues, metrics, navOk, finalUrl: page.url() };
}

async function testMobileNav(page, viewport) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle", timeout: 60000 });
  const menuBtn = page.locator("nav button.lg\\:hidden").first();
  if ((await menuBtn.count()) === 0) {
    return { ok: false, msg: "ไม่พบปุ่มเมนูมือถือ" };
  }
  await menuBtn.click();
  const mobilePanel = page.locator("nav .lg\\:hidden.bg-white.border-t").first();
  const visible = await mobilePanel.isVisible().catch(() => false);
  if (!visible) return { ok: false, msg: "เปิดเมนูแล้วไม่เห็นแผงเมนู" };
  const linkCount = await mobilePanel.locator("a").count();
  const homeLink = mobilePanel.getByRole("link", { name: "หน้าแรก" });
  const homeVisible = await homeLink.isVisible().catch(() => false);
  if (!homeVisible || linkCount < 5) {
    return { ok: false, msg: `ลิงก์ในเมนูไม่ครบ (พบ ${linkCount} ลิงก์)` };
  }
  return { ok: true, linkCount };
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ...devices["iPhone SE"] });
  const page = await context.newPage();

  console.log(`Auditing ${BASE_URL} ...`);
  const slugs = await discoverSlugs(page);
  const paths = [...STATIC_PATHS];
  if (slugs.car) paths.push({ path: slugs.car, label: `รายละเอียดรถ ${slugs.car}` });
  if (slugs.blog) paths.push({ path: slugs.blog, label: `บทความ ${slugs.blog}` });

  const report = {
    baseUrl: BASE_URL,
    note: "Production www.ch-erawan.com ยังเป็น WordPress — /cars 404; ทดสอบ local dev",
    slugs,
    viewports: VIEWPORTS.map((v) => v.name),
    pages: [],
    navTests: [],
    generatedAt: new Date().toISOString(),
  };

  // Mobile nav on iPhone SE only
  const navResult = await testMobileNav(page, VIEWPORTS[0]);
  report.navTests.push({ viewport: VIEWPORTS[0].name, ...navResult });

  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    for (const { path: urlPath, label } of paths) {
      const key = `${urlPath}@${vp.name}`;
      const result = await auditPage(page, urlPath, vp, label);
      if (result.status !== "pass") {
        const safeName = key.replace(/[^a-zA-Z0-9-_]/g, "_");
        await page.screenshot({ path: path.join(OUT_DIR, `${safeName}.png`), fullPage: true });
      }
      report.pages.push({
        path: urlPath,
        label,
        viewport: vp.name,
        ...result,
      });
      console.log(`[${vp.name}] ${urlPath}: ${result.status}`);
    }
  }

  await browser.close();
  const jsonPath = path.join(OUT_DIR, "report.json");
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  console.log(`\nReport: ${jsonPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

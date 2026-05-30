const urls = [
  "https://www.gwm.co.th/en/models/haval-h6",
  "https://www.gwm.co.th/en/models/ora-good-cat",
  "https://www.gwm.co.th/en/models/tank-300",
  "https://www.mazda.co.th/",
  "https://www.ford.co.th/",
  "https://www.mitsubishi-motors.co.th/",
  "https://www.deepal.co.th/",
  "https://www.kia.com/th/th/main.html",
];

for (const u of urls) {
  try {
    const res = await fetch(u, { headers: { "User-Agent": "Mozilla/5.0" } });
    const html = await res.text();
    const imgs = [...html.matchAll(/https?:\/\/[^"'\s>]+\.(?:jpg|jpeg|png|webp)/gi)]
      .map((m) => m[0])
      .filter((x) => !x.includes("icon") && !x.includes("logo") && !x.includes("favicon"))
      .slice(0, 10);
    console.log("\n===", u, "===");
    console.log(imgs.join("\n"));
  } catch (e) {
    console.log(u, e.message);
  }
}

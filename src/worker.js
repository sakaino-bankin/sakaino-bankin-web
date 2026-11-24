// お問い合わせフォームの送信を受けて、メールで知らせる Worker。
// それ以外のアクセスは public/ のファイルをそのまま返す。
// 送信先アドレスはリポジトリに書かず、Cloudflare の変数 CONTACT_TO に入れる。
import { EmailMessage } from "cloudflare:email";

const FROM = "form@sakaino-bankin.com";

const b64 = (s) => {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
};
const wrap76 = (s) => s.replace(/.{1,76}/g, "$&\r\n");
const encWord = (s) => `=?UTF-8?B?${b64(s)}?=`;
const clean = (v, max) => String(v ?? "").replace(/\r\n?/g, "\n").trim().slice(0, max);

function buildMail(to, f) {
  const subject = `【HPお問い合わせ】${f.name} 様（${f.kind}）`;
  const body = [
    "ホームページのお問い合わせフォームから送信がありました。",
    "",
    `お名前：${f.name}`,
    `電話番号：${f.tel}`,
    `工事場所：${f.place || "（未記入）"}`,
    `ご相談内容：${f.kind}`,
    "",
    "詳しい内容：",
    f.message || "（未記入）",
    "",
    "――",
    "このメールに返信しても、お客さまには届きません。お電話でご連絡ください。",
  ].join("\n").replace(/\n/g, "\r\n");
  return [
    `From: ${encWord("境野建築板金 HP")} <${FROM}>`,
    `To: <${to}>`,
    `Subject: ${encWord(subject)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@sakaino-bankin.com>`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    wrap76(b64(body)),
  ].join("\r\n");
}

const json = (status, obj) =>
  new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json; charset=utf-8" } });

async function contact(request, env) {
  if (request.method !== "POST") return json(405, { ok: false });
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).hostname.replace(/^www\./, "") !== "sakaino-bankin.com") return json(403, { ok: false });
  let form;
  try { form = await request.formData(); } catch { return json(400, { ok: false }); }
  // ロボット対策：人には見えない欄に入力があれば、送ったふりをして捨てる
  if (clean(form.get("website"), 100)) return json(200, { ok: true });
  const f = {
    name: clean(form.get("name"), 60),
    tel: clean(form.get("tel"), 30),
    place: clean(form.get("place"), 100),
    kind: clean(form.get("kind"), 40) || "その他",
    message: clean(form.get("message"), 3000),
  };
  if (!f.name || !/^[0-9０-９+\-−ー() ]{9,20}$/.test(f.tel)) return json(400, { ok: false });
  if (!env.CONTACT_TO || !env.SEND_EMAIL) return json(503, { ok: false });
  const raw = buildMail(env.CONTACT_TO, f);
  await env.SEND_EMAIL.send(new EmailMessage(FROM, env.CONTACT_TO, raw));
  return json(200, { ok: true });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/contact") {
      try { return await contact(request, env); }
      catch (e) { console.error(e); return json(500, { ok: false }); }
    }
    return env.ASSETS.fetch(request);
  },
};

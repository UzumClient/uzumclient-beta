// POST /api/payments/frontend/create?token=&id=&paymentType=[&promoCode=][&inputBoxEmail=]
// Records the order in Supabase payments, returns Telegram URL (manual payment).
const { sb } = require("../../_sb");
const { tariffByType } = require("../../_shop");

async function sessionUser(token) {
  const rows = await sb(
    "/rest/v1/web_sessions?select=user_id,profiles(id,email,username)&token=eq." +
      encodeURIComponent(token)
  );
  if (!rows.length || !rows[0].profiles) return null;
  return rows[0].profiles;
}

module.exports = async (req, res) => {
  try {
    const { token, id, paymentType, promoCode, inputBoxEmail } = req.query;
    if (!token) return res.status(400).send("Session expired.");
    const u = await sessionUser(token);
    if (!u) return res.status(400).send("Session expired.");
    const t = tariffByType(id);
    if (!t) return res.status(400).send("Unknown product.");
    let price = t.price;
    let promoTxt = "";
    if (promoCode) {
      const pr = await sb(
        "/rest/v1/promos?select=value,discount,outActive,outDate&value=eq." +
          encodeURIComponent(promoCode)
      );
      if (pr.length && (pr[0].outActive == null || pr[0].outActive > 0)) {
        const pct = pr[0].discount || 0;
        price = Math.round((price * (100 - pct)) / 100);
        promoTxt = " Promo: " + promoCode + " (-" + pct + "%)";
      }
    }
    await sb("/rest/v1/payments", {
      method: "POST",
      body: JSON.stringify({
        user_id: u.id,
        plan: t.plan,
        amount: price,
        check_path: "catlavan-pending",
      }),
    });
    const msg =
      "Assalomu alaykum! UZUM CLIENT sotib olmoqchiman." +
      " Tarif: " + t.plan + " (" + price + ")." +
      promoTxt +
      " Email: " + u.email;
    return res
      .status(200)
      .send("https://t.me/UZUMCLIENTSUPPORT?text=" + encodeURIComponent(msg));
  } catch (e) {
    return res.status(400).send("Create payment failed.");
  }
};

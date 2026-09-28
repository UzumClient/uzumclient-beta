// POST /api/payments/promocodes/apply?token=&code=
const { sb } = require("../../../lib/sb");

module.exports = async (req, res) => {
  try {
    const { token, code } = req.query;
    if (!token || !code) return res.status(404).send("PROMO_CODE_NOT_FOUND");
    const s = await sb(
      "/rest/v1/web_sessions?select=user_id&token=eq." + encodeURIComponent(token)
    );
    if (!s.length) return res.status(404).send("PROMO_CODE_NOT_FOUND");
    const pr = await sb(
      "/rest/v1/promos?select=value,discount,outActive,outDate&value=eq." +
        encodeURIComponent(code)
    );
    if (!pr.length) return res.status(404).send("PROMO_CODE_NOT_FOUND");
    const p = pr[0];
    if ((p.outActive != null && p.outActive <= 0) ||
        (p.outDate && new Date(p.outDate) <= new Date())) {
      return res.status(404).send("PROMO_CODE_NOT_FOUND");
    }
    return res.status(200).send("Promocode applied: -" + (p.discount || 0) + "%.");
  } catch (e) {
    return res.status(404).send("PROMO_CODE_NOT_FOUND");
  }
};

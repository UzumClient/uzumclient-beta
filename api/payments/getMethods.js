// GET /api/payments/getMethods? (token cookie) — payment methods
const { sb } = require("../../lib/sb");

const METHODS = [
  { displayName: "Click", enumName: "CLICK" },
  { displayName: "Payme", enumName: "PAYME" },
  { displayName: "Uzum Bank", enumName: "UZUM" },
];

module.exports = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(200).json(METHODS);
    const rows = await sb(
      "/rest/v1/web_sessions?select=user_id&token=eq." + encodeURIComponent(token)
    );
    if (!rows.length) return res.status(400).send("Session expired.");
    return res.status(200).json(METHODS);
  } catch (e) {
    return res.status(400).send("Failed.");
  }
};

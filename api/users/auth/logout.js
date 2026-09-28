// POST /api/users/auth/logout?token=
const { sb } = require("../../_sb");

module.exports = async (req, res) => {
  try {
    const { token } = req.query;
    if (token) {
      await sb(
        "/rest/v1/web_sessions?token=eq." + encodeURIComponent(token),
        { method: "DELETE" }
      );
    }
    return res.status(200).send("OK");
  } catch (e) {
    return res.status(200).send("OK");
  }
};

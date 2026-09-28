// POST /api/users/auth/session?token=
const { sb } = require("../../_sb");
const { userJson } = require("../../_user");

module.exports = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).send("Session expired.");
    const rows = await sb(
      "/rest/v1/web_sessions?select=user_id,profiles(id,seq,username,email,role,sub_until,hwid,banned_hwid,created_at)&token=eq." +
        encodeURIComponent(token)
    );
    if (!rows.length || !rows[0].profiles) {
      return res.status(400).send("Session expired.");
    }
    return res.status(200).json(userJson(rows[0].profiles, token));
  } catch (e) {
    return res.status(400).send("Session expired.");
  }
};

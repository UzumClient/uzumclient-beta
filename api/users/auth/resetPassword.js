// POST /api/users/auth/resetPassword?email=&newPassword=
const { sb } = require("../../_sb");

module.exports = async (req, res) => {
  try {
    const { email, newPassword } = req.query;
    if (!email || !newPassword || newPassword.length < 6) {
      return res.status(400).send("Required fields are missing.");
    }
    const rows = await sb(
      "/rest/v1/profiles?select=id&email=ilike." + encodeURIComponent(email)
    );
    if (!rows.length) return res.status(400).send("User not found.");
    await sb("/auth/v1/admin/users/" + rows[0].id, {
      method: "PUT",
      body: JSON.stringify({ password: newPassword }),
    });
    await sb("/rest/v1/web_sessions?user_id=eq." + rows[0].id, { method: "DELETE" });
    return res.status(200).send("Password changed.");
  } catch (e) {
    return res.status(400).send("Reset failed.");
  }
};

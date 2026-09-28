// POST /api/users/auth/register?hCaptcha=&username=&password=&email=
const { sb } = require("../../_sb");
const { userJson } = require("../../_user");

async function getProfile(id) {
  for (let i = 0; i < 10; i++) {
    const rows = await sb(
      "/rest/v1/profiles?select=id,seq,username,email,role,sub_until,hwid,banned_hwid,created_at&id=eq." + id
    );
    if (rows.length) return rows[0];
    await new Promise((r) => setTimeout(r, 300));
  }
  return null;
}

module.exports = async (req, res) => {
  try {
    const { username, password, email } = req.query;
    if (!username || !password || !email) {
      return res.status(400).send("Required fields are missing.");
    }
    let u;
    try {
      u = await sb("/auth/v1/admin/users", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          email_confirm: true,
          user_metadata: { username },
        }),
      });
    } catch (e) {
      const m = String((e.body && (e.body.msg || e.body.message)) || "");
      if (/already|exists|registered/i.test(m)) {
        return res.status(400).send("Email is already linked to another user.");
      }
      throw e;
    }
    const p = await getProfile(u.id);
    if (!p) return res.status(400).send("Registration failed, try again.");
    const s = await sb("/rest/v1/web_sessions", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ user_id: p.id }),
    });
    const out = userJson(p, s[0].token);
    out.authMessage = "You have successfully registered.";
    return res.status(200).json(out);
  } catch (e) {
    return res.status(400).send("Registration failed.");
  }
};

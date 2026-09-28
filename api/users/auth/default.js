// POST /api/users/auth/default?hCaptcha=&username=&password=  (login)
const { sb } = require("../../_sb");
const { userJson } = require("../../_user");

module.exports = async (req, res) => {
  try {
    const { username, password } = req.query;
    if (!username || !password) {
      return res.status(400).send("Required fields are missing.");
    }
    let email = username;
    if (!username.includes("@")) {
      try {
        email = await sb(
          "/rest/v1/rpc/login_email",
          { method: "POST", body: JSON.stringify({ p_login: username }) },
          true
        );
      } catch (e) {
        return res.status(400).send("Invalid login or password.");
      }
      if (typeof email !== "string" || !email.includes("@")) {
        return res.status(400).send("Invalid login or password.");
      }
    }
    let s;
    try {
      s = await sb(
        "/auth/v1/token?grant_type=password",
        { method: "POST", body: JSON.stringify({ email, password }) },
        true
      );
    } catch (e) {
      return res.status(400).send("Invalid login or password.");
    }
    if (!s.user) return res.status(400).send("Invalid login or password.");
    const rows = await sb(
      "/rest/v1/profiles?select=id,seq,username,email,role,sub_until,hwid,banned_hwid,created_at&id=eq." +
        s.user.id
    );
    if (!rows.length) return res.status(400).send("Invalid login or password.");
    const sess = await sb("/rest/v1/web_sessions", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ user_id: rows[0].id }),
    });
    const out = userJson(rows[0], sess[0].token);
    out.authMessage = "You have successfully authorized.";
    return res.status(200).json(out);
  } catch (e) {
    return res.status(400).send("Authorization failed.");
  }
};

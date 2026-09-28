// GET /api/payments/getAll — tariff list (public)
const { TARIFFS } = require("../../_shop");

module.exports = async (req, res) => {
  return res.status(200).json(
    TARIFFS.map((t) => {
      const o = { type: t.type, price: t.price };
      if (t.time != null) o.time = t.time;
      return o;
    })
  );
};

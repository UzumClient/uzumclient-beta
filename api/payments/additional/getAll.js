// GET /api/payments/additional/getAll — no additional products
module.exports = async (req, res) => {
  return res.status(200).json([]);
};

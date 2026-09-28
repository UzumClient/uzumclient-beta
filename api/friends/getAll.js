// POST /api/friends/getAll?token= (no friends system -> empty)
module.exports = async (req, res) => {
  return res.status(200).json([]);
};

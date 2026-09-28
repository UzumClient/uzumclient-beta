module.exports = async (req, res) => {
  res.status(200).json({
    ok: true,
    node: process.version,
    hasUrl: !!process.env.SUPABASE_URL,
    hasSvc: !!process.env.SUPABASE_SERVICE_KEY,
    hasAnon: !!process.env.SUPABASE_ANON_KEY,
  });
};

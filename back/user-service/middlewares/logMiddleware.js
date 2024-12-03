const logMiddleware = (req, res, next) => {
  console.log(`[INFO] Request : ${req.method} ${req.url}`);
  res.on("finish", () => {
    console.warn(
      `[SUCCESS] Response status: ${res.statusCode} : ${res.statusMessage}`
    );
  });
  next();
};

module.exports = logMiddleware;

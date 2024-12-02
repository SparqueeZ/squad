const logMiddleware = (req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  res.on("finish", () => {
    console.log(`Response status: ${res.statusCode} : ${res.statusMessage}`);
  });
  next();
};

module.exports = logMiddleware;

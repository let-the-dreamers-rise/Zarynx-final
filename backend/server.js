const { config } = require("./config");
const app = require("./app");

app.listen(config.port, () => {
  console.log(`ZARYNX backend listening on http://localhost:${config.port}`);
});

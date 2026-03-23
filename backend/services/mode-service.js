const { config } = require("../config");

const isMockMode = () => config.mockMode;

module.exports = {
  isMockMode,
};

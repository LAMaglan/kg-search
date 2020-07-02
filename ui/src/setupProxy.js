const proxy = require("http-proxy-middleware");

module.exports = function(app) {
  app.use(proxy("/search/proxy", {
    //target: "https://kg.ebrains.eu",
    //target: "https://kg-dev.humanbrainproject.eu",
    target: "https://kg-int.humanbrainproject.eu",
    // target:"http://localhost:9000",
    // pathRewrite: { "^/search/proxy": "/proxy" },
    secure:false,
    changeOrigin: true }));
  app.use(proxy("/search/auth", {
    //target: "https://kg.ebrains.eu",
    //target: "https://kg-dev.humanbrainproject.eu",
    target: "https://kg-int.humanbrainproject.eu",
    // target:"http://localhost:9000",
    // pathRewrite: { "^/search/auth": "/auth" },
    secure:false,
    changeOrigin: true }));
  app.use(proxy("/query", {
    // target: "https://kg.ebrains.eu",
    // target: "https://kg-dev.humanbrainproject.eu",
    target: "https://kg-int.humanbrainproject.eu",
    // target:"http://localhost:9000",
    changeOrigin: true,
    ws: true }));
  app.use(proxy("/proxy", {
    // target: "https://kg.ebrains.eu",
    //target: "https://kg-dev.humanbrainproject.eu",
    target: "https://kg-int.humanbrainproject.eu",
    // target:"http://localhost:9000",
    changeOrigin: true,
    ws: true }));
};
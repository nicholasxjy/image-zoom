module.exports = {
  plugins: [
    require("autoprefixer")({
      browsers: [">= 5%", "last 2 versions", "iOS >= 8", "Safari >= 8"]
    })
  ]
};

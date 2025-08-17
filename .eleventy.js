// .eleventy.js
module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addWatchTarget("src/assets");

  return {
    dir: {
      input: "src",
      includes: "_includes",
      layouts: "_includes/layouts",   // ← KRİTİK: layout kökü burası
      data: "_data",
      output: "dist",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};

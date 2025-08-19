// .eleventy.js
module.exports = function (eleventyConfig) {
  // Statik kopyalamalar
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });
  eleventyConfig.addPassthroughCopy({ "src/favicon.ico": "favicon.ico" });

  // TR tarih: 20 Ağustos 2025
  eleventyConfig.addNunjucksFilter("dateTR", (d) => {
    try {
      return new Intl.DateTimeFormat("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(d);
    } catch {
      return d;
    }
  });

  // ISO tarih: 2025-08-20T00:00:00.000Z (time datetime="" için)
  eleventyConfig.addNunjucksFilter("dateISO", (d) => {
    try {
      return new Date(d).toISOString();
    } catch {
      return new Date(String(d)).toISOString();
    }
  });

  return {
    dir: {
      input: "src",
      output: "dist",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk", "md", "html", "liquid"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};

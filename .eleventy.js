module.exports = function (eleventyConfig) {
   // Admin ve uploads klasörü “passthrough”
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
eleventyConfig.addPassthroughCopy({ "node_modules/decap-cms/dist/decap-cms.js": "admin/decap-cms.js" });

  // Koleksiyon: sadece src/posts/*.md
  eleventyConfig.addCollection("posts", (api) =>
    api.getFilteredByGlob("src/posts/*.md")
  );

  // TR tarih
  eleventyConfig.addFilter("dateTR", (dateObj) => {
    try {
      return new Intl.DateTimeFormat("tr-TR", { day:"2-digit", month:"long", year:"numeric" })
        .format(new Date(dateObj));
    } catch { return ""; }
  });
  // ISO tarih (meta için)
  eleventyConfig.addFilter("dateISO", (d) => new Date(d).toISOString());

  return {
    dir: { input: "src", output: "dist", includes: "_includes" },
    templateFormats: ["njk","md","html","liquid"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    passthroughFileCopy: true,
  };
};

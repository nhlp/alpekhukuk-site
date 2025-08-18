module.exports = function (eleventyConfig) {
  // statik dosyalar
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });

  // Koleksiyon: sadece src/posts/*.md
  eleventyConfig.addCollection("posts", (api) =>
    api.getFilteredByGlob("src/posts/*.md")
  );

  // TR tarih
  eleventyConfig.addFilter("dateTR", (d) => {
    const dt = new Date(d);
    return dt.toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });
  });

  // ISO tarih (meta için)
  eleventyConfig.addFilter("dateISO", (d) => new Date(d).toISOString());

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "dist" },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};

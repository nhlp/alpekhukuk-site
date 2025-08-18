module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy({"src/assets": "assets"});
  eleventyConfig.addPassthroughCopy({"src/admin": "admin"});
eleventyConfig.addLayoutAlias("base", "layouts/base.njk");
eleventyConfig.addLayoutAlias("post", "layouts/post.njk");

  // TR tarih filtresi
  eleventyConfig.addFilter("dateTR", (dateObj, opts = {}) => {
    try {
      return new Intl.DateTimeFormat("tr-TR", { dateStyle: "long", ...opts }).format(dateObj);
    } catch {
      return (dateObj instanceof Date) ? dateObj.toISOString().slice(0,10) : String(dateObj);
    }
  });

  // Etiket filtre yardımcı
  eleventyConfig.addFilter("filterByTag", (collection, tag) => {
    return (collection || []).filter(p => (p.data.tags || []).includes(tag));
  });

  // Makaleler koleksiyonu
  eleventyConfig.addCollection("makaleler", (api) => {
    return api.getFilteredByGlob("src/makaleler/*.md").sort((a, b) => b.date - a.date);
  });

  // Tüm etiketler
  eleventyConfig.addCollection("tagList", (api) => {
    const set = new Set();
    api.getFilteredByGlob("src/makaleler/*.md").forEach(p => {
      (p.data.tags || []).forEach(t => set.add(t));
    });
    return [...set].sort();
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "dist"
    },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    passthroughFileCopy: true
  };
};

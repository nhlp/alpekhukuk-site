// src/posts/posts.11tydata.js
module.exports = {
  layout: "layouts/post.njk",
  tags: ["posts"],
  permalink: (data) => `/makaleler/${data.page.fileSlug}/`,
};

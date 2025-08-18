module.exports = {
  filterByTag(collection, tag) {
    return (collection || []).filter(p => (p.data.tags || []).includes(tag));
  }
};

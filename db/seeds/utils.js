const db = require("../../db/connection");

exports.convertTimestampToDate = ({ created_at, ...otherProperties }) => {
  if (!created_at) return { ...otherProperties };
  return { created_at: new Date(created_at), ...otherProperties };
};

exports.createArticlesLookupObj = (articleData) => {
  const lookup = {};
  articleData.forEach((article) => {
    lookup[article.title] = article.article_id;
  });
  return lookup;
};




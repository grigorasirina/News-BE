const db = require("../db/connection")

const fetchTopics = (queries) => {
    let queryStr = `SELECT slug, description, img_url FROM topics`
    return db.query(queryStr).then(({rows}) => {
        return rows
    })
    
}


const fetchArticleById = (articleId) => {
    const queryStr = `
      SELECT
        articles.article_id,
        articles.title,
        articles.topic,
        articles.author,
        articles.body,
        articles.created_at,
        articles.votes,
        articles.article_img_url
      FROM articles
      WHERE articles.article_id = $1;
    `;
    const values = [articleId]
  
    return db.query(queryStr, values)
      .then(({ rows }) => {
        if (rows.length === 0) {
          return Promise.reject({ status: 404, msg: 'Article not found' });
        }
        return rows[0]; // Return the single article object
      });
  };


module.exports = {fetchTopics, fetchArticleById};







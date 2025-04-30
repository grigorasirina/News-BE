const db = require("../db/connection")
const articles = require("../db/data/test-data/articles")

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


  const fetchArticles = () => {
    const queryStr = `
      SELECT
        articles.author,
        articles.title,
        articles.article_id,
        articles.topic,
        articles.created_at,
        articles.votes,
        articles.article_img_url,
        CAST(COUNT(comments.comment_id) AS INTEGER) AS comment_count
      FROM articles
      LEFT JOIN comments ON articles.article_id = comments.article_id
      GROUP BY articles.article_id
      ORDER BY articles.created_at DESC;
    `;
  
    return db.query(queryStr)
      .then(({ rows }) => {
        return rows
      })
      .catch((err) => {
        console.error("DB Error:", err);
        throw err; // Re-throw the error to be caught by the controller
      })
  }


module.exports = {fetchTopics, fetchArticleById, fetchArticles};







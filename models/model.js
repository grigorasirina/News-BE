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
        return rows[0]
      })
  }


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
        console.error("DB Error:", err)
        throw err
      })
  }


  const fetchArticleComments = (articleId) => {
    const queryStr = `
      SELECT
        comment_id,
        votes,
        created_at,
        author,
        body,
        article_id
      FROM comments
      WHERE article_id = $1
      ORDER BY created_at DESC;
    `;
    const values = [articleId]
  
    return db.query(queryStr, values)
      .then(({ rows }) => {
        return rows
      })
      .catch((err) => {
        console.error("DB Error:", err)
        throw err 
      })
  }


  const fetchUserByUsername = (username) => {
    const queryStr = `SELECT * FROM users WHERE username = $1`
    const values = [username]
    return db.query(queryStr, values).then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "User not found" })
      }
      return rows[0]
    });
  };

 const addArticleComment = (articleId, username, body) => {
   const queryStr = `
     INSERT INTO comments (article_id, author, body)
     VALUES ($1, $2, $3)
     RETURNING *;
   `;
   const values = [articleId, username, body];
   return db.query(queryStr, values)
     .then(({ rows }) => {
       return rows[0]
     })
     .catch((err) => {
       console.error("DB Error:", err);
       throw err
     })
 }


module.exports = {fetchTopics, fetchArticleById, fetchArticles, fetchArticleComments, fetchUserByUsername, addArticleComment};







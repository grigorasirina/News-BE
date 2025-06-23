const db = require("../db/connection");
const articles = require("../db/data/test-data/articles");

const fetchTopics = () => {
  let queryStr = `SELECT slug, description, img_url FROM topics`;
  return db.query(queryStr).then(({ rows }) => {
    return rows;
  });
};

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
  const values = [articleId];

  return db.query(queryStr, values).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Article not found" });
    }
    return rows[0];
  });
};

const fetchArticles = (
  sort_by = "created_at",
  order = "desc",
  topic = null
) => {
  const validSortColumns = [
    "article_id",
    "title",
    "topic",
    "author",
    "created_at",
    "votes",
    "comment_count",
  ];

  const validOrderValues = ["asc", "desc"];

  if (!validSortColumns.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Invalid sort_by query" });
  }

  if (!validOrderValues.includes(order.toLowerCase())) {
    return Promise.reject({ status: 400, msg: "Invalid order query" });
  }

  let queryStr = `
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
    `;

  const queryValues = [];
  let whereClause = "";
  let queryIndex = 1;

  if (topic) {
    whereClause += ` WHERE articles.topic = $${queryIndex++}`;
    queryValues.push(topic);
  }

  queryStr += whereClause;
  queryStr += `
    GROUP BY articles.article_id
    ORDER BY articles.${sort_by} ${order.toUpperCase()};
  `;

  return db
    .query(queryStr, queryValues)
    .then(({ rows }) => {
      return rows;
    })
    .catch((err) => {
      console.error("DB Error:", err);
      throw err;
    });
};

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
  const values = [articleId];
  return db.query(queryStr, values).then(({ rows }) => {
    console.log(rows, "rows");
    return rows;
  });
};

const fetchUserByUsername = (username) => {
  const queryStr = `SELECT * FROM users WHERE username = $1`;
  const values = [username];
  return db.query(queryStr, values).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "User not found" });
    }
    return rows[0];
  });
};

const addArticleComment = (articleId, username, body) => {
  const queryStr = `
     INSERT INTO comments (article_id, author, body)
     VALUES ($1, $2, $3)
     RETURNING *;
   `;
  const values = [articleId, username, body];
  return db.query(queryStr, values).then(({ rows }) => {
    return rows[0];
  });
};

const updateArticleVotes = (articleId, inc_votes) => {
  const queryStr = `
    UPDATE articles
    SET votes = votes + $1
    WHERE article_id = $2
    RETURNING *;
  `;
  const values = [inc_votes, articleId];

  return db.query(queryStr, values).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Article not found" });
    }
    return rows[0];
  });
};

const removeCommentById = (commentId) => {
  const queryStr = `
    DELETE FROM comments
    WHERE comment_id = $1
    RETURNING *;
  `;
  const values = [commentId];

  return db.query(queryStr, values).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Comment not found" });
    }
  });
};

module.exports = {
  fetchTopics,
  fetchArticleById,
  fetchArticles,
  fetchArticleComments,
  fetchUserByUsername,
  addArticleComment,
  updateArticleVotes,
  removeCommentById,
};

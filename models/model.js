const db = require("../db/connection");
const articles = require("../db/data/test-data/articles");


const checkTopicExists = (topic) => {
  if (!topic) return Promise.resolve(true);
  return db
    .query("SELECT * FROM topics WHERE slug = $1;", [topic])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Topic not found" });
      }
      return true; 
    });
};

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

  return checkTopicExists(topic).then(() => {
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
  })
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

exports.fetchAllUsers = () => {
  return db.query('SELECT * FROM users;').then(({ rows }) => rows);
};

const getUsers = (req, res, next) => {
  return fetchAllUsers() 
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch(next);
};


const updateCommentVotes = (comment_id, inc_votes) => {
  return db.query(
    `UPDATE comments
     SET votes = votes + $1
     WHERE comment_id = $2
     RETURNING *;`,
    [inc_votes, comment_id]
  )
  .then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: 'Comment not found' });
    }
    return rows[0];
  });
};


const insertArticle = (author, title, body, topic, article_img_url) => {
  const default_img_url =
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1000&q=80"; // Example default
  const final_article_img_url = article_img_url || default_img_url;

  return db.query(
    `INSERT INTO articles
       (author, title, body, topic, article_img_url)
     VALUES
       ($1, $2, $3, $4, $5)
     RETURNING article_id, author, title, body, topic, article_img_url, votes, created_at;`, // Don't forget to return created_at and votes (default 0)
    [author, title, body, topic, final_article_img_url]
  )
  .then(({ rows }) => {
    const newArticle = { ...rows[0], comment_count: 0 };
    return newArticle;
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
  updateCommentVotes,
  getUsers,
  insertArticle,
};

const endpoints = require("../endpoints.json");
const {
  fetchTopics,
  fetchArticleById,
  fetchArticles,
  fetchArticleComments,
  fetchUserByUsername,
  addArticleComment,
  updateArticleVotes,
  removeCommentById,
} = require("../models/model");

const getApi = (req, res) => {
  res.status(200).send({ endpoints });
};

const getTopics = (req, res) => {
  return fetchTopics(req.query)
    .then((topics) => {
      res.status(200).send({ topics: topics });
    })
    .catch((err) => {
      console.error("Error fetching topics:", err);
      res.status(500).send({ msg: "Internal Server Error" });
    });
};

const getArticleById = (req, res) => {
  const { article_id } = req.params;

  if (isNaN(article_id)) {
    return res.status(400).send({ msg: "Invalid article ID format" });
  }

  return fetchArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      if (err.status === 404) {
        return res.status(404).send({ msg: err.msg });
      } else {
        console.error("Error fetching article:", err);
        return res.status(500).send({ msg: "Internal Server Error" });
      }
    });
};

const getArticles = (req, res, next) => {
  const { sort_by, order, topic } = req.query;
  return fetchArticles(sort_by, order, topic)
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch((err) => {
      console.error("Error fetching articles:", err);
      if (err.status === 400) {
        return res.status(400).send({ msg: err.msg });
      }
      next(err);
    });
};

const getArticleComments = (req, res, next) => {
  const { article_id } = req.params;
  if (isNaN(article_id)) {
    return res.status(400).send({ msg: "Invalid article ID format" });
  }
  return fetchArticleComments(article_id)
    .then((comments) => {
      if (!comments || comments.length === 0) {
        return fetchArticleById(article_id)
          .then(() => {
            res.status(200).send({ comments: [] });
          })
          .catch(() => {
            res.status(404).send({ msg: "Article not found" });
          });
      }
      res.status(200).send({ comments });
    })
    .catch((err) => {
      console.error("Error fetching article comments:", err);
      next(err);
    });
};

const getUsers = (req, res, next) => {
  return fetchUserByUsername()
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch(next);
};

const postArticleComment = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;

  if (isNaN(article_id)) {
    return res.status(400).send({ msg: "Invalid article ID format" });
  }

  if (!username || !body) {
    return res.status(400).send({ msg: "Missing required fields" });
  }
  return fetchArticleById(article_id)
    .then(() => {
      return fetchUserByUsername(username);
    })
    .then(() => {
      return addArticleComment(article_id, username, body);
    })
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch((err) => {
      if (err.status === 404) {
        return res.status(404).send({ msg: err.msg });
      }
      console.error("Error posting article comment:", err);
      next(err);
    });
};

const patchArticleById = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;

  if (isNaN(article_id)) {
    return res.status(400).send({ msg: "Invalid article ID format" });
  }

  if (inc_votes === undefined) {
    return res.status(400).send({ msg: "Missing inc_votes" });
  }

  if (typeof inc_votes !== "number") {
    return res.status(400).send({ msg: "Invalid inc_votes value" });
  }

  updateArticleVotes(article_id, inc_votes)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      if (err.status === 404) {
        return res.status(404).send({ msg: err.msg });
      }
      next(err);
    });
};

const deleteCommentById = (req, res, next) => {
  const { comment_id } = req.params;

  if (isNaN(comment_id)) {
    return res.status(400).send({ msg: "Invalid comment ID format" });
  }

  removeCommentById(comment_id)
    .then(() => {
      res.status(204).send();
    })
    .catch((err) => {
      if (err.status === 404) {
        return res.status(404).send({ msg: err.msg });
      }
      next(err);
    });
};

module.exports = {
  getApi,
  getTopics,
  getArticleById,
  getArticles,
  getArticleComments,
  postArticleComment,
  patchArticleById,
  deleteCommentById,
  getUsers,
};

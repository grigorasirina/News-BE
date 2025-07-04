const articlesRouter = require("express").Router();
const {
  getArticles,
  getArticleById,
  patchArticleById,
  getArticleComments,
  postArticleComment,
  postArticle,
  deleteArticleById,
} = require("../controllers/controllers");

articlesRouter
.route("/")
.get(getArticles)
.post(postArticle);

articlesRouter
  .route("/:article_id")
  .get(getArticleById)
  .patch(patchArticleById)
  .delete(deleteArticleById); 

articlesRouter
  .route("/:article_id/comments")
  .get(getArticleComments)
  .post(postArticleComment);

module.exports = articlesRouter;

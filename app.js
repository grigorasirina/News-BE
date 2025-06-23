const db = require("./db/connection")
const express = require("express");
const app = express();
const {getApi, getTopics, getArticleById, getArticles, getArticleComments, postArticleComment, patchArticleById} =require("./controllers/controllers")
const sorted = require("jest-sorted")
const apiRouter = require('./routes/api-router');

app.use(express.json())

app.use('/api', apiRouter); 

app.get('/api/articles/:article_id', getArticleById)

app.get('/api/articles', getArticles)

app.get('/api/articles/:article_id/comments', getArticleComments)

app.post('/api/articles/:article_id/comments', postArticleComment)

app.patch('/api/articles/:article_id', patchArticleById)


module.exports = app
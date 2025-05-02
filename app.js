const db = require("./db/connection")
const express = require("express");
const app = express();
const {getApi, getTopics, getArticleById, getArticles, getArticleComments, postArticleComment} =require("./controllers/controllers")
const sorted = require("jest-sorted")

app.use(express.json())

app.get("/api", getApi);

app.get("/api/topics", getTopics)

app.get('/api/articles/:article_id', getArticleById)

app.get('/api/articles', getArticles)

app.get('/api/articles/:article_id/comments', getArticleComments)

app.post('/api/articles/:article_id/comments', postArticleComment)


module.exports = app
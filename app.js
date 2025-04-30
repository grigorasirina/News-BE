const db = require("./db/connection")
const express = require("express");
const app = express();
const {getApi, getTopics, getArticleById, getArticles} =require("./controllers/controllers")
const sorted = require("jest-sorted")


app.get("/api", getApi);

app.get("/api/topics", getTopics)

app.get('/api/articles/:article_id', getArticleById)

app.get('/api/articles', getArticles)

app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).send({ msg: 'Internal Server Error' });
  })


module.exports = app
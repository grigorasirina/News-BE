const db = require("./db/connection")
const express = require("express");
const app = express();
const {getApi, getTopics, getArticleById} =require("./controllers/controllers")


app.get("/api", getApi);

app.get("/api/topics", getTopics)

app.get('/api/articles/:article_id', getArticleById)


module.exports = app
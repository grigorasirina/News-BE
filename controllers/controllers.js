const endpoints = require("../endpoints.json")
const {fetchTopics, fetchArticleById, fetchArticles, fetchArticleComments} = require("../models/model")

const getApi =(req, res) =>{
    res.status(200).send({endpoints})
  };


  const getTopics = (req, res) => {
    return fetchTopics(req.query).then((topics) => {
      res.status(200).send({topics: topics})
    })
    .catch((err) => {
      console.error("Error fetching topics:", err)
      res.status(500).send({ msg: "Internal Server Error" })
    });
  }


  const getArticleById = (req, res) => {
    const { article_id } = req.params 
    
  if (isNaN(article_id)) {
    return res.status(400).send({ msg: 'Invalid article ID format' })
  }
  
    return fetchArticleById(article_id)
      .then((article) => {
        res.status(200).send({ article }) 
      })
      .catch((err) => {
        if (err.status === 404) {
          return res.status(404).send({ msg: err.msg })
        } else {
          console.error("Error fetching article:", err)
          return res.status(500).send({ msg: "Internal Server Error" })
        }
      })
  }


  const getArticles = (req, res, next) => {
    return fetchArticles(req.query)
      .then((articles) => {
        res.status(200).send({ articles });
      })
      .catch((err) => {
        console.error("Error fetching articles:", err)
        next(err)
      })
  }


  const getArticleComments = (req, res, next) => {
    const { article_id } = req.params
    if (isNaN(article_id)) {
      return res.status(400).send({ msg: 'Invalid article ID format' });
    }
    return fetchArticleComments(article_id)
      .then((comments) => {
        if (!comments || comments.length === 0) {
          return fetchArticleById(article_id)
            .then(() => {
              res.status(200).send({ comments: [] })
            })
            .catch(() => {
               res.status(404).send({ msg: 'Article not found' })
            })
  
        }
        res.status(200).send({ comments })
      })
      .catch((err) => {
        console.error("Error fetching article comments:", err);
        next(err)
      })

  }


module.exports ={getApi, getTopics, getArticleById, getArticles, getArticleComments}



const endpoints =require("../endpoints.json")
const {fetchTopics, fetchArticleById} = require("../models/model")

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
    const { article_id } = req.params // Extract the article_id from req.params

    // Check if article_id is a valid number
  if (isNaN(article_id)) {
    return res.status(400).send({ msg: 'Invalid article ID format' })
  }
  
    return fetchArticleById(article_id)
      .then((article) => {
        res.status(200).send({ article }) // Send the retrieved article in the response
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


module.exports ={getApi, getTopics, getArticleById}



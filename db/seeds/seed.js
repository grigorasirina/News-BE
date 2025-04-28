const db = require("../connection");
const format = require("pg-format")
const { values } = require("../data/test-data/articles");

const seed = ({ topicData, userData, articleData, commentData }) => {
    //drop databases for topics, users, articles, comments
    return db.query('DROP TABLE IF EXISTS comments')
    .then(() => {
    return db.query('DROP TABLE IF EXISTS articles')
    .then(()=> {
    return db.query('DROP TABLE IF EXISTS users')
      })
    .then(()=> {
    return db.query('DROP TABLE IF EXISTS topics')
    })


    //create tables for topics, users, articles,comments
    .then(()=> {
    return db.query(`CREATE TABLE topics (
      slug VARCHAR(40) PRIMARY KEY,
      description VARCHAR(100),
      img_url VARCHAR(1000));`)
  })


  .then(()=> {
    return db.query(`CREATE TABLE users (
      username VARCHAR(30) PRIMARY KEY ,
      name VARCHAR (80),
      avatar_url VARCHAR(1000))`)
  })


  .then(()=> {
    return db.query(`CREATE TABLE articles (
      article_ID SERIAL PRIMARY KEY,
      title VARCHAR(100),
      topic VARCHAR(40) REFERENCES topics(slug),
      author VARCHAR(30) REFERENCES users(username) ,
      body TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      votes INT DEFAULT 0,
      article_img_url VARCHAR(1000)
      )`)
  })


  .then(()=> {
    return db.query(`CREATE TABLE comments (
      comment_id SERIAL PRIMARY KEY,
      article_id INT REFERENCES articles(article_ID),
      body TEXT,
      votes INT DEFAULT 0,
      author VARCHAR(30) REFERENCES users(username),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`)
  })


  .then(() => {
    const formattedTopic = topicData.map((topic) => {
      return [topic.description, topic.slug, topic.img_url]
    })
    const insertTopicsString = format(
      `INSERT INTO topics
      (description, slug, img_url)
      VALUES
      %L 
      RETURNING *;`,
      formattedTopic
    )
    return db.query(insertTopicsString)
  })


  .then(() =>{
    const formattedUser = userData.map((user) => {
      return [user.username, user.name, user.avatar_url]
    })
    const insertUserString = format(
      `INSERT INTO users
      (username, name, avatar_url)
      VALUES
      %L
      RETURNING *;`,
      formattedUser
    )
    return db.query(insertUserString)
  })


  .then(() => {
    const formattedArticles = articleData.map((article) => {
      const createdAtDate = new Date(article.created_at)
      return [article.title, article.topic, article.author, article.body, createdAtDate, article.votes, article.article_img_url,]
    })
    const insertArticleString = format(
      `INSERT INTO articles
      (title, topic, author, body, created_at, votes, article_img_url)
      VALUES
      %L
      RETURNING *;`,
      formattedArticles
    )
    return db.query(insertArticleString)
  })
.then(() => {
  
})


.then(() => {
    const formattedComment = commentData.map((comment) => {
       const createdAtDate = new Date(comment.created_at)
      return [comment.article_id, comment.body, comment.votes, comment.author, createdAtDate]
    })
    const insertCommentString = format(
      `INSERT INTO comments
      (article_id, body, votes, author, created_at)
      VALUES
      %L 
      RETURNING *;`,
      formattedComment
    )
    return db.query(insertCommentString)
  })
})
}
module.exports = seed;
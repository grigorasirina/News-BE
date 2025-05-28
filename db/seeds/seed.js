const db = require("../connection");
const format = require("pg-format");
const { createArticlesLookupObj } = require("../seeds/utils");

const seed = ({ topicData, userData, articleData, commentData }) => {
    return db.query(`DROP TABLE IF EXISTS comments, articles, users, topics CASCADE;`)
    .then(() => {
        return db.query(`
            CREATE TABLE topics (
                slug VARCHAR(40) PRIMARY KEY,
                description VARCHAR(100) NOT NULL,
                img_url VARCHAR(1000)
            );
        `);
    })
    .then(() => {
        return db.query(`
            CREATE TABLE users (
                username VARCHAR(30) PRIMARY KEY ,
                name VARCHAR (80),
                avatar_url VARCHAR(1000)
            );
        `);
    })
    .then(() => {
        return db.query(`
            CREATE TABLE articles (
                article_ID SERIAL PRIMARY KEY,
                title VARCHAR(100),
                topic VARCHAR(40) REFERENCES topics(slug),
                author VARCHAR(30) REFERENCES users(username),
                body TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                votes INT DEFAULT 0,
                article_img_url VARCHAR(1000)
            );
        `);
    })
    .then(() => {
        return db.query(`
            CREATE TABLE comments (
                comment_id SERIAL PRIMARY KEY,
                article_id INT REFERENCES articles(article_ID) ON DELETE CASCADE,
                body TEXT,
                votes INT DEFAULT 0,
                author VARCHAR(30) REFERENCES users(username),
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
    })
    .then(() => {
        const formattedTopicValues = topicData.map((topic) => {
            return [topic.description, topic.slug, topic.img_url];
        });
        const insertTopicsString = format(
            `INSERT INTO topics (description, slug, img_url) VALUES %L RETURNING *;`,
            formattedTopicValues
        );
        return db.query(insertTopicsString);
    })
    .then(() => {
        const formattedUserValues = userData.map((user) => {
            return [user.username, user.name, user.avatar_url];
        });
        const insertUserString = format(
            `INSERT INTO users (username, name, avatar_url) VALUES %L RETURNING *;`,
            formattedUserValues
        );
        return db.query(insertUserString);
    })
    .then((result) => { 
        const formattedArticleValues = articleData.map((article) => {
            const createdAtDate = new Date(article.created_at);
            return [
                article.title,
                article.topic,
                article.author,
                article.body,
                createdAtDate,
                article.votes || 0,
                article.article_img_url || null,
            ];
        });
        const insertArticleString = format(
            `INSERT INTO articles (title, topic, author, body, created_at, votes, article_img_url) VALUES %L RETURNING *;`,
            formattedArticleValues
        );
        return db.query(insertArticleString);
    })
    .then((articlesResult) => {
        const articlesLookup = createArticlesLookupObj(articlesResult.rows);

        const commentInsertPromises = commentData.map((comment) => {
            const articleId = articlesLookup[comment.article_title];
            if (articleId === undefined) {
                console.warn(`Article ID not found for comment with title: "${comment.article_title}". Skipping this comment.`);
                return Promise.resolve();
            }

            const createdAtDate = new Date(comment.created_at);

            return db.query(
                `INSERT INTO comments (article_id, body, votes, author, created_at)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING *;`,
                [
                    articleId,
                    comment.body,
                    comment.votes || 0,
                    comment.author,
                    createdAtDate,
                ]
            );
        });

        return Promise.all(commentInsertPromises);
    });
};

module.exports = seed;
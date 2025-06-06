const endpointsJson = require("../endpoints.json");
const db = require("../db/connection")
const seed = require("../db/seeds/seed")
const data = require("../db/data/test-data/index")
const app = require("../app")
const request = require("supertest");
const { fetchArticles } = require("../models/model");
const { getArticles } = require("../controllers/controllers");


beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});

/* Set up your test imports here */

/* Set up your beforeEach & afterAll functions here */


describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson)
      })
  })
})


describe ("GET/api/topics", () => {
  test("200: Responds with an object containing the topics", () => {
    return request(app)
    .get("/api/topics")
    .expect(200)
    .then(({body: {topics}}) => {
      expect(Array.isArray(topics)).toBe(true)
      expect(topics.length).toBeGreaterThan(0) // Ensure there are topics
      topics.forEach((topic) => {
        expect(topic).toHaveProperty("slug")
        expect(topic).toHaveProperty("description")
    })
  })
  })
})


describe("GET /api/articles/:article_id", () => {
  test("200: Responds with the article corresponding to the provided ID", () => {
    const articleIdToTest = 1
    return request(app)
      .get(`/api/articles/${articleIdToTest}`)
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toBeInstanceOf(Object)
        expect(article.article_id).toBe(articleIdToTest)
        expect(article).toHaveProperty("title")
        expect(article).toHaveProperty("topic")
        expect(article).toHaveProperty("author")
        expect(article).toHaveProperty("body")
        expect(article).toHaveProperty("created_at")
        expect(article).toHaveProperty("votes")
        expect(article).toHaveProperty("article_img_url")
      })
  })

  test("400: Responds with an error message for an invalid article ID format", () => {
    return request(app)
      .get("/api/articles/not-a-number")
      .expect(400)
      .then(({ body }) => {
        expect(body).toHaveProperty("msg", "Invalid article ID format")
      })
  })

  test("404: Responds with an error message for a non-existent article ID", () => {
    const nonExistentId = 1234567
    return request(app)
      .get(`/api/articles/${nonExistentId}`)
      .expect(404)
      .then(({ body }) => {
        expect(body).toHaveProperty("msg", "Article not found")
      })
  })
})


describe("GET /api/articles", () => {
  test("200: Responds with an array of article objects", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeInstanceOf(Array)
        expect(articles.length).toBeGreaterThan(0)
        articles.forEach((article) => {
          expect(article).toHaveProperty("author")
          expect(article).toHaveProperty("title")
          expect(article).toHaveProperty("article_id")
          expect(article).toHaveProperty("topic")
          expect(article).toHaveProperty("created_at")
          expect(article).toHaveProperty("votes")
          expect(article).toHaveProperty("article_img_url")
          expect(article).toHaveProperty("comment_count")
          expect(typeof article.comment_count).toBe("number")
          expect(article).not.toHaveProperty("body")
        });
      });
  });

  test("200: Articles are sorted by created_at in descending order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy('created_at', { descending: true })
      })
  })
})

describe("GET /api/articles/:article_id/comments", () => {
  test("200: Responds with an array of comments for the given article_id", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toBeInstanceOf(Array)
        expect(comments).toHaveLength(11)
          comments.forEach((comment) => {
            expect(comment).toHaveProperty("comment_id")
            expect(comment).toHaveProperty("votes")
            expect(comment).toHaveProperty("created_at")
            expect(comment).toHaveProperty("author")
            expect(comment).toHaveProperty("body")
            expect(comment).toHaveProperty("article_id")
            expect(typeof comment.article_id).toBe("number")
          })
        
      })
  })

  test("200: Comments are sorted by created_at in descending order", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toBeSortedBy('created_at', { descending: true })
      })
  })

  test("400: Responds with an error message for an invalid article_id", () => {
    return request(app)
      .get("/api/articles/invalid_id/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body).toHaveProperty("msg", "Invalid article ID format")
      })
  })

  test("404: Responds with an error message if the article_id is valid but doesn't exist", () => {
    return request(app)
      .get("/api/articles/999/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body).toHaveProperty("msg", "Article not found")
      })
  })

  test("200: Responds with an empty array if the article exists but has no comments", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toBeInstanceOf(Array)
        expect(comments.length).toBe(0)
      })
  })

  test("404: Responds with an error message if the article_id is valid but doesn't exist", () => {
    return request(app)
      .get("/api/articles/123456789/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body).toHaveProperty("msg", "Article not found");
      })
  })
})


describe("POST /api/articles/:article_id/comments", () => {
  test("201: Responds with the posted comment", () => {
    const newComment = {
      username: "butter_bridge", 
      body: "This is a new comment for article 1.",
    };

    return request(app)
      .post("/api/articles/1/comments") 
      .send(newComment)
      .expect(201)
      .then(({ body: { comment } }) => {
        expect(comment).toHaveProperty("comment_id")
        expect(comment).toHaveProperty("author", newComment.username)
        expect(comment).toHaveProperty("body", newComment.body)
        expect(comment).toHaveProperty("article_id", 1)
        expect(comment).toHaveProperty("votes", 0)
        expect(comment).toHaveProperty("created_at")
      })
    })

    test("400: Responds with an error message for an invalid article_id", () => {
      const newComment = {
        username: "butter_bridge",
        body: "This is a new comment.",
      }
      return request(app)
        .post("/api/articles/invalid_id/comments")
        .send(newComment)
        .expect(400)
        .then(({ body }) => {
          expect(body).toHaveProperty("msg", "Invalid article ID format")
        })
    })

    test("400: Responds with an error message for missing username", () => {
      const newComment = {
        body: "This is a new comment.",
      };
      return request(app)
        .post("/api/articles/1/comments")
        .send(newComment)
        .expect(400)
        .then(({ body }) => {
          expect(body).toHaveProperty("msg", "Missing required fields")
        })
    })

    test("400: Responds with an error message for missing body", () => {
      const newComment = {
        username: "butter_bridge",
      };
      return request(app)
        .post("/api/articles/1/comments")
        .send(newComment)
        .expect(400)
        .then(({ body }) => {
          expect(body).toHaveProperty("msg", "Missing required fields")
        })
    })

    test("404: Responds with an error message if the article_id is valid but doesn't exist", () => {
      const newComment = {
        username: "butter_bridge",
        body: "This is a new comment.",
      };
      return request(app)
        .post("/api/articles/999/comments")
        .send(newComment)
        .expect(404)
        .then(({ body }) => {
          expect(body).toHaveProperty("msg", "Article not found")
        })
    })

    test("404: Responds with an error message if the username is valid but doesn't exist", () => {
      const newComment = {
        username: "non_existent_user", 
        body: "This is a comment",
      };
      return request(app)
        .post("/api/articles/1/comments")
        .send(newComment)
        .expect(404)
        .then(({ body }) => {
          expect(body).toHaveProperty("msg", "User not found")
        })
    })
  })


  describe("PATCH /api/articles/:article_id", () => {
    test("200: Responds with the updated article", () => {
      return request(app)
        .patch("/api/articles/1")
        .send({ inc_votes: 1 }) 
        .expect(200)
        .then(({ body: { article } }) => {
          expect(article).toHaveProperty("article_id", 1)
          expect(article).toHaveProperty("title")
          expect(article).toHaveProperty("body")
          expect(article).toHaveProperty("votes", expect.any(Number))
          expect(article).toHaveProperty("topic")
          expect(article).toHaveProperty("author")
          expect(article).toHaveProperty("created_at")
          expect(article).toHaveProperty("article_img_url")
        })
    })

    test("200: Responds with the updated article when inc_votes is negative", () => {
      return request(app)
        .patch("/api/articles/1")
        .send({ inc_votes: -5 })
        .expect(200)
        .then(({ body: { article } }) => {
          expect(article).toHaveProperty("article_id", 1)
          expect(article).toHaveProperty("votes", expect.any(Number))
        })
    })

    test("400: Responds with an error message for an invalid article_id", () => {
      return request(app)
        .patch("/api/articles/invalid_id")
        .send({ inc_votes: 1 })
        .expect(400)
        .then(({ body }) => {
          expect(body).toHaveProperty("msg", "Invalid article ID format")
        })
    })

    test("400: Responds with an error message for missing inc_votes", () => {
      return request(app)
        .patch("/api/articles/1")
        .send({}) 
        .expect(400)
        .then(({ body }) => {
          expect(body).toHaveProperty("msg", "Missing inc_votes");
        })
    })

    test("400: Responds with an error message for invalid inc_votes", () => {
      return request(app)
        .patch("/api/articles/1")
        .send({ inc_votes: "not a number" })
        .expect(400)
        .then(({ body }) => {
          expect(body).toHaveProperty("msg", "Invalid inc_votes value")
        })
    })

    test("404: Responds with an error message if the article_id is valid but doesn't exist", () => {
      return request(app)
        .patch("/api/articles/999") 
        .send({ inc_votes: 1 })
        .expect(404)
        .then(({ body }) => {
          expect(body).toHaveProperty("msg", "Article not found")
        })
    })
  })


  describe("DELETE /api/comments/:comment_id", () => {
    test("204: Responds with no content when the comment is successfully deleted", () => {
      return request(app)
        .delete("/api/comments/1") 
        .expect(204)
        .then((response) => {
          expect(response.body).toEqual({})
          return db.query("SELECT * FROM comments WHERE comment_id = 1")
        })
        .then(({ rows }) => {
          expect(rows.length).toBe(0)
        })
    })
  
    test("400: Responds with an error message for an invalid comment_id", () => {
      return request(app)
        .delete("/api/comments/invalid_id")
        .expect(400)
        .then(({ body }) => {
          expect(body).toHaveProperty("msg", "Invalid comment ID format")
        })
    })
  
    test("404: Responds with an error message if the comment_id is valid but doesn't exist", () => {
      return request(app)
        .delete("/api/comments/12345")
        .expect(404)
        .then(({ body }) => {
          expect(body).toHaveProperty("msg", "Comment not found")
        })
    })
  })


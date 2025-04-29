const endpointsJson = require("../endpoints.json");
const db = require("../db/connection")
const seed = require("../db/seeds/seed")
const data = require("../db/data/test-data/index")
const app = require("../app")
const request = require("supertest")


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
      expect(topics.length).toBeGreaterThan(0); // Ensure there are topics
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

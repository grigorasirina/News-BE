NC News Backend API

🚀 Project Overview
This is the backend API for NC News, a news aggregation platform. It provides a robust set of endpoints to interact with articles, comments, topics, and users.

Content Retrieval: Fetching lists of articles (with filtering and sorting options), individual articles, comments for an article, and lists of topics.

User Interaction: Posting new comments, updating article votes, and deleting comments.
The API is designed following RESTful principles, built with Node.js and the Express.js framework, and uses PostgreSQL as its relational database.

🌐 Hosted Version
You can explore the deployed version of this API live at:
[https://news-be-1493.onrender.com]

🛠️ Setup and Installation
To get a local copy of the project up and running for development or testing, follow these steps.

Prerequisites
Node.js: v16.x or higher
PostgreSQL: v12.x or higher

1. Clone the repository
First, clone the repository to your local machine:

git clone [https://github.com/grigorasirina/News-BE.git]

2. Install dependencies
Navigate into the cloned directory and install the necessary Node.js packages:

npm install

3. Database Setup
This project uses PostgreSQL for its database.

Create .env files
You will need two .env files in the root directory of your project to manage your database connections for different environments:
    .env.development
    .env.test
Each file should contain a single environment variable PGDATABASE pointing to your local PostgreSQL database for that environment.

Example for .env.development:
    PGDATABASE=nc_news
Example for .env.test:
    PGDATABASE=nc_news_test

Seed the local database
After setting up your .env files, you can populate your local databases with the provided test data:

npm run seed

4. Running the Tests
To execute the full suite of automated tests for the API endpoints:

npm test
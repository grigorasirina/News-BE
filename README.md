# NC News Seeding

Step 1: Run the setup script
To create both databases, run:
npm run setup-dbs
This will run the setup-dbs.sql file to create both a test and development database.
Step 2: Set up environment variables
.env.test (for the test database).
.env.development (for the development database).
Double-check that your .gitignore file includes .env.* so these files aren't pushed to GitHub.
Step 3: Verify your setup
Run the following scripts and check the console logs (you may need to scroll up a bit in the terminal!):
npm run test-seed
This runs tests for your seed function.
No tests will pass yet (which is expected), but you should see logs confirming you are connected to your test database.
npm run seed-dev
This runs the run-seed script, which calls your seed function with development data.
You will see errors at this stage, but the logs should confirm that you are connected to the development database.
A seeds folder
This contains the scripts for seeding your databases.
Any utility functions we need for data-manipulation are also found here.
connection.js file
The connection has already been written for you and is exported from here. Both the seed.js file and its corresponding test suite are requiring in the connection already.

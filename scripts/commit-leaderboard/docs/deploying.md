# Deploying the Commit Leaderboard

The app is easily deployed to [Heroku](https://heroku.com) by following the steps below.

## Setting up your Heroku app
1. Set up a Heroku app to host the leaderboard. Name the app `commit-leaderboard`.
2. Download the Heroku CLI to your machine.
3. Log into Heroku by running `heroku login` in a terminal.
4. Set up the Heroku environment by running `make heroku-init`. This will add a scheduler to the app and set the buildpack to use Node.js.

## Deploying the app
1. Clone this repository, or download the `scripts/commit-leaderboard` directory.
2. Publish the scripts by running `make publish`.

You can verify that the application has been published successfully by running `heroku logs` or by visiting the web route using `heroku open`.

## Scheduling the job
1. Configure your GitHub token by navigating to `settings` and clicking `Reveal Config Variables` on the Heroku web console. Add a new field named `GITHUB_TOKEN` with your API token.

![Adding the GITHUB_TOKEN config variable](github_token.png?raw=true)

2. Open the scheduling console by running `heroku addons:open scheduler`.
3. Add a new job, set to run daily at `17:00` and enter the command `node daily`.

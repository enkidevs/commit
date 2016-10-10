# Environment Variables

The following environment variables can be set using the Heroku dashboard or in your local deployment.

| Variable name      | Default value              | Description                                                                                                           |
|--------------------|----------------------------|-----------------------------------------------------------------------------------------------------------------------|
| `GITHUB_TOKEN`       | `null`                     | A required token used to communicate with the GitHub API                                                            |
| `GIT_AUTHOR_NAME`    | `Enki Leaderboard Bot`     | The author name to include when committing.                                                                           |
| `GIT_AUTHOR_EMAIL`   | `luke@enki.com`            | The author email to include when committing.                                                                          |
| `GIT_COMMIT_MESSAGE` | `Updating the leaderboard` | The commit message for updates.                                                                                       |
| `LEADERBOARD_COUNT`  | `10`                       | The number of users to show in the leaderboard.                                                                       |
| `GIT_BASE_BRANCH`    | `master`                   | The base branch to use when creating pull requests for updates. This is currently only done for monthly leaderboards. |
| `GIT_HEAD_BRANCH`    | `update-leaderboard`       | The compare branch to use when creating pull requests for updates.    

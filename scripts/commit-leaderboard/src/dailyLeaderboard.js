import {retrieveCommits, createLeaderboardMarkdown, standardCompetitionScoring,
  writeFile, checkGithubToken, repo, GIT_BASE_BRANCH, LEADERBOARD_COUNT}
  from './helpers';

const co = require('co');

function updateReadme(md, copy) {
  const path = 'README.md';
  return co(function* () {
    const readme = yield repo.getContents(GIT_BASE_BRANCH, path, true);
    const elems = readme.data.split(/#Leaderboard|#FAQ/);
    const inject =
      '#Leaderboard\n' + copy + '\n\n' + md + '\n\n#FAQ';
    elems.splice(1, 1, inject);
    const newReadme = elems.join('');
    yield writeFile(path, newReadme, GIT_BASE_BRANCH);
    return newReadme;
  });
}

function leaderboard(now, before, copy) {
  return co(function* () {
    const commits = yield retrieveCommits(before, now);
    const sorted = standardCompetitionScoring(commits);
    const md = createLeaderboardMarkdown(sorted);
    const contents = yield updateReadme(md, copy);
    return contents;
  });
}

function getStartOfMonth() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function monthlyLeaderboard(callback) {
  const now = new Date();
  const before = getStartOfMonth();
  leaderboard(now, before,
    `The top ${LEADERBOARD_COUNT} committers this month are shown here.`)
      .then(contents => callback(null, contents), err => callback(err));
}

export default function compute(callback) {
  if (!checkGithubToken()) {
    return callback('GitHub token was not found');
  }
  monthlyLeaderboard(callback);
}

import co from 'co';
import {retrieveCommits, standardCompetitionScoring, createLeaderboardMarkdown,
  writeFile, checkGithubToken, repo, GIT_BASE_BRANCH, GIT_HEAD_BRANCH,
  LEADERBOARD_COUNT} from './helpers';

/* eslint-disable no-nested-ternary */
function leaderboard(now, before, path) {
  return co(function* () {
    const commits = yield retrieveCommits(before, now);
    const sorted = standardCompetitionScoring(commits);
    const lastIndex = LEADERBOARD_COUNT - 1;
    const penultimateIndex = lastIndex - 1;
    const mentions = 'Congratulations to ' +
      sorted.slice(0, LEADERBOARD_COUNT).map((user, i) => {
        return '@' + user.user +
          (i === lastIndex ? '' :
          (i === penultimateIndex ? ' and' : ','));
      }).join(' ') + '!';
    const md = createLeaderboardMarkdown(sorted) + '\n\n' + mentions;
    const contents = yield writeFile(path, md, GIT_HEAD_BRANCH, true);
    return contents;
  });
}
/* eslint-enable no-nested-ternary */

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

function getMonthlyFilename(date) {
  const baseDir = 'leaderboards';
  const month = date.getMonth() + 1;
  const monthNumeric = (month < 9 ? '0' : '') + (month + 1); // < 9 due to +1
  const filename =
    date.getFullYear() + '-' + monthNumeric + '-' + monthNames[month] + '.md';
  return baseDir + '/' + filename;
}

function checkLeaderboardExists(path) {
  return co(function* () {
    yield repo.getContents(GIT_BASE_BRANCH, path, true);
    return true;
  }).catch(err => {
    if (err.status && err.status === '404') {
      return false;
    }
  });
}

export default function compute(callback) {
  if (!checkGithubToken()) {
    return callback('GitHub token was not found');
  }

  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const path = getMonthlyFilename(lastMonth);

  checkLeaderboardExists(path).then(exists => {
    if (exists) {
      callback('Leaderboard already exists, aborting');
    } else {
      lastMonth.setDate(1);
      lastMonth.setHours(0, 0, 0, 0);
      const lastMonthEnd =
        new Date(lastMonth.getFullYear(),
          lastMonth.getMonth() + 1, 0);
      lastMonthEnd.setHours(23, 59, 59, 999);
      leaderboard(lastMonthEnd, lastMonth, path)
        .then(contents => {
          callback(null, contents);
        }, err => callback(err));
    }
  }, err => callback(err));
}

const Github = require('github-api');
const co = require('co');

const ENV = process.env;
const GITHUB_TOKEN = ENV.GITHUB_TOKEN;

const GIT_AUTHOR_NAME = ENV.GIT_AUTHOR_NAME || 'Enki Leaderboard Bot';
const GIT_AUTHOR_EMAIL = ENV.GIT_AUTHOR_EMAIL || 'luke@enki.com';

const GIT_COMMIT_MESSAGE = ENV.GIT_COMMIT_MESSAGE ||
  'Updating the leaderboard';

export const LEADERBOARD_COUNT = ENV.LEADERBOARD_COUNT || 10;

export const GIT_BASE_BRANCH = ENV.GIT_BASE_BRANCH || 'master';
export const GIT_HEAD_BRANCH = ENV.GIT_HEAD_BRANCH || 'update-leaderboard';

export const ENKI_USERS = ['enkibot', 'lukem512', 'tomwmarshall', 'spypsy',
  'mathieudutour', 'charlottebretonsch', 'kirillongithub', 'jordanfish',
  'Loopiezlol'];

const github = new Github({
  token: GITHUB_TOKEN,
  auth: 'oauth',
});

export const repo = github.getRepo('enkidevs', 'commit');

export function checkGithubToken() {
  return (GITHUB_TOKEN || false);
}

function excludeUser(commits, user) {
  return commits.filter(c =>
    ((c.author || {}).login || c.commit.author.name) !== user);
}

// The data is paginated, retrieve it all, 100 at a time
// A page sized by 100 is the maximum allowed by GitHub
export function retrieveCommits(since, until, excluded = ENKI_USERS) {
  /* eslint-disable camelcase */
  return co(function* () {
    const per_page = 100;
    let commits = [];
    let found = 0;
    let page = 0;
    do {
      const pageComm = yield repo.listCommits({
        since,
        until,
        page,
        per_page,
      });
      commits = commits.concat(pageComm.data);
      found = pageComm.data.length;
      page++;
    } while (found === per_page);
    excluded.forEach(user => {
      commits = excludeUser(commits, user);
    });
    return commits;
  });
  /* eslint-enable camelcase */
}

export function createLeaderboardMarkdown(data) {
  const header = '| Rank | User | Commits |\n|------|------|---------|';
  let table = header;
  data.some((o, i) => {
    table = table +
      '\n|' + o.rank + (o.joint ? '=' : '') +
      '|[' + o.user + '](https://github.com/' + o.user + ')' +
      '|' + o.commits + '|';
    return i >= (LEADERBOARD_COUNT - 1);
  });
  return table;
}

// Standard "1224" ranking
export function standardCompetitionScoring(commits) {
  // Count the number of commits by each user
  const counts = commits.reduce((acc, cur) => {
    const user = (cur.author || {}).login || cur.commit.author.name;
    if (acc[user]) {
      if (acc[user].indexOf(cur.sha) === -1) {
        acc[user].push(cur.sha);
      }
    } else {
      acc[user] = [cur.sha];
    }
    return acc;
  }, {});

  // Count the number of users with a given score
  const usersWithCount = {};
  Object.keys(counts).forEach(user => {
    const count = counts[user].length;
    usersWithCount[count] = usersWithCount[count] + 1 || 1;
  });

  // Create a rank for each score
  const sortedCounts = Object.keys(usersWithCount).sort((a, b) => b - a);

  const ranks = {};
  let start = 1;
  sortedCounts.forEach(c => {
    ranks[c] = {
      start,
      count: usersWithCount[c],
    };
    start += usersWithCount[c];
  });

  // Return the formatted data
  const sortedUsers = Object.keys(counts).sort((a, b) =>
    counts[b].length - counts[a].length);
  return sortedUsers.map(user => {
    const n = counts[user].length;
    return {
      rank: ranks[n].start,
      user,
      commits: n,
      joint: ranks[n].count > 1,
    };
  });
}

export function createPR(head, base, title, body) {
  return repo.createPullRequest({
    head,
    base,
    title,
    body,
  });
}

export function writeFile(path, contents, head = GIT_HEAD_BRANCH, pr = false) {
  return co(function* () {
    const author = {
      name: GIT_AUTHOR_NAME,
      email: GIT_AUTHOR_EMAIL,
      date: new Date().toISOString(),
    };

    const sameHead = (head === GIT_BASE_BRANCH);
    if (!sameHead) {
      const branches = yield repo.listBranches();

      let found = false;
      branches.data.some(branch => {
        found = (branch.name === head);
        return found;
      });

      if (!found) {
        yield repo.createBranch(GIT_BASE_BRANCH, head);
      }
    }

    yield repo.writeFile(
      head, path, contents, GIT_COMMIT_MESSAGE, {
        author,
        committer: author,
      });

    if (pr && !sameHead) {
      yield createPR(head, GIT_BASE_BRANCH,
        GIT_COMMIT_MESSAGE, contents)
        .catch(err => {
          console.log(err);
          console.log('Issuing PR failed, is one already open?');
        });
    }
    return true;
  });
}

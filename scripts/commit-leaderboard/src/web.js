const http = require('http');
const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  res.end('Enki Daily Commit Leaderboard');
});

server.listen(PORT, () => {
  console.log("Server listening on: http://localhost:%s", PORT);
});

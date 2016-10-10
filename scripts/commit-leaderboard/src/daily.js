#!/usr/bin/env node
require("babel-polyfill");
import job from './dailyLeaderboard';

job(
  (err, result) => {
    const now = new Date();
    console.log();
    if (err) {
      console.error(now, 'Daily job failed with an error.');
      console.error(err);
      process.exit(1);
    }
    console.log(now, 'Daily job completed successfully!');
    console.log(result);
    process.exit(0);
  }
);

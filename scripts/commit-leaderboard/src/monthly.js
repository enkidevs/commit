#!/usr/bin/env node
require("babel-polyfill");
import job from './monthlyLeaderboard';

job(
  (err, result) => {
    const now = new Date();
    console.log();
    if (err) {
      console.error(now, 'Monthly job failed with an error.');
      console.error(err);
      process.exit(1);
    }
    console.log(now, 'Monthly job completed successfully!');
    console.log(result);
    process.exit(0);
  }
);

const { AtpAgent } = require('@atproto/api');
require('dotenv').config();

const handle = process.env.BSKY_HANDLE;
const appPassword = process.env.BSKY_APP_PASSWORD;

(async () => {
  const agent = new AtpAgent({ service: 'https://bsky.social' });

  // Log in
  await agent.login({ identifier: handle, password: appPassword });
  console.log(`Logged in as ${handle}`);

  // Get follows and unfollow each
  let cursor;
  let totalCount = 0;

  do {
    const res = await agent.com.atproto.repo.listRecords({
      repo: agent.session.did,
      collection: 'app.bsky.graph.follow',
      limit: 100,
      cursor,
    });

    const records = res.data.records;
    cursor = res.data.cursor;

    if (records && records.length > 0) {
      for (const record of records) {
        const rkey = record.uri.split('/').pop();
        await agent.com.atproto.repo.deleteRecord({
          repo: agent.session.did,
          collection: 'app.bsky.graph.follow',
          rkey,
        });
        console.log(`Unfollowed record with rkey: ${rkey}`);
        totalCount++;
      }
    }
  } while (cursor);

  console.log(`Done. Total unfollowed: ${totalCount}`);
})();
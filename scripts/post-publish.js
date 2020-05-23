/* eslint-disable no-console */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { execSync } = require('child_process');

const sleep = timeout => new Promise(resolve => setTimeout(resolve, timeout));
const packages = fs.readdirSync(path.join(__dirname, '../packages'));

packages.forEach(async (x, i) => {
  const packageFile = path.join(__dirname, '../packages', x, 'package.json');
  if (fs.existsSync(packageFile)) {
    await sleep(i * 200);
    const { name, version } = require(packageFile);
    try {
      const res = await axios({
        url: `https://npm.taobao.org/sync/${name}?sync_upstream=true`,
        method: 'put',
        timeout: 5000,
      });
      console.log('trigger cnpm sync success', name, res.data);
    } catch (err) {
      console.error('trigger cnpm sync failed', name);
    }
    if (process.env.SLACK_WEBHOOK) {
      try {
        const command = `curl -s -X POST --data-urlencode "payload={\\"text\\": \\"${name} v${version} is published\\"}" ${process.env.SLACK_WEBHOOK}`;
        const result = execSync(command);
        console.log('send slack notification', result.toString('utf8'));
      } catch (err) {
        console.error('send slack notification failed', name, err);
      }
    }
  }
});

(async () => {
  try {
    const res = await axios.post('https://api.netlify.com/build_hooks/5d71fd6472feae0bb5d28671');
    console.log('trigger blocklets build success:', res.status);
  } catch (error) {
    console.error('trigger blocklets build failed:', error);
  }
})();

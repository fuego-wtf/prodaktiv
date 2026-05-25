#!/usr/bin/env bun

const baseUrl = (process.argv[2] ?? 'https://prodaktiv.com').replace(/\/$/, '');

const checks = [
  {
    name: 'home',
    url: `${baseUrl}/`,
    expectStatus: 200,
    expectHeader: ['content-type', /text\/html/],
    expectBody: /Lock your phone\. Ship your work\./i,
  },
  {
    name: 'social/prodaktiv-og.png',
    url: `${baseUrl}/social/prodaktiv-og.png`,
    expectStatus: 200,
    expectHeader: ['content-type', /image\/png/],
  },
];

let failures = 0;

for (const check of checks) {
  process.stdout.write(`  ${check.name.padEnd(28)} ... `);
  try {
    const res = await fetch(check.url, { redirect: 'manual' });
    if (res.status !== check.expectStatus) {
      console.log(`FAIL  status ${res.status}, expected ${check.expectStatus}  (${check.url})`);
      failures += 1;
      continue;
    }
    if (check.expectHeader) {
      const [name, re] = check.expectHeader;
      const value = res.headers.get(name) ?? '';
      if (!re.test(value)) {
        console.log(`FAIL  header ${name}="${value}" did not match ${re}  (${check.url})`);
        failures += 1;
        continue;
      }
    }
    if (check.expectBody) {
      const body = await res.text();
      if (!check.expectBody.test(body)) {
        console.log(`FAIL  body did not match ${check.expectBody}  (${check.url})`);
        failures += 1;
        continue;
      }
    }
    console.log(`OK   (${res.status})`);
  } catch (err) {
    console.log(`FAIL  ${err.message}  (${check.url})`);
    failures += 1;
  }
}

console.log('');
if (failures > 0) {
  console.log(`NO-GO  ${failures} check(s) failed against ${baseUrl}`);
  process.exit(1);
}
console.log(`GO     all checks passed against ${baseUrl}`);

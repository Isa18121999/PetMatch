const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

test("deployment configuration includes required files and scripts", () => {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const dockerfile = fs.readFileSync("Dockerfile", "utf8");
  const environmentTemplate = fs.readFileSync(".env.example", "utf8");

  assert.equal(packageJson.scripts.start, "node server.js");
  assert.match(dockerfile, /EXPOSE 3000/);
  assert.match(environmentTemplate, /PETFINDER_CLIENT_ID=/);
  assert.match(environmentTemplate, /DATABASE_URL=/);
});

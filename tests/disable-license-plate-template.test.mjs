import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const rootDir = process.cwd();
const templateScriptPath = path.join(
  rootDir,
  "pages",
  "road-manifest",
  "disable-license-plate-template.js"
);
const htmlPath = path.join(
  rootDir,
  "pages",
  "road-manifest",
  "disable-license-plate.html"
);

function loadTemplateApi() {
  const sandbox = { window: {}, globalThis: {} };
  sandbox.window = sandbox.globalThis;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(templateScriptPath, "utf8"), sandbox);
  return sandbox.globalThis.DisableLicensePlateTemplate;
}

test("disable-license-plate page uses classic scripts and contains add/delete sections", function () {
  const html = fs.readFileSync(htmlPath, "utf8");

  assert.match(html, /<script src="\.\/disable-license-plate-template\.js" defer><\/script>/);
  assert.match(html, /<script src="\.\/disable-license-plate\.js" defer><\/script>/);
  assert.doesNotMatch(html, /type="module"/);
  assert.match(html, />新增禁用车牌</);
  assert.match(html, />删除禁用车牌</);
});

test("buildDisableLicensePlateArtifacts returns add SQL and pure cache key", function () {
  const api = loadTemplateApi();
  const result = api.buildDisableLicensePlateArtifacts(
    "ab 1234",
    new Date(2026, 3, 20, 17, 8, 7)
  );

  assert.equal(result.normalizedPlate, "AB 1234");
  assert.equal(result.timestamp, "2026-04-20 17:08:07");
  assert.match(
    result.sql,
    /VALUES\('DISABLE_LICENSE_PLATES', 'BUNDLED', 'AB 1234',/
  );
  assert.equal(
    result.cacheKey,
    "tz:basic_data:com_config:DISABLE_LICENSE_PLATES"
  );
  assert.equal(
    result.cacheDisplay,
    "tz:basic_data:com_config:DISABLE_LICENSE_PLATES"
  );
  assert.equal(
    result.cacheHint,
    "这个备注复制给运维删除，不删除最长1小时后会自动刷新"
  );
  assert.equal(result.apiDeleteUrl, "https://app.apifox.com/project/462517");
  assert.equal(result.apiDeleteParam, "DISABLE_LICENSE_PLATES");
});

test("buildDeleteDisableLicensePlateArtifacts returns delete SQL and same cache key", function () {
  const api = loadTemplateApi();
  const result = api.buildDeleteDisableLicensePlateArtifacts(
    "ab 1234",
    new Date(2026, 3, 20, 17, 8, 7)
  );

  assert.equal(result.normalizedPlate, "AB 1234");
  assert.equal(result.timestamp, "2026-04-20 17:08:07");
  assert.equal(
    result.sql,
    "UPDATE tz_basic_data.base_com_config_detail SET deleted=1, modify_time='2026-04-20 17:08:07' where  group_code='DISABLE_LICENSE_PLATES' AND item_name='BUNDLED' and  item_value='AB 1234';"
  );
  assert.equal(
    result.cacheKey,
    "tz:basic_data:com_config:DISABLE_LICENSE_PLATES"
  );
  assert.equal(
    result.cacheDisplay,
    "tz:basic_data:com_config:DISABLE_LICENSE_PLATES"
  );
});

test("buildDisableLicensePlateArtifacts escapes single quotes in plate values", function () {
  const api = loadTemplateApi();
  const result = api.buildDisableLicensePlateArtifacts(
    "ab'12",
    new Date(2026, 3, 20, 17, 8, 7)
  );

  assert.match(result.sql, /'AB''12'/);
});

test("buildDisableLicensePlateArtifacts rejects empty plate values", function () {
  const api = loadTemplateApi();

  assert.throws(
    function () {
      api.buildDisableLicensePlateArtifacts("   ");
    },
    /香港车牌不能为空/
  );
});

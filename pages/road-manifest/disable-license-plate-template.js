(function (global) {
  const CACHE_KEY = "tz:basic_data:com_config:DISABLE_LICENSE_PLATES";
  const CACHE_DELETE_HINT = "这个备注复制给运维删除，不删除最长1小时后会自动刷新";
  const API_DELETE_URL = "https://app.apifox.com/project/462517";
  const API_DELETE_PARAM = "DISABLE_LICENSE_PLATES";

  function buildDisableLicensePlateArtifacts(rawPlate, now) {
    return buildAddDisableLicensePlateArtifacts(rawPlate, now);
  }

  function buildAddDisableLicensePlateArtifacts(rawPlate, now) {
    const sharedArtifacts = buildSharedArtifacts(rawPlate, now);

    return {
      normalizedPlate: sharedArtifacts.normalizedPlate,
      timestamp: sharedArtifacts.timestamp,
      sql:
        "INSERT INTO tz_basic_data.base_com_config_detail\n" +
        "(group_code, item_name, item_value, creater_id, creater_name, creater_firm_id, creater_firm_name, create_time, modifier_id, modifier_name, modifier_firm_id, modify_time, deleted)\n" +
        "VALUES('DISABLE_LICENSE_PLATES', 'BUNDLED', '" +
        sharedArtifacts.safePlate +
        "', '00000000-0000-0000-0000-000000000000', '系统', '00000000-0000-0000-0000-000000000000', '系统', '" +
        sharedArtifacts.timestamp +
        "', '00000000-0000-0000-0000-000000000000', '系统', '00000000-0000-0000-0000-000000000000', '" +
        sharedArtifacts.timestamp +
        "', 0);",
      cacheKey: CACHE_KEY,
      cacheDisplay: CACHE_KEY,
      cacheHint: CACHE_DELETE_HINT,
      apiDeleteUrl: API_DELETE_URL,
      apiDeleteParam: API_DELETE_PARAM
    };
  }

  function buildDeleteDisableLicensePlateArtifacts(rawPlate, now) {
    const sharedArtifacts = buildSharedArtifacts(rawPlate, now);

    return {
      normalizedPlate: sharedArtifacts.normalizedPlate,
      timestamp: sharedArtifacts.timestamp,
      sql:
        "UPDATE tz_basic_data.base_com_config_detail SET deleted=1, modify_time='" +
        sharedArtifacts.timestamp +
        "' where  group_code='DISABLE_LICENSE_PLATES' AND item_name='BUNDLED' and  item_value='" +
        sharedArtifacts.safePlate +
        "';",
      cacheKey: CACHE_KEY,
      cacheDisplay: CACHE_KEY,
      cacheHint: CACHE_DELETE_HINT,
      apiDeleteUrl: API_DELETE_URL,
      apiDeleteParam: API_DELETE_PARAM
    };
  }

  function buildSharedArtifacts(rawPlate, now) {
    const normalizedPlate = normalizePlate(rawPlate);
    const timestamp = formatDateTime(now || new Date());

    return {
      normalizedPlate: normalizedPlate,
      safePlate: normalizedPlate.replace(/'/g, "''"),
      timestamp: timestamp
    };
  }

  function normalizePlate(rawPlate) {
    if (!rawPlate || !rawPlate.trim()) {
      throw new Error("香港车牌不能为空");
    }

    return rawPlate.trim().toUpperCase();
  }

  function formatDateTime(date) {
    return [
      date.getFullYear(),
      pad(date.getMonth() + 1),
      pad(date.getDate())
    ].join("-") +
      " " +
      [
        pad(date.getHours()),
        pad(date.getMinutes()),
        pad(date.getSeconds())
      ].join(":");
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  global.DisableLicensePlateTemplate = Object.freeze({
    API_DELETE_PARAM: API_DELETE_PARAM,
    API_DELETE_URL: API_DELETE_URL,
    CACHE_DELETE_HINT: CACHE_DELETE_HINT,
    CACHE_KEY: CACHE_KEY,
    buildAddDisableLicensePlateArtifacts: buildAddDisableLicensePlateArtifacts,
    buildDeleteDisableLicensePlateArtifacts: buildDeleteDisableLicensePlateArtifacts,
    buildDisableLicensePlateArtifacts: buildDisableLicensePlateArtifacts,
    formatDateTime: formatDateTime,
    normalizePlate: normalizePlate
  });
})(globalThis);

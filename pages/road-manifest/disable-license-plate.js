(function () {
  const templateApi = window.DisableLicensePlateTemplate;
  const sections = [
    {
      buildArtifacts: templateApi && templateApi.buildAddDisableLicensePlateArtifacts,
      form: document.getElementById("add-license-form"),
      plateInput: document.getElementById("add-plate-input"),
      feedback: document.getElementById("add-form-feedback"),
      sqlOutput: document.getElementById("add-sql-output"),
      cacheOutput: document.getElementById("add-cache-output"),
      cacheHint: document.getElementById("add-cache-hint"),
      generatedAt: document.getElementById("add-generated-at"),
      copySqlButton: document.getElementById("add-copy-sql"),
      copyCacheKeyButton: document.getElementById("add-copy-cache-key"),
      apiDeleteLink: document.getElementById("add-api-delete-link"),
      apiDeleteParam: document.getElementById("add-api-delete-param"),
      emptySqlText: "提交车牌后，这里会生成新增禁用车牌 SQL。",
      successText: "新增禁用车牌 SQL 已生成，请同步通知运维删除 Redis 缓存。"
    },
    {
      buildArtifacts: templateApi && templateApi.buildDeleteDisableLicensePlateArtifacts,
      form: document.getElementById("delete-license-form"),
      plateInput: document.getElementById("delete-plate-input"),
      feedback: document.getElementById("delete-form-feedback"),
      sqlOutput: document.getElementById("delete-sql-output"),
      cacheOutput: document.getElementById("delete-cache-output"),
      cacheHint: document.getElementById("delete-cache-hint"),
      generatedAt: document.getElementById("delete-generated-at"),
      copySqlButton: document.getElementById("delete-copy-sql"),
      copyCacheKeyButton: document.getElementById("delete-copy-cache-key"),
      apiDeleteLink: document.getElementById("delete-api-delete-link"),
      apiDeleteParam: document.getElementById("delete-api-delete-param"),
      emptySqlText: "提交车牌后，这里会生成删除禁用车牌 SQL。",
      successText: "删除禁用车牌 SQL 已生成，请同步通知运维删除 Redis 缓存。"
    }
  ];

  if (!templateApi) {
    sections.forEach(function (section) {
      if (!section.feedback) {
        return;
      }

      section.feedback.textContent = "页面脚本加载失败，请刷新后重试。";
      section.feedback.className = "helper-text is-error";
    });
    return;
  }

  sections.forEach(function (section) {
    bootstrapSection(section);
    bindSection(section);
  });

  function bootstrapSection(section) {
    section.latestArtifacts = null;
    section.cacheOutput.textContent = templateApi.CACHE_KEY;
    section.cacheHint.textContent = templateApi.CACHE_DELETE_HINT;
    section.apiDeleteLink.href = templateApi.API_DELETE_URL;
    section.apiDeleteLink.textContent = templateApi.API_DELETE_URL;
    section.apiDeleteParam.textContent = templateApi.API_DELETE_PARAM;
  }

  function bindSection(section) {
    section.form.addEventListener("submit", function (event) {
      event.preventDefault();

      try {
        section.latestArtifacts = section.buildArtifacts(section.plateInput.value);
      } catch (error) {
        section.latestArtifacts = null;
        section.copySqlButton.disabled = true;
        section.generatedAt.textContent = "等待生成";
        section.sqlOutput.textContent = section.emptySqlText;
        section.feedback.textContent = error.message;
        section.feedback.className = "helper-text is-error";
        section.plateInput.focus();
        return;
      }

      section.sqlOutput.textContent = section.latestArtifacts.sql;
      section.generatedAt.textContent = "生成时间：" + section.latestArtifacts.timestamp;
      section.copySqlButton.disabled = false;
      section.feedback.textContent = section.successText;
      section.feedback.className = "helper-text is-success";
    });

    section.copySqlButton.addEventListener("click", function () {
      if (!section.latestArtifacts) {
        return;
      }

      copyText(section.feedback, section.latestArtifacts.sql, "SQL 已复制到剪贴板。");
    });

    section.copyCacheKeyButton.addEventListener("click", function () {
      copyText(section.feedback, templateApi.CACHE_KEY, "缓存 KEY 已复制到剪贴板。");
    });
  }

  function copyText(feedback, value, successMessage) {
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      feedback.textContent = "当前环境不支持自动复制，请手动复制。";
      feedback.className = "helper-text is-error";
      return;
    }

    navigator.clipboard
      .writeText(value)
      .then(function () {
        feedback.textContent = successMessage;
        feedback.className = "helper-text is-success";
      })
      .catch(function () {
        feedback.textContent = "复制失败，请手动复制。";
        feedback.className = "helper-text is-error";
      });
  }
})();

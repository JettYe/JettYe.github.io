(function () {
  const menuConfig = window.TZSelfHelpMenu || [];
  const menuTree = document.getElementById("menu-tree");
  const contentFrame = document.getElementById("content-frame");
  const pageKicker = document.getElementById("page-kicker");
  const pageTitle = document.getElementById("page-title");
  const pageDescription = document.getElementById("page-description");
  const toast = document.getElementById("toast");

  const pageMap = new Map();
  const labelMap = new Map();

  const state = {
    activeId: "welcome",
    expandedIds: new Set(),
    activeAncestors: [],
    toastTimer: null
  };

  const welcomePage = {
    id: "welcome",
    label: "欢迎页",
    page: "pages/welcome.html",
    description: "请选择左侧菜单，右侧会加载对应的独立子页面。"
  };

  buildIndexes(menuConfig);
  renderMenu();
  syncRouteFromHash();

  window.addEventListener("hashchange", syncRouteFromHash);

  menuTree.addEventListener("click", function (event) {
    const trigger = event.target.closest(".menu-button");
    if (!trigger) {
      return;
    }

    const itemId = trigger.dataset.id;
    const entry = pageMap.get(itemId);
    if (!entry) {
      return;
    }

    const item = entry.item;
    const hasChildren = Array.isArray(item.children) && item.children.length > 0;
    const isTopLevel = entry.ancestors.length === 0;

    if (item.type === "branch") {
      toggleExpanded(item.id);
      return;
    }

    if (item.type === "page" && isTopLevel && hasChildren) {
      loadPage(item, entry.ancestors);
      toggleExpanded(item.id);
      return;
    }

    if (item.type === "page") {
      loadPage(item, entry.ancestors);
      return;
    }

    showToast("“" + item.label + "”功能未开发。");
  });

  function buildIndexes(items, ancestors) {
    (items || []).forEach(function (item) {
      const lineage = ancestors || [];
      pageMap.set(item.id, { item: item, ancestors: lineage });
      labelMap.set(item.id, item.label);

      if (Array.isArray(item.children) && item.children.length > 0) {
        buildIndexes(item.children, lineage.concat(item.id));
      }
    });
  }

  function syncRouteFromHash() {
    const routeId = decodeURIComponent(window.location.hash.replace(/^#/, ""));

    if (!routeId) {
      loadPage(welcomePage, [], false);
      return;
    }

    const entry = pageMap.get(routeId);
    if (!entry || entry.item.type !== "page") {
      loadPage(welcomePage, [], false);
      return;
    }

    entry.ancestors.forEach(function (ancestorId) {
      state.expandedIds.add(ancestorId);
    });

    loadPage(entry.item, entry.ancestors, false);
  }

  function loadPage(item, ancestors, updateHash) {
    const lineage = ancestors || [];
    const description = item.description !== undefined
      ? item.description
      : welcomePage.description;

    state.activeId = item.id;
    state.activeAncestors = lineage.slice();

    if (updateHash !== false) {
      window.location.hash = item.id;
    }

    contentFrame.src = item.page;
    pageKicker.textContent = formatKicker(lineage, item.label);
    pageTitle.textContent = item.label;
    pageDescription.textContent = description;
    pageDescription.hidden = description === "";

    renderMenu();
  }

  function toggleExpanded(itemId) {
    if (state.expandedIds.has(itemId)) {
      state.expandedIds.delete(itemId);
    } else {
      state.expandedIds.add(itemId);
    }

    renderMenu();
  }

  function renderMenu() {
    menuTree.innerHTML = renderItems(menuConfig, 0);
  }

  function renderItems(items, level) {
    return items
      .map(function (item) {
        const hasChildren = Array.isArray(item.children) && item.children.length > 0;
        const isTopLevel = level === 0;
        const isExpanded = state.expandedIds.has(item.id);
        const isActive = state.activeId === item.id;
        const isPath = state.activeAncestors.indexOf(item.id) >= 0;
        const chevron = hasChildren
          ? '<span class="menu-chevron ' + (isExpanded ? "is-open" : "") + '">&#8250;</span>'
          : '<span class="menu-chevron menu-chevron-spacer">&#8250;</span>';
        const children = hasChildren
          ? '<div class="menu-children ' + (isExpanded ? "is-open" : "") + '">' + renderItems(item.children, level + 1) + "</div>"
          : "";

        return (
          '<div class="menu-node ' +
          (isTopLevel ? "is-top-level " : "") +
          (isActive ? "is-active " : "") +
          (isPath ? "is-path" : "") +
          '">' +
          '<button class="menu-button" style="--level:' +
          level +
          '" data-id="' +
          item.id +
          '" type="button" ' +
          (hasChildren ? 'aria-expanded="' + String(isExpanded) + '"' : "") +
          ">" +
          chevron +
          '<span class="menu-label">' +
          item.label +
          "</span>" +
          "</button>" +
          children +
          "</div>"
        );
      })
      .join("");
  }

  function formatKicker(ancestors, label) {
    const parts = (ancestors || []).map(function (itemId) {
      return labelMap.get(itemId);
    });
    parts.push(label);
    return parts.join(" / ").toUpperCase();
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("is-visible");

    if (state.toastTimer) {
      window.clearTimeout(state.toastTimer);
    }

    state.toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 2400);
  }
})();

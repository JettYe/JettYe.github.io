import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

function renderMenu(hash = "") {
  const elements = new Map();

  function makeElement(id) {
    return {
      id,
      innerHTML: "",
      textContent: "",
      hidden: false,
      src: "",
      className: "",
      listeners: {},
      addEventListener(type, handler) {
        this.listeners[type] = handler;
      }
    };
  }

  ["menu-tree", "content-frame", "page-kicker", "page-title", "page-description", "toast"].forEach(
    function (id) {
      elements.set(id, makeElement(id));
    }
  );

  const sandbox = {
    document: {
      getElementById(id) {
        if (!elements.has(id)) {
          elements.set(id, makeElement(id));
        }
        return elements.get(id);
      }
    },
    window: {
      location: { hash: hash },
      addEventListener() {},
      clearTimeout() {},
      setTimeout() {
        return 1;
      }
    },
    console
  };

  sandbox.window.window = sandbox.window;
  sandbox.window.document = sandbox.document;

  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync("assets/js/menu-config.js", "utf8"), sandbox);
  vm.runInContext(fs.readFileSync("assets/js/app.js", "utf8"), sandbox);

  return {
    menuHtml: elements.get("menu-tree").innerHTML,
    menuConfigSource: fs.readFileSync("assets/js/menu-config.js", "utf8"),
    cssSource: fs.readFileSync("assets/css/main.css", "utf8")
  };
}

test("menu renders without level/status badges", function () {
  const result = renderMenu();

  assert.doesNotMatch(result.menuHtml, /menu-badge/);
  assert.doesNotMatch(result.menuHtml, />一级</);
  assert.doesNotMatch(result.menuHtml, />二级</);
  assert.doesNotMatch(result.menuHtml, />待建</);
  assert.doesNotMatch(result.menuConfigSource, /badge:/);
  assert.doesNotMatch(result.cssSource, /\.menu-badge/);
});

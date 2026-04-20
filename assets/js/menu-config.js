(function () {
  const menu = [
    {
      id: "hong-kong-customs",
      label: "香港关务",
      type: "page",
      page: "pages/hong-kong-customs/index.html",
      description: "香港关务总览与预置菜单入口。",
      children: [
        {
          id: "hong-kong-seamless",
          label: "香港无缝",
          type: "placeholder",
          description: "香港无缝功能尚未配置具体页面。"
        },
        {
          id: "hong-kong-bundled",
          label: "香港捆绑",
          type: "placeholder",
          description: "香港捆绑功能尚未配置具体页面。"
        },
        {
          id: "hong-kong-declaration",
          label: "香港报关",
          type: "placeholder",
          description: "香港报关功能尚未配置具体页面。"
        }
      ]
    },
    {
      id: "mainland-customs",
      label: "大陆报关",
      type: "page",
      page: "pages/mainland-customs/index.html",
      description: "大陆报关页面预留与后续维护入口。"
    },
    {
      id: "road-manifest",
      label: "公路舱单",
      type: "page",
      page: "pages/road-manifest/index.html",
      description: "公路舱单总览以及确报相关维护能力。",
      children: [
        {
          id: "road-manifest-manifest",
          label: "舱单",
          type: "placeholder",
          description: "公路舱单的舱单节点暂未开发。"
        },
        {
          id: "road-manifest-confirm",
          label: "确报",
          type: "branch",
          description: "确报菜单可继续展开到具体维护动作。",
          children: [
            {
              id: "road-manifest-disable-license-plate",
              label: "禁用车牌",
              type: "page",
              page: "pages/road-manifest/disable-license-plate.html",
              description: ""
            }
          ]
        }
      ]
    },
    {
      id: "sea-manifest",
      label: "海运舱单",
      type: "page",
      page: "pages/sea-manifest/index.html",
      description: "海运舱单页面预留与后续维护入口。"
    },
    {
      id: "billing",
      label: "计费",
      type: "page",
      page: "pages/billing/index.html",
      description: "计费页面预留与后续维护入口。"
    }
  ];

  window.TZSelfHelpMenu = Object.freeze(menu);
})();

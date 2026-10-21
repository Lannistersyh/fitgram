# FITGRAM

日韩男生秋冬穿搭的本地资料站：真实原帖照片、可追溯的单品依据，以及中文搭配观察。站点采用原生 HTML、CSS、JavaScript，无依赖安装、构建步骤、网络字体或第三方脚本。

当前版本收录 **11 个真实来源、48 套造型、40 条独立原帖、212 条单品记录**。其中 8 个来源有入选造型，另 3 个保留公开主页与来源说明。造型按原帖中的具体图片组织，同一原帖可以贡献多套造型，因此48套不等于48条独立原帖。

## 手机与公网访问

GitHub Pages 地址：https://lannistersyh.github.io/fitgram/ 。无需同一局域网，也无需 Mac 保持开机。收藏和笔记保存在当前浏览器，不会在手机和电脑之间自动同步。仓库保留当前选中的48张原帖照片，未入选候选图不上传。

## 运行

双击 `index.html` 即可通过 `file://` 打开，已保存的图片与站内功能可以离线使用。
也可在本目录运行 `python3 -m http.server 8000`，再打开 `http://localhost:8000`。

网站运行不需要 Node 或 Python。只有重建内容、运行开发验收时才使用这些工具。原帖与官方商品页属于外部链接，需要联网；正常站内浏览使用本地照片，不依赖Instagram在线图片地址。

## 内容与证据

- **36 条原帖明示单品**：原文给出完整名称或目录编号；目录名称不自动证明制造品牌。
- **25 条品牌线索**：原帖提供品牌依据，具体款式仍未核实。
- **151 条视觉观察**：只描述照片中可见的颜色、廓形、位置与搭配，不确认品牌、型号或纤维成分。
- **27 个去重官方商品**已与TONYWACK官网同名同色详情页核对，在造型清单中出现31次。对应价格使用官网原币种 **KRW**，并保留核验日期与库存信息。
- 没有证据的价格、整套预算、拍摄气温和互动数字保持未知。48套的实测拍摄气温全部未核实；20条造型的发帖日期和点赞数未采集到。不会用虚构数字补齐。

风格、适用场景、配色与中文文案均为“本站观察”，不代表作者的自我风格定义。当前真实样本覆盖8类风格，分布不均；没有为了填满分类而替照片编造标签。

来源、原始文案与图片序号可在详情中追溯。多套LOOK的单品按实际图片对应，不能把一条原帖caption里的全部商品自动挂到首图。完整规则见 [真实来源说明](docs/REAL-SOURCES.md) 与 [官网商品证据](docs/PRODUCT-EVIDENCE.md)。

## 功能

- 首页信息流、来源追踪、分批加载、文案展开与造型详情。
- 发现页按关键词、地区、风格、温度记录、场景和证据级别筛选；可按“官网同款”筛出有已核实商品的12套造型。
- 详情保留真实照片比例，编号热点与单品清单双向高亮，提供原帖依据与已核实官方商品入口。
- 本地喜欢、收藏、衣橱与笔记持久化；本地喜欢不会修改原帖的公开点赞数字。
- 11个来源主页与分类图鉴、静态图片速览、本站风格观察与日韩对照、深浅主题和键盘操作。
- 衣橱按币种小计已核实价格；未知价格不当作零元，也不合成虚假的整套预算。

图片速览是本地静态照片动效，不是原作者发布的视频；没有音轨。站点没有后端、Instagram账户登录、真实私信发送、上传发布或下单功能，站内追踪也不会在Instagram执行关注。

## 文件结构

```text
fitgram/
├── index.html
├── README.md
├── css/                         主题、布局、组件与响应式样式
├── js/
│   ├── data.js                  真实来源与最终48套造型快照
│   ├── components.js            图片、证据标签与组件
│   ├── detail.js                图片热点、清单与本站笔记
│   ├── views.js / views-extra.js 各页面
│   └── utils.js / store.js / router.js / app.js
├── assets/
│   ├── real/                    已入选的真实原帖照片
│   ├── placeholder/             来源字母头像与中性缺图卡
│   └── research/
│       ├── raw_sources.json     11个公开来源的主页采集
│       ├── raw_posts.json       完整候选原帖，非正式展示清单
│       ├── selected_posts.json  最终48套选图、原帖与图片序号
│       ├── analysis-jp.json / analysis-jp-extra.json 日系逐图观察
│       ├── analysis-kr.json / analysis-tony.json 韩系逐图观察
│       ├── analysis.json        由分组观察汇总生成
│       └── product_verification.json 官方商品核验记录
├── tools/
│   ├── build_real_data.py       将选图和证据转换为data.js
│   ├── assemble_real_collection.py 汇总选图、逐图观察与官网证据
│   └── check_integrity.js       无网络的数据、图片、语法验收
└── docs/                        设计来源、商品证据与验收记录
```

## 路由

`#/`、`#/explore`、`#/reels`、`#/bloggers`、`#/blogger/ig-tonywack_official`、`#/p/r042`、`#/compare`、`#/trends`、`#/closet`、`#/about`。另支持 `#/tag/...` 话题聚合。

路由使用hash，直接打开详情或刷新不会向服务器请求对应子路径。来源ID使用 `ig-账号名`，造型ID使用 `r...`，避免与先前演示记录的存储状态混淆。

## 添加、替换与重建内容

1. 将实际原帖图片放入 `assets/real/来源账号/`，在 `raw_posts.json` 记录候选原帖的本地路径、原帖code、永久链接、准确图片序号及宽高。不要将相邻推荐帖的文字合并成同一原帖。
2. 编辑 `analysis-jp.json`、`analysis-jp-extra.json`、`analysis-kr.json` 或 `analysis-tony.json`，用唯一分析键关联中文观察和单品热点，并填写 `sourceCode`、`sourceImageIndex`。热点坐标为对应首图的0～1比例；同一原帖不同图片可使用不同分析键。
3. 只有原文明确品名或可核验资料支持时才使用 `exact`。品牌线索使用 `brand`；只看外观使用 `visual`，不填写猜测品牌或型号。
4. 官方价格仅在 `exact`、`officialProductVerified=true`、HTTPS商品详情和币种都有证据时保留。不要手工估算未知价格、日期、互动或整套预算。
5. 运行 `python3 tools/assemble_real_collection.py`，合成 `selected_posts.json` 与 `analysis.json`；再运行 `python3 tools/build_real_data.py --dry-run`。确认后运行 `python3 tools/build_real_data.py`，最后运行 `node tools/check_integrity.js`。

构建默认读取 `selected_posts.json`，不会把132条候选全部当作正式造型。`analysis.json` 是汇总产物，直接修改会被下一次assemble覆盖，长期修改应写入对应分组分析文件。普通script将数据写入 `window.FITGRAM_DATA`，页面运行不使用ES Module或fetch读取本地JSON。更换图片构图后必须重新确认热点；更改图片比例时同步更新实际宽高。

缺图依次尝试已采集的原帖远程地址与中性缺图卡。远程地址可能过期；完整交付中48张主图已在本地。缺图卡没有人物或服装，不会用另一张相似造型冒充原帖。

## 存储与限制

本地喜欢、收藏、衣橱、来源追踪与笔记只保存在当前浏览器。`file://`与HTTP通常使用不同存储空间；切换浏览器或清除网站数据不会自动同步。存储被禁用时降级为会话内存，关闭页面后临时记录会丢失。剪贴板权限由浏览器决定，界面提供失败反馈。

公开主页数字、商品价格和库存是采集时记录，不是实时信息。部分规格有货、部分售罄的商品标记为混合库存；未执行结账验证，也没有换汇或计算跨境费用。零售目录名不等于已核实制造品牌。图片、原文与人物肖像的权利属于各自权利人，资料索引不表示合作、赞助或背书。

完整静态验收见 [数据验收](docs/ACCEPTANCE-DATA.md)，实际浏览器回归见 [交付验收](docs/ACCEPTANCE.md)，设计与来源取舍见 [设计参考](docs/DESIGN-REFERENCES.md)。

## 后续扩展

补充自有或获授权的照片及更多可核验的原帖单品；增加账户与跨设备衣橱后端；在HTTP/HTTPS环境增加Service Worker与安装清单，提供PWA离线缓存与安装能力。

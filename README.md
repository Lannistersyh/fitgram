# FITGRAM

日韩男生穿搭资料站：真实 Instagram 原帖照片、逐件证据、中文搭配观察。原生 HTML/CSS/JavaScript，无依赖安装、构建步骤或 CDN。

线上地址：[https://lannistersyh.github.io/fitgram/](https://lannistersyh.github.io/fitgram/)。手机无需与电脑连接同一局域网，Mac 关机不影响访问。收藏与笔记保存在各自浏览器，不跨设备同步。

## 购买与搭配图鉴

新增 [单品图鉴](https://lannistersyh.github.io/fitgram/?v=20261021-catalog1#/catalog)：鞋子、裤子、衬衫各 10 款，真实品牌商品图、完整型号与官方入口。点图放大，展开查看搭配与试穿重点；按品牌/货号搜索，书签建立本地购买清单，并按币种分别小计。提供 3 套跨类别组合。

这些是参考年轻男团穿搭比例的编辑选品，不默认是艺人同款。26 款取得官网当地价格，4 款价格留空；海外价格不等于大陆到手价。30 张图片约 1.78 MB，29 张单品图与 1 张品牌上身图。核验与维护见 [图鉴说明](docs/ITEM-ATLAS.md)。

## 当前选图

2026-10-21 按用户反馈更新：下架旧日系来源，改用高粉日本创作者；韩国内容重点转向 CORTIS 等年轻男团。

- 48 套造型，36 条独立原帖，7 个来源，48 张实际原帖照片。
- 男团参考 21 套：CORTIS 13、BOYNEXTDOOR 发布的本团与合作内容 6、RIIZE 2。
- 新日系 11 套：Ryo Takashima 5、Yoshiaki 6；主页采集显示粉丝分别约 47.2 万和 51.2 万。
- 另保留 0neonones_ 的 4 套实用搭配、TONYWACK 的 12 套同款档案。
- CORTIS、BOYNEXTDOOR、RIIZE 主页采集显示约 1,650 万、470 万、520 万粉丝。数字是公开缩略值的采集记录，不是实时精确统计。

首页优先展示男团参考，并提供男团专用入口；发现页支持“只看男团参考”和“只看有官方同款”。合作原帖不把嘉宾冒称为发布团体成员，音乐节后台与广告合作按原帖说明场景。没有原文依据时，不凭人脸指定成员姓名。

## 单品依据

184 条单品记录：32 条原帖明示、23 条品牌线索、129 条视觉观察。TONYWACK 的 27 个去重官方商品在清单出现 31 次，保留 KRW 原币种价格、核验时间和库存快照。其余记录不猜价格、制造品牌、型号或材质成分。

原帖未提供拍摄气温；48 套实测气温均未知。23 套原帖日期及互动未核实。中文风格、场景、配色和搭配说明属于本站编辑观察；原文和原帖链接保留用于复核。不同图片可分别分析，不把一条原帖的所有商品挂在首图。

## 运行与修改

双击 `index.html` 可通过 file:// 打开；站内照片与本地功能可离线浏览。官方商品页和 Instagram 原帖需要联网。普通 script 写入 `window.FITGRAM_DATA`，不使用 ES Module 或 fetch 读取本地 JSON。

当前来源和分析分组由 `assets/research/collection.json` 管理。编辑 `analysis-idols.json`、`analysis-jp-v2.json`、`analysis-kr.json` 或 `analysis-tony.json`，再依次执行：

```sh
python3 tools/assemble_real_collection.py
python3 tools/build_real_data.py --dry-run
python3 tools/build_real_data.py
node tools/check_integrity.js
```

独立选品目录通过 `python3 tools/build_catalog.py` 生成，通过 `node tools/check_catalog.js` 验收，不受上述造型重建覆盖。

新增实际原帖记录写入 raw_posts.json，保留永久链接、本地图片、真实宽高与图片序号。selected_posts.json 和 analysis.json 是合并结果，直接修改会被下次合并覆盖。已有分析键保留站内 ID，删除内容的 ID 不复用。

照片仅作等比缩放与压缩以便手机加载，未裁剪、合成或生成；完整下载保留本机备份。正式仓库上传当前48张造型照片及30张商品图；候选图和旧版资料保留在本机备份，不进入当前图库。替换图片构图后重新核对热点，不能沿用旧坐标。

## 功能与权利

首页、搜索筛选、图鉴、来源主页、详情热点、静态图片速览、日韩对照、编辑选题、衣橱、笔记、深浅主题和键盘操作。静态速览不是原作者视频，没有音轨；喜欢和追踪不会在 Instagram 上执行操作。存储受限时降级为会话内存。

图片、原文、人物肖像和品牌标志归各权利人所有。本站保留原帖来源，不表示合作、赞助或背书。商品信息以当前官网为准，未进行下单、运费、税费或换汇验证。

详细证据见 [真实来源说明](docs/REAL-SOURCES.md)、[商品核验记录](docs/PRODUCT-EVIDENCE.md)、[验收](docs/ACCEPTANCE.md)。

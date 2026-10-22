# FITGRAM

日韩男生穿搭资料站：真实 Instagram 原帖照片、逐件证据、中文搭配观察。原生 HTML/CSS/JavaScript，无依赖安装、构建步骤或 CDN。

线上地址：[https://lannistersyh.github.io/fitgram/](https://lannistersyh.github.io/fitgram/)。手机无需与电脑连接同一局域网，Mac 关机不影响访问。收藏与笔记保存在各自浏览器，不跨设备同步。

## 分类图鉴 / 2026-10-22

打开 [穿搭参考图鉴](https://lannistersyh.github.io/fitgram/?v=20261022-atlas1#/catalog) 或 [全部单品](https://lannistersyh.github.io/fitgram/?v=20261022-atlas1#/catalog/all)。28 张不重复参考照片来自用户提供的抖音选辑，按衬衫、针织/上衣、裤子、外套、皮鞋/靴子、首饰和配件分类；支持场景、姿势、文字搜索、本地收藏、单图放大及保存。

逐张列出可见款式、比例与动作；25 张关联真实近似商品，共 47 条关联，可从照片跳到商品，也可从商品回看照片。未找到合适商品的 3 张保留观察和查款关键词，不自动填入不相干的商品。

原有 54 款与本次 7 款合为 61 件：皮鞋 16、裤子 12、衬衫 17、外套 7、首饰 6、针织/上衣 3。新增来自 No Maintenance、ASKET 和 Schott 的真实官网单品图，包括白衬衫、亨利领、Polo、黑 T、两条裤子和棒球夹克。关联均为近似选品，逐项解释颜色、袖长、口袋或版型差异，没有确认这组照片中的任何品牌同款。

8 张原帖拼图保留供复核；封面的 12 格是重复照片，不额外计数。单图为拼图裁切，本站等比例缩为 900px 展示、360px 缩略图，尚未找到独立摄影原图。整理账号“幸福小孩儿”不等于照片原作者；原帖、拼图序号、裁切位置、坐标、原始宽高和校验值均保留。原始无损裁切另存于本机参考图文件夹。

## 国际选品与大陆购买图鉴

打开 [国际审美选品](https://lannistersyh.github.io/fitgram/?v=20261022-world1#/catalog/international)：新增鞋、衬衫、外套、男士首饰各 6 款，共 24 件，来自 Our Legacy、ADIEU、No Maintenance、Entire Studios 和 All Blues 的具体官方商品页。按轮廓、材质和整身搭配选择，不以大陆可购或原有人民币预算限制国际区。

原有 54 件商品均有真实单品主图；国际区的 12 件衬衫和外套另附同款、同色品牌上身图，可在大图里切换。支持分类、鞋型、首饰类型、外套长短、品牌/材质/编号搜索、跨选品区收藏、按币种分别小计和 6 套编辑组合定位。全部资源本地保存，file:// 下可用。

[大陆购买清单](https://lannistersyh.github.io/fitgram/?v=20261022-world1#/catalog/shoes) 保留皮鞋、裤子、衬衫各 10 款；30 条 CNY 商品或目录记录中 26 条在 ¥1,000–3,000 内。国际区保留 EUR/USD 官网记录价，不换汇、不作为大陆到手价。

Dr. Martens 大陆目录价与旗舰店现货分别说明；国际区缺货和未核实配送的款式仍可作为审美参考。真实图片、资料边界与维护方式见 [图鉴说明](docs/ITEM-ATLAS.md)。

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

独立选品目录通过 `python3 tools/build_catalog.py` 生成，通过 `node tools/check_catalog.js` 和 `node tools/check_atlas.js` 验收，不受上述造型重建覆盖。

新增实际原帖记录写入 raw_posts.json，保留永久链接、本地图片、真实宽高与图片序号。selected_posts.json 和 analysis.json 是合并结果，直接修改会被下次合并覆盖。已有分析键保留站内 ID，删除内容的 ID 不复用。

Instagram 造型照片仅作等比缩放与压缩；本次抖音参考单图由原帖拼图裁切，并逐张记录来源坐标。均未合成、补绘或生成商品外观。仓库保存当前 48 张原帖造型照片、28 张参考单图及缩略图、8 张来源拼图、61 张商品主图和 12 张品牌上身图；候选图和旧版资料留在本机备份。替换图片构图后重新核对热点，不能沿用旧坐标。

## 功能与权利

首页、搜索筛选、图鉴、来源主页、详情热点、静态图片速览、日韩对照、编辑选题、衣橱、笔记、深浅主题和键盘操作。静态速览不是原作者视频，没有音轨；喜欢和追踪不会在 Instagram 上执行操作。存储受限时降级为会话内存。

图片、原文、人物肖像和品牌标志归各权利人所有。本站保留原帖来源，不表示合作、赞助或背书。商品信息以当前官网为准，未进行下单、运费、税费或换汇验证。

详细证据见 [真实来源说明](docs/REAL-SOURCES.md)、[商品核验记录](docs/PRODUCT-EVIDENCE.md)、[验收](docs/ACCEPTANCE.md)。

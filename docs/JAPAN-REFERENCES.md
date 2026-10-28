# 日系新选 / 2026-10-28

线上入口：[日系新选 · 20 套](https://lannistersyh.github.io/fitgram/?v=20261028-japan2#/catalog/japan)。这些是 Instagram 发布账号公开的真人穿搭照片；其中 3 张为原帖中的独立品牌模特图，保留原有文字，未作为发布者本人的街拍。

本轮在 Instagram 站内按 `メンズコーデ`、`シティボーイ`、`きれいめカジュアル` 发现账号，再查看六个公开主页。逐张筛过 47 个照片帖封面，并查看三个原帖的 55 张轮播帧；最终选 20 张不同搭配，来自 19 篇原帖、5 个发布账号。这是定向选辑，不代表穷尽 Instagram。明确标注 AI 生成的发现结果 `looksnote11` 未采用。

## 来源与选图

- [@dai.fashion510](https://www.instagram.com/dai.fashion510/)：JP01–JP03；主页显示约 23.8 万粉丝。
- [@genji_official_](https://www.instagram.com/genji_official_/)：JP04–JP07；约 28.5 万。
- [@kei_adrer](https://www.instagram.com/kei_adrer/)：JP08–JP10；约 38.3 万。分别取 B-3 原帖第 6 张、挂钩夹克原帖第 2 张、针织帽衫原帖第 12 张；后两套来自同一轮播但服装不同。
- [@ryo__takashima](https://www.instagram.com/ryo__takashima/)：JP11–JP14；约 47.2 万。
- [@ultrabra1n](https://www.instagram.com/ultrabra1n/)：JP15–JP20；约 32.1 万。

粉丝数为 2026-10-28 公开主页的缩略显示，不作为精确值或实时统计。发布账号与摄影作者分别记录，摄影署名以原帖为准。未凭人脸指定人物身份。

选图比较主单品、廓形、叠穿和配色。同套换角度、仅换颜色不另算；静物、建筑、生日合照、多人宣传拼图与模特架搭配不收录。正文逐套给出差异和搭配公式，覆盖城市休闲、干净日常、复古工装、暗色个性、柔和针织、学院休闲、复古户外等方向。服装风格属于编辑归纳，不作“某类人一定喜欢”的结论。

原图只等比缩小与 JPEG 压缩，保留完整画面；展示图最长宽度 900px、缩略图 360px。20 张展示图与 20 张缩略图合计约 4.54 MB。原始字节的 SHA-256、来源原帖、轮播序号、发布时间、实际源图尺寸、派生图片尺寸与校验值分别记录。

另外生成 64 位 difference hash 作近似图提示。最接近的是 JP06 与 JP07，距离 8；已经逐张复看：前者为亨利领与弧线粗花呢裤，后者为中长猎装与深色牛仔，是同背景下不同服装。另与已有 76 张首页及抖音图片比较，最小距离 14；未出现接近重复图阈值的结果。哈希不能代替审美筛选。

## 网站行为

- `#/catalog/japan` 仅显示新增 20 张；`#/catalog/douyin` 显示原抖音选辑 28 张；`#/catalog` 和 `#/catalog/atlas` 合并为 48 张。
- 各分组均可继续按服装类别、场景、姿势、季节、搜索与收藏筛选。新增路线筛选、包包类别和发布账号信息，鞋履标签涵盖皮鞋、运动鞋及凉鞋。
- 日历沿用北京时间与北半球月份规则。新图季节标注为春 15、夏 3、秋 18、冬 4；跨季分别计入。图中冬季单层或局部展示的局限写在每张的季节说明里，发布日期不用来推断气温。
- 详情保留大图保存、原帖链接、轮播序号、原文能支持的品牌线索、学习重点及下一套。直接打开 JP 详情时返回日系分组。
- 与已有商品建立 49 条 `similar-style` 关联，逐条解释版型、材质、颜色或结构差别。原帖确有品牌信息时单独呈现；目录近似商品不会升级成照片同款。
- 商品总数保持 149，首页 IG 档案仍为 48 套 / 36 篇 / 7 个来源；原抖音 28 张和原商品价格快照均保持原记录。

## 数据与维护

`assets/research/japan-looks-1.json` 至 `japan-looks-4.json` 每文件 5 条；`japan-sources.json` 保存主页快照，`japan-selection-audit.json` 保存筛选范围和 47 条去留理由。`assets/references/japan2026/{full,thumb}/` 仅存入围照片，候选与原始文件留在仓库外的项目参考图目录。

```sh
python3 tools/build_catalog.py
node tools/check_japan.js
node tools/check_integrity.js
node tools/check_atlas.js
node tools/check_seasons.js
```

构建生成 `window.FITGRAM_JAPAN`，由普通 script 标签载入，不使用 ESM、CDN 或 fetch 本地 JSON，保留 file:// 离线浏览。

本机采集与候选材料统一放在 `/Users/admin/开发项目/fitgram/参考图/日系穿搭-20261028/`，不放回科研项目。浏览器采集复用一个 Edge 工作标签；额外的一次标签清理审计也已结束，用户原有 6 个标签保留，审计时总数 7，活动自动化会话归零。

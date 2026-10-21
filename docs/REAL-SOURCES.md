# 真实来源与证据处理

本轮将 FITGRAM 的内容层迁移为真实 Instagram 公开原帖索引。公开来源、原帖文字、原帖图片与本站中文视觉观察分别保存。站内风格标签不代表作者本人对风格的定义，合集、杂志与品牌账号也不称为虚构穿搭博主。

当前处理脚本为 `tools/build_real_data.py`。脚本不联网、不操纵浏览器、不下载图片；采集与图片保存由主任务完成。缺少实际原帖记录时，脚本停止，不会拿旧的虚构内容凑数或覆盖正式数据。

## 本轮来源清单

地区分组来自本次任务给定的采集清单，仅用于编辑导航。个人身份、主页名称、粉丝数、认证状态与来源分类，以实际采集的公开主页证据为准；没有证据时不补写。

日系来源：

- `@japan_streetstyle_`
- `@i_am_kentadesu_`
- `@nanikajapan`
- `@kabuki_610`
- `@mensnonnojp`

韩系来源：

- `@0neonones_`
- `@gentlemans_seoul`
- `@alyxtsu`
- `@coor_official`
- `@tonywack_official`
- `@solidhomme`

`sourceKind` 使用 `creator`（创作者）、`curation`（街拍或选图合集）、`magazine`（杂志媒体）、`brand`（品牌）四个非空枚举。缺失时保持 `null`。历史输入别名 `individual` 转为 `creator`，`media` 转为 `magazine`。账号 handle 带 `official` 或名字像品牌，本身不能替代主页证据。

## 输入文件

所有 JSON 文件均采用 UTF-8，位于 `assets/research/`。原始采集文件不应被编辑观察覆盖。修正观察时编辑 `analysis-jp.json`、`analysis-jp-extra.json`、`analysis-kr.json` 或 `analysis-tony.json`，再运行合并脚本生成 `analysis.json` 与 `selected_posts.json`；直接编辑合并结果会被下一次合并覆盖。顶层数组与下述对象包装均受支持。

### raw_sources.json

```json
{
  "collectedAt": "2026-10-21T12:00:00+08:00",
  "sources": [
    {
      "handle": "coor_official",
      "url": "https://www.instagram.com/coor_official/",
      "name": null,
      "region": "kr",
      "sourceKind": null,
      "bioRaw": "",
      "followers": null,
      "followersRaw": null,
      "following": null,
      "postsCount": null,
      "verified": null,
      "avatarUrl": null,
      "evidence": [
        {"field": "sourceKind", "text": "公开主页中的原文证据", "url": "https://www.instagram.com/coor_official/", "observedAt": null}
      ]
    }
  ]
}
```

- `handle` 可带 `@`，也可以是主页 URL；构建时统一为小写账号。
- `name` 只填公开主页名称。未采集时以账号作为站内名称，不编造真人中文姓名。
- 数值只接受明确采集到的非负数字。`7.2K` 等缩略显示可放 `followersRaw`；不要求换算成精确数字。
- 未观察到认证，站内 `verified` 为 `false`，同时保留原始 `verificationObserved`。
- 站内 ID 固定为 `ig-` 加标准化 handle，不再使用 `b1`，避免旧关注状态误挂真实来源。
- 头像使用账号首字母生成的独立 SVG，不作为真实人物头像。

### raw_posts.json

```json
{
  "collectedAt": "2026-10-21T12:00:00+08:00",
  "posts": [
    {
      "id": "r001",
      "code": "ACTUAL_POST_CODE",
      "sourceHandle": "@coor_official",
      "sourceUrl": "https://www.instagram.com/p/ACTUAL_POST_CODE/",
      "date": null,
      "captionRaw": "",
      "imagesLocal": ["assets/real/r001-1.jpg"],
      "imageUrls": [],
      "altTexts": [],
      "taggedBrands": [],
      "counts": {"likes": null, "comments": null, "saves": null},
      "location": null,
      "collectedAt": null
    }
  ]
}
```

- 原始候选 `raw_posts.json` 按原帖 `code` 去重；没有 code 时，可从 `/p/CODE/` 或 `/reel/CODE/` URL 解析。正式 `selected_posts.json` 按造型组织，同一原帖可重复 code，但每套必须有唯一的 `id` 与 `analysisKey`，并保留真实 `sourceImageIndex`。合并脚本保留已有 analysisKey 的站内 ID，新增造型不会重排旧收藏 ID。
- `imagesLocal` 保存实际下载的原帖图片路径，不混用旧的插画、旧的 Unsplash 地址或与原帖无关的照片。
- 本地图不存在时会记录警告，页面使用一张不含人物、服装或模仿造型的中性出处卡。不会用臆造图补齐真实穿搭。
- `imageUrls` 只保留该原帖实际采集到的 HTTP(S) 图地址，脚本不会探测地址或下载资源。
- `taggedBrands` 推荐使用 `{name,handle,evidenceText,evidenceUrl}`；原帖标签只能证明账号被提及，不能自动证明图中每件服装都属于该品牌。
- 原帖未公开或未采集到的点赞、评论、收藏数量保持 `null`；不按粉丝量或其他比例估算。
- `date` 未核实则为 `null`。脚本只读取 ISO 日期，不把页面采集日期当作发帖日期。
- 账号是发布者；出镜者身份、拍摄者身份与服装归属需各自有证据，不因账号名称而自动认定。

### analysis.json

```json
{
  "posts": {
    "ACTUAL_POST_CODE": {
      "title": "本站编辑标题",
      "caption": "本站基于图片作出的中文搭配观察，明确区分可见结构与未核实信息。",
      "styles": ["韩系极简"],
      "scenes": [],
      "tempBand": null,
      "temperatureNote": "原帖未提供气温",
      "aspect": "4:5",
      "palette": [],
      "layers": [
        {"name": "可见外层", "desc": "描述照片中可见的廓形与颜色", "identification": "visual", "evidenceText": "对应的可见细节", "evidenceUrl": "https://www.instagram.com/p/ACTUAL_POST_CODE/"}
      ],
      "items": [
        {"name": "可见外套", "brand": null, "category": "外套", "hotspot": {"x": 0.5, "y": 0.4}, "identification": "visual", "evidenceText": "对应的可见细节", "evidenceUrl": "https://www.instagram.com/p/ACTUAL_POST_CODE/", "productUrl": null}
      ]
    }
  }
}
```

- 观察按真实 `code` 索引，也兼容以站内 `r001` ID 索引。
- 不强行凑满三层。被遮住的内搭、看不见的鞋、未展示的配饰均可不写。
- `visual` 观察使用“毛呢质感”“类似灯芯纹理”等措辞；仅凭照片不确认纤维成分、克重、尺码或型号。
- 未知温度转为站内 `unknown`。显式写入温度带时，会标为本站穿搭参考，不当作拍摄时实测天气。
- 风格仅采用站内既有十类枚举，均标为“本站观察”；没有做视觉判断时允许为空。
- 图片上的热点坐标取 0～1，针对实际首图，而非旧插画的位置。

## 单品证据分级

- `exact`：原帖文字、明确产品标签或可核验产品页将单品对应到具体款式。必须同时有 `evidenceText` 与有效 `evidenceUrl`。只有该级可保留具体 `productUrl`。
- `brand`：原帖明确提供品牌线索，但款式未核实。必须有品牌名、原文证据与来源 URL；不填写具体产品链接，不升级成“已确认同款”。
- `visual`：本站对照片可见颜色、长度、廓形和搭配关系的观察。品牌、具体型号与价格不作确认。默认单品级别为此级。

价格只有在 `exact`、`officialProductVerified=true`、具体 HTTPS 商品页及核验记录一致时采用。本轮 27 个去重 TONYWACK 官方商品在清单中出现 31 次，价格保留 KRW 原币种，并记录 `verifiedAt`、`priceBasis` 与库存快照。其余单品价格保持 `null`；品牌信息不能自动填补价格。整套 `budget/budgetMin/budgetMax` 仍全部为 `null`，不把未知单价当作零元。

精选模拟评论清空。站内新增的用户评论仍是本站本地内容，不能呈现为原帖中的真实评论。

## 构建与校验

先校验，不写入站点：

```sh
python3 tools/build_real_data.py --dry-run
```

确认输入完整后生成站点数据：

```sh
python3 tools/assemble_real_collection.py
python3 tools/build_real_data.py
node tools/check_integrity.js
```

输出为 `js/data.js`、独立首字母头像、中性 `assets/placeholder/neutral.svg` 与 `assets/research/real-data-audit.json`。`window.FITGRAM_DATA.mode` 为 `real-sources`，`capturedAt` 来自原始采集文件。脚本不读旧数据，因此不会混入旧虚构博主、模拟粉丝量、模拟互动数、随机远程图片或虚构单品。

趋势页只汇总已有分析标签的真实原帖，标明“本站观察 · 非行业趋势统计”。日韩对照只给出可回到原帖核对的观察维度，不将少量照片扩写为对整个地区的风格定论。实际图片与原文出处仍需在详情中显示。

前端必须将 `null` 呈现为“未公开／未采集／未核实”，不得显示成数字 0、假预算、默认气温或无证据蓝勾。旧插画、虚构数据、旧截图和旧生成器已移至同级 `fitgram-legacy-demo/` 备份目录，不属于正式站点。采集辅助脚本只复用明确指定的自有标签，需设置 `FITGRAM_CDP_TARGET`；禁止并行操作浏览器，总标签数不超过 8，结束后关闭自有标签。正式页面运行及离线构建不需要浏览器连接。

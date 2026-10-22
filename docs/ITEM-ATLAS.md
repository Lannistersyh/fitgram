# 分类图鉴 / 28 张参考与 61 件单品 / 2026-10-22

## 照片与商品合并

`#/catalog` 和 `#/catalog/atlas/:category` 展示 28 张不重复参考照片；`#/catalog/reference/:id` 为逐张详情。类别包含衬衫、针织/上衣、裤子、外套、皮鞋/靴子、首饰、配件，照片可以属于多个类别。场景、姿势、搜索与本地收藏可以组合筛选。

25 张照片连接到实际商品，共 47 条 `similar-style` 关联；每条说明商品与照片的差异。照片中的款式观察不是品牌、纤维成分或货号鉴定。3 张未有合适商品的参考保留关键词；本批独立摄影原图和确切同款均未确认。

`#/catalog/all` 按单品类别合并原 54 款与新增 7 款，`#/catalog/new` 单独查看本次补充；原国际和大陆清单仍可浏览。7 款来自 No Maintenance、ASKET、Schott，记录官网原币种、日期、材质依据、编号类型和实际对应颜色商品图。

来源是「幸福小孩儿」抖音选辑，发布于 2026-10-20 18:38:09。8 张拼图保留原字节及 SHA256，后 7 张各裁 4 格共 28 张，封面 12 格不重复录入。单图原始裁切为 1080px 宽；网站只等比缩为 900px 及 360px，没有补绘。每条保留拼图序号、位置、坐标、原宽高和无损裁切校验值。选辑整理账号不视作独立摄影原作者。

参考观察源文件 `reference-looks-{1,2,3,4}.json`、来源记录 `reference-source.json`、新增商品 `catalog-reference-additions.json` 经 `tools/build_catalog.py` 合并成普通全局脚本 `reference-data.js` 与 `catalog-data.js`。`node tools/check_atlas.js` 验证 28 张唯一照片、8 张来源拼图、图像尺寸、裁切坐标及全部商品关系；原商品与 IG 资料检查继续保留。

## 国际审美选品

用户新增要求：除大陆可买的款式，也看其他国家的鞋、衬衫、外套和男士首饰，不要求一定可购，优先保证审美与真实素材。国际区新增 24 款，四类各 6 款；大陆区原有 30 款和预算偏好保留。

品牌为 Our Legacy、ADIEU、No Maintenance、Entire Studios、All Blues。编辑观察围绕圆钝鞋头、旧化或毛感皮面、暗格纹与轻垂感衬衫、短外套与宽裤比例、少量银饰。国际总览交错展示鞋、衣服和首饰，分类页可逐类比较。3 套新组合分别串联鞋、衬衫、外套、首饰，并说明下身搭配；与大陆原有 3 套互相独立。

24 款均取官网具体商品资料和无模特单品图；12 件衬衫与外套另附同款、同色的官方上身图。在放大对话框中可切换单品与上身参考，不把模特比例当作用户穿着承诺。所有照片只等比缩放、转 JPEG，不重画、不修改商品外观。

Our Legacy 使用公开页面 Centra 商品数据的款名、sku、颜色、材质、EUR 价格和对应图片；No Maintenance 使用商品正文与 Product JSON-LD 的 USD 价，款式路径标明为官网标识，避免把含尺码的变体编号冒充通用货号。ADIEU 逐一核对男款 M 编号与尺码说明。All Blues 保留官网明确提供的 EUR 价目及所选规格，42 cm 项链不写成宽松长链；925 银不写成纯银含量 100%。Entire Studios 读取 ProductGroup 的具体变体和 USD 价格，Pod Puffer 仅标注已取得的面料信息，不推断羽绒或填充成分。

官网标记缺货的商品可作档案参考。国际记录全部为 `mainlandStatus=unverified`，不参与人民币预算筛选、不承诺发往大陆。价格是官网原币种采集记录，不是大陆成交价。

新增路由：`#/catalog/international` 及其 `/shoes`、`/shirts`、`/outerwear`、`/jewelry` 子页。`#/catalog` 现进入穿搭参考图鉴；`#/catalog/all` 合并全部 61 件商品。`#/catalog/international` 保留国际区；旧 `#/catalog/shoes`、`/pants`、`/shirts` 保留大陆区。收藏跨区共用，点击条目跳到相应区域、类别和商品。

国际资料按品类分别保存于 `assets/research/catalog-international-{shoes,shirts,outerwear,jewelry}.json`，组合在 `catalog-international-outfits.json`；每个文件小于 700 行。生成脚本合并为 `js/catalog-data.js`。

## 大陆购买清单（沿用）

用户确认：中国大陆购买，单件以人民币 1,000–3,000 元为主；鞋履选择「圆头、稍厚底的德比鞋／乐福鞋」及「切尔西靴、系带短靴」。三类各 10 款，按年轻男团私服中的宽松比例和格纹叠穿提供编辑搭配建议，不默认是艺人同款。

## 选品与来源

10 双皮鞋分为 2 双系带皮鞋、4 双乐福鞋、4 双靴子，均有大陆 CNY 目录或商品记录价，且在常用预算内。G.H.BASS 包含厚底系带、便士、马衔扣、链条乐福；Dr. Martens 包含 1461、Adrian、2976、1460、Jadon 和棕色 1460 Bex。每款有明确鞋面材质和对应官方资料链接。

30 件商品中，26 件在常用预算内，4 件低于 1,000 元作为基础补充。未使用外币换汇或划线原价凑预算。裤子与衬衫共 20 款来自 I.T 中国官方商城和 Ralph Lauren 中国官网。

G.H.BASS 的价格来自 I.T 男款商品页当前有货尺码的 `skus.salePrice`，4 款鞋面均标注牛皮革；鞋底按各款商品资料分别记录，不把皮革底一概写作橡胶底。I.T 编号标明为零售商编号，不冒称制造商完整货号。采集时部分尺码可售，不承诺全尺码现货。

Dr. Martens 中国官网证书过期，6 款鞋的价格只作为大陆目录参考。购买按钮使用官网实际指向的 `https://drmartens.tmall.com` 官方旗舰店首页，按完整货号查款；未验证的旧精确天猫详情不作为可买链接。目录不能证明旗舰店当前有货或同价。1460 使用当前 10072004 对应页面与图片，未混用旧页面另一货号的图片。Jadon 的 Polished Smooth 皮革材质由同货号美国官网补证，未据此改用美元价格。

## 页面与操作

- `#/catalog`，`#/catalog/shoes`、`#/catalog/pants`、`#/catalog/shirts`、`#/catalog/all`。
- 鞋类提供「全部鞋型」「系带皮鞋」「乐福鞋」「靴子」筛选，可与搜索、预算、收藏组合使用。
- 点图放大，Escape 关闭；展开「怎么搭 · 购买前看」可见搭配、鞋面材质、试穿重点、库存与渠道限制。
- 预算内单品优先排列；区分官方零售商直接入口与官方旗舰店按货号查款。
- 收藏保存在当前浏览器的 `fitgram.catalogSaves`；3 套组合全部使用皮鞋，并显示三件人民币记录价合计、定位到具体商品。合计不含运费、活动和实时差价。

## 数据与维护

用户偏好在 `assets/research/purchasing-preferences.json`；核验记录在 `assets/research/catalog-{shoes,pants,shirts}.json`，商品照片保存在 `assets/catalog/`。所有图片为真实单品图，只等比例压缩或转换格式，未生成或修改商品设计。

`python3 tools/build_catalog.py` 生成独立 `js/catalog-data.js`。`node tools/check_catalog.js` 核对数量、官方/零售商域名、图片、币种、预算证据、鞋型与材质依据、组合引用；`node tools/check_integrity.js` 检查原有 48 套原帖穿搭资料。

鞋类于 2026-10-22 核验，裤子和衬衫沿用 2026-10-21 的采集记录；各卡片保留对应日期。最终价格、库存、颜色与尺码以商店为准。

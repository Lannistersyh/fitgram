# TONYWACK 官方商品证据

核验日期：2026-10-21。已确认 **27 件**“原帖明确品名 → 官方同名同色商品详情页”，覆盖 **9 条**公开原帖；另有 **1 件**保留原帖确切品名，未取得可确认的官方商品详情URL。

完整机器可读证据见 `assets/research/product_verification.json`。本文件只记录核验结果，不改动站点数据或单品热点。

## 核验规则

- 从本地采集的 `captionRaw` 提取原帖明确列出的完整英文品名和颜色；不凭图片猜型号。
- 官网分类页与站内搜索只用于发现链接，最终逐页访问具体商品详情，并将 `product_name` 与原帖品名归一化匹配；颜色也必须一致。
- `officialPageTitle` 保存详情中的正式商品名；页面HTML文档title通常仅写TONYWACK，另存为 `documentTitle`。
- 每条 `sourceQuote` 均不超过25个英文单词，保留原帖URL、code和重复出现该商品的出处列表。
- 官方标价保持 **KRW**，没有换算成人民币，也没有使用原演示站的估算价格。
- 库存读取详情页JSON-LD的规格报价；多个尺码状态不同记为 `mixed-variants`，不把搜索摘要中的SOLD OUT当作当前详情库存。

## 已确认的官方商品页

- [拉毛Shaggy Dog V领针织衫（驼色）](https://www.tonywack.com/product/brushed-shaggy-dog-v-neck-knit-camel/4603/category/492/display/1/) · 185,000 KRW · 结构化数据标为有货 · [原帖 DdkkhBgzgVd](https://www.instagram.com/tonywack_official/p/DdkkhBgzgVd/)。
- [重构微喇牛仔裤（水洗蓝）](https://www.tonywack.com/product/re-cut-flared-denim-jeans-worn-blue/4637/category/492/display/1/) · 165,000 KRW · 结构化数据标为有货 · [原帖 DdkkhBgzgVd](https://www.instagram.com/tonywack_official/p/DdkkhBgzgVd/)。
- [高领美利奴羊毛纽扣针织夹克（灰褐色）](https://www.tonywack.com/product/high-neck-merino-wool-button-up-knitted-blouson-taupe/4590/category/492/display/1/) · 238,000 KRW · 结构化数据标为有货 · [原帖 DejK7hOkxDu](https://www.instagram.com/tonywack_official/p/DejK7hOkxDu/)。
- [羊毛混纺微喇西裤（深棕）](https://www.tonywack.com/product/wool-blend-flared-trousers-deep-brown/4702/category/492/display/1/) · 208,000 KRW · 部分尺码有货、部分售罄 · [原帖 DejK7hOkxDu](https://www.instagram.com/tonywack_official/p/DejK7hOkxDu/)。
- [SOUVEN小牛麂皮靴（Sandalo色）](https://www.tonywack.com/product/souven-boots-in-suede-calfskin-sandalo/4922/category/492/display/1/) · 535,000 KRW · 部分尺码有货、部分售罄 · [原帖 DejK7hOkxDu](https://www.instagram.com/tonywack_official/p/DejK7hOkxDu/)。
- [人字纹羊毛双排扣大衣（苔棕）](https://www.tonywack.com/product/herringbone-wool-double-breasted-coat-moss-brown/4904/category/492/display/1/) · 475,000 KRW · 结构化数据标为有货 · [原帖 DejK7hOkxDu](https://www.instagram.com/tonywack_official/p/DejK7hOkxDu/)。
- [羊毛混纺微喇西裤（石板灰）](https://www.tonywack.com/product/wool-blend-flared-trousers-slate-grey/4700/category/492/display/1/) · 208,000 KRW · 部分尺码有货、部分售罄 · [原帖 DejK7hOkxDu](https://www.instagram.com/tonywack_official/p/DejK7hOkxDu/)。
- [羔羊毛皮飞行夹克（褪色棕）](https://www.tonywack.com/product/lamb-shearling-leather-bomber-jacket-faded-brown/4652/category/492/display/1/) · 1,380,000 KRW · 部分尺码有货、部分售罄 · [原帖 DdkkM5lzVpt](https://www.instagram.com/tonywack_official/p/DdkkM5lzVpt/)。
- [宽直筒后腰调节扣牛仔裤（本白）](https://www.tonywack.com/product/loose-straight-buckle-back-jeans-ecru/4638/category/492/display/1/) · 175,000 KRW · 结构化数据标为有货 · [原帖 DdkkM5lzVpt](https://www.instagram.com/tonywack_official/p/DdkkM5lzVpt/)。
- [SOUVEN小牛皮靴（黑色）](https://www.tonywack.com/product/souven-boots-in-calfskin-black/4921/category/492/display/1/) · 565,000 KRW · 部分尺码有货、部分售罄 · [原帖 DdkkM5lzVpt](https://www.instagram.com/tonywack_official/p/DdkkM5lzVpt/)。
- [做旧羊皮短大衣（深棕）](https://www.tonywack.com/product/aged-lamb-leather-carcoat-dark-brown/4658/category/492/display/1/) · 895,000 KRW · 部分尺码有货、部分售罄 · [原帖 DeeB8xiE3ap](https://www.instagram.com/tonywack_official/p/DeeB8xiE3ap/)。
- [宽直筒牛仔裤（中蓝）](https://www.tonywack.com/product/loose-straight-denim-jeans-mid-blue/4641/category/492/display/1/) · 158,000 KRW · 结构化数据标为有货 · [原帖 DeeB8xiE3ap](https://www.instagram.com/tonywack_official/p/DeeB8xiE3ap/)。
- [柔软羊毛围巾（红格纹）](https://www.tonywack.com/product/soft-wool-essential-scarf-red-check/4926/category/492/display/1/) · 85,000 KRW · 结构化数据标为有货 · [原帖 DeeB8xiE3ap](https://www.instagram.com/tonywack_official/p/DeeB8xiE3ap/)。
- [立领肩章夹克（黑色）](https://www.tonywack.com/product/stand-collar-epaulette-blouson-black/4689/category/492/display/1/) · 325,000 KRW · 结构化数据标为有货 · [原帖 DeeB8xiE3ap](https://www.instagram.com/tonywack_official/p/DeeB8xiE3ap/)。
- [细条纹羊毛腰带西裤（黑色细条纹）](https://www.tonywack.com/product/pinstriped-wool-belted-trousers-black-pinstripe/4913/category/492/display/1/) · 242,000 KRW · 部分尺码有货、部分售罄 · [原帖 DeeB8xiE3ap](https://www.instagram.com/tonywack_official/p/DeeB8xiE3ap/)。
- [人字纹羊毛双排扣西装（Saffron Beige色）](https://www.tonywack.com/product/herringbone-wool-double-breasted-jacket-saffron-beige/4691/category/492/display/1/) · 352,000 KRW · 结构化数据标为有货 · [原帖 Ddkj1caTZDe](https://www.instagram.com/tonywack_official/p/Ddkj1caTZDe/)。
- [微喇牛仔裤（原洗靛蓝）](https://www.tonywack.com/product/flared-leg-denim-jeans-rinsed-indigo/4643/category/492/display/1/) · 158,000 KRW · 结构化数据标为有货 · [原帖 Ddkj1caTZDe](https://www.instagram.com/tonywack_official/p/Ddkj1caTZDe/)。
- [复古羊皮飞行夹克（黑色）](https://www.tonywack.com/product/vintage-lamb-leather-bomber-jacket-black/4153/category/492/display/1/) · 618,000 KRW · 部分尺码有货、部分售罄 · [原帖 DdkjtCAzztl](https://www.instagram.com/tonywack_official/p/DdkjtCAzztl/)。
- [细条纹羊毛混纺宽松西装（藏青细条纹）](https://www.tonywack.com/product/pinstriped-wool-blend-relaxed-tailored-jacket-navy-pinstripe/4915/category/492/display/1/) · 325,000 KRW · 部分尺码有货、部分售罄 · [原帖 DdkjtCAzztl](https://www.instagram.com/tonywack_official/p/DdkjtCAzztl/)。
- [细条纹羊毛腰带西裤（藏青细条纹）](https://www.tonywack.com/product/pinstriped-wool-belted-trousers-navy-pinstripe/4914/category/492/display/1/) · 208,000 KRW · 部分尺码有货、部分售罄 · [原帖 DdkjtCAzztl](https://www.instagram.com/tonywack_official/p/DdkjtCAzztl/)。
- [成衣水洗棉质野战夹克（橄榄绿）](https://www.tonywack.com/product/garment-washed-cotton-field-jacket-olive/4681/category/492/display/1/) · 368,000 KRW · 结构化数据标为有货 · [原帖 DeY4YEDE8qf](https://www.instagram.com/tonywack_official/p/DeY4YEDE8qf/)。
- [罗纹羊毛侧扣高领衫（Midnight色）](https://www.tonywack.com/product/ribbed-wool-side-button-turtleneck-midnight/4578/category/492/display/1/) · 185,000 KRW · 结构化数据标为有货 · [原帖 DeY4YEDE8qf](https://www.instagram.com/tonywack_official/p/DeY4YEDE8qf/)。
- [重构阔腿工装裤（橄榄绿）](https://www.tonywack.com/product/re-cut-wide-leg-cargo-pants-olive/4618/category/492/display/1/) · 195,000 KRW · 部分尺码有货、部分售罄 · [原帖 DeY4YEDE8qf](https://www.instagram.com/tonywack_official/p/DeY4YEDE8qf/)。
- [磨毛棉质谷仓夹克（绿色）](https://www.tonywack.com/product/brushed-cotton-barn-jacket-green/4665/category/492/display/1/) · 275,000 KRW · 部分尺码有货、部分售罄 · [原帖 DdkjO_6THkP](https://www.instagram.com/tonywack_official/p/DdkjO_6THkP/)。
- [磨毛棉质谷仓夹克（黑色）](https://www.tonywack.com/product/brushed-cotton-barn-jacket-black/4666/category/492/display/1/) · 275,000 KRW · 部分尺码有货、部分售罄 · [原帖 DeY3LFcEytN](https://www.instagram.com/tonywack_official/p/DeY3LFcEytN/)。
- [高密度条纹棉衬衫（Sky Cobalt色）](https://www.tonywack.com/product/high-density-striped-cotton-shirt-sky-cobalt/4627/category/492/display/1/) · 145,000 KRW · 结构化数据标为有货 · [原帖 DeeB8xiE3ap](https://www.instagram.com/tonywack_official/p/DeeB8xiE3ap/)。
- [丝棉基础衬衫（黑色）](https://www.tonywack.com/product/silk-cotton-essential-shirt-black/4634/category/492/display/1/) · 205,000 KRW · 部分尺码有货、部分售罄 · [原帖 DeY4YEDE8qf](https://www.instagram.com/tonywack_official/p/DeY4YEDE8qf/)。

## 仅有原帖确切品名的记录

- 皮革饰边麂皮托特包（棕色）（LEATHER TRIM SUEDE TOTE BAG_ BROWN）：[原帖](https://www.instagram.com/tonywack_official/p/DdkkhBgzgVd/)明确列出该品名，但本次未找到可确认的官网单品页；`productUrl` 与价格保持null。可回到[品牌官网](https://www.tonywack.com/)，不能把官网首页或搜索结果页当作同款链接。

## 接入站点时的边界

原帖 `DejK7hOkxDu`、`DeeB8xiE3ap`、`DeY4YEDE8qf` 的采集caption包含多套LOOK。此次确认的是原帖品名与官网商品的对应关系，`frameAssignment` 仍为null；接入热点前要以实际照片确认该件出现在哪一帧，不能把整个caption的商品清单自动归到首图。

招聘、幕后花絮和仅有系列标题的三条帖子不提供具体单品证据，已从商品核验范围排除。中文品名为本站翻译；材质名称来自官方英文商品名，未补造未公开的纤维比例、尺码或产地。

商品页库存可能随时间变化，本站没有进行结账验证。整套预算仍未汇总，因为图片与完整商品清单尚未逐帧对应。本轮只使用公开HTTP读取，浏览器标签打开数为 **0**。

采集文本中出现重复系列标题和多个 `AVAILABLE AT TONYWACK.COM` 时，JSON额外标记 `sourceAssociationStatus: multi-block-capture-needs-check`。此标记区分“确切品名已匹配官网商品”与“采集文本块的原帖归属、照片帧归属已复核”：后者本轮没有独立确认，主任务接入这些记录前应回到原帖检查，避免相邻内容块被合并采集的情况。

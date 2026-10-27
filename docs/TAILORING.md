# 西装外套款式课

入口：`#/catalog/blazers`；单课定位：`#/catalog/blazers/{lessonId}`。侧栏、分类图鉴栏目、外套商品页、参考图外套分类和页脚均有入口。

## 内容与来源

10个样本按领型、扣法、面料和比例拆解；它们是不同观察角度，可以交叉组合，不作为互斥的服装分类。共6品牌，8件新商品与2件已有记录；其中TONYWACK、Our Legacy两件属于品牌明确的混合夹克设计。

- 平驳领单排扣：[Suitsupply C25216](https://suitsupply.com/en-us/men/jackets/navy-tailored-fit-havana-blazer/C25216.html)，399 USD，100%羊毛。
- 海军蓝金属扣：复用`world-uk-commodore`，保留原350 GBP与2026-10-23核验时间。
- 羊绒双排扣：[Suitsupply BBL10038N01](https://suitsupply.com/en-us/men/jackets/navy-tailored-fit-havana-blazer/BBL10038N01.html)，799 USD，100%羊绒；商品描述和版型栏目对肩型、口袋描述不一致，不确认内部垫肩细节。
- 亚麻半衬：复用`world-it-luca-blazer`，保留975 USD与2026-10-23核验时间。
- 粗花呢：[Peter Christian MJ112](https://www.peterchristian.co.uk/product/autumn-harris-tweed-jacket/)，350 GBP，外层100% Harris Tweed羊毛。
- 泡泡纱：[Peter Christian MJ103](https://www.peterchristian.co.uk/product/blue-striped-seersucker-jacket/)，150 GBP，官网只说明棉质，未填造100%比例；上身选用蓝条纹图，未混用图库第一张Natural配色。
- 针织：[Paul James Gabriel常规M号](https://www.pauljamesknitwear.com/products/mens-cotton-deconstructed-knitted-blazer?variant=55285180465525)，165 GBP，100%棉，无里布。
- 短身混合剪裁：[TONYWACK 4115](https://tonywack.com/product/wool-cropped-tailored-blouson-black/4115/)，商品页展示265,500 KRW促销价、295,000 KRW标价，结构化Offer仍写标价。衣身羊毛与聚酯各50%，里布黏胶与聚酯各50%。
- 四袋混合剪裁：[Our Legacy Trip M2260TBB](https://www.ourlegacy.com/trip-blazer-glazed-brown-durawool)，730 EUR，75%初剪羊毛与25%聚酰胺。官网配色名Glazed Brown Durawool原样保留。
- 青果领晚宴：[Suitsupply STJ10011999](https://suitsupply.com/en-us/men/jackets/black-tailored-fit-milano-dinner-jacket/STJ10011999.html)，549 USD，衣身98%黏胶、2%氨纶；不按领面外观改写为丝或羊毛。

新记录核验日为2026-10-27。原币种价格和来源库存快照独立记录，不换汇、不承诺大陆配送或尺码现货。款式说明、季节与裤鞋练习为本站编辑观察，不认定为艺人同款。晚宴课只关联现有牛津鞋作为鞋型观察，不把普通西裤列为完整礼服配置。

## 数据与交互

- `assets/research/blazer-products.json`：8件新增共享商品；`collection=tailoring`。
- `assets/research/blazer-lessons.json`：10课、3个阅读步骤、3组对照；通过`productId`和`pairingIds`引用共享商品。
- `tools/build_catalog.py`：合入商品目录并生成`js/tailoring-data.js`；不重复原2款商品。
- `js/tailoring.js`、`css/tailoring.css`：阅读、搜索、方向／领型筛选、季节优先、两款对照与预览。对应商品共用`catalogSaves`。
- `tools/check_tailoring.js`：检查来源与生成数据一致、图片有效与尺寸、变体图片不重复、混合款分类、3类领型与有效裤鞋引用。

默认按北京时间当季排序，所有样本保留，可改为任意季节在前或原学习顺序。3组快捷对照分别比较单／双排扣、常规／短身、粗花呢／泡泡纱；左右同款选择会交换另一侧。原2款暂缺独立上身图时显示单品图并标明。

所有新增图片为品牌实际图库：8张单品图、8张同款同色上身图。只做完整等比例缩小与JPEG编码，不补绘、不改变服装。原始下载与网页证据保存在本机开发项目的`参考图/西装外套-20261027/`，避免混入科研目录；公开仓库只保留图鉴所需的精简资源与记录。

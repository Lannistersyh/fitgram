# 皮包专题

首轮新增20款皮包、14个品牌，分为日常10款与奢侈／设计师10款，7种包型，20张主图和8张同款同色真人上身图。6组搭包对照关联现有穿法；新增商品关联13种风格。资料核验于2026-10-25，专题发布于2026-10-26。

皮包专题连接现有服装、国家风格与共享商品目录。入口为 `#/catalog/leather`，两个分组为 `#/catalog/leather/everyday`、`#/catalog/leather/luxury`。日常品牌与奢侈／设计师品牌按品牌定位整理，用于比较设计方向，不以价格代替质量判断。

## 选品范围

本系列只收录主体材料可从具体商品资料确认的真皮包。外层为皮革可以有织物内衬；以帆布、尼龙为主体、仅有皮革饰边的包留在原有“全部包包”目录。品牌或产品线包含皮包，不代表该线所有颜色、尺寸和款式都使用相同皮料，每条按具体型号记录。

图片采用真实商品页的单品图，部分另附同款同色上身参考。仅进行等比缩放与JPEG压缩，不生成、补绘或修改商品外观。官网原站可能归男装、女装或中性栏目；原栏目在商品的 `audienceNote` 说明，本站按搭配方向选用，不自动改称官方男款。

## 规格与购买资料

每款保留品牌、款名、具体型号或商品标识、颜色、主体材质、尺寸原文顺序、可核对背法、容量说明和核验日期。外部尺寸与可装物品分别记录，未列装载清单时明确说明，不推测电脑或手机适配。

价格按实际来源地区与币种保留，未换汇。品牌官网与零售商来源分别标注；缺货、停售、库存未核实与可购状态按页面快照记录。专题里的图片、价格、尺寸使用同一具体款式与配色，不将不同尺寸的包混在一张卡片里。

## 页面使用

支持品牌／型号／颜色搜索，按包型、皮面与背法组合筛选，以及只看已收藏。收藏共用 `catalogSaves`，从专题加入的包会同时出现在原有商品清单。单品图片与上身图使用共享预览窗口，可放大并通过Escape关闭。

每款关联已有的国家风格，风格页也能反向查看可以替换的皮包。专题中的并排搭配把两种品牌定位放回同一条穿法，比较的是包型、体量和细节，不声称彼此同款或替代品质相等。

原有11个包保留在“全部包包”分类，其中包括皮革、帆布、尼龙及其他材质；新增选品并入同一目录，不复制收藏或价格记录。

## 维护

新增商品来源分别为 `assets/research/leather-bags-everyday.json` 和 `assets/research/leather-bags-luxury.json`；编辑搭配与选包提示为 `assets/research/leather-editorial.json`。原始商品包含 `bodyLeatherVerified` 标记，只有逐件核对具体主体材料后才设为true。程序检查不能替代对原始材质说明和实际图片的审核。

生成与验收：

```sh
python3 tools/build_catalog.py
python3 tools/build_leather.py
node tools/check_catalog.js
node tools/check_leather.js
node tools/check_integrity.js
node tools/check_world.js
node tools/check_history.js
node tools/check_atlas.js
```

商品数据由 `js/catalog-data.js` 共享，专题只在 `js/leather-data.js` 保存ID与编辑内容。均为普通脚本，不需要fetch本地JSON，保持file://与离线可用。

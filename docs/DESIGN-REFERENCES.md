# FITGRAM 设计与真实来源参考

记录日期：2026-10-21（Asia/Shanghai）。本轮内容已由真实公开原帖照片与逐图中文观察构成。设计目标是让用户从一张实际造型追溯原帖、看懂可见搭配，并区分确切单品、品牌线索与视觉判断。

## 界面设计取舍

沿用图片社区常见的侧栏导航、头像入口、信息流卡片、三列发现网格与左右详情结构。主视觉交给真实照片；白底、细分隔线、克制的字体层级和较小圆角承接高密度信息。FITGRAM使用独立衣架标记、系统字体与内联线性图标，不表示与Instagram或任一收录账号存在合作关系。

照片按实际比例呈现，详情热点依据该帧的衣服位置设置；不以另一张相似穿搭或代码造型替换缺图。来源头像为中性字母标识，图片未保存时使用不含人物或服装的中性出处卡。头像并不代表真实账号原头像。

单品清单优先显示“为什么认定”：原帖名称或目录编号、品牌证据、官网对应关系与可见外观分别标记。KRW价格保留原币种，未核实值明确留空。对照与趋势页写作均限定为本站观察，避免将少量照片说成整个国家的普遍规则。

## 本轮公开来源

以下链接用于追溯资料发布账号。发布者不必然等于摄影师、出镜者或服装制造者；主页数字为采集时记录，不代表实时统计。

日系来源：

- [@japan_streetstyle_](https://www.instagram.com/japan_streetstyle_/)：穿搭选辑。当前保留主页资料，未采用造型。
- [@i_am_kentadesu_](https://www.instagram.com/i_am_kentadesu_/)：个人创作者，入选12套。
- [@nanikajapan](https://www.instagram.com/nanikajapan/)：穿搭选辑。当前保留主页资料，未采用造型。
- [@kabuki_610](https://www.instagram.com/kabuki_610/)：个人创作者，入选5套。
- [@mensnonnojp](https://www.instagram.com/mensnonnojp/)：时尚媒体，入选4套。

韩系来源：

- [@0neonones_](https://www.instagram.com/0neonones_/)：个人创作者，入选4套。
- [@gentlemans_seoul](https://www.instagram.com/gentlemans_seoul/)：穿搭选辑，入选4套。原帖零售目录名不自动证明制造品牌。
- [@alyxtsu](https://www.instagram.com/alyxtsu/)：个人创作者。当前保留主页资料，未采用造型。
- [@coor_official](https://www.instagram.com/coor_official/)：品牌账号，入选3套。
- [@tonywack_official](https://www.instagram.com/tonywack_official/)：品牌账号，入选12套；其中已核实官方商品的造型来自9条去重原帖。
- [@solidhomme](https://www.instagram.com/solidhomme/)：品牌账号，入选4套。

地区分组用于本站导航，不将账号或出镜者的个人风格概括为地域定论。11个来源中8个贡献48套入选造型，共40条独立原帖。

## 图片、文案与单品的对应

`raw_sources.json`保存主页采集，`raw_posts.json`保留完整候选原帖。分组分析文件保存逐图中文观察，经 `assemble_real_collection.py` 合成最终 `selected_posts.json` 与 `analysis.json`；`build_real_data.py`再生成站点数据。

每套LOOK保留原帖code、永久链接、图片序号与实际本地照片。相同原帖不同帧允许形成不同造型卡，但使用唯一分析键。具体单品须对应所选图片，不能仅凭一条caption出现多个商品名，就把它们全部分配给首图。

当前212条单品中，36条有原帖明确名称或目录编号、25条确认到品牌、151条只作视觉观察。27个去重TONYWACK官方商品与原帖同名同色核验，在清单中出现31次；价格、商品页和核验记录见 `PRODUCT-EVIDENCE.md`。没有确证的型号、材质成分、价格、气温与身高不猜测补齐。

## 资料与检查范围

图片、原文、人物肖像和品牌标志的权利属于各自作者或权利人。FITGRAM提供本地资料索引和编辑观察，不声称拥有这些资料，也不表示合作、赞助或背书。公开页面与商品状态可能更新、删除或转为私密；原帖与对应商品页是继续核对的入口。

来源采集由主任务以1个自建Edge标签串行完成并关闭，复核保留5个用户页面。此文档和离线数据验收没有打开浏览器。网页实际回归结果见 `ACCEPTANCE.md`，字段与证据规则见 `REAL-SOURCES.md`。

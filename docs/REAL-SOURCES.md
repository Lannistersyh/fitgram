# 当前来源与处理规则

当前版本由 collection.json 指定7个来源。日本来源仅保留 @ryo__takashima（约472K）和 @yooshiakiii（约512K）；旧的 japan_streetstyle_、i_am_kentadesu_、nanikajapan、kabuki_610、mensnonnojp 不进入正式图鉴、信息流或当前图片资源。

男团来源：@cortis（约16.5M）、@boynextdoor_official（约4.7M）、@riize_official（约5.2M）。sourceKind=group，在页面显示“男团官方”；合作原帖以发布账号为出处，嘉宾与团体成员不混同。CORTIS 的音乐节后台造型、RIIZE 的 adidas 广告均保留实际场景说明，不全部标成私人衣橱。没有文字证据时不凭人脸认定具体成员。

其他来源：@0neonones_、@tonywack_official。前者为实用日常参考，后者为可回到官方商品页的同款档案。

以上粉丝数来自本次真实 Instagram 主页可见文本，按缩略显示换算为约数。原始证据在 raw_sources.json，包含观察时间和主页链接。粉丝不作为自动判定审美质量或商品归属的依据。

## 数据与构建

raw_posts.json 保存候选原帖；analysis-idols.json 和 analysis-jp-v2.json 保存本次逐图观察，analysis-kr.json 与 analysis-tony.json 保留选中的旧参考。合并时使用 sourceCode 与真实 sourceImageIndex，已有 analysisKey 保持 ID。一个原帖可以有多个造型记录；48套来自36条永久链接。

每套只挂对应图片的单品。合照标注重点位置；不同照片不会自动继承同一套热点。不会从未展示部分补写鞋履或内搭。单品证据分为 exact（原帖明示）、brand（只确认品牌）、visual（仅可见外观）。品牌标签不能自动证明每件衣服的归属；商业活动的主办品牌也不能自动当作服装品牌。

价格只采用 exact、officialProductVerified=true、具体HTTPS商品页与核验记录一致的商品。本轮27个去重TONYWACK商品，31次出现，保持KRW原币种；其他价格和整套预算未知。保留库存与日期快照，不推断可下单状态。

运行 assemble_real_collection.py、build_real_data.py 后再执行 check_integrity.js。当前验收同时防止旧来源重新进入正式清单，并检查日本来源的已核实粉丝门槛和男团主体数量。正式站点不需要运行采集工具。

所有主图为本地原帖实图；中性缺图卡不含人物或服装。原帖日期、气温、互动和材质未知时保持未知，不按粉丝量或画面效果推算。

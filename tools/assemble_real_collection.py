# 将逐图人工观察与官方商品核验合并；原帖多套造型保留真实code和图片索引。
import json
import re
from copy import deepcopy
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
R=ROOT/'assets/research'
load=lambda name:json.loads((R/name).read_text())
raw=load('raw_posts.json'); by_code={p['code']:p for p in raw['posts']}
manifest=load('collection.json')
analyses={}
for name in manifest['analysisFiles']:
    if (R/name).exists():analyses.update(load(name)['posts'])
verified=load('product_verification.json')['items']
normalize=lambda name:re.sub(r'\W+','',str(name or '').upper())
products={normalize(p['modelName']):p for p in verified}
previous=load('selected_posts.json').get('posts',[]) if (R/'selected_posts.json').exists() else []
known_ids={p.get('analysisKey'):p['id'] for p in previous if p.get('analysisKey')}
next_id=max([int(p['id'][1:]) for p in previous if re.fullmatch(r'r\d+',p.get('id',''))] or [0])+1
selected=[]
for key,analysis in analyses.items():
    code=analysis.get('sourceCode') or key
    if code not in by_code:raise ValueError('Missing original source '+code)
    post=deepcopy(by_code[code]); slide=analysis.get('sourceImageIndex') or 1
    if slide>1:
        frame=next((x for x in post.get('carousel',[]) if x['slide']==slide),None)
        if not frame:raise ValueError('Missing actual frame '+key)
        post['imagesLocal']=[frame['imageLocal']];post['imageWidth']=frame['width'];post['imageHeight']=frame['height'];post['imageUrls']=[]
    post['analysisKey']=key;post['sourceImageIndex']=slide;post['originalSourceCode']=code
    if key in known_ids:post['id']=known_ids[key]
    else:
        post['id']='r'+str(next_id).zfill(3);next_id+=1
    post['altTexts']=[analysis['title']+'；'+post['sourceHandle']+' 公开原帖第'+str(slide)+'张图片。']
    post['imageEvidence']=[dict(sourceUrl=post['sourceUrl'],sourceImageIndex=slide,localFile=post['imagesLocal'][0],observedAt=post.get('detailCapturedAt') or post.get('capturedAt'))]
    for item in analysis.get('items',[]):
        model=products.get(normalize(item.get('modelName')))
        if item.get('identification')!='exact' or item.get('brand')!='TONYWACK' or not model:continue
        if not model.get('officialProductVerified'):continue
        for field in ['productUrl','officialProductVerified','officialPageTitle','price','currency','availability','availabilityStates','availabilityLabel','verifiedAt','priceBasis']:
            item[field]=model.get(field)
        item['priceNumeric']=model['price'];item['priceCurrency']=model['currency'];item['frameAssignment']=slide
        item['evidenceText']='原帖第'+str(slide)+'张对应的官方清单明示 '+item['modelName']+'；官网商品详情页同名同色核对。'
    analysis['sourceCode']=code;analysis['sourceImageIndex']=slide
    selected.append(post)
# 先展现有官方同款的造型，再轮流展现各来源；ID保持不随顺序变化。
def official_count(post):return sum(i.get('officialProductVerified') is True for i in analyses[post['analysisKey']].get('items',[]))
selected.sort(key=lambda p:(-analyses[p['analysisKey']].get('feedPriority',0),-official_count(p),p['sourceHandle'],p['analysisKey']))
(R/'selected_posts.json').write_text(json.dumps(dict(collectedAt=raw['collectedAt'],posts=selected),ensure_ascii=False,indent=2))
(R/'analysis.json').write_text(json.dumps(dict(posts=analyses),ensure_ascii=False,indent=2))
print(json.dumps(dict(looks=len(selected),originalPosts=len(set(x['code'] for x in selected)),sourcesUsed=len(set(x['sourceHandle'] for x in selected)),officialLinks=sum(official_count(x) for x in selected),captionRange=[min(len(x['caption']) for x in analyses.values()),max(len(x['caption']) for x in analyses.values())]),ensure_ascii=False,indent=2))

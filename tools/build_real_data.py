#!/usr/bin/env python3
"""把带出处的Instagram采集与人工视觉分析转为离线FITGRAM数据；不联网、不下载、不推测价格或互动数。"""
from pathlib import Path
from urllib.parse import urlparse
from collections import Counter
import argparse
import json
import math
import re
import sys
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parents[1]
RESEARCH = ROOT / 'assets/research'
SOURCE_REGIONS = dict.fromkeys(['japan_streetstyle_', 'i_am_kentadesu_', 'nanikajapan', 'kabuki_610', 'mensnonnojp'], 'jp')
SOURCE_REGIONS.update(dict.fromkeys(['0neonones_', 'gentlemans_seoul', 'alyxtsu', 'coor_official', 'tonywack_official', 'solidhomme'], 'kr'))
SOURCE_KINDS = {'creator', 'curation', 'magazine', 'brand'}
KIND_ALIASES = {'individual': 'creator', 'media': 'magazine'}
STYLES = {'City Boy', 'Clean Fit', 'Gorpcore', 'Ivy/Preppy', 'Y2K 复古', '日系工装', '韩系极简', '街头廓形', 'All Grey 全灰', '无性别 Archive'}
TEMP_BANDS = {'15-20', '10-15', '5-10', '0-5', '-5-0'}
IDENTIFICATIONS = {'exact', 'brand', 'visual'}
LABELS = {'exact': '原帖明确单品', 'brand': '原帖品牌线索', 'visual': '本站视觉观察'}
WARNINGS = []


def load_json(path, default=None):
    if not path.exists():
        if default is not None:
            return default
        raise ValueError(f'缺少采集文件：{path}')
    with path.open(encoding='utf-8-sig') as handle:
        return json.load(handle)


def as_rows(value, key):
    if isinstance(value, list):
        return value
    rows = value.get(key, []) if isinstance(value, dict) else []
    if isinstance(rows, dict):
        return [dict(row, **({} if 'code' in row else {'code': code})) for code, row in rows.items()]
    return rows


def clean_handle(value):
    value = str(value or '').strip()
    if 'instagram.com/' in value:
        value = urlparse(value).path.strip('/').split('/')[0]
    return value.lstrip('@').strip('/').lower()


def web_url(value):
    text = str(value or '').strip()
    parsed = urlparse(text)
    return text if parsed.scheme in {'http', 'https'} and parsed.netloc else None


def number_or_null(value):
    # 只接受采集到的实际数字；不从粉丝量反推点赞，不把未知转换为0。
    if isinstance(value, (int, float)) and not isinstance(value, bool) and value >= 0:
        return int(value)
    return None


def iso_date(value):
    text = str(value or '').strip()
    return text[:10] if re.fullmatch(r'\d{4}-\d{2}-\d{2}(?:[T ].*)?', text) else None


def source_kind(value):
    value = KIND_ALIASES.get(value, value)
    if value and value not in SOURCE_KINDS:
        raise ValueError(f'sourceKind必须为creator/curation/magazine/brand：{value}')
    return value or None


def normalize_evidence(value):
    if not isinstance(value, list):
        return []
    return [dict(field=str(row.get('field', '')), text=str(row.get('text', '')), url=web_url(row.get('url') or row.get('evidenceUrl')), observedAt=row.get('observedAt')) for row in value if isinstance(row, dict)]


def make_source(raw, index):
    handle = clean_handle(raw.get('handle') or raw.get('username'))
    if not handle:
        raise ValueError(f'第{index + 1}条来源没有handle')
    initials = ''.join(part[:1] for part in handle.split('_') if part)[:2].upper() or handle[:2].upper()
    source = dict(id='ig-' + handle, handle='@' + handle, name=raw.get('name') or '@' + handle, city=raw.get('city') or '地点未注明', region=raw.get('region') or SOURCE_REGIONS.get(handle), sourceKind=source_kind(raw.get('sourceKind')), followers=number_or_null(raw.get('followers')), following=number_or_null(raw.get('following')), posts=0, accountPosts=number_or_null(raw.get('postsCount')), height=None, verified=raw.get('verified') is True, styles=[], brands=[], initials=initials, slogan='查看公开原帖与本站搭配观察', frequency='以原账号公开更新为准', bio=raw.get('bioRaw') or raw.get('text') or '主页简介尚未采集', formulas=[], highlights=[], avatar=f'assets/placeholder/ig-{handle}.svg')
    source.update(sourceUrl=web_url(raw.get('url')) or f'https://www.instagram.com/{handle}/', bioRaw=raw.get('bioRaw') or raw.get('text') or '', followersRaw=raw.get('followersRaw'), followingRaw=raw.get('followingRaw'), verificationObserved=raw.get('verified'), evidence=normalize_evidence(raw.get('evidence')), collectedAt=raw.get('collectedAt'), isFictional=False, editorialLabel='本站观察', profileAvatarUrl=web_url(raw.get('avatarUrl')))
    source['profileUrl'] = source['sourceUrl']
    return source


def normalize_analysis(raw):
    if not raw:
        return {}
    rows = raw.get('posts', raw) if isinstance(raw, dict) else raw
    if isinstance(rows, list):
        return {str(row.get('analysisKey') or row.get('code') or row.get('postCode') or row.get('id')): row for row in rows}
    return rows if isinstance(rows, dict) else {}


def local_path(value):
    if isinstance(value, dict):
        value = value.get('path') or value.get('local') or value.get('localPath')
    if not value:
        return None
    path = Path(str(value))
    absolute = path if path.is_absolute() else ROOT / path
    try:
        relative = absolute.resolve().relative_to(ROOT)
    except ValueError:
        WARNINGS.append(f'本地图超出项目目录，已忽略：{path}')
        return None
    if re.match(r'assets/(?:img|placeholder)/p[0-9]{3}(?:[-.]|$)', relative.as_posix()):
        WARNINGS.append('Legacy illustration path ignored: ' + relative.as_posix())
        return None
    if absolute.is_file():
        return relative.as_posix()
    WARNINGS.append(f'本地图尚不存在，将使用其余图片或中性兜底：{relative}')
    return None


def post_code(raw):
    if raw.get('code') or raw.get('postCode'):
        return str(raw.get('code') or raw.get('postCode'))
    match = re.search(r'/(?:p|reel)/([^/?#]+)', str(raw.get('sourceUrl') or ''))
    if not match:
        raise ValueError(f'帖子缺少code与可解析的sourceUrl：{raw.get("id")}')
    return match.group(1)


def checked_identification(raw, context):
    level = raw.get('identification') or 'visual'
    if level not in IDENTIFICATIONS:
        raise ValueError(f'{context}的identification无效：{level}')
    if level in {'exact', 'brand'} and not (raw.get('evidenceText') and web_url(raw.get('evidenceUrl'))):
        raise ValueError(f'{context}标为{level}时必须有evidenceText和evidenceUrl')
    return level


def make_layers(rows, source_url):
    result = []
    for index, row in enumerate(rows or []):
        if isinstance(row, str):
            row = dict(name=f'可见层次{index + 1}', desc=row)
        level = checked_identification(row, '叠穿层次')
        result.append(dict(name=row.get('name') or f'可见层次{index + 1}', desc=row.get('desc') or '细节尚未核实', identification=level, identificationLabel=LABELS[level], evidenceText=row.get('evidenceText') or row.get('desc') or '', evidenceUrl=web_url(row.get('evidenceUrl')) or source_url, editorial=level == 'visual'))
    return result


def make_item(raw, post_id, index, source_url):
    level = checked_identification(raw, f'{post_id}单品{index + 1}')
    hotspot = raw.get('hotspot') or {}
    x, y = hotspot.get('x', .5), hotspot.get('y', .5)
    if not all(isinstance(v, (int, float)) and 0 <= v <= 1 for v in (x, y)):
        raise ValueError(f'{post_id}单品热点必须在0～1范围内')
    if level == 'brand' and not raw.get('brand'):
        raise ValueError(f'{post_id}品牌线索单品缺少brand')
    item_id = f'i{post_id.lstrip("rp")}_{index + 1:02d}'
    item = dict(id=item_id, name=raw.get('name') or '可见服装细节', brand=(raw.get('brand') or None) if level in {'exact', 'brand'} else None, category=raw.get('category') or '服装', price=None, priceMin=None, priceMax=None, color=raw.get('color') or None, hex=raw.get('hex') or None, identification=level, identificationLabel=LABELS[level], evidenceText=raw.get('evidenceText') or '', evidenceUrl=web_url(raw.get('evidenceUrl')) or source_url, productUrl=web_url(raw.get('productUrl')) if level == 'exact' else None, sourceUrl=source_url, editorial=level == 'visual')
    verified = level == 'exact' and raw.get('officialProductVerified') is True and product_source(item['productUrl'])
    item.update(modelName=raw.get('modelName') or raw.get('enName'), officialProductVerified=verified, officialPageTitle=raw.get('officialPageTitle') if verified else None, availability=raw.get('availability') if verified else None, availabilityStates=raw.get('availabilityStates') or [] if verified else [], verifiedAt=raw.get('verifiedAt') if verified else None, priceBasis=raw.get('priceBasis') if verified else None)
    item.update(verified_price(raw, verified))
    ref = dict(itemId=item_id, hotspot=dict(x=x, y=y), note=raw.get('note') or LABELS[level], fit=None, identification=level, evidenceText=item['evidenceText'], evidenceUrl=item['evidenceUrl'])
    return item, ref


def verified_price(raw, verified):
    # 只有经官网确认的exact单品可保留实际币种价格；视觉判断与品牌线索不获得估价。
    result = dict(price=None, priceNumeric=None, priceCurrency=None, priceMin=None, priceMax=None)
    currency = str(raw.get('priceCurrency') or raw.get('currency') or '').upper()
    if not verified or not re.fullmatch(r'[A-Z]{3}', currency):
        return result
    value = raw.get('priceNumeric') if raw.get('priceNumeric') is not None else raw.get('price')
    if value is None and raw.get('priceMin') == raw.get('priceMax'):
        value = raw.get('priceMin')
    if isinstance(value, str):
        value = value.replace(currency, '').replace(',', '').strip()
        value = float(value) if re.fullmatch(r'\d+(?:\.\d+)?', value) else None
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) or value <= 0:
        return result
    value = int(value) if float(value).is_integer() else value
    result.update(price=f'{value:,} {currency}', priceNumeric=value, priceCurrency=currency, priceMin=value, priceMax=value)
    return result


def product_source(value):
    parsed = urlparse(str(value or ''))
    return parsed.scheme == 'https' and bool(parsed.netloc) and bool(parsed.path.strip('/')) and 'search' not in parsed.path.lower()


def normalized_brands(rows):
    result = []
    for row in rows or []:
        if isinstance(row, str):
            row = dict(name=row)
        result.append(dict(name=row.get('name') or row.get('handle') or '', handle=row.get('handle'), evidenceText=row.get('evidenceText') or '', evidenceUrl=web_url(row.get('evidenceUrl'))))
    return result


def make_post(raw, analysis, source, index):
    code = post_code(raw); post_id = raw.get('id') or f'r{index + 1:03d}'
    if not str(post_id).startswith('r'):
        raise ValueError(f'真实帖子id应以r开头，避免混入旧虚构记录：{post_id}')
    source_url = web_url(raw.get('sourceUrl')) or f'https://www.instagram.com/p/{code}/'
    images = [value for value in (local_path(p) for p in raw.get('imagesLocal', [])) if value]
    remote = [url for url in (web_url(v) for v in raw.get('imageUrls', [])) if url]
    styles = [value for value in analysis.get('styles', []) if value in STYLES]
    temp_band = analysis.get('tempBand') if analysis.get('tempBand') in TEMP_BANDS else 'unknown'
    counts = raw.get('counts') or {}
    caption = analysis.get('caption') or '这条公开原帖已收录。具体搭配信息仍在核实，请通过原帖查看作者说明。'
    items, refs = [], []
    for item_index, row in enumerate(analysis.get('items') or []):
        item, ref = make_item(row, post_id, item_index, source_url); items.append(item); refs.append(ref)
    post = dict(id=post_id, code=code, bloggerId=source['id'], title=analysis.get('title') or f'{source["handle"]} · 原帖造型', date=iso_date(raw.get('date')), dateRaw=raw.get('date'), tempBand=temp_band, styles=styles, scenes=analysis.get('scenes') or [], location=raw.get('location') or '地点未注明', aspect=analysis.get('aspect') or raw.get('aspect') or '4:5', images=images or ['assets/placeholder/neutral.svg'], remoteImages=remote, placeholder='assets/placeholder/neutral.svg', likes=number_or_null(counts.get('likes', raw.get('likes'))), comments=number_or_null(counts.get('comments', raw.get('comments'))), saves=number_or_null(counts.get('saves', raw.get('saves'))), caption=caption, captionRaw=raw.get('captionRaw') or '', tags=analysis.get('tags') or ['#' + value.replace(' ', '') for value in styles], palette=analysis.get('palette') or [], layers=make_layers(analysis.get('layers'), source_url), items=refs, budget=None, budgetMin=None, budgetMax=None, commentsMock=[], alt=(raw.get('altTexts') or [analysis.get('alt') or f'{source["handle"]}公开原帖中的穿搭照片'])[0])
    post.update(sourceUrl=source_url, sourceHandle=source['handle'], originalCaption=post['captionRaw'], altTexts=raw.get('altTexts') or [], taggedBrands=normalized_brands(raw.get('taggedBrands')), editorial=True, editorialLabel='本站观察', temperatureType='editorial-recommendation' if temp_band != 'unknown' else 'unverified', temperatureNote=analysis.get('temperatureNote') or ('温度带为本站穿搭参考，不代表拍摄时实测气温' if temp_band != 'unknown' else '原帖未提供气温，不从照片推断实际天气'), capturedAt=raw.get('collectedAt') or raw.get('capturedAt'), imageWidth=number_or_null(raw.get('imageWidth')), imageHeight=number_or_null(raw.get('imageHeight')), imageDimensions=raw.get('imageDimensions') or [], sourceDate=iso_date(raw.get('date')), imageEvidence=raw.get('imageEvidence') or [], isFictional=False, dataOrigin='public-instagram-source', analysisNotes=analysis.get('notes') or '')
    post.update(analysisKey=raw.get('analysisKey') or post_id, originalSourceCode=raw.get('originalSourceCode') or raw.get('originalCode') or code, sourceImageIndex=raw.get('sourceImageIndex'), sourceImageIndices=raw.get('sourceImageIndices') or [])
    return post, items


def enrich_sources(sources, posts):
    for source in sources:
        owned = [p for p in posts if p['bloggerId'] == source['id']]
        source['posts'] = len(owned)
        source['styles'] = list(dict.fromkeys(s for p in owned for s in p['styles']))
        source['brands'] = list(dict.fromkeys(b['name'] for p in owned for b in p['taggedBrands'] if b['name']))


def make_trends(posts):
    # 这里只汇总已做视觉分析的真实帖子；文字明确是本站编辑观察，不声称行业统计趋势。
    groups = [('City Boy', '城市松量'), ('韩系极简', '清楚的比例'), ('街头廓形', '短上身与宽裤'), ('日系工装', '功能口袋'), ('All Grey 全灰', '全灰层次'), ('Ivy/Preppy', '学院单品')]
    result = []
    for style, title in groups:
        ids = [p['id'] for p in posts if style in p['styles']]
        if not ids:
            continue
        lines = [f'本站从已收录原帖中，将这些造型归入{style}作为观察索引。', '具体单品归属与材质请查看每条证据；视觉判断不代表作者的自我风格定义。', '用廓形与搭配关系作参考，原帖未公开的价格与气温保持未知。']
        result.append(dict(id=f't{len(result) + 1}', title=title, subtitle='本站观察 · 非行业趋势统计', description=''.join(lines), lines=lines, postIds=ids[:2], tags=['#' + style.replace(' ', '')], cover=ids[0], editorial=True, editorialLabel='本站观察', sourceUrls=[p['sourceUrl'] for p in posts if p['id'] in ids[:2]]))
    return result


def make_compares(posts, sources):
    # 不把个别照片扩写为对整个国家风格的断言，只提供带原帖的观察维度。
    region = {s['id']: s['region'] for s in sources}
    dimensions = [('廓形', '看肩线、衣长与裤腿的实际关系。', ['肩线', '衣长', '裤腿']), ('层次', '只数照片中确实可见的层次，不补写被遮挡的内搭。', ['可见领口', '门襟', '下摆']), ('色彩', '比较画面中的明暗和色块，保留拍摄光线造成的差异。', ['明度', '色块', '光线']), ('材质', '视觉纹理可观察，纤维成分以原帖或产品证据为准。', ['纹理', '反光', '待核实成分']), ('鞋履', '观察鞋头、鞋底与裤脚边界，品牌和型号另查证据。', ['鞋头', '鞋底', '裤脚']), ('配饰', '记录照片中可见的包与配饰，不把品牌标签自动分配给单件。', ['可见配饰', '位置', '品牌线索']), ('发型', '照片中的个人造型仅属于该原帖，不概括为地区规则。', ['原帖个体', '局部观察', '不作泛化'])]
    result = []
    for dimension, note, keywords in dimensions:
        result.append(dict(dimension=dimension, jp='本站观察：' + note, kr='本站观察：' + note, jpKeywords=keywords, krKeywords=keywords, jpPosts=[p['id'] for p in posts if region.get(p['bloggerId']) == 'jp'][:2], krPosts=[p['id'] for p in posts if region.get(p['bloggerId']) == 'kr'][:2], editorial=True, editorialLabel='本站观察'))
    return result


def neutral_svg():
    return '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350"><rect width="1080" height="1350" fill="#eeede8"/><path d="M88 88H992V1262H88Z" fill="none" stroke="#d0cec7"/><path d="M88 1010H992M88 1030H700" stroke="#d0cec7"/><text x="90" y="190" fill="#666760" font-family="Arial,sans-serif" font-size="28" letter-spacing="7">FITGRAM / SOURCE ARCHIVE</text><text x="90" y="850" fill="#6b6b65" font-family="Arial,sans-serif" font-size="20" letter-spacing="3">IMAGE NOT STORED LOCALLY</text><text x="90" y="900" fill="#92928b" font-family="Arial,sans-serif" font-size="17">View the attributed original post for the source image.</text></svg>'


def avatar_svg(source, index):
    colors = [('#526153', '#9ca487'), ('#8b6253', '#d2b491'), ('#3e586a', '#93a8a8'), ('#62715a', '#b2b193')]
    first, second = colors[index % len(colors)]
    letters = escape(source['initials'])
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><defs><linearGradient id="a" x2="1" y2="1"><stop stop-color="{first}"/><stop offset="1" stop-color="{second}"/></linearGradient></defs><circle cx="100" cy="100" r="100" fill="url(#a)"/><circle cx="100" cy="100" r="83" fill="none" stroke="#fff" opacity=".15"/><text x="100" y="117" text-anchor="middle" fill="#fffdf1" font-family="Georgia,serif" font-size="57">{letters}</text><text x="100" y="153" text-anchor="middle" fill="#fffdf1" font-family="Arial,sans-serif" font-size="9" letter-spacing="4">FITGRAM</text></svg>'


def write_assets(sources):
    folder = ROOT / 'assets/placeholder'; folder.mkdir(parents=True, exist_ok=True)
    (folder / 'neutral.svg').write_text(neutral_svg(), encoding='utf-8')
    for index, source in enumerate(sources):
        (ROOT / source['avatar']).write_text(avatar_svg(source, index), encoding='utf-8')


def write_data(data, output):
    lines = ['/* 真实Instagram公开来源索引：出处与本站视觉观察分开保存。', ' * 原始候选位于assets/research/raw_posts.json，正式选图位于selected_posts.json；人工观察位于analysis.json。', ' * 运行python3 tools/build_real_data.py重建。未知价格、预算、互动数保留null，不制造评论。', ' * 新增原帖：{id:"r001",code:"POSTCODE",sourceHandle:"handle",sourceUrl:"https://www.instagram.com/p/POSTCODE/",date:null,captionRaw:"",imagesLocal:[],imageUrls:[],altTexts:[],taggedBrands:[],counts:{likes:null,comments:null,saves:null}}。', ' */', 'window.FITGRAM_DATA = {']
    keys = list(data)
    for key in keys:
        value = data[key]
        if isinstance(value, list):
            lines.append('  ' + json.dumps(key) + ': [')
            lines.extend('    ' + json.dumps(row, ensure_ascii=False, separators=(',', ':')) + (',' if index < len(value) - 1 else '') for index, row in enumerate(value))
            lines.append('  ]' + (',' if key != keys[-1] else ''))
        else:
            lines.append('  ' + json.dumps(key) + ': ' + json.dumps(value, ensure_ascii=False, separators=(',', ':')) + (',' if key != keys[-1] else ''))
    lines.append('};\n')
    if len(lines) > 700:
        raise ValueError('data.js超过700行，请按来源拆分并调整引用')
    output.write_text('\n'.join(lines), encoding='utf-8')


def audit(data):
    ids = [p['id'] for p in data['posts']]
    codes = [p['code'] for p in data['posts']]
    analysis_keys = [p['analysisKey'] for p in data['posts']]
    if len(ids) != len(set(ids)) or len(analysis_keys) != len(set(analysis_keys)):
        raise ValueError('造型id或analysisKey重复；同一原帖多套LOOK需各自使用唯一键')
    if not data['posts']:
        raise ValueError('没有真实帖子；为避免覆盖现有数据，已停止')
    assert all(p['budget'] is None and not p['commentsMock'] for p in data['posts'])
    for item in data['items']:
        if any(item.get(key) is not None for key in ['price', 'priceNumeric', 'priceMin', 'priceMax']):
            assert item['identification'] == 'exact' and item['officialProductVerified'] is True
            assert re.fullmatch(r'[A-Z]{3}', item.get('priceCurrency') or '') and product_source(item.get('productUrl'))
            assert item['priceNumeric'] == item['priceMin'] == item['priceMax'] and item['priceNumeric'] > 0
    return dict(sources=len(data['bloggers']), posts=len(ids), originalPosts=len(set(codes)), analysisKeys=len(set(analysis_keys)), items=len(data['items']), verifiedPriceItems=sum(i['priceNumeric'] is not None for i in data['items']), identification=dict(Counter(i['identification'] for i in data['items'])), localPhotos=sum(not p['images'][0].endswith('neutral.svg') for p in data['posts']), unknownDates=sum(p['date'] is None for p in data['posts']), unknownTemperatures=sum(p['tempBand'] == 'unknown' for p in data['posts']), unknownLikes=sum(p['likes'] is None for p in data['posts']), inventedPrices=0, inventedBudgets=0, mockComments=0, browserTabsOpened=0, warnings=WARNINGS)


def build(source_doc, post_doc, analysis_doc):
    sources = [make_source(raw, index) for index, raw in enumerate(as_rows(source_doc, 'sources'))]
    source_map = {clean_handle(source['handle']): source for source in sources}
    if len(source_map) != len(sources):
        raise ValueError('来源handle重复')
    analysis_map = normalize_analysis(analysis_doc); posts, items = [], []
    for index, raw in enumerate(as_rows(post_doc, 'posts')):
        handle = clean_handle(raw.get('sourceHandle'))
        if handle not in source_map:
            raise ValueError(f'原帖的sourceHandle不在来源清单中：{handle}')
        code = post_code(raw); analysis = analysis_map.get(raw.get('analysisKey')) or analysis_map.get(raw.get('id')) or analysis_map.get(code) or {}
        post, item_rows = make_post(raw, analysis, source_map[handle], index)
        posts.append(post); items.extend(item_rows)
    enrich_sources(sources, posts)
    priced = [i for i in items if i['priceNumeric'] is not None]
    return dict(mode='real-sources', capturedAt=(post_doc.get('collectedAt') or post_doc.get('capturedAt')) if isinstance(post_doc, dict) else None, editorialLabel='本站观察', provenance=dict(sourceFile='assets/research/raw_sources.json', postFile='assets/research/selected_posts.json', analysisFile='assets/research/analysis.json', collectedAt=(post_doc.get('collectedAt') or post_doc.get('capturedAt')) if isinstance(post_doc, dict) else None, pricesVerified=bool(priced), verifiedPriceItems=len(priced), verifiedPriceProducts=len({i['productUrl'] for i in priced})), bloggers=sources, posts=posts, items=items, trends=make_trends(posts), compares=make_compares(posts, sources))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--sources', type=Path, default=RESEARCH / 'raw_sources.json')
    parser.add_argument('--posts', type=Path, default=RESEARCH / 'selected_posts.json')
    parser.add_argument('--analysis', type=Path, default=RESEARCH / 'analysis.json')
    parser.add_argument('--output', type=Path, default=ROOT / 'js/data.js')
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    data = build(load_json(args.sources), load_json(args.posts), load_json(args.analysis, {}))
    report = audit(data)
    if not args.dry_run:
        RESEARCH.mkdir(parents=True, exist_ok=True)
        write_assets(data['bloggers']); write_data(data, args.output)
        (RESEARCH / 'real-data-audit.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    try:
        main()
    except (ValueError, OSError, json.JSONDecodeError) as error:
        print(f'数据构建停止：{error}', file=sys.stderr)
        raise SystemExit(1)

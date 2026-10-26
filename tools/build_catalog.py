"""合并大陆清单与国际选品的核验记录，避免造型资料重建时覆盖选品。"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
categories = ('shoes', 'pants', 'shirts')
items = []
for category in categories:
    records = json.loads((ROOT / 'assets/research' / ('catalog-' + category + '.json')).read_text())
    assert len(records) == 10, category + ' 必须正好有 10 款'
    assert all(p['category'] == category for p in records)
    items.extend(records)
assert len({p['id'] for p in items}) == 30
# 搭配组在核对后的完整目录里按货号挑选，只有真实商品引用可以进入组合。
recipe_path = ROOT / 'assets/research/catalog-outfits.json'
outfits = json.loads(recipe_path.read_text()) if recipe_path.exists() else []
international = []
for category in ('shoes', 'shirts', 'outerwear', 'jewelry'):
    source_path = ROOT / 'assets/research' / ('catalog-international-' + category + '.json')
    records = json.loads(source_path.read_text()) if source_path.exists() else []
    assert len(records) == 6, category + ' 国际选品必须有 6 款'
    international.extend(records)
assert all(p.get('collection') == 'international' for p in international)
items.extend(international)
addition_path = ROOT / 'assets/research/catalog-reference-additions.json'
additions = json.loads(addition_path.read_text()) if addition_path.exists() else []
assert all(p.get('collection') == 'reference' for p in additions)
items.extend(additions)
world_products = []
world_countries, world_styles = [], []
for country_id in ('us', 'uk', 'fr', 'it'):
    product_path = ROOT / 'assets/research' / ('world-products-' + country_id + '.json')
    style_path = ROOT / 'assets/research' / ('world-styles-' + country_id + '.json')
    if product_path.exists():
        records = json.loads(product_path.read_text())
        assert all(p.get('collection') == 'world' for p in records)
        world_products.extend(records)
    if style_path.exists():
        package = json.loads(style_path.read_text())
        assert package['country']['id'] == country_id
        world_countries.append(package['country'])
        assert len(package['styles']) == 3, country_id
        extra_style_path = ROOT / 'assets/research' / ('world-styles-' + country_id + '-extra.json')
        if extra_style_path.exists():
            extra_styles = json.loads(extra_style_path.read_text())
            for style in extra_styles:
                style['isNew'] = True
            package['styles'].extend(extra_styles)
        for order, style in enumerate(package['styles'], 1):
            style['countryId'], style['order'] = country_id, order
            world_styles.append(style)
for country_id in ('us', 'uk', 'fr', 'it'):
    for stem in ('world-products-', 'world-jewelry-'):
        extra_path = ROOT / 'assets/research' / (stem + country_id + '-extra.json')
        if extra_path.exists():
            records = json.loads(extra_path.read_text())
            assert all(p.get('collection') == 'world' for p in records)
            world_products.extend(records)
items.extend(world_products)
leather_products = []
for filename in ('leather-bags-everyday.json', 'leather-bags-luxury.json', 'coach-brand-leather.json'):
    source_path = ROOT / 'assets/research' / filename
    if source_path.exists():
        records = json.loads(source_path.read_text())
        assert all(p.get('collection') == 'leather' and p['category'] == 'bags' and p['bagTier'] in ('everyday', 'luxury') for p in records)
        leather_products.extend(records)
items.extend(leather_products)
brand_path = ROOT / 'assets/research/coach-brand-canvas.json'
brand_products = json.loads(brand_path.read_text()) if brand_path.exists() else []
assert all(p.get('collection') == 'brand' and p['category'] == 'bags' for p in brand_products)
items.extend(brand_products)
assert len({p['id'] for p in items}) == len(items)
ids = {p['id'] for p in items}
for outfit in outfits:
    assert len(outfit['items']) == 3
    assert all(item_id in ids for item_id in outfit['items'])
    assert {next(p['category'] for p in items if p['id'] == item_id) for item_id in outfit['items']} == set(categories)
international_outfits_path = ROOT / 'assets/research/catalog-international-outfits.json'
international_outfits = json.loads(international_outfits_path.read_text()) if international_outfits_path.exists() else []
for outfit in international_outfits:
    assert len(outfit['items']) == 4
    assert all(item_id in {p['id'] for p in international} for item_id in outfit['items'])
    assert {next(p['category'] for p in international if p['id'] == item_id) for item_id in outfit['items']} == {'shoes', 'shirts', 'outerwear', 'jewelry'}
data = {'version': 5, 'verifiedAt': '2026-10-25', 'type': 'editorial-style-and-shopping-selection',
        'note': '搭配选品，不代表已证实的艺人同款。价格按官网地区保留原币种，非大陆到手价。',
        'preferences': json.loads((ROOT / 'assets/research/purchasing-preferences.json').read_text()),
        'items': items, 'outfits': outfits, 'internationalOutfits': international_outfits}
(ROOT / 'js/catalog-data.js').write_text('/* 真实商品目录；由 tools/build_catalog.py 从核验记录生成。 */\nwindow.FITGRAM_CATALOG = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(json.dumps({'items': len(items), 'categories': {c: sum(p['category'] == c for p in items) for c in ('shoes', 'pants', 'shirts', 'outerwear', 'jewelry', 'tops', 'bags', 'accessories')}, 'international': len(international), 'outfits': len(outfits)}, ensure_ascii=False))

# 穿搭参考独立于原始 IG 档案，避免把整理选辑当作原作者帖文。
reference_looks = []
for index in range(1, 5):
    reference_looks.extend(json.loads((ROOT / 'assets/research' / ('reference-looks-' + str(index) + '.json')).read_text()))
assert len(reference_looks) == 28
assert len({look['id'] for look in reference_looks}) == 28
for look in reference_looks:
    assert all(match['itemId'] in ids and match['level'] == 'similar-style' for match in look['matches'])
references = {'version': 1, 'source': json.loads((ROOT / 'assets/research/reference-source.json').read_text()), 'looks': reference_looks}
(ROOT / 'js/reference-data.js').write_text('/* 28 张真实照片及逐张观察，由 tools/build_catalog.py 生成。 */\nwindow.FITGRAM_REFERENCES = ' + json.dumps(references, ensure_ascii=False, separators=(',', ':')) + ';\n')
print('Reference looks:', len(reference_looks))

# 国别风格引用已核验商品；不另建一组无法对应的示意款。
slot_categories = {'bag': {'bags'}, 'shoes': {'shoes'}, 'top': {'shirts', 'tops'}, 'outerwear': {'outerwear'}, 'pants': {'pants'}, 'jewelry': {'jewelry'}, 'accessory': {'accessories'}}
for style in world_styles:
    assert len(style['slots']) == 7
    assert {slot['slot'] for slot in style['slots']} == set(slot_categories)
    for slot in style['slots']:
        product = next((p for p in items if p['id'] == slot['itemId']), None)
        assert product and product['category'] in slot_categories[slot['slot']], style['id'] + ': ' + slot['itemId']
world = {'version': 1, 'verifiedAt': '2026-10-23', 'countries': world_countries, 'styles': world_styles}
(ROOT / 'js/world-data.js').write_text('/* 国别风格、真实商品与品牌依据；由 tools/build_catalog.py 生成。 */\nwindow.FITGRAM_WORLD = ' + json.dumps(world, ensure_ascii=False, separators=(',', ':')) + ';\n')
print('World styles:', len(world_styles), 'New products:', len(world_products))

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
data = {'version': 2, 'verifiedAt': '2026-10-22', 'type': 'editorial-style-and-shopping-selection',
        'note': '搭配选品，不代表已证实的艺人同款。价格按官网地区保留原币种，非大陆到手价。',
        'preferences': json.loads((ROOT / 'assets/research/purchasing-preferences.json').read_text()),
        'items': items, 'outfits': outfits, 'internationalOutfits': international_outfits}
(ROOT / 'js/catalog-data.js').write_text('/* 真实商品目录；由 tools/build_catalog.py 从核验记录生成。 */\nwindow.FITGRAM_CATALOG = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(json.dumps({'items': len(items), 'categories': {c: sum(p['category'] == c for p in items) for c in ('shoes', 'pants', 'shirts', 'outerwear', 'jewelry')}, 'international': len(international), 'outfits': len(outfits)}, ensure_ascii=False))

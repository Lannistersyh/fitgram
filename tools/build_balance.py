"""将量感课程、逐套观察和商品替换复核生成离线可读的数据脚本。"""
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
read = lambda filename: json.loads((ROOT / 'assets/research' / filename).read_text())
lessons = read('balance-lessons.json')
guides = sum([read('balance-japan-' + str(n) + '.json') for n in range(1, 5)], [])
reviews = read('balance-match-reviews.json')
pairing = read('balance-pairing.json')
looks = sum([read('japan-looks-' + str(n) + '.json') for n in range(1, 5)], [])
assert len(guides) == 20 and {p['id'] for p in guides} == {p['id'] for p in looks}
assert len(lessons['lessons']) == 4
assert len(reviews['reviews']) == 49
assert {(p['lookId'], p['itemId']) for p in reviews['reviews']} == {(p['id'], m['itemId']) for p in looks for m in p['matches']}
assert all(p['kind'] in ('reference', 'alternative', 'compare') for p in reviews['reviews'])
assert len(pairing['pairs']) == 9 and len({(p['shoeKey'], p['pantsKey']) for p in pairing['pairs']}) == 9
data = dict(version=1, reviewedAt='2026-10-28', source=lessons['source'], note=lessons['note'], lessons=lessons['lessons'], guides=guides, reviews=reviews['reviews'], pairing=pairing)
(ROOT / 'js/balance-data.js').write_text('/* 量感课程与逐套复核；由 tools/build_balance.py 生成。 */\nwindow.FITGRAM_BALANCE = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(json.dumps(dict(lessons=4,frames=8,guides=len(guides),reviews=len(reviews['reviews']),pairs=9),ensure_ascii=False))

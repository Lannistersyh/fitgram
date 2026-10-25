"""将逐章核对的潮流史资料转为 file:// 可用的脚本，不改写商品快照。"""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
chapters = []
for name in ('history-us-uk.json', 'history-fr-it.json'):
    chapters.extend(json.loads((ROOT / 'assets/research' / name).read_text()))
assert len({c['id'] for c in chapters}) == len(chapters)
for chapter in chapters:
    assert chapter['year'] <= chapter['endYear'] <= 2026
    assert chapter['imageKind'] in ('archive-photo', 'museum-object', 'brand-archive')
    assert len(chapter['sources']) >= 2
    assert len(chapter['productIds']) == 3
    image = (ROOT / chapter['image']).read_bytes()
    assert image[:3] == b'\xff\xd8\xff'
    chapter['imageSha256'] = hashlib.sha256(image).hexdigest()
chapters.sort(key=lambda c: (c['year'], c['countryId'], c['id']))
data = {'version': 1, 'verifiedAt': '2026-10-25', 'chapters': chapters}
(ROOT / 'js/history-data.js').write_text(
    '/* 潮流历史图集；由 tools/build_history.py 从逐章来源记录生成。 */\n'
    'window.FITGRAM_HISTORY = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(json.dumps({'chapters': len(chapters), 'images': len(chapters),
                  'period': [min(c['year'] for c in chapters), max(c['endYear'] for c in chapters)],
                  'sources': sum(len(c['sources']) for c in chapters)}, ensure_ascii=False))

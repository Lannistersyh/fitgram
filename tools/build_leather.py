"""生成皮包专题索引；实际商品统一进入现有目录，不另存价格副本。"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
records = []
for tier in ('everyday', 'luxury'):
    batch = json.loads((ROOT / 'assets/research' / ('leather-bags-' + tier + '.json')).read_text())
    assert len(batch) == 10
    assert all(p['collection'] == 'leather' and p['bagTier'] == tier for p in batch)
    records.extend(batch)
assert len({p['id'] for p in records}) == len(records)
editorial = json.loads((ROOT / 'assets/research/leather-editorial.json').read_text())
selected_ids = [p['id'] for p in records]
for pairing in editorial['pairings']:
    assert len(pairing['bagIds']) == 2
    assert all(i in selected_ids for i in pairing['bagIds'])
    assert {next(p['bagTier'] for p in records if p['id'] == i) for i in pairing['bagIds']} == {'everyday', 'luxury'}
data = {'version': 1, 'verifiedAt': '2026-10-25', 'selectedIds': selected_ids,
        'guides': editorial['guides'], 'pairings': editorial['pairings']}
(ROOT / 'js/leather-data.js').write_text(
    '/* 真皮包专题与编辑搭配；由 tools/build_leather.py 生成，共用真实商品目录。 */\n'
    'window.FITGRAM_LEATHER = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(json.dumps({'selectedBags': len(selected_ids), 'pairings': len(data['pairings']), 'guides': len(data['guides'])}))

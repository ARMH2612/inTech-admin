from pathlib import Path
import html
import re
from html.parser import HTMLParser

root = Path(__file__).parent
source = (root / 'REPORT.md').read_text(encoding='utf-8')

def inline(s):
    s = html.escape(s)
    s = re.sub(r'`([^`]+)`', r'<code>\1</code>', s)
    s = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', s)
    s = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', s)
    return s

out, paragraph, table = [], [], []
def flush():
    if paragraph:
        out.append('<p>' + inline(' '.join(paragraph)) + '</p>')
        paragraph.clear()
    if table:
        rows = [x for x in table if not re.match(r'^\|[\s:|\-]+\|$', x)]
        out.append('<div class="table-scroll"><table>')
        for i, row in enumerate(rows):
            tag = 'th' if i == 0 else 'td'
            out.append('<tr>' + ''.join(f'<{tag}>{inline(c.strip())}</{tag}>' for c in row.strip('|').split('|')) + '</tr>')
        out.append('</table></div>')
        table.clear()

for line in source.splitlines():
    if not line.strip():
        flush()
    elif line.startswith('|'):
        if paragraph: flush()
        table.append(line)
    elif line.startswith('#'):
        flush()
        level = len(line) - len(line.lstrip('#'))
        label = line[level:].strip()
        anchor = re.sub(r'[^a-z0-9]+', '-', label.lower()).strip('-')
        out.append(f'<h{level} id="{anchor}">{inline(label)}</h{level}>')
    elif line.startswith('- '):
        flush()
        out.append('<p class="bullet">' + inline(line[2:]) + '</p>')
    else:
        paragraph.append(line)
flush()

shots = [
 ('37-search-ready.png', 'Safe-area overlap and incorrect shop search title'),
 ('96-tech-devices-settled.png', 'Empty device-specialty selector with Continue'),
 ('109-rewards.png', 'Zero points and contradictory availability message'),
 ('110-credit-offers.png', 'Credit offers need clear charging and conversion rules'),
 ('48-referral.png', 'Placeholder referral URL and repeated sample entries'),
 ('60-promos.png', 'Expired promotion presented as a normal offer'),
 ('22-location-denied.png', 'Location-denial recovery needs a usable fallback'),
 ('119-warranty-request.png', 'A useful explicit no-active-warranty state'),
]
gallery = '<section><h2>Selected visual evidence</h2><p>Click a screenshot for its original image. Findings and qualifications are explained in the report.</p><div class="gallery">'
for name, label in shots:
    if not (root/'evidence'/name).is_file(): raise FileNotFoundError(name)
    gallery += f'<figure><a href="evidence/{name}"><img loading="lazy" src="evidence/{name}" alt="{html.escape(label)}"></a><figcaption>{html.escape(label)}<small>{name}</small></figcaption></figure>'
gallery += '</div></section>'

document = '''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>InTech — Product & APK audit</title><style>
:root{color-scheme:light;--ink:#202337;--muted:#647086;--purple:#6546bd}*{box-sizing:border-box}body{margin:0;background:#f3f4f8;color:var(--ink);font:16px/1.65 system-ui,-apple-system,Segoe UI,sans-serif}header{background:#242039;color:white;padding:28px max(24px,calc((100vw - 1120px)/2))}header b{font-size:23px}header p{margin:5px 0 0;color:#d7cee9}main{max-width:1120px;margin:30px auto;background:white;padding:44px 54px;border-radius:16px;box-shadow:0 5px 32px #20233709}h1{font-size:36px;line-height:1.2;margin:0 0 24px}h2{font-size:25px;margin:46px 0 18px;border-bottom:2px solid #ece7f6;padding-bottom:10px}h3{font-size:19px;margin:30px 0 10px;color:#453377}p{margin:12px 0}a{color:var(--purple);text-underline-offset:3px}code{font:13px/1.5 Consolas,monospace;overflow-wrap:anywhere;background:#f2f0f7;padding:2px 5px;border-radius:4px}table{border-collapse:collapse;width:100%;font-size:14px;line-height:1.5}th,td{padding:13px 14px;text-align:left;vertical-align:top;border-bottom:1px solid #e5e7ee}th{background:#eee9f8}tr:nth-child(even){background:#fafafd}.table-scroll{overflow:auto}.bullet{padding-left:18px;position:relative}.bullet:before{content:'•';position:absolute;left:0;color:var(--purple)}.gallery{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}figure{margin:0;background:#f6f5fa;border:1px solid #e4e0ed;border-radius:10px;overflow:hidden}figure img{display:block;width:100%;height:370px;object-fit:contain;background:#e9e6f0}figcaption{padding:12px;font-size:13px;line-height:1.4}small{display:block;color:var(--muted);margin-top:8px;font-size:11px}footer{max-width:1120px;margin:20px auto 40px;color:var(--muted);padding:0 24px;font-size:13px}@media(max-width:760px){main{margin:0;padding:26px 20px;border-radius:0}h1{font-size:29px}.gallery{grid-template-columns:repeat(2,1fr)}figure img{height:300px}}@media print{body{background:white}header,footer{display:none}main{box-shadow:none;margin:0;padding:0;max-width:none}h2,h3{break-after:avoid}tr,figure{break-inside:avoid}.gallery{grid-template-columns:repeat(4,1fr)}figure img{height:270px}}
</style></head><body><header><b>InTech / Independent build audit</b><p>Client · Technician · Reliability · Design · Product readiness</p></header><main>'''+ '\n'.join(out)+gallery+'''</main><footer>Prepared 28 September 2026 · Internal project review · APK and emulator evidence, with unverified areas explicitly identified.</footer></body></html>'''
(root/'REPORT.html').write_text(document, encoding='utf-8')

class LinkCheck(HTMLParser):
    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key in ('href','src') and value and not value.startswith(('http:', 'https:', '#')):
                assert (root/value).exists(), f'Missing local link: {value}'
LinkCheck().feed(document)
print(f'Built REPORT.html; verified local links and {len(shots)} gallery images. Markdown words: {len(source.split())}.')

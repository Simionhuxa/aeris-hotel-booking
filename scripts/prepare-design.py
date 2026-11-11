"""Offline conversion of the saved Figma reference to typed presentation data.

No Figma API access. Assets resolve through the verified local inventory.
The React renderer supplies semantics, shared components, and interactions.
"""
from pathlib import Path
from html.parser import HTMLParser
import json
import re

ROOT = Path(__file__).resolve().parents[1]
inventory = json.loads((ROOT / 'design/inventory.json').read_text(encoding='utf-8'))
assets = {a['url']: '/' + a['file'].removeprefix('public/') for a in inventory['assets']}

def normalize(classes):
    classes = re.sub(r"font-\['Cormorant_Garamond:([^']+)'\]", lambda m: 'font-display' + (' italic' if m[1] == 'Italic' else ''), classes)
    classes = re.sub(r"font-\['Manrope:[^']+'\]", 'font-sans', classes)
    classes = classes.replace('min-w-full', 'w-full min-w-0').replace('w-[min-content]', '')
    classes = classes.replace('size-full', 'w-full h-full')
    return ' '.join(classes.split())

class Parser(HTMLParser):
    def __init__(self, variables):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.roots = []
        self.variables = variables

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        node = {'tag': tag, 'id': attrs.get('data-node-id', ''), 'name': attrs.get('data-name', ''), 'classes': normalize(attrs.get('classname', '')), 'children': []}
        if tag == 'img':
            variable = attrs.get('src', '').strip('{}')
            node['src'] = self.variables.get(variable, '')
        if self.stack: self.stack[-1]['children'].append(node)
        else: self.roots.append(node)
        if tag != 'img': self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag != 'img': self.handle_endtag(tag)

    def handle_endtag(self, tag):
        if self.stack and self.stack[-1]['tag'] == tag: self.stack.pop()

    def handle_data(self, data):
        text = data.strip()
        if text and self.stack:
            text = re.sub(r'^\{`([\s\S]*)`\}$', r'\1', text)
            self.stack[-1]['children'].append(text)

frames = {}
asset_variables = {}
for frame in inventory['frames']:
    if frame['designContext'] != 'saved': continue
    code = (ROOT / ('design/references/' + frame['id'].replace(':', '_') + '.txt')).read_text(encoding='utf-8')
    variables = {m[1]: assets[m[2]] for m in re.finditer(r'const (\w+) = "([^"]+)"', code)}
    asset_variables[frame['id']] = variables
    # Retain every asset mapping; live booking components replace static form nodes.
    if frame['name'].startswith(('Booking', 'Confirmation')): continue
    parser = Parser(variables)
    body = code.split('return (', 1)[1].rsplit(');', 1)[0]
    parser.feed(body)
    assert len(parser.roots) == 1, frame['name']
    def share(node):
        if not isinstance(node, dict): return
        if node['name'] in ('Solid navigation', 'Transparent navigation'):
            node['children'] = []
        elif node['name'] == 'Footer' and frame['id'] not in ('3:15867', '3:16043'):
            node['name'] = 'Shared footer'
            node['children'] = []
            node['classes'] = ''
        else:
            for child in node['children']: share(child)
    share(parser.roots[0])
    frames[frame['id']] = parser.roots[0]
    asset_variables[frame['id']] = variables
(ROOT / 'src/data').mkdir(parents=True, exist_ok=True)
(ROOT / 'src/data/frames.json').write_text(json.dumps(frames, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
(ROOT / 'src/data/assets.json').write_text(json.dumps(asset_variables, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'Prepared {len(frames)} saved frame references using local assets only.')

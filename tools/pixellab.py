#!/usr/bin/env python3
# Appels PixelLab. Clé lue dans .env (PIXELLAB_API_KEY).
# Usage:
#   python3 tools/pixellab.py balance
#   python3 tools/pixellab.py char <id> "<description>"   -> assets/sprites/<id>_{south,west,east,north}.png
import sys, os, json, base64, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KEY = ''
for line in open(os.path.join(ROOT, '.env')):
    if line.startswith('PIXELLAB_API_KEY='):
        KEY = line.strip().split('=', 1)[1]
BASE = 'https://api.pixellab.ai/v2'

def req(method, path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(BASE + path, data=data, method=method,
        headers={'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json'})
    with urllib.request.urlopen(r, timeout=180) as resp:
        return json.load(resp)

def balance():
    print(json.dumps(req('GET', '/balance'), indent=2))

def save_b64(b64, path):
    if ',' in b64: b64 = b64.split(',', 1)[1]
    open(path, 'wb').write(base64.b64decode(b64))

def char(cid, desc):
    os.makedirs(os.path.join(ROOT, 'assets', 'sprites'), exist_ok=True)
    body = {
        'description': desc,
        'image_size': {'width': 64, 'height': 64},
        'view': 'high_top_down',
        'proportions': {'type': 'preset', 'name': 'cartoon'},
        'outline': 'single color black outline',
        'detail': 'medium detail',
    }
    res = req('POST', '/create-character-with-4-directions', body)
    imgs = res.get('images', {})
    for d in ('south', 'west', 'east', 'north'):
        if d in imgs and imgs[d].get('base64'):
            save_b64(imgs[d]['base64'], os.path.join(ROOT, 'assets', 'sprites', f'{cid}_{d}.png'))
            print('  ->', f'assets/sprites/{cid}_{d}.png')
    if 'usage' in res: print('usage:', res['usage'])

cmd = sys.argv[1] if len(sys.argv) > 1 else 'balance'
if cmd == 'balance': balance()
elif cmd == 'char': char(sys.argv[2], sys.argv[3])

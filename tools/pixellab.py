#!/usr/bin/env python3
# Appels PixelLab. Clé dans .env (PIXELLAB_API_KEY).
#   python3 tools/pixellab.py balance
#   python3 tools/pixellab.py sprite <id> "<desc>" [size] [nobg]
#   python3 tools/pixellab.py char   <id> "<desc>" [view]
#   python3 tools/pixellab.py tileset <id> "<lower>" "<upper>" ["<transition>"]
import sys, os, json, base64, time, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KEY = ''
for line in open(os.path.join(ROOT, '.env')):
    if line.startswith('PIXELLAB_API_KEY='):
        KEY = line.strip().split('=', 1)[1]
BASE = 'https://api.pixellab.ai/v2'
SPR = os.path.join(ROOT, 'assets', 'sprites')
TILES = os.path.join(ROOT, 'assets', 'tiles')
os.makedirs(SPR, exist_ok=True); os.makedirs(TILES, exist_ok=True)

def req(method, path, body=None, timeout=240):
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(BASE + path, data=data, method=method,
        headers={'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(r, timeout=timeout) as resp:
            return resp.status, json.load(resp)
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode() or '{}')

def b64(s):
    if isinstance(s, dict): s = s.get('base64') or ''
    if ',' in s: s = s.split(',', 1)[1]
    return base64.b64decode(s)

def balance():
    print(json.dumps(req('GET', '/balance')[1], indent=2))

def sprite(sid, desc, size=64, nobg=True, init=None):
    body = {'description': desc, 'image_size': {'width': int(size), 'height': int(size)}}
    if nobg and not init: body['no_background'] = True
    if init:
        import base64 as _b
        body['init_image'] = {'base64': _b.b64encode(open(init,'rb').read()).decode()}
    st, res = req('POST', '/create-image-pixflux', body)
    if st != 200: print('ERR', sid, st, res); return
    open(os.path.join(SPR, sid + '.png'), 'wb').write(b64(res['image']))
    print('OK sprite', sid, res.get('usage'))

def _dl(url, path):
    import urllib.request
    r = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(r, timeout=60) as resp:
        open(path, 'wb').write(resp.read())

def char(cid, desc, view='high_top_down'):
    body = {'description': desc, 'image_size': {'width': 64, 'height': 64}, 'view': view,
            'proportions': {'type': 'preset', 'name': 'cartoon'}, 'outline': 'single color black outline'}
    for attempt in range(3):
        st, res = req('POST', '/create-character-with-4-directions', body)
        if st not in (200, 202): print('ERR char', cid, st, res); return
        job, charid = res['background_job_id'], res['character_id']
        status = None
        for _ in range(48):
            time.sleep(5)
            _, jr = req('GET', f'/background-jobs/{job}')
            status = jr.get('status')
            if status in ('completed', 'failed'): break
        if status == 'completed':
            _, cr = req('GET', f'/characters/{charid}')
            ok = 0
            for d in ('south', 'west', 'east', 'north'):
                u = (cr.get('rotation_urls') or {}).get(d)
                if u:
                    try: _dl(u, os.path.join(SPR, f'{cid}_{d}.png')); ok += 1
                    except Exception as e: print('  dl err', d, e)
            print('OK char', cid, '->', ok, 'directions'); return
        print(f'  char {cid} échec (essai {attempt+1}), retry...')
    print('ABANDON char', cid)

def tileset(tid, lower, upper, transition=None):
    body = {'lower_description': lower, 'upper_description': upper,
            'tile_size': {'width': 16, 'height': 16}, 'view': 'high top-down'}
    if transition: body['transition_description'] = transition
    st, res = req('POST', '/create-tileset', body)
    if st not in (200, 202): print('ERR tileset', tid, st, res); return
    job, ts = res['background_job_id'], res['tileset_id']
    for _ in range(60):
        time.sleep(5)
        s2, jr = req('GET', f'/background-jobs/{job}')
        status = jr.get('status')
        if status == 'completed': break
        if status == 'failed': print('FAILED', tid, jr); return
    s3, tr = req('GET', f'/tilesets/{ts}')
    json.dump(tr, open(os.path.join(TILES, tid + '.json'), 'w'))
    n = 0
    for i, t in enumerate(tr['tileset']['tiles']):
        open(os.path.join(TILES, f'{tid}_{i:02d}.png'), 'wb').write(b64(t['image'])); n += 1
    print('OK tileset', tid, '->', n, 'tuiles', tr.get('usage'))

cmd = sys.argv[1] if len(sys.argv) > 1 else 'balance'
if cmd == 'balance': balance()
elif cmd == 'sprite': sprite(sys.argv[2], sys.argv[3], *(sys.argv[4:6] if len(sys.argv) > 4 else []))
elif cmd == 'isprite': sprite(sys.argv[2], sys.argv[3], sys.argv[4], False, sys.argv[5])  # init_image img2img
elif cmd == 'char': char(sys.argv[2], sys.argv[3], *(sys.argv[4:5]))
elif cmd == 'tileset': tileset(sys.argv[2], sys.argv[3], sys.argv[4], *(sys.argv[5:6]))

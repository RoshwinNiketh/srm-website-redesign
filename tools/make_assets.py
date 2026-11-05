"""Builds gate layers, depth maps and campus data. Run from the repo root."""
import json, math, re
from PIL import Image, ImageDraw, ImageFilter
IMG = "assets/images/"
# ---- gate: same photo with the central arch opening cut out, so the camera can pass through it
src = Image.open(IMG + "archgate.png").convert("RGB"); W, H = src.size; sx, sy = W / 1672, H / 941
SS = 2; m = Image.new("L", (W * SS, H * SS), 255); d = ImageDraw.Draw(m)
cx, cy, rx, ry = 838, 482, 234, 205
d.ellipse([(cx - rx) * sx * SS, (cy - ry) * sy * SS, (cx + rx) * sx * SS, (cy + ry) * sy * SS], fill=0)
d.rectangle([(cx - rx) * sx * SS, cy * sy * SS, (cx + rx) * sx * SS, 772 * sy * SS], fill=0)
m = m.resize((W, H), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.6))
front = src.copy(); front.putalpha(m); front.save(IMG + "arch-front.webp", quality=84, method=6)
# ---- depth maps: hand-placed masses, white = near
def depth(name, shapes, sky=0):
    D = Image.new("L", (836, 470)); dr = ImageDraw.Draw(D)
    for y in range(470):
        v = int(255 * max(0, (y / 470 - sky) / (1 - sky)) ** 1.15); dr.line([(0, y), (836, y)], fill=v)
    for poly, v in shapes:
        dr.polygon([(x / 2, y / 2) for x, y in poly], fill=v)
    D.filter(ImageFilter.GaussianBlur(5)).save(IMG + name, quality=82)
depth("campus-aerial-depth.webp", [
    ([(850, 205), (1245, 205), (1245, 530), (850, 530)], 150), ([(1280, 285), (1520, 285), (1520, 500), (1280, 500)], 125),
    ([(0, 430), (495, 430), (495, 625), (0, 625)], 170), ([(200, 270), (500, 270), (500, 360), (200, 360)], 70),
    ([(900, 655), (1340, 655), (1340, 835), (900, 835)], 225), ([(0, 660), (420, 660), (420, 941), (0, 941)], 240)], sky=.2)
depth("campus-life-depth.webp", [([(0, 0), (520, 0), (520, 941), (0, 941)], 200), ([(1000, 200), (1672, 200), (1672, 700), (1000, 700)], 120)], sky=.25)
# ---- campus data (metres from a local origin)
LAT0, LON0 = 12.822, 80.043; MX = 111320 * math.cos(math.radians(LAT0)); MY = 110540
xy = lambda p: [round((p["lon"] - LON0) * MX, 1), round(-(p["lat"] - LAT0) * MY, 1)]
DROP = re.compile(r"zoho|abode|kia|estancia|woodlands|lake view|evangelical|balaji|vanga|temple|tea stall|mosque|vidya mandir|club house|aparments|new ", re.I)
TALL = {"srm tech park": 48, "tech park 2": 48, "high tech block": 24, "main block": 20, "university building": 28}
B = []
for e in json.load(open("tools/osm-campus.json", encoding="utf-8"))["elements"]:
    t = e.get("tags", {}); n = t.get("name", "")
    if (n and DROP.search(n)) or not e.get("geometry"): continue
    pts = [xy(g) for g in e["geometry"] if g]
    if len(pts) > 1 and pts[0] == pts[-1]: pts.pop()
    if len(pts) < 3: continue
    h = next((v for k, v in TALL.items() if k in n.lower()), None)
    if not h and t.get("building:levels"):
        try: h = float(t["building:levels"]) * 3.6
        except ValueError: pass
    B.append({"n": n, "h": h or (18 if re.search("hostel|block", n, re.I) else 12), "p": pts})
area = lambda b: abs(sum(a[0] * c[1] - c[0] * a[1] for a, c in zip(b["p"], b["p"][1:] + b["p"][:1]))) / 2
find = lambda s: next(i for i, b in enumerate(B) if s in b["n"].lower())
east = [i for i, b in enumerate(B) if not b["n"] and b["p"][0][0] > 150 and b["p"][0][1] > -350]
schools = {"engineering": find("srm tech park"), "medical": max(east, key=lambda i: area(B[i])) if east else find("biotech"),
           "arts": find("biotech"), "management": find("mba block"), "law": find("c v raman")}
env = json.load(open("tools/osm-env.json", encoding="utf-8"))["elements"]
water = [[xy(p) for p in e["geometry"] if p] for e in env if e.get("tags", {}).get("natural") == "water" and e.get("geometry")]
roads = [[xy(p) for p in e["geometry"] if p] for e in env if e.get("tags", {}).get("highway") and e.get("geometry")]
json.dump({"credit": "Footprints (c) OpenStreetMap contributors, ODbL", "buildings": B, "water": water, "roads": roads, "schools": schools},
          open("assets/data/campus.json", "w", encoding="utf-8"), separators=(",", ":"))
print(len(B), "buildings", schools, {k: (B[v]["n"] or "unnamed", round(area(B[v]))) for k, v in schools.items()})

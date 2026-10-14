#!/usr/bin/env python3
"""The pieces "What's in the box" (How to play) shows in 3D: each card's flat front and back art, each deck's
thumbnail sheet, the game box's sides and the point token's two faces, copied into public/images/pieces/ with
public/images/pieces/pieces.json listing them.

They come from Pegasus HQ's mockups tool (pegasusnotunicorn/LCM, marketing/video/tools/blender/mockup.py):

  python3 mockup.py hq --out /tmp/hq                 # the art, 768 px wide, and /tmp/hq/hq.json
  python3 scripts/import-pieces.py /tmp/hq/hq.json

Only the base game's decks, the box and the token: the Second Season's are left out. The box's and the token's
thumbnails aren't made by `mockup.py hq`; this keeps the ones already in public/images/pieces/box/.
"""
import json
import os
import shutil
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "public", "images", "pieces")
URL = "/images/pieces"
SLUGS = {"Characters": "characters", "Episodes": "episodes", "Director": "director", "Producer": "producer",
         "Showrunner": "showrunner", "Good traits": "good-traits", "Bad traits": "bad-traits", "Chaotic traits": "chaotic-traits"}


def main(manifest):
    decks = json.load(open(manifest))["decks"]
    out = []

    def put(src, rel):
        dst = os.path.join(OUT, rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copyfile(src, dst)
        return f"{URL}/{rel}"

    # the box and the point token first, one "deck" (its thumbnail sheet: the two, side by side)
    props = {d["kind"]: d for d in decks if d.get("kind")}
    box, token = props["box"]["cards"][0], props["token"]["cards"][0]
    out.append({"name": "The box", "cols": 2, "thumbs": f"{URL}/box/thumbs.webp", "items": [
        {"name": box["name"], "kind": "box", "mm": props["box"]["mm"], "front": put(box["front"], "box/lid.webp"),
         "back": put(box["back"], "box/bottom.webp"), "sides": {k: put(v, f"box/{k}.webp") for k, v in box["sides"].items()}},
        {"name": token["name"], "kind": "token", "mm": props["token"]["mm"], "front": put(token["front"], "box/token-front.webp"),
         "back": put(token["back"], "box/token-back.webp")},
    ]})
    for d in decks:
        if d.get("kind") or d.get("group") != "Base game":
            continue
        slug, cards = SLUGS[d["name"]], d["cards"]
        one_back = len({c["back"] for c in cards}) == 1
        items = []
        for i, c in enumerate(cards, 1):
            back = f"{slug}/back.webp" if one_back else f"{slug}/{i:02d}-back.webp"
            items.append({"name": c["name"], "front": put(c["front"], f"{slug}/{i:02d}.webp"), "back": put(c["back"], back),
                          **({"text": c["text"]} if c.get("text") else {})})
        out.append({"name": d["name"], "kind": "card", "mm": d["mm"], "cols": 10, "thumbs": put(d["thumbs"], f"{slug}/thumbs.webp"), "items": items})
        print(f"{d['name']}: {len(items)}")
    with open(os.path.join(OUT, "pieces.json"), "w", encoding="utf-8") as f:
        json.dump({"decks": out}, f, ensure_ascii=False, separators=(",", ":"))
        f.write("\n")


if __name__ == "__main__":
    main(*sys.argv[1:])

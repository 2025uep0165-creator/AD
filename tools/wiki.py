"""Shared helpers for pulling media off the Game of Thrones wiki."""
import json, time, urllib.parse, urllib.request

API = "https://gameofthrones.fandom.com/api.php"
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                    "(KHTML, like Gecko) Chrome/122 Safari/537.36"}

def api(**kw):
    kw.setdefault("format", "json")
    url = API + "?" + urllib.parse.urlencode(kw)
    for attempt in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=45) as r:
                return json.load(r)
        except Exception:
            time.sleep(1.5 * (attempt + 1))
    return {}

def imageinfo(titles):
    """[File:x] -> {title: (url, w, h, mime)} — batched 50 at a time."""
    out = {}
    titles = list(titles)
    for i in range(0, len(titles), 50):
        d = api(action="query", titles="|".join(titles[i:i+50]),
                prop="imageinfo", iiprop="url|size|mime")
        for p in d.get("query", {}).get("pages", {}).values():
            ii = (p.get("imageinfo") or [{}])[0]
            if ii.get("url"):
                out[p["title"]] = (ii["url"], ii.get("width", 0),
                                   ii.get("height", 0), ii.get("mime", ""))
    return out

def search_files(query, limit=30):
    d = api(action="query", list="search", srsearch=query, srnamespace="6", srlimit=limit)
    return [h["title"] for h in d.get("query", {}).get("search", [])]

def page_images(title, limit=300):
    d = api(action="query", titles=title, prop="images", imlimit=str(limit))
    out = []
    for p in d.get("query", {}).get("pages", {}).values():
        for im in p.get("images", []):
            if im["title"].lower().endswith((".jpg", ".jpeg", ".png")):
                out.append(im["title"])
    return out

def original(url):
    """Strip the wiki's scaling suffix so we get the full-size file."""
    return url.split("/revision/")[0] + "/revision/latest?format=original"

def fetch(url, timeout=120):
    with urllib.request.urlopen(urllib.request.Request(original(url), headers=UA),
                                timeout=timeout) as r:
        return r.read()

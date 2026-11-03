import urllib.request,urllib.error,json,pathlib,time
results=[]
for url,headers in [('https://clients3.google.com/generate_204',{}),('http://141.136.42.95:8000/api/shop/brands',{'Accept':'application/json'})]:
    start=time.monotonic()
    try:
        with urllib.request.urlopen(urllib.request.Request(url,headers=headers),timeout=15) as r:
            results.append({'url':url,'status':r.status,'seconds':round(time.monotonic()-start,2),'content_type':r.headers.get('Content-Type')})
    except urllib.error.HTTPError as e:
        results.append({'url':url,'status':e.code,'seconds':round(time.monotonic()-start,2),'content_type':e.headers.get('Content-Type')})
    except Exception as e:results.append({'url':url,'error':str(e),'seconds':round(time.monotonic()-start,2)})
pathlib.Path(__file__).with_name('evidence').joinpath('network-check.json').write_text(json.dumps(results,indent=2))
print(json.dumps(results,indent=2))

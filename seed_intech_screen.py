import importlib.util,json,sys,uuid
from pathlib import Path
spec=importlib.util.spec_from_file_location('campaign',r'C:\Users\HP\Desktop\Islem\qa\scripts\campaign.py')
q=importlib.util.module_from_spec(spec);spec.loader.exec_module(q)
manifest={'purpose':'Persistent app-screen demo data; do not automatically delete','created':q.RUN,'categories':[],'brands':[],'products':[],'vendor_admin_ids':[]}
out=q.QA/'screen-demo.json'
tokens=[];super_token=None
def save():out.write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
def require(row):
    if row['verdict']!='PASS':raise RuntimeError('Request failed: '+row['id'])
try:
    creds=json.loads(sys.stdin.read());mailbox=creds.pop('invitation_email')
    p,row=q.check('Login for screen data','POST','/admin/login',creds,auth=False);creds.clear();require(row)
    super_token=p['token'];q.TOKEN=super_token
    for fr,ar in [('Démo - Réfrigération','تجريبي - التبريد'),('Démo - Climatisation','تجريبي - تكييف الهواء'),('Démo - Outillage','تجريبي - الأدوات')]:
        cid,item=q.create('/admin/shop/categories',{'name_fr':fr,'name_ar':ar,'is_active':True},cleanup=False)
        if not cid:raise RuntimeError('Category creation failed')
        manifest['categories'].append({'id':cid,'name_fr':fr,'name_ar':ar});save()
    local,domain=mailbox.rsplit('@',1)
    for index,name in enumerate(['Démo FroidPro','Démo ClimAir']):
        email=f'{local}+intechscreen{q.TAG.lower()}{index}@{domain}';password=uuid.uuid4().hex
        aid,item=q.create('/admin/admins',{'first_name':'Demo','last_name':'FroidPro' if index==0 else 'ClimAir','email':email,'password':password,'role':'brand_owner'},cleanup=False)
        if not aid:raise RuntimeError('Vendor creation failed')
        manifest['vendor_admin_ids'].append(aid);save()
        p,row=q.check('Vendor login to set brand identity','POST','/admin/login',{'email':email,'password':password},auth=False);require(row)
        owner_token=p['token'];tokens.append(owner_token)
        p,row=q.check('Locate created vendor brand','GET','/admin/shop/brands');require(row)
        brand=next(x for x in q.rows(p) if x.get('owner_user_id')==aid);bid=brand['id']
        manifest['brands'].append({'id':bid,'name':name,'owner_admin_id':aid});save()
        q.TOKEN=owner_token
        _,row=q.check('Set demo brand identity','POST',f'/admin/shop/brands/{bid}',{'name':name,'description':'Marque de démonstration pour tester les écrans Intech.','address':'Alger - données de démonstration'});require(row)
        q.TOKEN=super_token
        _,row=q.check('Activate and verify demo brand','POST',f'/admin/shop/brands/{bid}',{'is_active':True,'is_verified':True});require(row)
        p,row=q.check('Verify brand saved','GET',f'/admin/shop/brands/{bid}',validate=lambda p,n=name:None if q.entity(p).get('name')==n and q.entity(p).get('is_active') and q.entity(p).get('is_verified') else 'Brand identity or active state missing');require(row)
    products=[
      ('Compresseur réfrigérateur 1/4 HP',18500,8,0,0,'Compresseur de démonstration pour réfrigérateur domestique.'),
      ('Thermostat universel réfrigérateur',2200,25,0,0,'Thermostat réglable - exemple de petite pièce détachée.'),
      ('Ventilateur condenseur 25 W',4800,0,0,0,'Produit volontairement en rupture de stock pour tester cet état.'),
      ('Télécommande climatiseur universelle',1500,40,1,1,'Télécommande de démonstration avec fonctions de base.'),
      ('Support mural climatiseur',3500,12,1,1,'Paire de supports métalliques - données de démonstration.'),
      ('Coffret tournevis 12 pièces',2900,18,2,1,'Coffret de démonstration pour interventions et maintenance.'),
    ]
    for i,(name,price,stock,cat,brand,description) in enumerate(products):
        body={'name':'Démo - '+name,'reference':f'SCREEN-{q.TAG}-{i+1:02}','description':description,'price':price,'stock':stock,'shop_category_id':manifest['categories'][cat]['id'],'shop_brand_id':manifest['brands'][brand]['id'],'is_active':True}
        pid,item=q.create('/admin/shop/products',body,cleanup=False)
        if not pid:raise RuntimeError('Product creation failed')
        manifest['products'].append({'id':pid,**body});save()
        p,row=q.check('Verify persistent demo product','GET',f'/admin/shop/products/{pid}',validate=lambda p,b=body:None if all(str(q.entity(p).get(k))==str(b[k]) for k in ['name','stock','shop_category_id','shop_brand_id']) and float(q.entity(p)['price'])==b['price'] and q.entity(p).get('is_active') else 'Product fields not persisted');require(row)
    manifest['status']='complete';save()
    lines=['# Intech screen demo data','', 'These records are intentionally retained on the test server. Categories and products are active; brands are active and verified. Images have not been attached.','', '| Product ID | Name | Price (DA) | Stock | Category ID | Brand ID |','|---|---|---|---|---|---|']
    for p in manifest['products']:lines.append(f"| {p['id']} | {p['name']} | {p['price']} | {p['stock']} | {p['shop_category_id']} | {p['shop_brand_id']} |")
    lines+=['','## Categories','']+[f"- {c['id']}: {c['name_fr']}" for c in manifest['categories']]
    lines+=['','## Brands','']+[f"- {b['id']}: {b['name']} (vendor admin {b['owner_admin_id']})" for b in manifest['brands']]
    lines+=['','One product intentionally has zero stock. No checkout or order was created. Vendor passwords were generated only in memory; invitation emails allow their owner to set a password if needed.','', 'Refresh the app screen to load these records. They were verified through admin API reads; mobile-screen rendering has not been inspected.']
    (q.QA/'SCREEN_DEMO.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
except Exception as e:
    manifest['status']='partial';manifest['error']=str(e);save();print('STOPPED',str(e),flush=True)
finally:
    for token in tokens+([super_token] if super_token else []):
        q.TOKEN=token
        try:q.check('Logout seed session','POST','/admin/logout',{})
        except Exception:pass
    for f in q.FIXTURES:f['state']='retained intentionally for screen testing'
    q.save()
    print(json.dumps({'status':manifest.get('status'),'category_ids':[c['id'] for c in manifest['categories']],'brands':manifest['brands'],'product_ids':[p['id'] for p in manifest['products']],'manifest':str(out)},ensure_ascii=True))

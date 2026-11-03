import importlib.util,json,sys,uuid
from pathlib import Path
spec=importlib.util.spec_from_file_location('campaign',r'C:\Users\HP\Desktop\Islem\qa\scripts\campaign.py')
q=importlib.util.module_from_spec(spec);spec.loader.exec_module(q)
out=q.QA/'brandt-example.json'
m={'purpose':'Retained screenshot-based backend example; text only, no image uploads','created':q.RUN,'categories':[],'products':[],'notes':['Price chosen from product-detail screenshot: 120000 DA. Brand-list screenshot instead shows 12000 DA.','The repeated Climatiseurs tiles were represented by one category, not duplicate categories.','Two identical refrigerator listings reproduce the two example cards; both use the product-detail price.']}
super_token=None;owner_token=None
def save():out.write_text(json.dumps(m,ensure_ascii=False,indent=2),encoding='utf-8')
def must(row):
    if row['verdict']!='PASS':raise RuntimeError(row['id']+' '+str(row['problem']))
try:
    credentials=json.loads(sys.stdin.read());mailbox=credentials.pop('invitation_email')
    p,r=q.check('Login to create screenshot example','POST','/admin/login',credentials,auth=False);credentials.clear();must(r)
    super_token=p['token'];q.TOKEN=super_token
    existing,r=q.check('Read categories before seeding','GET','/admin/shop/categories');must(r)
    for fr,ar in [('Réfrigérateur','ثلاجة'),('Climatiseurs','مكيفات الهواء')]:
        item=next((c for c in q.rows(existing) if c.get('name_fr')==fr),None)
        if item:cid=item['id']
        else:
            cid,item=q.create('/admin/shop/categories',{'name_fr':fr,'name_ar':ar,'is_active':True},cleanup=False)
            if not cid:raise RuntimeError('Category creation failed')
        m['categories'].append({'id':cid,'name_fr':fr});save()
    local,domain=mailbox.rsplit('@',1);email=f'{local}+intechbrandt{q.TAG.lower()}@{domain}';password=uuid.uuid4().hex
    aid,item=q.create('/admin/admins',{'first_name':'Brandt','last_name':'Exemple','email':email,'password':password,'role':'brand_owner'},cleanup=False)
    if not aid:raise RuntimeError('Brand owner creation failed')
    m['vendor_admin_id']=aid;save()
    p,r=q.check('Login brand owner','POST','/admin/login',{'email':email,'password':password},auth=False);must(r);owner_token=p['token']
    p,r=q.check('Find newly created brand','GET','/admin/shop/brands');must(r)
    bid=next(b['id'] for b in q.rows(p) if b.get('owner_user_id')==aid)
    m['brand']={'id':bid,'name':'Brandt Algérie Officiel','description':"Brandt est une des deux marques généralistes - avec De Dietrich - du Groupe Brandt. Brandt déploie de larges gammes de produits dans tout l’univers d’électroménager : Lavage, Cuisson, Froid, Petit Electroménager, Télévision et Climatisation.",'address':'123 Main Street, Algiers Center, Algeria'};save()
    q.TOKEN=owner_token
    _,r=q.check('Set screenshot brand details','POST',f'/admin/shop/brands/{bid}',{k:v for k,v in m['brand'].items() if k!='id'});must(r)
    q.TOKEN=super_token
    _,r=q.check('Set active verified brand','POST',f'/admin/shop/brands/{bid}',{'is_active':True,'is_verified':True});must(r)
    _,r=q.check('Verify brand details persisted','GET',f'/admin/shop/brands/{bid}',validate=lambda p:None if all(q.entity(p).get(k)==v for k,v in m['brand'].items()) and q.entity(p).get('is_verified') else 'Brand details mismatch');must(r)
    for i in range(2):
        body={'name':'Réfrigérateur Brandt 24L Solo','price':120000,'reference':'WW90CGC04DAE 9kg','description':'Réfrigérateur congélateur à double porte','stock':10,'shop_category_id':m['categories'][0]['id'],'shop_brand_id':bid,'is_active':True}
        pid,item=q.create('/admin/shop/products',body,cleanup=False)
        if not pid:raise RuntimeError('Product creation failed')
        m['products'].append({'id':pid,**body});save()
        _,r=q.check('Verify screenshot product details','GET',f'/admin/shop/products/{pid}',validate=lambda p,b=body:None if all(q.entity(p).get(k)==b[k] for k in ['name','reference','description','shop_category_id','shop_brand_id']) and float(q.entity(p)['price'])==120000 else 'Product details mismatch');must(r)
    m['status']='complete';save()
    content='# Brandt screenshot example\n\nRetained on the Intech test server. No images were generated or uploaded by this backend seed.\n\n'
    content+=f"Brand **{m['brand']['name']}**, ID **{bid}**, active and verified.\n\nAddress: {m['brand']['address']}\n\n{m['brand']['description']}\n\n"
    content+='| Product ID | Name | Price (DA) | Reference | Category |\n|---|---|---|---|---|\n'
    for p in m['products']:content+=f"| {p['id']} | {p['name']} | {p['price']} | {p['reference']} | Réfrigérateur |\n"
    content+='\nDescription: Réfrigérateur congélateur à double porte.\n\nCategories: '+', '.join(f"{c['name_fr']} (ID {c['id']})" for c in m['categories'])+'.\n\n'+ '\n'.join('- '+n for n in m['notes'])+'\n\nNo separate featured-product, banner or image-gallery field is documented in the supplied API. App formatting and presentation still determine the rendered layout. Vendor admin '+str(aid)+' is retained to own this brand.\n'
    (q.QA/'BRANDT_EXAMPLE.md').write_text(content,encoding='utf-8')
except Exception as e:
    m['status']='partial';m['error']=str(e);save();print('STOPPED',str(e))
finally:
    for token in [owner_token,super_token]:
        if token:
            q.TOKEN=token
            try:q.check('Logout seed session','POST','/admin/logout',{})
            except Exception:pass
    for f in q.FIXTURES:f['state']='retained for screenshot example'
    q.save()
    print(json.dumps({'status':m.get('status'),'brand_id':m.get('brand',{}).get('id'),'product_ids':[p['id'] for p in m['products']],'saved':str(out)}))

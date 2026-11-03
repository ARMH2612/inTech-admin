import struct,pathlib,json,re
p=pathlib.Path(__file__).parent/'static'
b=(p/'assets/index.android.bundle').read_bytes()
fields=['fileLength','globalCodeIndex','functionCount','stringKindCount','identifierCount','stringCount','overflowStringCount','stringStorageSize','bigIntCount','bigIntStorageSize','regExpCount','regExpStorageSize','arrayBufferSize','objKeyBufferSize','objValueBufferSize','segmentID','cjsModuleCount','functionSourceCount','debugInfoOffset']
h=dict(zip(fields,struct.unpack_from('<19I',b,32)))
print(h)
assert h['fileLength']==len(b)
start=128+h['functionCount']*16+h['stringKindCount']*4+h['identifierCount']*4
ov=start+h['stringCount']*4
storage=ov+h['overflowStringCount']*8
strings=[]
for i in range(h['stringCount']):
    x=struct.unpack_from('<I',b,start+i*4)[0]; utf=x&1; off=(x>>1)&0x7fffff; length=x>>24
    if length==255: off,length=struct.unpack_from('<II',b,ov+off*8)
    assert off+length*(1+utf)<=h['stringStorageSize']
    s=b[storage+off:storage+off+length*(1+utf)].decode('utf-16le' if utf else 'utf-8',errors='replace')
    strings.append(s)
(p/'strings.json').write_text(json.dumps(strings,ensure_ascii=False,indent=2),encoding='utf-8')
(p/'strings-indexed.txt').write_text('\n'.join(f'{i}: {s}' for i,s in enumerate(strings)),encoding='utf-8')
print('Decoded',len(strings),'strings')
print('\n'.join(s for s in strings if s.startswith(('http://141','https://intech','/auth/','/api/'))))

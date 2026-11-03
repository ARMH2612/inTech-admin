import subprocess, pathlib, sys, json, xml.etree.ElementTree as ET
ROOT=pathlib.Path(__file__).parent
ADB=r'C:\Users\HP\AppData\Local\Android\Sdk\platform-tools\adb.exe'
def adb(*args):
    return subprocess.run([ADB,'-s','emulator-5554',*args],capture_output=True)
def capture(name):
    adb('shell','uiautomator','dump','/sdcard/audit-window.xml')
    data=adb('shell','cat','/sdcard/audit-window.xml').stdout
    (ROOT/'evidence'/f'{name}.xml').write_bytes(data)
    (ROOT/'evidence'/f'{name}.png').write_bytes(adb('exec-out','screencap','-p').stdout)
    try:
        root=ET.fromstring(data)
        for n in root.iter('node'):
            a=n.attrib
            if a.get('text') or a.get('content-desc') or a.get('clickable')=='true':
                if a.get('clickable')=='true' or a.get('text'):
                    print(json.dumps({'label':a.get('text') or a.get('content-desc') or '(unlabelled)','tap':a.get('clickable')=='true','bounds':a.get('bounds')},ensure_ascii=True))
    except Exception: print(data.decode(errors='replace')[:1000])
if __name__=='__main__': capture(sys.argv[1])

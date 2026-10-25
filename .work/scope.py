from pathlib import Path
p=Path('src/app/globals.css');s=p.read_text(encoding='utf-8');i=s.index('/* Shared public-site scale.');base=s[:i];extra=s[i:].replace(':root{','&{').replace('\nbody{','\n&{');p.write_text(base+'.company-site {\n'+extra+'\n}\n',encoding='utf-8')
p=Path('src/app/(public)/layout.tsx');s=p.read_text(encoding='utf-8').replace('import { Consent } from "@/components/consent";\n','').replace('return <><a className=', 'return <div className="company-site"><a className=').replace('/></>;','/></div>;');p.write_text(s,encoding='utf-8')

from functools import partialmethod
from pathlib import Path
Path.read_text = partialmethod(Path.read_text, encoding='utf-8')
Path.write_text = partialmethod(Path.write_text, encoding='utf-8')
p=Path('src/components/admin/dashboard.tsx');s=p.read_text(encoding='utf-8-sig');p.write_text(s)
# Keep the existing settings shape so its editor is untouched.
p=Path('src/lib/catalog.ts');s=p.read_text().replace('import { defaultEditorial } from "./editorial";\n','').replace('editorial: defaultEditorial, heroPrimary: "Discuss your IAM project", heroSecondary: "Explore our expertise",\n  ','');p.write_text(s)
p=Path('src/lib/validation.ts');s=p.read_text().replace('import { editorialSchema, defaultEditorial } from "./editorial";\n','');a=s.index('  editorial:');b=s.index('  name:',a);s=s[:a]+s[b:];p.write_text(s)

from pathlib import Path
p=Path('src/components/header.tsx');s=p.read_text(encoding='utf-8').replace('<Link ', '<Link prefetch={false} ');p.write_text(s,encoding='utf-8')
p=Path('src/app/(public)/[...slug]/page.tsx');s=p.read_text(encoding='utf-8').replace('const title = content?.title.replace', 'const title = (content?.group === "technologies" ? `${content.title} consulting & integration` : content?.title)?.replace');p.write_text(s,encoding='utf-8')

from pathlib import Path
p=Path('scripts/smoke.mjs');s=p.read_text(encoding='utf-8').replace('text.includes("Identity is our expertise.")','text.includes("Discuss your IAM project")');p.write_text(s,encoding='utf-8')

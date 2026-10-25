import subprocess
from pathlib import Path
Path('src/components/admin/dashboard.tsx').write_bytes(subprocess.check_output(['git','show','HEAD:src/components/admin/dashboard.tsx']))
Path('.work/original-catalog.ts').write_bytes(subprocess.check_output(['git','show','HEAD:src/lib/catalog.ts']))

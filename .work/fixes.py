from pathlib import Path
p=Path('src/components/contact-form.tsx');s=p.read_text(encoding='utf-8').replace('useRef, useState','useEffect, useRef, useState');s=s.replace('services, context = "" }: { services: string[]; context?: string }','services }: { services: string[] }');s=s.replace('const { register, handleSubmit, formState:', 'const { register, handleSubmit, setValue, formState:');s=s.replace('service: services.includes(context) ? context : "", message: context && !services.includes(context) ? `Platform / engagement: ${context}\\n\\n` : "", company:', 'service: "", message: "", company:');s=s.replace('  async function submit', '''  useEffect(() => {
    const context = (new URLSearchParams(window.location.search).get("context") || "").slice(0, 100);
    if (services.includes(context)) setValue("service", context);
    else if (context) setValue("message", `Platform / engagement: ${context}\\n\\n`);
  }, [services, setValue]);
  async function submit''');p.write_text(s,encoding='utf-8')
p=Path('src/app/(public)/[...slug]/page.tsx');s=p.read_text(encoding='utf-8').replace('; searchParams: Promise<{ context?: string }>','').replace('ContentRoute({ params, searchParams }: Props)','ContentRoute({ params }: Props)').replace(' context={((await searchParams).context || "").slice(0, 100)}','');p.write_text(s,encoding='utf-8')
p=Path('src/app/(public)/layout.tsx');s=p.read_text(encoding='utf-8').replace('default: `${settings.name} | Identity & Access Management Engineering`','default: "Identity & Access Management Engineering"');p.write_text(s,encoding='utf-8')
p=Path('src/lib/content.ts');s=p.read_text(encoding='utf-8');s='import { platformDetail } from "./platform-details";\n'+s;s=s.replace('  return settingsSchema.parse(row.data);','''  const settings = settingsSchema.parse(row.data);
  // Upgrade untouched starter copy while preserving owner-authored settings.
  if (settings.heroTitle === "Identity is our expertise.\\nSecurity is our foundation.") settings.heroTitle = defaultSettings.heroTitle;
  if (settings.heroDescription === "We architect, engineer, integrate and manage enterprise identity solutions that enable secure, seamless and scalable access across your digital ecosystem.") settings.heroDescription = defaultSettings.heroDescription;
  return settings;''');s=s.replace('    if (row.published) entries.set(row.slug, row.data as unknown as ContentPage);','''    if (row.published) {
      const stored = row.data as unknown as ContentPage;
      const fallback = entries.get(row.slug);
      let content = { ...fallback, ...stored };
      const starterDescription = `Architecture, implementation and hands-on integration for ${stored.title}. Plan a supportable platform, engineer the required extensions and take changes through a controlled production rollout.`;
      if (stored.group === "technologies" && stored.description === starterDescription) content = platformDetail(content);
      if (fallback?.scope && stored.group === "services") {
        if (stored.outcomes?.[0] === "A documented architecture and clear ownership of identity controls.") content.outcomes = fallback.outcomes;
        if (stored.faqs?.[0]?.q === "Can you work with our existing identity platform?") content.faqs = fallback.faqs;
      }
      entries.set(row.slug, content);
    }''');p.write_text(s,encoding='utf-8')

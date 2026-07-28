import { SITE } from '@/constants/site';

export function buildWhatsAppLink(heading: string, fields: Record<string, string | undefined>) {
  const lines = [heading, ''];
  for (const [label, value] of Object.entries(fields)) {
    if (value) lines.push(`${label}: ${value}`);
  }
  return `${SITE.whatsappHref}?text=${encodeURIComponent(lines.join('\n'))}`;
}

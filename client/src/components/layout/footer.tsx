import type { SVGProps } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone } from 'lucide-react';
import { SITE, FOOTER_LINKS } from '@/constants/site';

function YoutubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.56A3.02 3.02 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3.02 3.02 0 0 0 2.12 2.14C4.5 20.5 12 20.5 12 20.5s7.5 0 9.38-.56a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.4 3.6-6.4 3.6Z" />
    </svg>
  );
}

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.6" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="section-container grid grid-cols-1 gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <img src="/brand/logo-horizontal-light.svg" alt="Target Classes" className="h-16 w-auto max-w-[15rem] dark:hidden" />
          <img src="/brand/logo-horizontal-dark.svg" alt="Target Classes" className="hidden h-16 w-auto max-w-[15rem] dark:block" />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Established {SITE.established}, {SITE.name} has been guiding young learners in Lar Town, Deoria
            with dedicated faculty and a premium learning environment.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <a
              href={SITE.youtube}
              target="_blank"
              rel="noreferrer"
              className="inline-flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground transition-colors hover:bg-gold hover:text-gold-foreground"
              aria-label="Target Classes on YouTube"
            >
              <YoutubeIcon className="size-5" />
            </a>
            <a
              href={SITE.instagram}
              target="_blank"
              rel="noreferrer"
              className="inline-flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground transition-colors hover:bg-gold hover:text-gold-foreground"
              aria-label="Target Classes on Instagram"
            >
              <InstagramIcon className="size-5" />
            </a>
          </div>
        </div>

        <FooterColumn title="Institute" links={FOOTER_LINKS.institute} />
        <FooterColumn title="Resources" links={FOOTER_LINKS.resources} />

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wide text-foreground/80">Get in Touch</h4>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold" />
              <span>{SITE.address}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="size-4 shrink-0 text-gold" />
              <a href={SITE.phoneHref} className="hover:text-foreground">{SITE.phone}</a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="size-4 shrink-0 text-gold" />
              <a href={`mailto:${SITE.email}`} className="hover:text-foreground">{SITE.email}</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="section-container flex flex-col items-center justify-between gap-3 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>&copy; {year} {SITE.name}. All rights reserved.</p>
          <div className="flex gap-5">
            {FOOTER_LINKS.legal.map((l) => (
              <Link key={l.href} to={l.href} className="hover:text-foreground">{l.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: ReadonlyArray<{ label: string; href: string }> }) {
  return (
    <div>
      <h4 className="font-display text-sm font-semibold uppercase tracking-wide text-foreground/80">{title}</h4>
      <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
        {links.map((l) => (
          <li key={l.href}>
            <Link to={l.href} className="transition-colors hover:text-foreground">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

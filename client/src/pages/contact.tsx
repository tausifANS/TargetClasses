import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Send, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { PageHero } from '@/components/layout/page-hero';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SITE } from '@/constants/site';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { api } from '@/lib/api';

const contactSchema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit phone number'),
  email: z.union([z.string().email('Enter a valid email'), z.literal('')]).optional(),
  message: z.string().min(5, 'Please enter your message'),
});

type ContactForm = z.infer<typeof contactSchema>;

const contactDetails = [
  { icon: MapPin, label: 'Address', value: SITE.address },
  { icon: Phone, label: 'Phone', value: SITE.phone, href: SITE.phoneHref },
  { icon: Mail, label: 'Email', value: SITE.email, href: `mailto:${SITE.email}` },
  { icon: Clock, label: 'Office Hours', value: 'Monday – Saturday' },
];

export function ContactPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', phone: '', email: '', message: '' },
  });

  const { mutateAsync } = useMutation({
    mutationFn: (data: ContactForm) => api.post('/inquiries/contact', data),
  });

  const onSubmit = async (data: ContactForm) => {
    await mutateAsync(data).catch(() => {});

    const link = buildWhatsAppLink('New Contact Message — Target Classes', {
      Name: data.name,
      Phone: data.phone,
      Email: data.email,
      Message: data.message,
    });
    window.open(link, '_blank', 'noopener,noreferrer');
    toast.success('Opening WhatsApp to send your message', {
      description: 'Just hit send in WhatsApp and we\'ll get back to you soon.',
    });
    reset();
  };

  return (
    <>
      <title>Contact Us | Target Classes</title>
      <meta name="description" content="Get in touch with Target Classes, Lar Town, Deoria — phone, email, and address." />
      <PageHero eyebrow="We'd Love to Hear From You" title="Contact Us" description="Questions about admissions, courses, or anything else? Reach out and we'll respond promptly." />

      <section className="section-container py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-8">
            {contactDetails.map((c) => (
              <div key={c.label} className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <c.icon className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{c.label}</p>
                  {c.href ? (
                    <a href={c.href} className="font-display font-semibold hover:text-gold">{c.value}</a>
                  ) : (
                    <p className="font-display font-semibold">{c.value}</p>
                  )}
                </div>
              </div>
            ))}

            <div className="overflow-hidden rounded-2xl border border-border">
              <iframe
                title="Target Classes location"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(SITE.mapEmbedQuery)}&output=embed`}
                className="h-64 w-full"
                loading="lazy"
              />
            </div>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5 rounded-3xl border border-border bg-card p-6 sm:p-8"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Your Name</Label>
                <Input id="name" placeholder="Full name" {...register('name')} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="10-digit mobile number" {...register('phone')} />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email (optional)</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" rows={5} placeholder="How can we help?" {...register('message')} />
              {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
            </div>

            <Button type="submit" variant="gold" size="lg" className="w-full" disabled={isSubmitting}>
              <Send className="size-4" /> Send via WhatsApp
            </Button>
          </motion.form>
        </div>
      </section>
    </>
  );
}

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Briefcase, Send, Heart, Users, TrendingUp } from 'lucide-react';
import { PageHero } from '@/components/layout/page-hero';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { api } from '@/lib/api';

const reasons = [
  { icon: Heart, title: 'Meaningful Work', description: 'Shape the earliest, most formative years of a child\'s education.' },
  { icon: Users, title: 'Small, Close-Knit Team', description: 'Work alongside a small faculty team that genuinely supports each other.' },
  { icon: TrendingUp, title: 'Room to Grow', description: 'As Target Classes grows, so do the opportunities within it.' },
];

const careerSchema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit phone number'),
  email: z.union([z.string().email('Enter a valid email'), z.literal('')]).optional(),
  message: z.string().min(5, 'Tell us a bit about your experience and interest'),
});

type CareerForm = z.infer<typeof careerSchema>;

export function CareersPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CareerForm>({ resolver: zodResolver(careerSchema), defaultValues: { name: '', phone: '', email: '', message: '' } });

  const { mutateAsync } = useMutation({
    mutationFn: (data: CareerForm) => api.post('/inquiries/careers', data),
  });

  const onSubmit = async (data: CareerForm) => {
    await mutateAsync(data).catch(() => {});

    const link = buildWhatsAppLink('New Career Inquiry — Target Classes', {
      Name: data.name,
      Phone: data.phone,
      Email: data.email,
      Message: data.message,
    });
    window.open(link, '_blank', 'noopener,noreferrer');
    toast.success('Opening WhatsApp to send your details', { description: "We'll reach out if there's a fit." });
    reset();
  };

  return (
    <>
      <title>Careers | Target Classes</title>
      <meta name="description" content="Join the Target Classes team in Lar Town, Deoria." />
      <PageHero eyebrow="Join Our Team" title="Careers at Target Classes" description="We're always glad to hear from passionate educators who want to make a difference in young learners' lives." />

      <section className="section-container py-24">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {reasons.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl border border-border bg-card p-7 text-center"
            >
              <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <r.icon className="size-6" />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold">{r.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-xl rounded-3xl border border-border bg-secondary/40 p-8 sm:p-10">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-gold/15 text-gold">
              <Briefcase className="size-7" />
            </div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">No Open Positions Right Now</h2>
            <p className="text-muted-foreground">
              We don't have specific openings listed at the moment, but we're always happy to hear from dedicated
              educators. Share your details and we'll reach out when a suitable role opens up.
            </p>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4 }}
            onSubmit={handleSubmit(onSubmit)}
            className="mt-8 space-y-5"
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
              <Label htmlFor="message">Tell us about yourself</Label>
              <Textarea id="message" rows={4} placeholder="Subject expertise, experience, and what interests you about Target Classes" {...register('message')} />
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

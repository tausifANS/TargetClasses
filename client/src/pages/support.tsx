import { Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Send, ArrowRight, LifeBuoy, HelpCircle } from 'lucide-react';
import { PageHero } from '@/components/layout/page-hero';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { api } from '@/lib/api';

const topics = ['Admissions', 'Fees', 'Academics', 'Technical / Portal', 'Other'] as const;

const supportSchema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit phone number'),
  topic: z.enum(topics, { message: 'Please select a topic' }),
  message: z.string().min(5, 'Please describe your issue'),
});

type SupportForm = z.infer<typeof supportSchema>;

export function SupportPage() {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupportForm>({ resolver: zodResolver(supportSchema), defaultValues: { name: '', phone: '', message: '' } });

  const { mutateAsync } = useMutation({
    mutationFn: (data: SupportForm) => api.post('/inquiries/support', data),
  });

  const onSubmit = async (data: SupportForm) => {
    await mutateAsync(data).catch(() => {});

    const link = buildWhatsAppLink('New Support Request — Target Classes', {
      Name: data.name,
      Phone: data.phone,
      Topic: data.topic,
      Message: data.message,
    });
    window.open(link, '_blank', 'noopener,noreferrer');
    toast.success('Opening WhatsApp to send your request', { description: "We'll get back to you as soon as we can." });
    reset();
  };

  return (
    <>
      <title>Support | Target Classes</title>
      <meta name="description" content="Get help with admissions, fees, academics, or the Target Classes portal." />
      <PageHero eyebrow="We're Here to Help" title="Support" description="Have a question or an issue? Send us a message and our team will assist you." />

      <section className="section-container py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <LifeBuoy className="size-6" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-bold">Quick Answers First</h2>
            <p className="mt-3 text-muted-foreground">
              Many common questions about admissions, fees, and academics are already answered on our FAQ page.
            </p>
            <Button asChild variant="outline" className="mt-5">
              <Link to="/faqs">
                <HelpCircle className="size-4" /> Browse FAQs <ArrowRight className="size-4" />
              </Link>
            </Button>
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
              <Label htmlFor="topic">Topic</Label>
              <Controller
                control={control}
                name="topic"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="topic" className="w-full">
                      <SelectValue placeholder="What's this about?" />
                    </SelectTrigger>
                    <SelectContent>
                      {topics.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.topic && <p className="text-xs text-destructive">{errors.topic.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="message">How can we help?</Label>
              <Textarea id="message" rows={5} placeholder="Describe your question or issue" {...register('message')} />
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

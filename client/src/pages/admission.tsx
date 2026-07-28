import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Send, Phone, CheckCircle2 } from 'lucide-react';
import { PageHero } from '@/components/layout/page-hero';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CLASSES, SITE } from '@/constants/site';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { api } from '@/lib/api';

const admissionSchema = z.object({
  studentName: z.string().min(2, 'Please enter the student\'s full name'),
  dob: z.string().min(1, 'Please enter date of birth'),
  applyingFor: z.enum(CLASSES, { message: 'Please select a class' }),
  parentName: z.string().min(2, 'Please enter parent/guardian name'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit phone number'),
  email: z.union([z.string().email('Enter a valid email'), z.literal('')]).optional(),
  address: z.string().min(5, 'Please enter your address'),
  message: z.string().optional(),
});

type AdmissionForm = z.infer<typeof admissionSchema>;

const steps = [
  'Fill out the admission form below',
  'Our team reviews your application',
  "We'll reach out to confirm the seat and next steps",
];

export function AdmissionPage() {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdmissionForm>({
    resolver: zodResolver(admissionSchema),
    defaultValues: { studentName: '', dob: '', parentName: '', phone: '', email: '', address: '', message: '' },
  });

  const { mutateAsync } = useMutation({
    mutationFn: (data: AdmissionForm) => api.post('/inquiries/admissions', data),
  });

  const onSubmit = async (data: AdmissionForm) => {
    // Save to the admissions sheet so the institute has a permanent record — but
    // never let a save failure (e.g. Sheets not configured yet) block WhatsApp,
    // which is the one channel guaranteed to reach them right now.
    await mutateAsync(data).catch(() => {});

    const link = buildWhatsAppLink('New Admission Inquiry — Target Classes', {
      'Student Name': data.studentName,
      'Date of Birth': data.dob,
      'Applying For': data.applyingFor,
      'Parent/Guardian': data.parentName,
      Phone: data.phone,
      Email: data.email,
      Address: data.address,
      Message: data.message,
    });
    window.open(link, '_blank', 'noopener,noreferrer');
    toast.success('Opening WhatsApp to send your application', {
      description: 'Just hit send in WhatsApp and our admissions team will get back to you shortly.',
    });
    reset();
  };

  return (
    <>
      <title>Admission | Target Classes</title>
      <meta name="description" content="Apply for admission at Target Classes — Nursery, LKG, and UKG programs in Lar Town, Deoria." />
      <PageHero
        eyebrow="Admissions Open"
        title="Apply for Admission"
        description="Give your child a strong start. Fill out the form below and our team will reach out to guide you through enrollment."
      />

      <section className="section-container py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <span className="text-sm font-semibold uppercase tracking-widest text-gold">How It Works</span>
            <h2 className="mt-3 font-display text-2xl font-bold sm:text-3xl">Three Simple Steps</h2>

            <ol className="mt-8 space-y-6">
              {steps.map((s, i) => (
                <li key={s} className="flex items-start gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-bold text-primary">
                    {i + 1}
                  </span>
                  <p className="pt-1 text-sm text-muted-foreground">{s}</p>
                </li>
              ))}
            </ol>

            <div className="mt-10 rounded-2xl border border-border bg-secondary/40 p-6">
              <div className="flex items-center gap-2.5 font-display font-semibold">
                <Phone className="size-4 text-gold" /> Prefer to talk directly?
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Call or WhatsApp us at{' '}
                <a href={SITE.phoneHref} className="font-medium text-foreground hover:text-gold">{SITE.phone}</a>
              </p>
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
                <Label htmlFor="studentName">Student's Full Name</Label>
                <Input id="studentName" placeholder="e.g. Aarav Sharma" {...register('studentName')} />
                {errors.studentName && <p className="text-xs text-destructive">{errors.studentName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" type="date" {...register('dob')} />
                {errors.dob && <p className="text-xs text-destructive">{errors.dob.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="applyingFor">Applying For</Label>
              <Controller
                control={control}
                name="applyingFor"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="applyingFor" className="w-full">
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {CLASSES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.applyingFor && <p className="text-xs text-destructive">{errors.applyingFor.message}</p>}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="parentName">Parent/Guardian Name</Label>
                <Input id="parentName" placeholder="e.g. Rahul Sharma" {...register('parentName')} />
                {errors.parentName && <p className="text-xs text-destructive">{errors.parentName.message}</p>}
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
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" rows={2} placeholder="Your full address" {...register('address')} />
              {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="message">Anything else we should know? (optional)</Label>
              <Textarea id="message" rows={3} placeholder="Questions or notes for our admissions team" {...register('message')} />
            </div>

            <Button type="submit" variant="gold" size="lg" className="w-full" disabled={isSubmitting}>
              <Send className="size-4" /> Send Application via WhatsApp
            </Button>
            <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
              <CheckCircle2 className="size-3.5 text-gold" /> Your details are sent directly to our admissions team on WhatsApp.
            </p>
          </motion.form>
        </div>
      </section>
    </>
  );
}

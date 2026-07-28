import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { MessageSquareHeart, Send, Star, Quote } from 'lucide-react';
import { PageHero } from '@/components/layout/page-hero';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { api, apiErrorMessage } from '@/lib/api';
import { useTestimonials } from '@/hooks/use-content';

const testimonialSchema = z.object({
  parentName: z.string().min(2, 'Please enter your name'),
  studentName: z.string().optional(),
  message: z.string().min(10, 'Please share a bit more detail'),
  rating: z.number().min(1).max(5),
});

type TestimonialForm = z.infer<typeof testimonialSchema>;

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          className="p-0.5"
        >
          <Star className={cn('size-6 transition-colors', n <= value ? 'fill-gold text-gold' : 'text-muted-foreground')} />
        </button>
      ))}
    </div>
  );
}

export function TestimonialsPage() {
  const { data: testimonials, isLoading } = useTestimonials();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TestimonialForm>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: { parentName: '', studentName: '', message: '', rating: 5 },
  });

  const [submitted, setSubmitted] = useState(false);
  const { mutateAsync } = useMutation({
    mutationFn: (data: TestimonialForm) => api.post('/inquiries/testimonials', data),
  });

  const onSubmit = async (data: TestimonialForm) => {
    try {
      await mutateAsync(data);
      toast.success('Thank you for sharing!', { description: "We'll review it and publish it here soon." });
      setSubmitted(true);
      reset();
    } catch (err) {
      toast.error('Could not send feedback', { description: apiErrorMessage(err) });
    }
  };

  const hasTestimonials = (testimonials?.length ?? 0) > 0;

  return (
    <>
      <title>Testimonials | Target Classes</title>
      <meta name="description" content="What parents say about Target Classes." />
      <PageHero eyebrow="Parent Voices" title="Testimonials" description="Real feedback from the families we work with, gathered right here as our community grows." />

      <section className="section-container py-24">
        {hasTestimonials && (
          <div className="mb-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials!.map((t, i) => (
              <motion.div
                key={t.Id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-2xl border border-border bg-card p-7"
              >
                <Quote className="size-7 text-gold/50" />
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t.Message}</p>
                <div className="mt-5 flex items-center justify-between">
                  <div>
                    <p className="font-display text-sm font-semibold">{t.ParentName}</p>
                    {t.StudentName && <p className="text-xs text-muted-foreground">Parent of {t.StudentName}</p>}
                  </div>
                  {Number(t.Rating) > 0 && (
                    <div className="flex gap-0.5">
                      {Array.from({ length: Number(t.Rating) }).map((_, idx) => (
                        <Star key={idx} className="size-3.5 fill-gold text-gold" />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!hasTestimonials && !isLoading && (
          <div className="mx-auto mb-16 flex max-w-xl flex-col items-center gap-4 rounded-3xl border border-border bg-card p-10 text-center sm:p-14">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-gold/15 text-gold">
              <MessageSquareHeart className="size-7" />
            </div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Testimonials Coming Soon</h2>
            <p className="text-muted-foreground">
              We're collecting feedback from our parent community and will feature it here soon. Be the first to
              share yours below.
            </p>
          </div>
        )}

        <div className="mx-auto max-w-xl rounded-3xl border border-border bg-secondary/40 p-8 sm:p-10">
          <h2 className="text-center font-display text-xl font-bold sm:text-2xl">Share Your Experience</h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Are you a Target Classes parent? We'd love to hear from you — submitted feedback is reviewed before it
            appears on this page.
          </p>

          {submitted ? (
            <p className="mt-8 text-center text-sm font-medium text-gold">Thank you — your feedback has been received!</p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
              <div className="flex justify-center">
                <Controller
                  control={control}
                  name="rating"
                  render={({ field }) => <StarRating value={field.value} onChange={field.onChange} />}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="parentName">Your Name</Label>
                  <Input id="parentName" placeholder="Full name" {...register('parentName')} />
                  {errors.parentName && <p className="text-xs text-destructive">{errors.parentName.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="studentName">Student's Name (optional)</Label>
                  <Input id="studentName" placeholder="Your child's name" {...register('studentName')} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="message">Your Feedback</Label>
                <Textarea id="message" rows={4} placeholder="Tell us about your experience with Target Classes" {...register('message')} />
                {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
              </div>

              <Button type="submit" variant="gold" size="lg" className="w-full" disabled={isSubmitting}>
                <Send className="size-4" /> Submit Feedback
              </Button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}

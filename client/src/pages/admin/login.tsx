import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ShieldCheck, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiErrorMessage } from '@/lib/api';
import { useAdminLogin } from '@/hooks/use-admin';

const schema = z.object({
  username: z.string().min(1, 'Required'),
  password: z.string().min(1, 'Required'),
});
type Form = z.infer<typeof schema>;

export function AdminLoginPanel({ onSuccess }: { onSuccess: () => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', password: '' },
  });
  const { mutateAsync } = useAdminLogin();

  const onSubmit = async (data: Form) => {
    try {
      await mutateAsync(data);
      toast.success('Welcome back');
      onSuccess();
    } catch (err) {
      toast.error('Could not log in', { description: apiErrorMessage(err, 'Invalid credentials.') });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#16305C] to-[#060D1F] px-5">
      <title>Admin Login | Target Classes</title>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl sm:p-10"
      >
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gold/15 text-gold">
          <ShieldCheck className="size-7" />
        </div>
        <h1 className="mt-5 text-center font-display text-2xl font-bold text-white">Admin Portal</h1>
        <p className="mt-2 text-center text-sm text-white/60">Target Classes management dashboard</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-white/80">Username</Label>
            <Input id="username" className="border-white/15 bg-white/5 text-white" {...register('username')} />
            {errors.username && <p className="text-xs text-red-400">{errors.username.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-white/80">Password</Label>
            <Input id="password" type="password" className="border-white/15 bg-white/5 text-white" {...register('password')} />
            {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
          </div>
          <Button type="submit" variant="gold" size="lg" className="w-full" disabled={isSubmitting}>
            <LogIn className="size-4" /> Log In
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

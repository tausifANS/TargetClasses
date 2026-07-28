import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowLeft, LogOut, GraduationCap, User, Wallet, CalendarCheck, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { api, apiErrorMessage } from '@/lib/api';
import { useNotices } from '@/hooks/use-content';

interface StudentRecord {
  studentId: string;
  studentName: string;
  className: string;
  parentName: string;
  attendancePercent?: string | number;
  feeStatus?: string;
  status?: string;
}

const STORAGE_KEY = 'tc_student_portal_session';

const loginSchema = z.object({
  studentId: z.string().min(1, 'Please enter your Student ID'),
  dob: z.string().min(1, 'Please enter date of birth'),
});
type LoginForm = z.infer<typeof loginSchema>;

function PortalHeader({ onLogout }: { onLogout?: () => void }) {
  return (
    <div className="section-container flex items-center justify-between py-6">
      <Link to="/" className="flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-white">
        <ArrowLeft className="size-4" /> Back to website
      </Link>
      {onLogout && (
        <Button variant="glass" size="sm" onClick={onLogout}>
          <LogOut className="size-4" /> Log Out
        </Button>
      )}
    </div>
  );
}

function LoginCard({ onSuccess }: { onSuccess: (s: StudentRecord) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema), defaultValues: { studentId: '', dob: '' } });

  const { mutateAsync } = useMutation({
    mutationFn: (data: LoginForm) => api.post<{ data: StudentRecord }>('/portal/login', data),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await mutateAsync(data);
      onSuccess(res.data.data);
    } catch (err) {
      toast.error('Could not log in', { description: apiErrorMessage(err, 'No student found with that Student ID and date of birth.') });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl sm:p-10"
    >
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gold/15 text-gold">
        <GraduationCap className="size-7" />
      </div>
      <h1 className="mt-5 text-center font-display text-2xl font-bold text-white sm:text-3xl">Student Portal</h1>
      <p className="mt-2 text-center text-sm text-white/60">
        Log in with your Student ID and date of birth to view attendance, fee status, and notices.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="studentId" className="text-white/80">Student ID</Label>
          <Input id="studentId" placeholder="e.g. TC-2026-001" className="border-white/15 bg-white/5 text-white placeholder:text-white/40" {...register('studentId')} />
          {errors.studentId && <p className="text-xs text-red-400">{errors.studentId.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dob" className="text-white/80">Date of Birth</Label>
          <Input id="dob" type="date" className="border-white/15 bg-white/5 text-white [color-scheme:dark]" {...register('dob')} />
          {errors.dob && <p className="text-xs text-red-400">{errors.dob.message}</p>}
        </div>

        <Button type="submit" variant="gold" size="lg" className="w-full" disabled={isSubmitting}>
          Log In
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-white/50">
        Don't have your Student ID? Contact the institute directly and we'll help you out.
      </p>
    </motion.div>
  );
}

function Dashboard({ student }: { student: StudentRecord }) {
  const { data: notices } = useNotices();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto w-full max-w-3xl space-y-6"
    >
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gold/15 text-gold">
            <User className="size-7" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-white">{student.studentName}</h1>
            <p className="text-sm text-white/60">
              {student.className} &middot; Student ID {student.studentId} &middot; Parent: {student.parentName}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-2.5 text-white/70">
            <CalendarCheck className="size-5 text-gold" />
            <span className="text-sm font-medium">Attendance</span>
          </div>
          <p className="mt-3 font-display text-3xl font-bold text-white">
            {student.attendancePercent ? `${student.attendancePercent}%` : 'Not available yet'}
          </p>
          {student.attendancePercent && (
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gold" style={{ width: `${Math.min(Number(student.attendancePercent), 100)}%` }} />
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-2.5 text-white/70">
            <Wallet className="size-5 text-gold" />
            <span className="text-sm font-medium">Fee Status</span>
          </div>
          <p
            className={cn(
              'mt-3 inline-flex rounded-full px-3 py-1 font-display text-lg font-semibold',
              student.feeStatus?.toLowerCase().includes('due') ? 'bg-red-500/15 text-red-300' : 'bg-emerald-500/15 text-emerald-300'
            )}
          >
            {student.feeStatus || 'Not available yet'}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-2.5 text-white/70">
          <Megaphone className="size-5 text-gold" />
          <span className="text-sm font-medium">Notices</span>
        </div>
        {notices && notices.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {notices.map((n) => (
              <li key={n.Id} className="rounded-xl bg-white/5 p-4">
                <p className="font-display text-sm font-semibold text-white">{n.Title}</p>
                <p className="mt-1 text-xs text-white/60">{n.Body}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-white/50">No notices right now.</p>
        )}
      </div>
    </motion.div>
  );
}

export function StudentPortalPage() {
  const [student, setStudent] = useState<StudentRecord | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setStudent(JSON.parse(saved));
      } catch {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const handleLogin = (s: StudentRecord) => {
    setStudent(s);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    toast.success(`Welcome, ${s.studentName}!`);
  };

  const handleLogout = () => {
    setStudent(null);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#16305C] to-[#060D1F]">
      <title>Student Portal | Target Classes</title>
      <PortalHeader onLogout={student ? handleLogout : undefined} />
      <div className="section-container flex min-h-[80vh] items-center justify-center pb-16">
        {student ? <Dashboard student={student} /> : <LoginCard onSuccess={handleLogin} />}
      </div>
    </div>
  );
}

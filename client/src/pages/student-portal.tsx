import { useState, useMemo, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeft,
  LogOut,
  GraduationCap,
  User,
  Megaphone,
  Video,
  PlayCircle,
  Clock,
  LogIn as LogInIcon,
  CheckCircle2,
  FileText,
  BookOpen,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Camera,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { apiErrorMessage } from '@/lib/api';
import { COACHING_CLASSES } from '@/constants/site';
import { useNotices } from '@/hooks/use-content';
import {
  useIsStudentLoggedIn,
  usePortalLogin,
  usePortalLogout,
  usePortalMe,
  usePortalClasses,
  usePortalAttendance,
  usePunchIn,
  usePunchOut,
  usePortalApplication,
  usePortalQuestions,
  usePortalNotes,
  usePortalResults,
  usePortalForgotPassword,
  usePortalResetPassword,
} from '@/hooks/use-portal';

function PortalHeader({ onLogout }: { onLogout?: () => void }) {
  return (
    <header className="border-b border-border bg-card">
      <div className="section-container flex items-center justify-between py-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/">
            <ArrowLeft className="size-4" /> Back to website
          </Link>
        </Button>
        {onLogout && (
          <Button variant="outline" size="sm" onClick={onLogout}>
            <LogOut className="size-4" /> Log Out
          </Button>
        )}
      </div>
    </header>
  );
}

// ---- Login ----

const loginSchema = z.object({
  studentId: z.string().min(1, 'Please enter your Student ID'),
  password: z.string().min(1, 'Please enter your password'),
});
type LoginForm = z.infer<typeof loginSchema>;

function LoginForm({ onSuccess, onForgotPassword }: { onSuccess: () => void; onForgotPassword: () => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { studentId: '', password: '' },
  });
  const { mutateAsync } = usePortalLogin();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: LoginForm) => {
    try {
      await mutateAsync(data);
      toast.success('Welcome back!');
      onSuccess();
    } catch (err) {
      toast.error('Could not log in', { description: apiErrorMessage(err, 'Invalid Student ID or password.') });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="studentId">Student ID</Label>
        <Input id="studentId" placeholder="e.g. TC-2026-001" {...register('studentId')} />
        {errors.studentId && <p className="text-xs text-destructive">{errors.studentId.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input id="password" type={showPassword ? 'text' : 'password'} className="pr-10" {...register('password')} />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        <button type="button" onClick={onForgotPassword} className="text-xs text-gold hover:underline">
          Forgot password?
        </button>
      </div>
      <Button type="submit" variant="gold" size="lg" className="w-full" disabled={isSubmitting}>
        <LogInIcon className="size-4" /> Log In
      </Button>
    </form>
  );
}

// ---- Forgot / Reset password ----

const forgotPasswordSchema = z.object({
  studentId: z.string().min(1, 'Please enter your Student ID'),
});
type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { studentId: '' },
  });
  const { mutateAsync } = usePortalForgotPassword();
  const [sent, setSent] = useState(false);

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      await mutateAsync(data);
      setSent(true);
    } catch (err) {
      toast.error('Something went wrong', { description: apiErrorMessage(err) });
    }
  };

  if (sent) {
    return (
      <div className="space-y-5 text-center">
        <p className="text-sm text-muted-foreground">
          If that Student ID has an email on file, a password reset link has been sent to it. Check your inbox (and spam folder).
        </p>
        <Button variant="outline" className="w-full" onClick={onBack}>
          <ArrowLeft className="size-4" /> Back to Log In
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <p className="text-sm text-muted-foreground">Enter your Student ID and we'll email a reset link to the address on file.</p>
      <div className="space-y-1.5">
        <Label htmlFor="forgotStudentId">Student ID</Label>
        <Input id="forgotStudentId" placeholder="e.g. TC-2026-001" {...register('studentId')} />
        {errors.studentId && <p className="text-xs text-destructive">{errors.studentId.message}</p>}
      </div>
      <Button type="submit" variant="gold" size="lg" className="w-full" disabled={isSubmitting}>
        Send Reset Link
      </Button>
      <Button type="button" variant="ghost" className="w-full" onClick={onBack}>
        <ArrowLeft className="size-4" /> Back to Log In
      </Button>
    </form>
  );
}

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm({ token, onDone }: { token: string; onDone: () => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });
  const { mutateAsync } = usePortalResetPassword();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: ResetPasswordForm) => {
    try {
      await mutateAsync({ token, newPassword: data.newPassword });
      toast.success('Password reset', { description: 'You can now log in with your new password.' });
      onDone();
    } catch (err) {
      toast.error('Could not reset password', { description: apiErrorMessage(err, 'This reset link is invalid or has expired.') });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <p className="text-sm text-muted-foreground">Choose a new password for your Student Portal account.</p>
      <div className="space-y-1.5">
        <Label htmlFor="newPassword">New Password</Label>
        <div className="relative">
          <Input id="newPassword" type={showPassword ? 'text' : 'password'} className="pr-10" {...register('newPassword')} />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input id="confirmPassword" type={showPassword ? 'text' : 'password'} {...register('confirmPassword')} />
        {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
      </div>
      <Button type="submit" variant="gold" size="lg" className="w-full" disabled={isSubmitting}>
        Reset Password
      </Button>
    </form>
  );
}

// ---- Apply ----

const applySchema = z.object({
  studentName: z.string().min(2, "Please enter the student's full name"),
  dob: z.string().min(1, 'Please enter date of birth'),
  className: z.enum(COACHING_CLASSES, { message: 'Please select a class' }),
  subjects: z.string().optional(),
  parentName: z.string().min(2, 'Please enter parent/guardian name'),
  parentPhone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit phone number'),
  email: z.string().email('A valid email is required to receive your login details'),
  address: z.string().min(5, 'Please enter your address'),
});
type ApplyForm = z.infer<typeof applySchema>;

function ApplyForm() {
  const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ApplyForm>({
    resolver: zodResolver(applySchema),
    defaultValues: { studentName: '', dob: '', subjects: '', parentName: '', parentPhone: '', email: '', address: '' },
  });
  const { mutateAsync } = usePortalApplication();

  const onSubmit = async (data: ApplyForm) => {
    try {
      await mutateAsync(data);
      toast.success('Application submitted', { description: "We'll email your login details once it's approved." });
      reset();
    } catch (err) {
      toast.error('Could not submit application', { description: apiErrorMessage(err) });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="studentName">Student's Full Name</Label>
          <Input id="studentName" {...register('studentName')} />
          {errors.studentName && <p className="text-xs text-destructive">{errors.studentName.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dob">Date of Birth</Label>
          <Input id="dob" type="date" {...register('dob')} />
          {errors.dob && <p className="text-xs text-destructive">{errors.dob.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="className">Class</Label>
        <Controller
          control={control}
          name="className"
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger id="className" className="w-full">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {COACHING_CLASSES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.className && <p className="text-xs text-destructive">{errors.className.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="subjects">Subjects (optional)</Label>
        <Input id="subjects" placeholder="e.g. Physics, Chemistry, Maths" {...register('subjects')} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="parentName">Parent/Guardian Name</Label>
          <Input id="parentName" {...register('parentName')} />
          {errors.parentName && <p className="text-xs text-destructive">{errors.parentName.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="parentPhone">Phone Number</Label>
          <Input id="parentPhone" type="tel" {...register('parentPhone')} />
          {errors.parentPhone && <p className="text-xs text-destructive">{errors.parentPhone.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register('email')} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        <p className="text-xs text-muted-foreground">Your Student ID and password will be sent here once approved.</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="address">Address</Label>
        <Textarea id="address" rows={2} {...register('address')} />
        {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
      </div>

      <Button type="submit" variant="gold" size="lg" className="w-full" disabled={isSubmitting}>
        Submit Application
      </Button>
    </form>
  );
}

// ---- Dashboard ----

function formatDuration(ms: number): string {
  const totalMinutes = Math.max(0, Math.round(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

function PunchCard() {
  const { data: attendance } = usePortalAttendance(true);
  const punchIn = usePunchIn();
  const punchOut = usePunchOut();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const todayRecord = attendance?.find((r) => r.Date === today);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  }, []);

  const openCamera = async () => {
    setCameraLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setCameraOpen(true);
      setCameraLoading(false);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      });
    } catch {
      setCameraLoading(false);
      toast.error('Camera access denied', { description: 'Please allow camera permission to punch in.' });
    }
  };

  const handleCaptureAndPunchIn = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const maxW = 640;
    const scale = video.videoWidth > maxW ? maxW / video.videoWidth : 1;
    canvas.width = video.videoWidth * scale;
    canvas.height = video.videoHeight * scale;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const photo = canvas.toDataURL('image/jpeg', 0.7);

    stopCamera();

    try {
      await punchIn.mutateAsync({ photo });
      toast.success('Punched in!');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const handlePunchOut = async () => {
    try {
      await punchOut.mutateAsync();
      toast.success('Punched out!');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  return (
    <>
      <canvas ref={canvasRef} className="hidden" />
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2.5">
            <Clock className="size-5 text-gold" />
            <span className="text-sm font-medium">Today's Attendance</span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 sm:flex-nowrap">
            <div className="flex-1 space-y-1 text-sm text-muted-foreground">
              <p>Punch In: <span className="font-medium text-foreground">{todayRecord?.PunchIn ? new Date(todayRecord.PunchIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</span></p>
              <p>Punch Out: <span className="font-medium text-foreground">{todayRecord?.PunchOut ? new Date(todayRecord.PunchOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</span></p>
              {todayRecord?.PunchIn && todayRecord?.PunchOut && (
                <p>Total Time: <span className="font-medium text-foreground">{formatDuration(new Date(todayRecord.PunchOut).getTime() - new Date(todayRecord.PunchIn).getTime())}</span></p>
              )}
            </div>

            {!todayRecord?.PunchIn ? (
              <Button variant="gold" className="w-full sm:w-auto" onClick={openCamera} disabled={punchIn.isPending || cameraLoading}>
                <Camera className="size-4" /> {cameraLoading ? 'Opening...' : 'Punch In'}
              </Button>
            ) : !todayRecord?.PunchOut ? (
              <Button variant="outline" className="w-full sm:w-auto" onClick={handlePunchOut} disabled={punchOut.isPending}>
                <LogOut className="size-4" /> Punch Out
              </Button>
            ) : (
              <span className="flex w-full items-center justify-center gap-1.5 text-sm text-emerald-600 sm:w-auto sm:justify-start">
                <CheckCircle2 className="size-4" /> Day complete
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={cameraOpen} onOpenChange={(open) => { if (!open) stopCamera(); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogTitle className="flex items-center gap-2">
            <Camera className="size-5 text-gold" /> Verify Attendance
          </DialogTitle>
          <div className="relative mt-2 overflow-hidden rounded-xl bg-black">
            <video ref={videoRef} autoPlay muted playsInline className="max-h-[60vh] w-full rounded-xl" />
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <Button variant="outline" onClick={stopCamera}>
              Cancel
            </Button>
            <Button variant="gold" onClick={handleCaptureAndPunchIn}>
              <Camera className="size-4" /> Capture & Punch In
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function AttendanceCalendar({ attendance }: { attendance?: Array<{ Date: string; PunchIn?: string; PunchOut?: string; PhotoUrl?: string }> }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<{ dateStr: string; PunchIn?: string; PunchOut?: string; PhotoUrl: string } | null>(null);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const today = new Date().toISOString().slice(0, 10);

  const attendanceMap = useMemo(() => {
    if (!attendance) return {};
    const map: Record<string, { PunchIn?: string; PunchOut?: string; PhotoUrl?: string }> = {};
    attendance.forEach((r) => { map[r.Date] = { PunchIn: r.PunchIn, PunchOut: r.PunchOut, PhotoUrl: r.PhotoUrl }; });
    return map;
  }, [attendance]);

  const blanks = Array.from({ length: firstDayOfWeek }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground"><ChevronLeft className="size-5" /></button>
          <span className="font-display text-sm font-semibold">{currentDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground"><ChevronRight className="size-5" /></button>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="py-1 text-muted-foreground">{d}</div>
          ))}
          {blanks.map((b) => <div key={`b${b}`} />)}
          {days.map((day) => {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const rec = attendanceMap[dateStr];
            const isToday = dateStr === today;
            const hasPhoto = !!rec?.PhotoUrl;
            let bg = 'text-foreground';
            if (rec?.PunchIn) bg = rec.PunchOut ? 'bg-emerald-500/15 text-emerald-700' : 'bg-amber-500/15 text-amber-700';
            if (isToday) bg += ' ring-1 ring-gold/60';
            return (
              <div key={day} className="group relative flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => hasPhoto && setSelectedDay({ dateStr, PunchIn: rec?.PunchIn, PunchOut: rec?.PunchOut, PhotoUrl: rec!.PhotoUrl! })}
                  className={`flex size-8 items-center justify-center rounded-full text-xs ${bg} ${hasPhoto ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  {day}
                </button>
                {hasPhoto && (
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 hidden -translate-x-1/2 flex-col items-center group-hover:flex">
                    <img
                      src={rec!.PhotoUrl}
                      alt={`Punch-in photo — ${dateStr}`}
                      className="size-20 rounded-lg border border-border object-cover shadow-lg"
                    />
                    <span className="mt-1 rounded bg-popover px-1.5 py-0.5 text-[10px] text-popover-foreground shadow">
                      {rec?.PunchIn ? new Date(rec.PunchIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : dateStr}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="inline-block size-2 rounded-full bg-emerald-500/40" /> Present</span>
          <span className="flex items-center gap-1"><span className="inline-block size-2 rounded-full bg-amber-500/40" /> Partial</span>
          <span className="flex items-center gap-1"><span className="inline-block size-2 rounded-full bg-secondary" /> Absent</span>
        </div>
      </CardContent>

      <Dialog open={!!selectedDay} onOpenChange={(open) => { if (!open) setSelectedDay(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogTitle className="flex items-center gap-2">
            <Camera className="size-5 text-gold" /> Punch-in Photo
          </DialogTitle>
          {selectedDay && (
            <div className="mt-2">
              <img src={selectedDay.PhotoUrl} alt={`Punch-in photo — ${selectedDay.dateStr}`} className="w-full rounded-xl border border-border object-cover" />
              <p className="mt-3 text-sm text-muted-foreground">
                {new Date(selectedDay.dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                <p>Punch In: <span className="font-medium text-foreground">{selectedDay.PunchIn ? new Date(selectedDay.PunchIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</span></p>
                <p>Punch Out: <span className="font-medium text-foreground">{selectedDay.PunchOut ? new Date(selectedDay.PunchOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</span></p>
                {selectedDay.PunchIn && selectedDay.PunchOut && (
                  <p>Total Time: <span className="font-medium text-foreground">{formatDuration(new Date(selectedDay.PunchOut).getTime() - new Date(selectedDay.PunchIn).getTime())}</span></p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function PortalQuestionsPanel({ studentClass }: { studentClass: string }) {
  const { data: questions, isLoading } = usePortalQuestions(studentClass, !!studentClass);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2.5"><FileText className="size-5 text-gold" /><span className="text-sm font-medium">Questions</span></div>
        {isLoading && <p className="mt-4 text-sm text-muted-foreground">Loading…</p>}
        {!isLoading && (!questions || questions.length === 0) && <p className="mt-4 text-sm text-muted-foreground">No questions posted yet.</p>}
        {!isLoading && questions && questions.length > 0 && (
          <ul className="mt-4 space-y-3">
            {questions.map((q) => (
              <li key={q.Id} className="rounded-xl bg-secondary/50 p-4">
                <p className="font-display text-sm font-semibold">{q.Title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{q.Subject} &middot; {q.Type}</p>
                {q.Description && <p className="mt-2 text-xs text-muted-foreground">{q.Description}</p>}
                {q.PdfUrl && <a href={q.PdfUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-gold hover:underline">View PDF</a>}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function PortalNotesPanel({ studentClass }: { studentClass: string }) {
  const { data: notes, isLoading } = usePortalNotes(studentClass, !!studentClass);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2.5"><BookOpen className="size-5 text-gold" /><span className="text-sm font-medium">Study Notes</span></div>
        {isLoading && <p className="mt-4 text-sm text-muted-foreground">Loading…</p>}
        {!isLoading && (!notes || notes.length === 0) && <p className="mt-4 text-sm text-muted-foreground">No notes posted yet.</p>}
        {!isLoading && notes && notes.length > 0 && (
          <ul className="mt-4 space-y-3">
            {notes.map((n) => (
              <li key={n.Id} className="rounded-xl bg-secondary/50 p-4">
                <p className="font-display text-sm font-semibold">{n.Title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{n.Subject}</p>
                {n.Description && <p className="mt-2 text-xs text-muted-foreground">{n.Description}</p>}
                {n.PdfUrl && <a href={n.PdfUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-gold hover:underline">View PDF</a>}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function PortalResultsPanel({ studentClass }: { studentClass: string }) {
  const { data: results, isLoading } = usePortalResults(studentClass, !!studentClass);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2.5"><Trophy className="size-5 text-gold" /><span className="text-sm font-medium">Results</span></div>
        {isLoading && <p className="mt-4 text-sm text-muted-foreground">Loading…</p>}
        {!isLoading && (!results || results.length === 0) && <p className="mt-4 text-sm text-muted-foreground">No results posted yet.</p>}
        {!isLoading && results && results.length > 0 && (
          <ul className="mt-4 space-y-3">
            {results.map((r) => (
              <li key={r.Id} className="rounded-xl bg-secondary/50 p-4">
                <p className="font-display text-sm font-semibold">{r.ExamName}</p>
                <p className="mt-1 text-xs text-muted-foreground">{r.Subject} &middot; {r.ExamDate ? new Date(r.ExamDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</p>
                {r.Description && <p className="mt-2 text-xs text-muted-foreground">{r.Description}</p>}
                {r.PdfUrl && <a href={r.PdfUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-gold hover:underline">View Result PDF</a>}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const { data: student } = usePortalMe(true);
  const { data: classes } = usePortalClasses(true);
  const { data: attendance } = usePortalAttendance(true);
  const { data: notices } = useNotices();
  const [portalTab, setPortalTab] = useState('classes');

  if (!student) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mx-auto w-full max-w-6xl">
      <div className="lg:grid lg:grid-cols-[320px_1fr] lg:items-start lg:gap-6">
        <div className="space-y-6">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gold/15 text-gold">
                <User className="size-7" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate font-display text-xl font-bold">{student.studentName}</h1>
                <p className="text-sm text-muted-foreground">Class {student.className} &middot; ID {student.studentId}</p>
              </div>
            </CardContent>
          </Card>

          <PunchCard />
          <AttendanceCalendar attendance={attendance} />

          <Button variant="outline" className="hidden w-full lg:flex" onClick={onLogout}>
            <LogOut className="size-4" /> Log Out
          </Button>
        </div>

        <div className="mt-6 lg:mt-0">
          <Tabs value={portalTab} onValueChange={setPortalTab}>
            <TabsList className="flex w-full justify-start gap-1 overflow-x-auto bg-secondary/60 p-1.5">
              <TabsTrigger value="classes" className="rounded-full px-3 py-1.5 text-xs"><Video className="mr-1 size-3" />Classes</TabsTrigger>
              <TabsTrigger value="questions" className="rounded-full px-3 py-1.5 text-xs"><FileText className="mr-1 size-3" />Questions</TabsTrigger>
              <TabsTrigger value="notes" className="rounded-full px-3 py-1.5 text-xs"><BookOpen className="mr-1 size-3" />Notes</TabsTrigger>
              <TabsTrigger value="results" className="rounded-full px-3 py-1.5 text-xs"><Trophy className="mr-1 size-3" />Results</TabsTrigger>
              <TabsTrigger value="notices" className="rounded-full px-3 py-1.5 text-xs"><Megaphone className="mr-1 size-3" />Notices</TabsTrigger>
            </TabsList>

            <TabsContent value="classes" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2.5"><Video className="size-5 text-gold" /><span className="text-sm font-medium">Live & Recorded Classes</span></div>
                  {classes && classes.length > 0 ? (
                    <ul className="mt-4 space-y-3">
                      {classes.map((c) => (
                        <li key={c.Id} className="flex items-center justify-between gap-4 rounded-xl bg-secondary/50 p-4">
                          <div className="min-w-0">
                            <p className="truncate font-display text-sm font-semibold">{c.Title}</p>
                            <p className="text-xs text-muted-foreground">{c.Subject} &middot; {c.Type}</p>
                          </div>
                          <Button asChild size="sm" variant="gold" className="shrink-0">
                            <a href={c.Url} target="_blank" rel="noreferrer"><PlayCircle className="size-4" /> {c.Type === 'Live' ? 'Join Live' : 'Watch'}</a>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="mt-3 text-sm text-muted-foreground">No classes posted yet.</p>}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="questions" className="mt-4">
              <PortalQuestionsPanel studentClass={student.className} />
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <PortalNotesPanel studentClass={student.className} />
            </TabsContent>

            <TabsContent value="results" className="mt-4">
              <PortalResultsPanel studentClass={student.className} />
            </TabsContent>

            <TabsContent value="notices" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2.5"><Megaphone className="size-5 text-gold" /><span className="text-sm font-medium">Notices</span></div>
                  {notices && notices.length > 0 ? (
                    <ul className="mt-4 space-y-3">
                      {notices.map((n) => (
                        <li key={n.Id} className="rounded-xl bg-secondary/50 p-4">
                          <p className="font-display text-sm font-semibold">{n.Title}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{n.Body}</p>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="mt-3 text-sm text-muted-foreground">No notices right now.</p>}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-center lg:hidden">
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="size-4" /> Log Out
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function StudentPortalPage() {
  const [loggedIn, setLoggedIn] = useState(useIsStudentLoggedIn());
  const logout = usePortalLogout();
  const [searchParams, setSearchParams] = useSearchParams();
  const [authView, setAuthView] = useState<'tabs' | 'forgot'>('tabs');
  const resetToken = searchParams.get('resetToken');

  const handleLogout = () => {
    logout();
    setLoggedIn(false);
  };

  const clearResetToken = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('resetToken');
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <title>Student Portal | Target Classes</title>
      <PortalHeader onLogout={loggedIn ? handleLogout : undefined} />
      <div className="section-container flex min-h-[80vh] items-center justify-center py-10">
        {loggedIn ? (
          <Dashboard onLogout={handleLogout} />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto w-full max-w-lg rounded-3xl border border-border bg-card p-8 shadow-sm sm:p-10"
          >
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gold/15 text-gold">
              <GraduationCap className="size-7" />
            </div>

            {resetToken ? (
              <>
                <h1 className="mt-5 text-center font-display text-2xl font-bold sm:text-3xl">Reset Password</h1>
                <div className="mt-8">
                  <ResetPasswordForm token={resetToken} onDone={clearResetToken} />
                </div>
              </>
            ) : authView === 'forgot' ? (
              <>
                <h1 className="mt-5 text-center font-display text-2xl font-bold sm:text-3xl">Forgot Password</h1>
                <div className="mt-8">
                  <ForgotPasswordForm onBack={() => setAuthView('tabs')} />
                </div>
              </>
            ) : (
              <>
                <h1 className="mt-5 text-center font-display text-2xl font-bold sm:text-3xl">Student Portal</h1>
                <p className="mt-2 text-center text-sm text-muted-foreground">Log in to view classes, attendance, and notices — or apply for a new account.</p>

                <Tabs defaultValue="login" className="mt-8">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Log In</TabsTrigger>
                    <TabsTrigger value="apply">Apply</TabsTrigger>
                  </TabsList>
                  <TabsContent value="login" className="mt-6">
                    <LoginForm onSuccess={() => setLoggedIn(true)} onForgotPassword={() => setAuthView('forgot')} />
                  </TabsContent>
                  <TabsContent value="apply" className="mt-6">
                    <ApplyForm />
                  </TabsContent>
                </Tabs>
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

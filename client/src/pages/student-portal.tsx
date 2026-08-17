import { useState, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
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
} from '@/hooks/use-portal';
import { api } from '@/lib/api';

function PortalHeader({ onLogout }: { onLogout?: () => void }) {
  return (
    <div className="section-container flex items-center justify-between py-6">
      <Link to="/" className="flex items-center gap-2 text-sm font-medium text-white transition-colors hover:text-white">
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

// ---- Login ----

const loginSchema = z.object({
  studentId: z.string().min(1, 'Please enter your Student ID'),
  password: z.string().min(1, 'Please enter your password'),
});
type LoginForm = z.infer<typeof loginSchema>;

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { studentId: '', password: '' },
  });
  const { mutateAsync } = usePortalLogin();

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
        <Label htmlFor="studentId" className="text-white/80">Student ID</Label>
        <Input id="studentId" placeholder="e.g. TC-2026-001" className="border-white/15 bg-white/5 text-white placeholder:text-white/40" {...register('studentId')} />
        {errors.studentId && <p className="text-xs text-red-400">{errors.studentId.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-white/80">Password</Label>
        <Input id="password" type="password" className="border-white/15 bg-white/5 text-white" {...register('password')} />
        {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
      </div>
      <Button type="submit" variant="gold" size="lg" className="w-full" disabled={isSubmitting}>
        <LogInIcon className="size-4" /> Log In
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
          <Label htmlFor="studentName" className="text-white/80">Student's Full Name</Label>
          <Input id="studentName" className="border-white/15 bg-white/5 text-white" {...register('studentName')} />
          {errors.studentName && <p className="text-xs text-red-400">{errors.studentName.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dob" className="text-white/80">Date of Birth</Label>
          <Input id="dob" type="date" className="border-white/15 bg-white/5 text-white [color-scheme:dark]" {...register('dob')} />
          {errors.dob && <p className="text-xs text-red-400">{errors.dob.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="className" className="text-white/80">Class</Label>
        <Controller
          control={control}
          name="className"
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger id="className" className="w-full border-white/15 bg-white/5 text-white">
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
        {errors.className && <p className="text-xs text-red-400">{errors.className.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="subjects" className="text-white/80">Subjects (optional)</Label>
        <Input id="subjects" placeholder="e.g. Physics, Chemistry, Maths" className="border-white/15 bg-white/5 text-white placeholder:text-white/40" {...register('subjects')} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="parentName" className="text-white/80">Parent/Guardian Name</Label>
          <Input id="parentName" className="border-white/15 bg-white/5 text-white" {...register('parentName')} />
          {errors.parentName && <p className="text-xs text-red-400">{errors.parentName.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="parentPhone" className="text-white/80">Phone Number</Label>
          <Input id="parentPhone" type="tel" className="border-white/15 bg-white/5 text-white" {...register('parentPhone')} />
          {errors.parentPhone && <p className="text-xs text-red-400">{errors.parentPhone.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-white/80">Email</Label>
        <Input id="email" type="email" className="border-white/15 bg-white/5 text-white" {...register('email')} />
        {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
        <p className="text-xs text-white/80">Your Student ID and password will be sent here once approved.</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="address" className="text-white/80">Address</Label>
        <Textarea id="address" rows={2} className="border-white/15 bg-white/5 text-white" {...register('address')} />
        {errors.address && <p className="text-xs text-red-400">{errors.address.message}</p>}
      </div>

      <Button type="submit" variant="gold" size="lg" className="w-full" disabled={isSubmitting}>
        Submit Application
      </Button>
    </form>
  );
}

// ---- Dashboard ----

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
      await punchIn.mutateAsync({ photo } as any);
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
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-2.5 text-white">
          <Clock className="size-5 text-gold" />
          <span className="text-sm font-medium">Today's Attendance</span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="flex-1 space-y-1 text-sm text-white">
            <p>Punch In: <span className="font-medium text-white">{todayRecord?.PunchIn ? new Date(todayRecord.PunchIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</span></p>
            <p>Punch Out: <span className="font-medium text-white">{todayRecord?.PunchOut ? new Date(todayRecord.PunchOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</span></p>
          </div>

          {!todayRecord?.PunchIn ? (
            <Button variant="gold" onClick={openCamera} disabled={punchIn.isPending || cameraLoading}>
              <Camera className="size-4" /> {cameraLoading ? 'Opening...' : 'Punch In'}
            </Button>
          ) : !todayRecord?.PunchOut ? (
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:text-white" onClick={handlePunchOut} disabled={punchOut.isPending}>
              <LogOut className="size-4" /> Punch Out
            </Button>
          ) : (
            <span className="flex items-center gap-1.5 text-sm text-emerald-300">
              <CheckCircle2 className="size-4" /> Day complete
            </span>
          )}
        </div>
      </div>

      <Dialog open={cameraOpen} onOpenChange={(open) => { if (!open) stopCamera(); }}>
        <DialogContent className="border border-white/10 bg-white/5 text-white backdrop-blur-xl sm:max-w-md">
          <DialogTitle className="flex items-center gap-2 text-white">
            <Camera className="size-5 text-gold" /> Verify Attendance
          </DialogTitle>
          <div className="relative mt-2 overflow-hidden rounded-xl bg-black">
            <video ref={videoRef} autoPlay muted playsInline className="w-full rounded-xl" />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={stopCamera}>
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

function AttendanceCalendar({ attendance }: { attendance?: Array<{ Date: string; PunchIn?: string; PunchOut?: string }> }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const today = new Date().toISOString().slice(0, 10);

  const attendanceMap = useMemo(() => {
    if (!attendance) return {};
    const map: Record<string, { PunchIn?: string; PunchOut?: string }> = {};
    attendance.forEach((r) => { map[r.Date] = { PunchIn: r.PunchIn, PunchOut: r.PunchOut }; });
    return map;
  }, [attendance]);

  const blanks = Array.from({ length: firstDayOfWeek }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="rounded-lg p-1 text-white hover:bg-white/10 hover:text-white"><ChevronLeft className="size-5" /></button>
        <span className="font-display text-sm font-semibold text-white">{currentDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
        <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="rounded-lg p-1 text-white hover:bg-white/10 hover:text-white"><ChevronRight className="size-5" /></button>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="py-1 text-white/70">{d}</div>
        ))}
        {blanks.map((b) => <div key={`b${b}`} />)}
        {days.map((day) => {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const rec = attendanceMap[dateStr];
          const isToday = dateStr === today;
          let bg = 'text-white';
          if (rec?.PunchIn) bg = rec.PunchOut ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300';
          if (isToday) bg += ' ring-1 ring-gold/50';
          return (
            <div key={day} className={`flex size-8 items-center justify-center rounded-full text-xs ${bg}`}>{day}</div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-white/70">
        <span className="flex items-center gap-1"><span className="inline-block size-2 rounded-full bg-emerald-500/40" /> Present</span>
        <span className="flex items-center gap-1"><span className="inline-block size-2 rounded-full bg-amber-500/40" /> Partial</span>
        <span className="flex items-center gap-1"><span className="inline-block size-2 rounded-full bg-white/10" /> Absent</span>
      </div>
    </div>
  );
}

function PortalQuestionsPanel({ studentClass }: { studentClass: string }) {
  const [questions, setQuestions] = useState<Array<Record<string, string>>>([]);
  const [loading, setLoading] = useState(true);

  useState(() => {
    (async () => {
      try {
        const res = await api.get(`/questions?className=${encodeURIComponent(studentClass)}`);
        setQuestions(res.data.data ?? []);
      } catch { /* empty */ } finally { setLoading(false); }
    })();
  });

  if (loading) return <p className="text-sm text-white/80">Loading...</p>;
  if (questions.length === 0) return <p className="text-sm text-white/80">No questions posted yet.</p>;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <div className="flex items-center gap-2.5 text-white"><FileText className="size-5 text-gold" /><span className="text-sm font-medium">Questions</span></div>
      <ul className="mt-4 space-y-3">
        {questions.map((q) => (
          <li key={q.Id} className="rounded-xl bg-white/5 p-4">
            <p className="font-display text-sm font-semibold text-white">{q.Title}</p>
            <p className="mt-1 text-xs text-white">{q.Subject} &middot; {q.Type}</p>
            {q.Description && <p className="mt-2 text-xs text-white/80">{q.Description}</p>}
            {q.PdfUrl && <a href={q.PdfUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-gold underline">View PDF</a>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PortalNotesPanel({ studentClass }: { studentClass: string }) {
  const [notes, setNotes] = useState<Array<Record<string, string>>>([]);
  const [loading, setLoading] = useState(true);

  useState(() => {
    (async () => {
      try {
        const res = await api.get(`/notes?className=${encodeURIComponent(studentClass)}`);
        setNotes(res.data.data ?? []);
      } catch { /* empty */ } finally { setLoading(false); }
    })();
  });

  if (loading) return <p className="text-sm text-white/80">Loading...</p>;
  if (notes.length === 0) return <p className="text-sm text-white/80">No notes posted yet.</p>;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <div className="flex items-center gap-2.5 text-white"><BookOpen className="size-5 text-gold" /><span className="text-sm font-medium">Study Notes</span></div>
      <ul className="mt-4 space-y-3">
        {notes.map((n) => (
          <li key={n.Id} className="rounded-xl bg-white/5 p-4">
            <p className="font-display text-sm font-semibold text-white">{n.Title}</p>
            <p className="mt-1 text-xs text-white">{n.Subject}</p>
            {n.Description && <p className="mt-2 text-xs text-white/80">{n.Description}</p>}
            {n.PdfUrl && <a href={n.PdfUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-gold underline">View PDF</a>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PortalResultsPanel({ studentClass }: { studentClass: string }) {
  const [results, setResults] = useState<Array<Record<string, string>>>([]);
  const [loading, setLoading] = useState(true);

  useState(() => {
    (async () => {
      try {
        const res = await api.get(`/results?className=${encodeURIComponent(studentClass)}`);
        setResults(res.data.data ?? []);
      } catch { /* empty */ } finally { setLoading(false); }
    })();
  });

  if (loading) return <p className="text-sm text-white/80">Loading...</p>;
  if (results.length === 0) return <p className="text-sm text-white/80">No results posted yet.</p>;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <div className="flex items-center gap-2.5 text-white"><Trophy className="size-5 text-gold" /><span className="text-sm font-medium">Results</span></div>
      <ul className="mt-4 space-y-3">
        {results.map((r) => (
          <li key={r.Id} className="rounded-xl bg-white/5 p-4">
            <p className="font-display text-sm font-semibold text-white">{r.ExamName}</p>
            <p className="mt-1 text-xs text-white">{r.Subject} &middot; {r.ExamDate ? new Date(r.ExamDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</p>
            {r.Description && <p className="mt-2 text-xs text-white/80">{r.Description}</p>}
            {r.PdfUrl && <a href={r.PdfUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-gold underline">View Result PDF</a>}
          </li>
        ))}
      </ul>
    </div>
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
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mx-auto w-full max-w-3xl space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gold/15 text-gold">
            <User className="size-7" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-white">{student.studentName}</h1>
            <p className="text-sm text-white">Class {student.className} &middot; Student ID {student.studentId}</p>
          </div>
        </div>
      </div>

      <PunchCard />
      <AttendanceCalendar attendance={attendance} />

      <Tabs value={portalTab} onValueChange={setPortalTab}>
        <TabsList className="flex h-auto w-fit flex-wrap gap-1 bg-white/10 p-1.5">
          <TabsTrigger value="classes" className="rounded-full px-3 py-1.5 text-xs"><Video className="mr-1 size-3" />Classes</TabsTrigger>
          <TabsTrigger value="questions" className="rounded-full px-3 py-1.5 text-xs"><FileText className="mr-1 size-3" />Questions</TabsTrigger>
          <TabsTrigger value="notes" className="rounded-full px-3 py-1.5 text-xs"><BookOpen className="mr-1 size-3" />Notes</TabsTrigger>
          <TabsTrigger value="results" className="rounded-full px-3 py-1.5 text-xs"><Trophy className="mr-1 size-3" />Results</TabsTrigger>
          <TabsTrigger value="notices" className="rounded-full px-3 py-1.5 text-xs"><Megaphone className="mr-1 size-3" />Notices</TabsTrigger>
        </TabsList>

        <TabsContent value="classes" className="mt-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-2.5 text-white"><Video className="size-5 text-gold" /><span className="text-sm font-medium">Live & Recorded Classes</span></div>
            {classes && classes.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {classes.map((c) => (
                  <li key={c.Id} className="flex items-center justify-between gap-4 rounded-xl bg-white/5 p-4">
                    <div>
                      <p className="font-display text-sm font-semibold text-white">{c.Title}</p>
                      <p className="text-xs text-white">{c.Subject} &middot; {c.Type}</p>
                    </div>
                    <Button asChild size="sm" variant="gold">
                      <a href={c.Url} target="_blank" rel="noreferrer"><PlayCircle className="size-4" /> {c.Type === 'Live' ? 'Join Live' : 'Watch'}</a>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-3 text-sm text-white/80">No classes posted yet.</p>}
          </div>
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
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-2.5 text-white"><Megaphone className="size-5 text-gold" /><span className="text-sm font-medium">Notices</span></div>
            {notices && notices.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {notices.map((n) => (
                  <li key={n.Id} className="rounded-xl bg-white/5 p-4">
                    <p className="font-display text-sm font-semibold text-white">{n.Title}</p>
                    <p className="mt-1 text-xs text-white">{n.Body}</p>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-3 text-sm text-white/80">No notices right now.</p>}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center pt-2">
        <Button variant="glass" onClick={onLogout}>
          <LogOut className="size-4" /> Log Out
        </Button>
      </div>
    </motion.div>
  );
}

export function StudentPortalPage() {
  const [loggedIn, setLoggedIn] = useState(useIsStudentLoggedIn());
  const logout = usePortalLogout();

  const handleLogout = () => {
    logout();
    setLoggedIn(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#16305C] to-[#060D1F]">
      <title>Student Portal | Target Classes</title>
      <PortalHeader onLogout={loggedIn ? handleLogout : undefined} />
      <div className="section-container flex min-h-[80vh] items-center justify-center pb-16">
        {loggedIn ? (
          <Dashboard onLogout={handleLogout} />
        ) : (
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
            <p className="mt-2 text-center text-sm text-white">Log in to view classes, attendance, and notices — or apply for a new account.</p>

            <Tabs defaultValue="login" className="mt-8">
              <TabsList className="grid w-full grid-cols-2 bg-white/10">
                <TabsTrigger value="login">Log In</TabsTrigger>
                <TabsTrigger value="apply">Apply</TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="mt-6">
                <LoginForm onSuccess={() => setLoggedIn(true)} />
              </TabsContent>
              <TabsContent value="apply" className="mt-6">
                <ApplyForm />
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </div>
    </div>
  );
}

import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/hooks/use-language";
import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import {
  useGetTeacherStats, getGetTeacherStatsQueryKey,
  useGetTeacherRevenue, getGetTeacherRevenueQueryKey,
  useGetRecentActivity, getGetRecentActivityQueryKey,
  useGetStudentEnrollments, getGetStudentEnrollmentsQueryKey,
  useGetStudentProgress, getGetStudentProgressQueryKey,
  useGetParentChildren, getGetParentChildrenQueryKey,
  useLinkChildToParent,
  useListAssignments, getListAssignmentsQueryKey,
  useGetDashboardSummary, getGetDashboardSummaryQueryKey,
} from "@workspace/api-client-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Users, BookOpen, TrendingUp, MessageSquare, Star, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";

function StatCard({ label, value, icon: Icon, delta, color = "primary" }: { label: string; value: string | number; icon: any; delta?: string; color?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">{label}</span>
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="w-4 h-4 text-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {delta && <p className="text-xs text-green-600 mt-1">{delta}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function TeacherDashboard({ userId }: { userId: number }) {
  const { t, lang } = useLanguage();
  const stats = useGetTeacherStats(userId, { query: { queryKey: getGetTeacherStatsQueryKey(userId) } });
  const revenue = useGetTeacherRevenue(userId, { query: { queryKey: getGetTeacherRevenueQueryKey(userId) } });
  const activity = useGetRecentActivity({ userId }, { query: { queryKey: getGetRecentActivityQueryKey({ userId }) } });
  const s = stats.data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label={lang === "ar" ? "الطلاب" : "Students"} value={s?.totalStudents ?? "—"} icon={Users} delta={lang === "ar" ? "نشط" : "Active"} />
        <StatCard label={lang === "ar" ? "الدورات" : "Courses"} value={s?.activeCourses ?? "—"} icon={BookOpen} />
        <StatCard label={lang === "ar" ? "التقييم" : "Rating"} value={s?.averageRating?.toFixed(1) ?? "—"} icon={Star} delta="★★★★★" />
        <StatCard label={lang === "ar" ? "الإيراد الشهري" : "Monthly Revenue"} value={s ? `${s.monthlyRevenue.toLocaleString()} EGP` : "—"} icon={TrendingUp} />
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t("revenue")}</CardTitle>
        </CardHeader>
        <CardContent>
          {revenue.isLoading ? (
            <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">{t("loading")}</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={revenue.data ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip formatter={(v) => [`${Number(v).toLocaleString()} EGP`, lang === "ar" ? "الإيرادات" : "Revenue"]} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t("recentActivity")}</CardTitle>
        </CardHeader>
        <CardContent>
          {activity.isLoading ? (
            <p className="text-sm text-muted-foreground">{t("loading")}</p>
          ) : !activity.data?.length ? (
            <div className="text-center py-8 text-muted-foreground text-sm">{lang === "ar" ? "لا يوجد نشاط حديث" : "No recent activity"}</div>
          ) : (
            <div className="space-y-3">
              {activity.data.slice(0, 6).map((a) => (
                <div key={a.id} className="flex items-start gap-3 py-2 border-b border-border/30 last:border-0">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                  <div>
                    <p className="text-sm">{lang === "ar" ? a.descriptionAr ?? a.description : a.description}</p>
                    <p className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StudentDashboard({ userId }: { userId: number }) {
  const { t, lang } = useLanguage();
  const enrollments = useGetStudentEnrollments(userId, { query: { queryKey: getGetStudentEnrollmentsQueryKey(userId) } });
  const progress = useGetStudentProgress(userId, { query: { queryKey: getGetStudentProgressQueryKey(userId) } });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label={lang === "ar" ? "دوراتي" : "My Courses"} value={enrollments.data?.length ?? 0} icon={BookOpen} />
        <StatCard label={lang === "ar" ? "معدل الإنجاز" : "Avg Progress"} value={`${Math.round((progress.data?.reduce((a, b) => a + b.progressPercent, 0) ?? 0) / Math.max(progress.data?.length ?? 1, 1))}%`} icon={TrendingUp} />
        <StatCard label={lang === "ar" ? "الواجبات المعلقة" : "Pending Assignments"} value={3} icon={AlertCircle} />
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{lang === "ar" ? "الدورات المسجلة" : "Enrolled Courses"}</CardTitle>
        </CardHeader>
        <CardContent>
          {!enrollments.data?.length ? (
            <div className="text-center py-12">
              <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">{lang === "ar" ? "لم تسجل في أي دورة بعد" : "No courses enrolled yet"}</p>
              <Link href="/courses">
                <Button className="mt-4" size="sm">{t("courses")}</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {enrollments.data.map((e) => (
                <div key={e.id} className="flex items-center gap-4 p-3 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{e.course?.title}</p>
                    <div className="mt-1 h-1.5 bg-muted rounded-full">
                      <div className="h-1.5 bg-primary rounded-full" style={{ width: `${e.progress}%` }} />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{e.progress}%</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ParentDashboard({ userId }: { userId: number }) {
  const { t, lang } = useLanguage();
  const children = useGetParentChildren(userId, { query: { queryKey: getGetParentChildrenQueryKey(userId) } });
  const linkChild = useLinkChildToParent();
  const qc = useQueryClient();
  const [childEmail, setChildEmail] = useState("");

  const form = useForm({ defaultValues: { childId: "" } });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard label={lang === "ar" ? "أبنائي" : "My Children"} value={children.data?.length ?? 0} icon={Users} />
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t("myChildren")}</CardTitle>
        </CardHeader>
        <CardContent>
          {!children.data?.length ? (
            <div className="text-center py-8">
              <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm mb-4">{lang === "ar" ? "لم تربط أي حساب طالب بعد" : "No children linked yet"}</p>
            </div>
          ) : (
            <div className="space-y-3 mb-4">
              {children.data.map((child) => (
                <div key={child?.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {child?.name?.[0]}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{child?.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{child?.role}</p>
                  </div>
                  <Link href={`/students/${child?.id}/progress`} className="ml-auto">
                    <Button variant="outline" size="sm">{t("childProgress")}</Button>
                  </Link>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-border/30 pt-4">
            <p className="text-sm font-medium mb-2">{t("addChild")}</p>
            <div className="flex gap-2">
              <Input
                placeholder={lang === "ar" ? "معرف حساب الطالب" : "Student account ID"}
                value={childEmail}
                onChange={e => setChildEmail(e.target.value)}
                className="flex-1"
                data-testid="input-child-id"
              />
              <Button
                onClick={() => {
                  const childId = parseInt(childEmail);
                  if (!isNaN(childId)) {
                    linkChild.mutate({ parentId: userId, data: { childId } }, {
                      onSuccess: () => {
                        qc.invalidateQueries({ queryKey: getGetParentChildrenQueryKey(userId) });
                        setChildEmail("");
                      }
                    });
                  }
                }}
                disabled={linkChild.isPending}
                data-testid="button-link-child"
              >
                {t("addChild")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminDashboard() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const summary = useGetDashboardSummary({ userId: user?.id ?? 0, role: "admin" }, { query: { queryKey: getGetDashboardSummaryQueryKey({ userId: user?.id ?? 0, role: "admin" }) } });
  const s = summary.data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label={lang === "ar" ? "إجمالي الطلاب" : "Total Students"} value={s?.totalStudents ?? "—"} icon={Users} />
        <StatCard label={lang === "ar" ? "الدورات" : "Courses"} value={s?.totalCourses ?? "—"} icon={BookOpen} />
        <StatCard label={lang === "ar" ? "الدروس" : "Lessons"} value={s?.totalLessons ?? "—"} icon={Clock} />
        <StatCard label={lang === "ar" ? "الإيرادات" : "Revenue"} value={s ? `${Number(s.totalRevenue ?? 0).toLocaleString()} EGP` : "—"} icon={TrendingUp} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();

  if (!user) return null;

  return (
    <Shell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t("welcome", { name: lang === "ar" ? user.nameAr ?? user.name : user.name })}</h1>
        <p className="text-muted-foreground text-sm mt-1 capitalize">{user.role} — {user.email}</p>
      </div>

      {user.role === "teacher" && <TeacherDashboard userId={user.id} />}
      {user.role === "student" && <StudentDashboard userId={user.id} />}
      {user.role === "parent" && <ParentDashboard userId={user.id} />}
      {user.role === "admin" && <AdminDashboard />}
    </Shell>
  );
}

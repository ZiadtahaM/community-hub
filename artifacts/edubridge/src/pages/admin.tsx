import { Shell } from "@/components/layout/shell";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetDashboardSummary, getGetDashboardSummaryQueryKey, useGetRecentActivity, getGetRecentActivityQueryKey } from "@workspace/api-client-react";
import { Users, BookOpen, Clock, TrendingUp, Activity } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const mockWeeklyData = [
  { day: "Mon", users: 12, courses: 3 }, { day: "Tue", users: 19, courses: 5 },
  { day: "Wed", users: 8, courses: 2 }, { day: "Thu", users: 25, courses: 7 },
  { day: "Fri", users: 31, courses: 9 }, { day: "Sat", users: 14, courses: 4 },
  { day: "Sun", users: 6, courses: 1 },
];

export default function Admin() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const summary = useGetDashboardSummary({ userId: user?.id ?? 0, role: "admin" }, { query: { queryKey: getGetDashboardSummaryQueryKey({ userId: user?.id ?? 0, role: "admin" }) } });
  const activity = useGetRecentActivity({ userId: user?.id ?? 0 }, { query: { queryKey: getGetRecentActivityQueryKey({ userId: user?.id ?? 0 }) } });
  const s = summary.data;

  const stats = [
    { label: lang === "ar" ? "إجمالي الطلاب" : "Total Students", value: s?.totalStudents ?? "—", icon: Users, color: "from-blue-500/20 to-blue-500/5" },
    { label: lang === "ar" ? "الدورات" : "Total Courses", value: s?.totalCourses ?? "—", icon: BookOpen, color: "from-teal-500/20 to-teal-500/5" },
    { label: lang === "ar" ? "الدروس" : "Total Lessons", value: s?.totalLessons ?? "—", icon: Clock, color: "from-amber-500/20 to-amber-500/5" },
    { label: lang === "ar" ? "الإيرادات" : "Total Revenue", value: s ? `${Number(s.totalRevenue ?? 0).toLocaleString()} EGP` : "—", icon: TrendingUp, color: "from-green-500/20 to-green-500/5" },
  ];

  return (
    <Shell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{lang === "ar" ? "لوحة الإدارة" : "Admin Dashboard"}</h1>
        <p className="text-muted-foreground text-sm mt-1">{lang === "ar" ? "نظرة عامة على المنصة" : "Platform overview and management"}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-border/50 shadow-sm overflow-hidden">
              <CardContent className={`p-4 bg-gradient-to-br ${color}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-xl font-bold">{value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{lang === "ar" ? "النشاط الأسبوعي" : "Weekly Activity"}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={mockWeeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip />
                <Bar dataKey="users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name={lang === "ar" ? "مستخدمون" : "Users"} />
                <Bar dataKey="courses" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} name={lang === "ar" ? "دورات" : "Courses"} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4" />
              {lang === "ar" ? "النشاط الأخير" : "Recent Activity"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activity.isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="h-10 bg-muted/30 rounded animate-pulse" />)}
              </div>
            ) : !activity.data?.length ? (
              <p className="text-sm text-muted-foreground text-center py-6">{lang === "ar" ? "لا يوجد نشاط" : "No activity yet"}</p>
            ) : (
              <div className="space-y-3">
                {activity.data.slice(0, 8).map((a) => (
                  <div key={a.id} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <p className="text-xs">{lang === "ar" ? a.descriptionAr ?? a.description : a.description}</p>
                      <p className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}

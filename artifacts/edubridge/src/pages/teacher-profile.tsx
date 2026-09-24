import { Shell } from "@/components/layout/shell";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useGetTeacher, getGetTeacherQueryKey,
  useGetTeacherStats, getGetTeacherStatsQueryKey,
  useListCourses, getListCoursesQueryKey,
} from "@workspace/api-client-react";
import { Star, Users, BookOpen, Award, MessageSquare } from "lucide-react";
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function TeacherProfile() {
  const { lang, t } = useLanguage();
  const params = useParams<{ teacherId: string }>();
  const teacherId = parseInt(params.teacherId ?? "0");

  const teacher = useGetTeacher(teacherId, { query: { queryKey: getGetTeacherQueryKey(teacherId) } });
  const stats = useGetTeacherStats(teacherId, { query: { queryKey: getGetTeacherStatsQueryKey(teacherId) } });
  const courses = useListCourses({ teacherId }, { query: { queryKey: getListCoursesQueryKey({ teacherId }) } });

  const T = teacher.data;
  const S = stats.data;

  if (teacher.isLoading) return <Shell><div className="h-64 bg-muted/30 rounded-2xl animate-pulse" /></Shell>;
  if (!T) return <Shell><p className="text-muted-foreground">Teacher not found.</p></Shell>;

  const ratingBars = [5, 4, 3, 2, 1].map(r => ({ star: r, count: Math.floor(Math.random() * 50) + (r === 5 ? 40 : 0) }));

  return (
    <Shell>
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-primary/10 via-background to-secondary/10 border border-border/50 rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-4xl shrink-0 shadow-lg">
            {T.user?.name?.[0] ?? "T"}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-2xl font-bold">{lang === "ar" ? T.user?.nameAr ?? T.user?.name : T.user?.name}</h1>
              {T.user?.verified && <Badge className="text-xs">{lang === "ar" ? "موثق" : "Verified"}</Badge>}
            </div>
            <p className="text-muted-foreground text-sm">{T.subject} · {T.gradeLevel} · {T.yearsExperience} {lang === "ar" ? "سنوات خبرة" : "years experience"}</p>
            {T.user?.bio && <p className="text-sm mt-2 max-w-lg">{T.user.bio}</p>}
            <div className="flex items-center gap-6 mt-3 text-sm">
              <span className="flex items-center gap-1.5"><Star className="w-4 h-4 fill-amber-400 text-amber-400" /><strong>{T.rating?.toFixed(1)}</strong> ({T.reviewCount} {lang === "ar" ? "تقييم" : "reviews"})</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-muted-foreground" />{T.totalStudents} {lang === "ar" ? "طالب" : "students"}</span>
              <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-muted-foreground" />{T.totalCourses} {lang === "ar" ? "دورة" : "courses"}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <div className="text-center bg-secondary/10 rounded-xl px-4 py-3 border border-secondary/20">
              <p className="font-bold text-lg text-secondary-foreground">{T.hourlyRate} {T.currency}</p>
              <p className="text-xs text-muted-foreground">{lang === "ar" ? "في الساعة" : "per hour"}</p>
            </div>
            <Link href="/messages">
              <Button className="w-full" data-testid="button-message-teacher">
                <MessageSquare className="w-4 h-4 mr-1 rtl:ml-1 rtl:mr-0" />
                {lang === "ar" ? "رسالة" : "Message"}
              </Button>
            </Link>
          </div>
        </div>
        {T.tags?.length ? (
          <div className="flex gap-2 mt-4 flex-wrap">
            {T.tags.map((tag: string) => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
          </div>
        ) : null}
      </div>

      {/* Stats */}
      {S && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: lang === "ar" ? "الطلاب" : "Students", value: S.totalStudents, icon: Users },
            { label: lang === "ar" ? "الدورات النشطة" : "Active Courses", value: S.activeCourses, icon: BookOpen },
            { label: lang === "ar" ? "معدل الإتمام" : "Completion Rate", value: `${Math.round((S.completionRate ?? 0) * 100)}%`, icon: Award },
            { label: lang === "ar" ? "التقييم" : "Rating", value: S.averageRating?.toFixed(1), icon: Star },
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label} className="border-border/50 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
                <p className="text-xl font-bold">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Tabs defaultValue="courses">
        <TabsList className="mb-4">
          <TabsTrigger value="courses">{t("courses")}</TabsTrigger>
          <TabsTrigger value="ratings">{lang === "ar" ? "التقييمات" : "Ratings"}</TabsTrigger>
        </TabsList>

        <TabsContent value="courses">
          {courses.isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <div key={i} className="h-40 bg-muted/30 rounded-2xl animate-pulse" />)}
            </div>
          ) : !courses.data?.courses?.length ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>{lang === "ar" ? "لا توجد دورات بعد" : "No courses yet"}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {courses.data.courses.map((c: any) => (
                <Link key={c.id} href={`/courses/${c.id}`}>
                  <motion.div whileHover={{ y: -2 }} className="bg-card border border-border/50 rounded-xl p-4 cursor-pointer hover:border-primary/30 transition-colors" data-testid={`course-card-${c.id}`}>
                    <p className="font-semibold text-sm">{lang === "ar" ? c.titleAr ?? c.title : c.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{c.subject} {c.gradeLevel ? `· ${c.gradeLevel}` : ""}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-muted-foreground">{c.enrollmentCount} {lang === "ar" ? "طالب" : "students"}</span>
                      <span className="font-bold text-primary text-sm">{Number(c.price) === 0 ? (lang === "ar" ? "مجاني" : "Free") : `${Number(c.price).toLocaleString()} EGP`}</span>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ratings">
          <Card className="border-border/50 shadow-sm max-w-md">
            <CardHeader className="pb-2"><CardTitle className="text-base">{lang === "ar" ? "توزيع التقييمات" : "Rating Distribution"}</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-center">
                  <p className="text-4xl font-bold text-primary">{T.rating?.toFixed(1)}</p>
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className={`w-4 h-4 ${i <= Math.round(T.rating ?? 0) ? "fill-amber-400 text-amber-400" : "text-muted"}`} />)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{T.reviewCount} {lang === "ar" ? "تقييم" : "reviews"}</p>
                </div>
                <div className="flex-1 space-y-1">
                  {ratingBars.map(({ star, count }) => (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-xs w-4">{star}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full">
                        <div className="h-2 bg-amber-400 rounded-full" style={{ width: `${(count / 90) * 100}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground w-6">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Shell>
  );
}

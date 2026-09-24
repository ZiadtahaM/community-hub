import { Shell } from "@/components/layout/shell";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useGetCourse, getGetCourseQueryKey,
  useListLessons, getListLessonsQueryKey,
  useListAnnouncements, getListAnnouncementsQueryKey,
  useListAssignments, getListAssignmentsQueryKey,
  useGetCourseStudents, getGetCourseStudentsQueryKey,
  useEnrollInCourse,
} from "@workspace/api-client-react";
import { BookOpen, Clock, Users, Star, ChevronRight, Plus, Bell } from "lucide-react";
import { Link, useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function CourseDetail() {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const params = useParams<{ courseId: string }>();
  const courseId = parseInt(params.courseId ?? "0");
  const { toast } = useToast();
  const qc = useQueryClient();

  const course = useGetCourse(courseId, { query: { queryKey: getGetCourseQueryKey(courseId) } });
  const lessons = useListLessons(courseId, { query: { queryKey: getListLessonsQueryKey(courseId) } });
  const announcements = useListAnnouncements(courseId, { query: { queryKey: getListAnnouncementsQueryKey(courseId) } });
  const assignments = useListAssignments(courseId, { query: { queryKey: getListAssignmentsQueryKey(courseId) } });
  const students = useGetCourseStudents(courseId, { query: { queryKey: getGetCourseStudentsQueryKey(courseId), enabled: user?.role === "teacher" } });
  const enroll = useEnrollInCourse();

  const c = course.data;
  const isTeacher = user?.role === "teacher";

  if (course.isLoading) {
    return <Shell><div className="h-64 bg-muted/30 rounded-2xl animate-pulse" /></Shell>;
  }
  if (!c) return <Shell><p className="text-muted-foreground">Course not found.</p></Shell>;

  return (
    <Shell>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/70 text-primary-foreground rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <Badge variant="secondary" className="mb-2 text-xs">{c.subject}</Badge>
            <h1 className="text-2xl font-bold mb-1">{lang === "ar" ? c.titleAr ?? c.title : c.title}</h1>
            {c.description && <p className="text-primary-foreground/80 text-sm max-w-lg">{c.description}</p>}
            <div className="flex items-center gap-4 mt-3 text-sm text-primary-foreground/80">
              <span className="flex items-center gap-1"><Users className="w-4 h-4" />{c.enrollmentCount} {t("students")}</span>
              <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-amber-300 text-amber-300" />{Number(c.rating).toFixed(1)}</span>
              <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{c.lessonCount} {t("lessons")}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className="text-2xl font-bold">
              {Number(c.price) === 0 ? (lang === "ar" ? "مجاني" : "Free") : `${Number(c.price).toLocaleString()} EGP`}
            </span>
            {user?.role === "student" && (
              <Button
                variant="secondary"
                disabled={enroll.isPending}
                onClick={() => enroll.mutate({ courseId, data: { studentId: user.id } }, {
                  onSuccess: () => { qc.invalidateQueries({ queryKey: getGetCourseQueryKey(courseId) }); toast({ title: lang === "ar" ? "تم التسجيل" : "Enrolled!" }); }
                })}
                data-testid="button-enroll"
              >
                {t("enroll")}
              </Button>
            )}
            {isTeacher && (
              <div className="flex gap-2">
                <Link href={`/courses/${courseId}/lessons/new`}>
                  <Button variant="secondary" size="sm" data-testid="button-add-lesson">
                    <Plus className="w-4 h-4 mr-1" />{lang === "ar" ? "درس جديد" : "New Lesson"}
                  </Button>
                </Link>
                <Link href={`/courses/${courseId}/assignments/new`}>
                  <Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20" data-testid="button-add-assignment">
                    <Plus className="w-4 h-4 mr-1" />{lang === "ar" ? "واجب جديد" : "New Assignment"}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="lessons">
        <TabsList className="mb-4">
          <TabsTrigger value="lessons" data-testid="tab-lessons">{t("lessons")}</TabsTrigger>
          <TabsTrigger value="assignments" data-testid="tab-assignments">{t("assignments")}</TabsTrigger>
          <TabsTrigger value="announcements" data-testid="tab-announcements">{t("announcements")}</TabsTrigger>
          {isTeacher && <TabsTrigger value="students" data-testid="tab-students">{t("students")}</TabsTrigger>}
        </TabsList>

        <TabsContent value="lessons" className="space-y-3">
          {lessons.isLoading ? <div className="h-40 bg-muted/30 rounded-xl animate-pulse" /> :
            !lessons.data?.length ? (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>{lang === "ar" ? "لا توجد دروس بعد" : "No lessons yet"}</p>
                {isTeacher && <Link href={`/courses/${courseId}/lessons/new`}><Button className="mt-3" size="sm">{lang === "ar" ? "أضف درساً" : "Add Lesson"}</Button></Link>}
              </div>
            ) : (
              lessons.data.map((l, i) => (
                <div key={l.id} className="flex items-center gap-4 p-4 bg-card border border-border/50 rounded-xl hover:border-primary/30 transition-colors" data-testid={`lesson-item-${l.id}`}>
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">{i + 1}</div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{lang === "ar" ? l.titleAr ?? l.title : l.title}</p>
                    {l.duration && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" />{l.duration} min</p>}
                  </div>
                  <Badge variant={l.status === "published" ? "default" : "secondary"} className="text-xs">{l.status}</Badge>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              ))
            )
          }
        </TabsContent>

        <TabsContent value="assignments" className="space-y-3">
          {assignments.isLoading ? <div className="h-40 bg-muted/30 rounded-xl animate-pulse" /> :
            !assignments.data?.length ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>{lang === "ar" ? "لا توجد واجبات بعد" : "No assignments yet"}</p>
              </div>
            ) : (
              assignments.data.map((a) => (
                <Link key={a.id} href={`/assignments/${a.id}`}>
                  <div className="flex items-center gap-4 p-4 bg-card border border-border/50 rounded-xl hover:border-primary/30 transition-colors cursor-pointer" data-testid={`assignment-item-${a.id}`}>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{lang === "ar" ? a.titleAr ?? a.title : a.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{lang === "ar" ? "موعد التسليم:" : "Due:"} {new Date(a.dueDate).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{a.maxGrade} pts</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Link>
              ))
            )
          }
        </TabsContent>

        <TabsContent value="announcements" className="space-y-3">
          {announcements.isLoading ? <div className="h-40 bg-muted/30 rounded-xl animate-pulse" /> :
            !announcements.data?.length ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>{lang === "ar" ? "لا توجد إعلانات" : "No announcements"}</p>
              </div>
            ) : (
              announcements.data.map((a) => (
                <div key={a.id} className="p-4 bg-card border border-border/50 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{a.title}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{new Date(a.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{a.body}</p>
                  <p className="text-xs text-muted-foreground/60 mt-2">{a.authorName}</p>
                </div>
              ))
            )
          }
        </TabsContent>

        {isTeacher && (
          <TabsContent value="students" className="space-y-3">
            {students.isLoading ? <div className="h-40 bg-muted/30 rounded-xl animate-pulse" /> :
              students.data?.map((s) => (
                <div key={s.studentId} className="flex items-center gap-3 p-3 bg-card border border-border/50 rounded-xl">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{s.studentName?.[0] ?? "?"}</div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{s.studentName}</p>
                    <div className="mt-1 h-1.5 bg-muted rounded-full w-32">
                      <div className="h-1.5 bg-primary rounded-full" style={{ width: `${s.progress}%` }} />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{s.progress}%</span>
                </div>
              ))
            }
          </TabsContent>
        )}
      </Tabs>
    </Shell>
  );
}

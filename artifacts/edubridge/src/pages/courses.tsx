import { useState } from "react";
import { Shell } from "@/components/layout/shell";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useListCourses, getListCoursesQueryKey,
  useEnrollInCourse,
  useGetTrendingCourses, getGetTrendingCoursesQueryKey,
} from "@workspace/api-client-react";
import { BookOpen, Star, Users, Search, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

const SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Biology", "Arabic", "English", "History", "Geography"];
const GRADES = ["G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9", "G10", "G11", "G12"];

function CourseCard({ course }: { course: any }) {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();
  const enroll = useEnrollInCourse();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
      data-testid={`card-course-${course.id}`}
    >
      <div className="h-32 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center relative">
        <span className="text-4xl font-bold text-primary/30">{course.subject?.[0] ?? "E"}</span>
        {course.gradeLevel && (
          <Badge className="absolute top-2 right-2 text-xs" variant="secondary">{course.gradeLevel}</Badge>
        )}
      </div>
      <div className="p-4">
        <Link href={`/courses/${course.id}`}>
          <h3 className="font-semibold text-sm hover:text-primary transition-colors cursor-pointer">
            {lang === "ar" ? course.titleAr ?? course.title : course.title}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground mt-1">{course.teacherName}</p>
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course.enrollmentCount}</span>
          <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{Number(course.rating).toFixed(1)}</span>
          <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{course.lessonCount}</span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-primary text-sm">
            {Number(course.price) === 0 ? (lang === "ar" ? "مجاني" : "Free") : `${Number(course.price).toLocaleString()} EGP`}
          </span>
          {user?.role === "student" && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              disabled={enroll.isPending}
              onClick={() => enroll.mutate({ courseId: course.id, data: { studentId: user.id } }, {
                onSuccess: () => {
                  qc.invalidateQueries({ queryKey: getListCoursesQueryKey() });
                  toast({ title: lang === "ar" ? "تم التسجيل" : "Enrolled!", description: lang === "ar" ? "تم تسجيلك في الدورة بنجاح" : "You've enrolled successfully." });
                }
              })}
              data-testid={`button-enroll-${course.id}`}
            >
              {t("enroll")}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Courses() {
  const { t, lang } = useLanguage();
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");

  const courses = useListCourses(
    { search: search || undefined, subject: subject || undefined, gradeLevel: grade || undefined },
    { query: { queryKey: getListCoursesQueryKey({ search: search || undefined, subject: subject || undefined, gradeLevel: grade || undefined }) } }
  );
  const trending = useGetTrendingCourses({ query: { queryKey: getGetTrendingCoursesQueryKey() } });

  return (
    <Shell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t("courses")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{lang === "ar" ? "اكتشف أفضل الدورات التعليمية في مصر" : "Discover the best educational courses in Egypt"}</p>
      </div>

      {/* Trending Banner */}
      {trending.data?.length ? (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">{lang === "ar" ? "الدورات الرائجة" : "Trending Now"}</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {trending.data.slice(0, 4).map((c: any) => (
              <Link key={c.id} href={`/courses/${c.id}`}>
                <div className="flex-shrink-0 w-48 bg-gradient-to-br from-primary to-primary/70 text-primary-foreground rounded-xl p-4 cursor-pointer hover:opacity-90 transition-opacity">
                  <p className="font-semibold text-sm">{c.title}</p>
                  <p className="text-xs opacity-80 mt-1">{c.subject}</p>
                  <p className="text-xs mt-2 font-medium">{c.enrollmentCount} {lang === "ar" ? "طالب" : "students"}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("search")}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="ps-9"
            data-testid="input-course-search"
          />
        </div>
        <Select value={subject || "all"} onValueChange={v => setSubject(v === "all" ? "" : v)}>
          <SelectTrigger className="w-40" data-testid="select-subject">
            <SelectValue placeholder={t("subject")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{lang === "ar" ? "كل المواد" : "All Subjects"}</SelectItem>
            {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={grade || "all"} onValueChange={v => setGrade(v === "all" ? "" : v)}>
          <SelectTrigger className="w-36" data-testid="select-grade">
            <SelectValue placeholder={t("gradeLevel")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{lang === "ar" ? "كل المراحل" : "All Grades"}</SelectItem>
            {GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Course Grid */}
      {courses.isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-64 bg-muted/30 rounded-2xl animate-pulse" />)}
        </div>
      ) : !courses.data?.courses?.length ? (
        <div className="text-center py-20">
          <BookOpen className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">{t("noResults")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {courses.data.courses.map((c: any) => <CourseCard key={c.id} course={c} />)}
        </div>
      )}
    </Shell>
  );
}

import { useState } from "react";
import { Shell } from "@/components/layout/shell";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  useListCourses, getListCoursesQueryKey,
  useCreateCourse,
  useGetStudentEnrollments, getGetStudentEnrollmentsQueryKey,
} from "@workspace/api-client-react";
import { BookOpen, Plus, Users, Star } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Biology", "Arabic", "English", "History", "Geography"];

export default function MyCourses() {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showCreate, setShowCreate] = useState(false);

  const isTeacher = user?.role === "teacher";

  const teacherCourses = useListCourses(
    { teacherId: user?.id },
    { query: { queryKey: getListCoursesQueryKey({ teacherId: user?.id }), enabled: isTeacher } }
  );
  const studentEnrollments = useGetStudentEnrollments(
    user?.id ?? 0,
    { query: { queryKey: getGetStudentEnrollmentsQueryKey(user?.id ?? 0), enabled: !isTeacher && !!user?.id } }
  );

  const createCourse = useCreateCourse();
  const form = useForm({
    defaultValues: { title: "", titleAr: "", subject: "", gradeLevel: "", price: "0", description: "" }
  });

  function onSubmit(values: any) {
    createCourse.mutate({ data: { ...values, price: parseFloat(values.price) } }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListCoursesQueryKey() });
        toast({ title: lang === "ar" ? "تم إنشاء الدورة" : "Course created!" });
        form.reset();
        setShowCreate(false);
      }
    });
  }

  return (
    <Shell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t("myCourses")}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isTeacher ? (lang === "ar" ? "إدارة دوراتك التعليمية" : "Manage your courses") : (lang === "ar" ? "الدورات المسجل بها" : "Your enrolled courses")}
          </p>
        </div>
        {isTeacher && (
          <Button onClick={() => setShowCreate(v => !v)} data-testid="button-toggle-create-course">
            <Plus className="w-4 h-4 mr-1 rtl:ml-1 rtl:mr-0" />
            {t("createCourse")}
          </Button>
        )}
      </div>

      {/* Create Course Form */}
      {isTeacher && showCreate && (
        <Card className="border-border/50 shadow-sm mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t("createCourse")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem><FormLabel>{lang === "ar" ? "العنوان (إنجليزي)" : "Title (English)"}</FormLabel><FormControl><Input {...field} data-testid="input-course-title" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="titleAr" render={({ field }) => (
                  <FormItem><FormLabel>{lang === "ar" ? "العنوان (عربي)" : "Title (Arabic)"}</FormLabel><FormControl><Input {...field} dir="rtl" data-testid="input-course-title-ar" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="subject" render={({ field }) => (
                  <FormItem><FormLabel>{t("subject")}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger data-testid="select-course-subject"><SelectValue /></SelectTrigger>
                      <SelectContent>{SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  <FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="gradeLevel" render={({ field }) => (
                  <FormItem><FormLabel>{t("gradeLevel")}</FormLabel><FormControl><Input {...field} placeholder="e.g. G10" data-testid="input-course-grade" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem><FormLabel>{lang === "ar" ? "السعر (EGP)" : "Price (EGP)"}</FormLabel><FormControl><Input type="number" min="0" {...field} data-testid="input-course-price" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem className="md:col-span-2"><FormLabel>{lang === "ar" ? "الوصف" : "Description"}</FormLabel><FormControl><Textarea {...field} className="resize-none h-20" data-testid="input-course-description" /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="md:col-span-2 flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>{t("cancel")}</Button>
                  <Button type="submit" disabled={createCourse.isPending} data-testid="button-create-course-submit">
                    {createCourse.isPending ? t("loading") : t("createCourse")}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Course List */}
      {isTeacher ? (
        teacherCourses.isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-48 bg-muted/30 rounded-2xl animate-pulse" />)}
          </div>
        ) : !teacherCourses.data?.courses?.length ? (
          <div className="text-center py-20">
            <BookOpen className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">{lang === "ar" ? "لم تنشئ أي دورة بعد" : "No courses yet"}</p>
            <Button className="mt-4" onClick={() => setShowCreate(true)} data-testid="button-create-first-course">{t("createCourse")}</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teacherCourses.data.courses.map((c: any) => (
              <Link key={c.id} href={`/courses/${c.id}`}>
                <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer" data-testid={`my-course-card-${c.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold text-sm flex-1">{lang === "ar" ? c.titleAr ?? c.title : c.title}</p>
                      <Badge variant={c.status === "published" ? "default" : "secondary"} className="text-xs ms-2 shrink-0">{c.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{c.subject} {c.gradeLevel ? `· ${c.gradeLevel}` : ""}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{c.enrollmentCount}</span>
                      <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{Number(c.rating ?? 0).toFixed(1)}</span>
                      <span className="font-medium text-foreground ms-auto">{Number(c.price) === 0 ? (lang === "ar" ? "مجاني" : "Free") : `${Number(c.price).toLocaleString()} EGP`}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )
      ) : (
        studentEnrollments.isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-48 bg-muted/30 rounded-2xl animate-pulse" />)}
          </div>
        ) : !studentEnrollments.data?.length ? (
          <div className="text-center py-20">
            <BookOpen className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">{lang === "ar" ? "لم تسجل في أي دورة بعد" : "No enrolled courses"}</p>
            <Link href="/courses"><Button className="mt-4">{t("courses")}</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {studentEnrollments.data.map((e) => (
              <Link key={e.id} href={`/courses/${e.courseId}`}>
                <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer" data-testid={`enrolled-course-${e.courseId}`}>
                  <CardContent className="p-4">
                    <p className="font-semibold text-sm mb-2">{e.course?.title}</p>
                    <p className="text-xs text-muted-foreground">{e.course?.subject}</p>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>{lang === "ar" ? "التقدم" : "Progress"}</span>
                        <span>{e.progress}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full">
                        <div className="h-2 bg-primary rounded-full transition-all" style={{ width: `${e.progress}%` }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )
      )}
    </Shell>
  );
}

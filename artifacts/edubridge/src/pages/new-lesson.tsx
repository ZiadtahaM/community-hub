import { Shell } from "@/components/layout/shell";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateLesson, getListLessonsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useParams, useLocation } from "wouter";

export default function NewLesson() {
  const { lang, t } = useLanguage();
  const params = useParams<{ courseId: string }>();
  const courseId = parseInt(params.courseId ?? "0");
  const qc = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const createLesson = useCreateLesson();
  const form = useForm({
    defaultValues: { title: "", titleAr: "", description: "", content: "", videoUrl: "", duration: "45", order: "1", status: "draft" }
  });

  function onSubmit(values: any) {
    createLesson.mutate({ courseId, data: { ...values, duration: parseInt(values.duration), order: parseInt(values.order) } }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListLessonsQueryKey(courseId) });
        toast({ title: lang === "ar" ? "تم إنشاء الدرس" : "Lesson created!" });
        setLocation(`/courses/${courseId}`);
      }
    });
  }

  return (
    <Shell>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{lang === "ar" ? "إنشاء درس جديد" : "Create New Lesson"}</h1>
        </div>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>{lang === "ar" ? "العنوان (إنجليزي)" : "Title"} *</FormLabel><FormControl><Input {...field} data-testid="input-lesson-title" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="titleAr" render={({ field }) => (
                    <FormItem><FormLabel>{lang === "ar" ? "العنوان (عربي)" : "Arabic Title"}</FormLabel><FormControl><Input {...field} dir="rtl" data-testid="input-lesson-title-ar" /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>{lang === "ar" ? "وصف مختصر" : "Short Description"}</FormLabel><FormControl><Input {...field} data-testid="input-lesson-description" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="content" render={({ field }) => (
                  <FormItem><FormLabel>{lang === "ar" ? "محتوى الدرس" : "Lesson Content"}</FormLabel><FormControl><Textarea {...field} className="resize-none min-h-32" data-testid="input-lesson-content" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="videoUrl" render={({ field }) => (
                  <FormItem><FormLabel>{lang === "ar" ? "رابط الفيديو (اختياري)" : "Video URL (optional)"}</FormLabel><FormControl><Input {...field} placeholder="https://youtube.com/..." data-testid="input-lesson-video" /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-3 gap-4">
                  <FormField control={form.control} name="duration" render={({ field }) => (
                    <FormItem><FormLabel>{lang === "ar" ? "المدة (دقيقة)" : "Duration (min)"}</FormLabel><FormControl><Input type="number" min="1" {...field} data-testid="input-lesson-duration" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="order" render={({ field }) => (
                    <FormItem><FormLabel>{lang === "ar" ? "الترتيب" : "Order"}</FormLabel><FormControl><Input type="number" min="1" {...field} data-testid="input-lesson-order" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem><FormLabel>{lang === "ar" ? "الحالة" : "Status"}</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger data-testid="select-lesson-status"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">{lang === "ar" ? "مسودة" : "Draft"}</SelectItem>
                          <SelectItem value="published">{lang === "ar" ? "منشور" : "Published"}</SelectItem>
                        </SelectContent>
                      </Select>
                    <FormMessage /></FormItem>
                  )} />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <Button type="button" variant="outline" onClick={() => setLocation(`/courses/${courseId}`)}>{t("cancel")}</Button>
                  <Button type="submit" disabled={createLesson.isPending} data-testid="button-create-lesson">
                    {createLesson.isPending ? t("loading") : (lang === "ar" ? "إنشاء الدرس" : "Create Lesson")}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}

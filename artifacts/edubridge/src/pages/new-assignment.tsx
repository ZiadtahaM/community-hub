import { Shell } from "@/components/layout/shell";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateAssignment, getListAssignmentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useParams, useLocation } from "wouter";

export default function NewAssignment() {
  const { lang, t } = useLanguage();
  const params = useParams<{ courseId: string }>();
  const courseId = parseInt(params.courseId ?? "0");
  const qc = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const createAssignment = useCreateAssignment();
  const form = useForm({
    defaultValues: { title: "", titleAr: "", description: "", dueDate: "", maxGrade: "100" }
  });

  function onSubmit(values: any) {
    createAssignment.mutate({ courseId, data: { ...values, maxGrade: parseFloat(values.maxGrade), dueDate: new Date(values.dueDate).toISOString() } }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListAssignmentsQueryKey(courseId) });
        toast({ title: lang === "ar" ? "تم إنشاء الواجب" : "Assignment created!" });
        setLocation(`/courses/${courseId}`);
      }
    });
  }

  return (
    <Shell>
      <div className="max-w-xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{lang === "ar" ? "إنشاء واجب جديد" : "Create New Assignment"}</h1>
        </div>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>{lang === "ar" ? "العنوان" : "Title"} *</FormLabel><FormControl><Input {...field} data-testid="input-assignment-title" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="titleAr" render={({ field }) => (
                    <FormItem><FormLabel>{lang === "ar" ? "العنوان بالعربية" : "Arabic Title"}</FormLabel><FormControl><Input {...field} dir="rtl" data-testid="input-assignment-title-ar" /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>{lang === "ar" ? "الوصف" : "Description"}</FormLabel><FormControl><Textarea {...field} className="resize-none min-h-24" data-testid="input-assignment-description" /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="dueDate" render={({ field }) => (
                    <FormItem><FormLabel>{lang === "ar" ? "موعد التسليم" : "Due Date"} *</FormLabel><FormControl><Input type="datetime-local" {...field} data-testid="input-assignment-due" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="maxGrade" render={({ field }) => (
                    <FormItem><FormLabel>{lang === "ar" ? "الدرجة الكاملة" : "Max Grade"}</FormLabel><FormControl><Input type="number" min="0" max="1000" {...field} data-testid="input-assignment-grade" /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <Button type="button" variant="outline" onClick={() => setLocation(`/courses/${courseId}`)}>{t("cancel")}</Button>
                  <Button type="submit" disabled={createAssignment.isPending} data-testid="button-create-assignment">
                    {createAssignment.isPending ? t("loading") : (lang === "ar" ? "إنشاء الواجب" : "Create Assignment")}
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

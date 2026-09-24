import { useState } from "react";
import { Shell } from "@/components/layout/shell";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  useGetAssignment, getGetAssignmentQueryKey,
  useListSubmissions, getListSubmissionsQueryKey,
  useSubmitAssignment, useGradeSubmission,
} from "@workspace/api-client-react";
import { CheckCircle, Clock, FileText } from "lucide-react";
import { useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function AssignmentDetail() {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const params = useParams<{ assignmentId: string }>();
  const assignmentId = parseInt(params.assignmentId ?? "0");
  const qc = useQueryClient();
  const { toast } = useToast();

  const [content, setContent] = useState("");
  const [gradeInput, setGradeInput] = useState<Record<number, string>>({});
  const [feedbackInput, setFeedbackInput] = useState<Record<number, string>>({});

  const assignment = useGetAssignment(assignmentId, { query: { queryKey: getGetAssignmentQueryKey(assignmentId) } });
  const submissions = useListSubmissions(assignmentId, { query: { queryKey: getListSubmissionsQueryKey(assignmentId) } });
  const submit = useSubmitAssignment();
  const grade = useGradeSubmission();

  const a = assignment.data;
  const isTeacher = user?.role === "teacher";
  const overdue = a ? new Date(a.dueDate) < new Date() : false;

  return (
    <Shell>
      {assignment.isLoading ? (
        <div className="h-40 bg-muted/30 rounded-2xl animate-pulse" />
      ) : !a ? (
        <p className="text-muted-foreground">Assignment not found.</p>
      ) : (
        <div className="max-w-3xl mx-auto space-y-4">
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h1 className="text-xl font-bold">{lang === "ar" ? a.titleAr ?? a.title : a.title}</h1>
                  <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{new Date(a.dueDate).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}</span>
                    <span>{a.maxGrade} {lang === "ar" ? "نقطة" : "pts"}</span>
                  </div>
                </div>
                <Badge variant={overdue ? "destructive" : "secondary"} className="shrink-0">
                  {overdue ? (lang === "ar" ? "انتهت المهلة" : "Overdue") : (lang === "ar" ? "نشط" : "Active")}
                </Badge>
              </div>
              {a.description && <p className="text-muted-foreground text-sm">{a.description}</p>}
            </CardContent>
          </Card>

          {/* Student Submission */}
          {!isTeacher && (
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-base">{lang === "ar" ? "إرسال الإجابة" : "Submit Answer"}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder={lang === "ar" ? "اكتب إجابتك هنا..." : "Write your answer here..."}
                  className="min-h-32"
                  data-testid="input-submission-content"
                />
                <Button
                  disabled={!content.trim() || submit.isPending || !user}
                  onClick={() => {
                    if (!user) return;
                    submit.mutate({ assignmentId, data: { studentId: user.id, content } }, {
                      onSuccess: () => {
                        qc.invalidateQueries({ queryKey: getListSubmissionsQueryKey(assignmentId) });
                        toast({ title: lang === "ar" ? "تم الإرسال" : "Submitted!" });
                        setContent("");
                      }
                    });
                  }}
                  data-testid="button-submit-assignment"
                >
                  <CheckCircle className="w-4 h-4 mr-1 rtl:ml-1 rtl:mr-0" />
                  {lang === "ar" ? "إرسال" : "Submit"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Teacher: Submissions List */}
          {isTeacher && (
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {lang === "ar" ? "إجابات الطلاب" : "Student Submissions"} ({submissions.data?.length ?? 0})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {submissions.isLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map(i => <div key={i} className="h-28 bg-muted/30 rounded-xl animate-pulse" />)}
                  </div>
                ) : !submissions.data?.length ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    {lang === "ar" ? "لا توجد إجابات بعد" : "No submissions yet"}
                  </div>
                ) : (
                  submissions.data.map((sub) => (
                    <div key={sub.id} className="p-4 border border-border/50 rounded-xl" data-testid={`submission-${sub.id}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{sub.studentName || `Student #${sub.studentId}`}</span>
                        <Badge variant={sub.status === "graded" ? "default" : "secondary"} className="text-xs">{sub.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 bg-muted/30 rounded-lg p-2">{sub.content}</p>
                      {sub.status !== "graded" ? (
                        <div className="flex gap-2 items-center">
                          <Input
                            type="number"
                            placeholder={lang === "ar" ? "الدرجة" : "Grade"}
                            className="w-24 h-8 text-sm"
                            value={gradeInput[sub.id] ?? ""}
                            onChange={e => setGradeInput(g => ({ ...g, [sub.id]: e.target.value }))}
                            max={a.maxGrade}
                            min={0}
                            data-testid={`input-grade-${sub.id}`}
                          />
                          <Input
                            placeholder={lang === "ar" ? "تعليق (اختياري)" : "Feedback (optional)"}
                            className="flex-1 h-8 text-sm"
                            value={feedbackInput[sub.id] ?? ""}
                            onChange={e => setFeedbackInput(f => ({ ...f, [sub.id]: e.target.value }))}
                            data-testid={`input-feedback-${sub.id}`}
                          />
                          <Button
                            size="sm"
                            className="h-8"
                            disabled={!gradeInput[sub.id] || grade.isPending}
                            onClick={() => {
                              grade.mutate({ submissionId: sub.id, data: { grade: parseFloat(gradeInput[sub.id]), feedback: feedbackInput[sub.id] } }, {
                                onSuccess: () => {
                                  qc.invalidateQueries({ queryKey: getListSubmissionsQueryKey(assignmentId) });
                                  toast({ title: lang === "ar" ? "تم التصحيح" : "Graded!" });
                                }
                              });
                            }}
                            data-testid={`button-grade-${sub.id}`}
                          >
                            {lang === "ar" ? "تصحيح" : "Grade"}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="font-medium">{sub.grade}/{a.maxGrade}</span>
                          {sub.feedback && <span className="text-muted-foreground">— {sub.feedback}</span>}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </Shell>
  );
}

import { useState } from "react";
import { Shell } from "@/components/layout/shell";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useListPayments, getListPaymentsQueryKey, useCreatePayment, ListPaymentsStatus } from "@workspace/api-client-react";
import { CreditCard, CheckCircle, Clock, XCircle, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  refunded: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

const STATUS_ICONS: Record<string, any> = {
  completed: CheckCircle,
  pending: Clock,
  failed: XCircle,
  refunded: RefreshCw,
};

const METHODS = ["cash", "vodafone_cash", "instapay", "card", "fawry"] as const;

export default function Payments() {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<ListPaymentsStatus | "">("");

  const payments = useListPayments(
    { userId: user?.id, status: statusFilter || undefined },
    { query: { queryKey: getListPaymentsQueryKey({ userId: user?.id, status: statusFilter || undefined }) } }
  );

  const totals = {
    completed: payments.data?.filter(p => p.status === "completed").reduce((s, p) => s + p.amount, 0) ?? 0,
    pending: payments.data?.filter(p => p.status === "pending").length ?? 0,
  };

  return (
    <Shell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t("payments")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{lang === "ar" ? "سجل المدفوعات والمعاملات المالية" : "Payment history and transactions"}</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">{lang === "ar" ? "إجمالي المدفوعات" : "Total Paid"}</p>
            <p className="text-2xl font-bold text-primary">{totals.completed.toLocaleString()} EGP</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">{lang === "ar" ? "في الانتظار" : "Pending"}</p>
            <p className="text-2xl font-bold text-amber-600">{totals.pending}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">{lang === "ar" ? "عدد المعاملات" : "Transactions"}</p>
            <p className="text-2xl font-bold">{payments.data?.length ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-3 mb-4">
        <Select value={statusFilter || "all"} onValueChange={v => setStatusFilter(v === "all" ? "" : v as ListPaymentsStatus)}>
          <SelectTrigger className="w-40" data-testid="select-payment-status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{lang === "ar" ? "كل الحالات" : "All Status"}</SelectItem>
            <SelectItem value="completed">{lang === "ar" ? "مكتمل" : "Completed"}</SelectItem>
            <SelectItem value="pending">{lang === "ar" ? "معلق" : "Pending"}</SelectItem>
            <SelectItem value="failed">{lang === "ar" ? "فشل" : "Failed"}</SelectItem>
            <SelectItem value="refunded">{lang === "ar" ? "مسترد" : "Refunded"}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payment List */}
      {payments.isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted/30 rounded-xl animate-pulse" />)}
        </div>
      ) : !payments.data?.length ? (
        <div className="text-center py-20">
          <CreditCard className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">{lang === "ar" ? "لا توجد مدفوعات بعد" : "No payments yet"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.data.map((p) => {
            const StatusIcon = STATUS_ICONS[p.status] ?? Clock;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 p-4 bg-card border border-border/50 rounded-xl"
                data-testid={`payment-row-${p.id}`}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{p.courseName || (lang === "ar" ? "دورة" : "Course")}</p>
                  <p className="text-xs text-muted-foreground">{p.method} · {new Date(p.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}</p>
                </div>
                <div className="text-end shrink-0">
                  <p className="font-bold text-sm">{p.amount.toLocaleString()} EGP</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status] ?? ""}`}>
                    {p.status}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </Shell>
  );
}

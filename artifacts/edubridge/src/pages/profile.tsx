import { Shell } from "@/components/layout/shell";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetMe, getGetMeQueryKey, useUpdateUser } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useEffect } from "react";

export default function Profile() {
  const { lang, t, setLang } = useLanguage();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  const updateUser = useUpdateUser();
  const form = useForm({
    defaultValues: {
      name: user?.name ?? "",
      nameAr: user?.nameAr ?? "",
      phone: user?.phone ?? "",
      bio: user?.bio ?? "",
      lang: user?.lang ?? "ar",
    }
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name ?? "",
        nameAr: user.nameAr ?? "",
        phone: user.phone ?? "",
        bio: user.bio ?? "",
        lang: user.lang ?? "ar",
      });
    }
  }, [user]);

  function onSubmit(values: any) {
    if (!user) return;
    updateUser.mutate({ userId: user.id, data: values }, {
      onSuccess: (updated) => {
        qc.setQueryData(getGetMeQueryKey(), updated);
        setLang(values.lang as "ar" | "en");
        toast({ title: lang === "ar" ? "تم حفظ التغييرات" : "Profile updated!" });
      }
    });
  }

  if (!user) return null;

  return (
    <Shell>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{t("profile")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{user.email}</p>
        </div>

        <Card className="border-border/50 shadow-sm mb-4">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-3xl">
                {user.name?.[0] ?? "?"}
              </div>
              <div>
                <p className="font-semibold text-lg">{user.name}</p>
                <p className="text-muted-foreground text-sm capitalize">{user.role}</p>
                {user.verified && <span className="text-xs text-green-600">{lang === "ar" ? "موثق" : "Verified"}</span>}
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>{lang === "ar" ? "الاسم (إنجليزي)" : "Name (English)"}</FormLabel><FormControl><Input {...field} data-testid="input-name" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="nameAr" render={({ field }) => (
                    <FormItem><FormLabel>{lang === "ar" ? "الاسم (عربي)" : "Name (Arabic)"}</FormLabel><FormControl><Input {...field} dir="rtl" data-testid="input-name-ar" /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem><FormLabel>{t("phone")}</FormLabel><FormControl><Input {...field} type="tel" data-testid="input-phone" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="bio" render={({ field }) => (
                  <FormItem><FormLabel>{lang === "ar" ? "نبذة عني" : "Bio"}</FormLabel><FormControl><Textarea {...field} className="resize-none h-24" data-testid="input-bio" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="lang" render={({ field }) => (
                  <FormItem><FormLabel>{lang === "ar" ? "اللغة المفضلة" : "Preferred Language"}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger data-testid="select-lang"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ar">العربية</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  <FormMessage /></FormItem>
                )} />
                <Button type="submit" disabled={updateUser.isPending} data-testid="button-save-profile">
                  {updateUser.isPending ? t("loading") : t("save")}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}

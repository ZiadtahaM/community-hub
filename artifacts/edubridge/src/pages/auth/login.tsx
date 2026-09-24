import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function Login() {
  const { t, lang } = useLanguage();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    try {
      setIsLoading(true);
      await login(values);
    } catch (error) {
      toast({
        title: t("error"),
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <div className="hidden md:flex flex-1 bg-primary items-center justify-center p-12 relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
         <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-primary/40"></div>
         <div className="relative z-10 text-primary-foreground max-w-lg">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white font-bold text-3xl mb-8 border border-white/20 shadow-xl">
              E
            </div>
            <h1 className="text-5xl font-bold mb-6 leading-tight">{t("loginWelcome")}</h1>
            <p className="text-xl text-primary-foreground/80 leading-relaxed">
              {lang === 'ar' ? 'ادخل إلى عالم جديد من التعليم التفاعلي.' : 'Enter a new world of interactive education.'}
            </p>
         </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-8 bg-card p-8 sm:p-10 rounded-3xl shadow-xl border border-border">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">{t("login")}</h2>
            <p className="text-muted-foreground mt-2">{t("loginWelcome")}</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("email")}</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" className="h-12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("password")}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" className="h-12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full h-12 text-lg shadow-md" disabled={isLoading}>
                {isLoading ? t("loading") : t("login")}
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm text-muted-foreground">
            {t("dontHaveAccount")}{" "}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              {t("register")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

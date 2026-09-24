import { Shell } from "@/components/layout/shell";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Moon, Sun, Globe } from "lucide-react";

export default function Settings() {
  const { lang, setLang, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();

  return (
    <Shell>
      <div className="max-w-lg mx-auto space-y-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{t("settings")}</h1>
        </div>

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Globe className="w-4 h-4" />{lang === "ar" ? "اللغة" : "Language"}</CardTitle></CardHeader>
          <CardContent className="flex gap-2">
            <Button
              variant={lang === "ar" ? "default" : "outline"}
              onClick={() => setLang("ar")}
              data-testid="button-lang-ar"
            >
              العربية
            </Button>
            <Button
              variant={lang === "en" ? "default" : "outline"}
              onClick={() => setLang("en")}
              data-testid="button-lang-en"
            >
              English
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2">
            {theme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            {lang === "ar" ? "المظهر" : "Appearance"}
          </CardTitle></CardHeader>
          <CardContent className="flex gap-2">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              onClick={() => setTheme("light")}
              data-testid="button-theme-light"
            >
              <Sun className="w-4 h-4 mr-1 rtl:ml-1 rtl:mr-0" />
              {lang === "ar" ? "فاتح" : "Light"}
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              onClick={() => setTheme("dark")}
              data-testid="button-theme-dark"
            >
              <Moon className="w-4 h-4 mr-1 rtl:ml-1 rtl:mr-0" />
              {lang === "ar" ? "داكن" : "Dark"}
            </Button>
            <Button
              variant={theme === "system" ? "default" : "outline"}
              onClick={() => setTheme("system")}
              data-testid="button-theme-system"
            >
              {lang === "ar" ? "تلقائي" : "System"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base">{lang === "ar" ? "الحساب" : "Account"}</CardTitle></CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={logout} data-testid="button-logout">
              {t("logout")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { Link } from "wouter";
import { BookOpen, Users, BarChart3, Globe, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { t, lang } = useLanguage();

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <header className="py-6 px-6 md:px-12 flex justify-between items-center border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
            E
          </div>
          <span className="font-bold text-2xl tracking-tight text-primary">EduBridge</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost" className="font-medium">{t("login")}</Button>
          </Link>
          <Link href="/register">
            <Button className="shadow-md shadow-primary/20">{t("getStarted")}</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 md:py-32 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
                {t("heroTitle")}
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
                {t("heroSubtitle")}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/register">
                  <Button size="lg" className="text-lg px-8 h-14 shadow-xl shadow-primary/20 w-full sm:w-auto">
                    {t("getStarted")}
                    <ArrowRight className="ml-2 rtl:mr-2 rtl:ml-0 w-5 h-5 rtl:rotate-180" />
                  </Button>
                </Link>
                <Link href="/courses">
                   <Button size="lg" variant="outline" className="text-lg px-8 h-14 bg-background/50 backdrop-blur-sm w-full sm:w-auto">
                    {t("learnMore")}
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-24 bg-card/30 border-y border-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <motion.div 
                className="bg-card p-8 rounded-2xl shadow-sm border border-border"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{lang === 'ar' ? 'مجتمع متصل' : 'Connected Community'}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {lang === 'ar' ? 'تواصل مع المعلمين والطلاب في بيئة تعليمية تفاعلية تشبه وسائل التواصل الاجتماعي.' : 'Connect with teachers and students in an interactive, social-media-like learning environment.'}
                </p>
              </motion.div>

              <motion.div 
                className="bg-card p-8 rounded-2xl shadow-sm border border-border"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-14 h-14 bg-secondary/20 text-secondary-foreground rounded-xl flex items-center justify-center mb-6">
                  <BookOpen className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{lang === 'ar' ? 'محتوى غني' : 'Rich Content'}</h3>
                <p className="text-muted-foreground leading-relaxed">
                   {lang === 'ar' ? 'وصول غير محدود إلى دورات، دروس، وملفات تعليمية عالية الجودة.' : 'Unlimited access to high-quality courses, lessons, and educational resources.'}
                </p>
              </motion.div>

              <motion.div 
                className="bg-card p-8 rounded-2xl shadow-sm border border-border"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                  <BarChart3 className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{lang === 'ar' ? 'تتبع التقدم' : 'Track Progress'}</h3>
                <p className="text-muted-foreground leading-relaxed">
                   {lang === 'ar' ? 'أدوات قوية للطلاب والمعلمين وأولياء الأمور لمتابعة الأداء لحظة بلحظة.' : 'Powerful tools for students, teachers, and parents to track performance in real-time.'}
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 px-6 border-t border-border bg-card">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-80">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm">
              E
            </div>
            <span className="font-bold text-lg text-primary">EduBridge</span>
          </div>
          <p className="text-muted-foreground text-sm text-center md:text-left">
            © {new Date().getFullYear()} EduBridge Egypt. {lang === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
          </p>
        </div>
      </footer>
    </div>
  );
}

import { useState } from "react";
import { Shell } from "@/components/layout/shell";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useListTeachers, getListTeachersQueryKey } from "@workspace/api-client-react";
import { Star, Users, BookOpen, Search } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Teachers() {
  const { lang, t } = useLanguage();
  const [search, setSearch] = useState("");

  const teachers = useListTeachers(
    { search: search || undefined },
    { query: { queryKey: getListTeachersQueryKey({ search: search || undefined }) } }
  );

  return (
    <Shell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t("teachers")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{lang === "ar" ? "تواصل مع أفضل المعلمين في مصر" : "Connect with Egypt's best educators"}</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={lang === "ar" ? "ابحث عن معلم..." : "Search teachers..."}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="ps-9 max-w-md"
          data-testid="input-teacher-search"
        />
      </div>

      {teachers.isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-52 bg-muted/30 rounded-2xl animate-pulse" />)}
        </div>
      ) : !teachers.data?.teachers?.length ? (
        <div className="text-center py-16 text-muted-foreground">{t("noResults")}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teachers.data.teachers.map((t: any, i: number) => (
            <motion.div
              key={t.user?.id ?? i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              data-testid={`card-teacher-${t.user?.id}`}
            >
              <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                      {t.user?.name?.[0] ?? "T"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{lang === "ar" ? t.user?.nameAr ?? t.user?.name : t.user?.name}</p>
                      <p className="text-xs text-muted-foreground">{t.subject}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-medium">{Number(t.rating).toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground">({t.reviewCount})</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{t.totalStudents}</span>
                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{t.totalCourses}</span>
                    {t.hourlyRate && <span className="font-medium text-foreground">{t.hourlyRate} {t.currency}/hr</span>}
                  </div>
                  <div className="flex gap-2 flex-wrap mb-3">
                    {t.tags?.slice(0, 3).map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                  <Link href={`/teachers/${t.user?.id}`}>
                    <Button variant="outline" size="sm" className="w-full" data-testid={`button-view-teacher-${t.user?.id}`}>
                      {lang === "ar" ? "عرض الملف الشخصي" : "View Profile"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </Shell>
  );
}

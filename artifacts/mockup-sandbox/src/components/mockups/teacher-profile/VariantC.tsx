import { useState } from "react";

const monthlyData = [
  { m: "Jan", rev: 3200 }, { m: "Feb", rev: 4100 }, { m: "Mar", rev: 3800 },
  { m: "Apr", rev: 5200 }, { m: "May", rev: 4700 }, { m: "Jun", rev: 6100 },
];
const maxRev = Math.max(...monthlyData.map(d => d.rev));

const recentActivity = [
  { type: "submission", text: "Ahmed submitted Homework 3", time: "2m ago", color: "bg-blue-500" },
  { type: "enrollment", text: "Nour Khalil enrolled in Algebra", time: "15m ago", color: "bg-green-500" },
  { type: "message", text: "Parent inquiry from Mona's mom", time: "1h ago", color: "bg-purple-500" },
  { type: "payment", text: "Payment received — 600 EGP", time: "2h ago", color: "bg-amber-500" },
];

export function VariantC() {
  const [lang, setLang] = useState<"en" | "ar">("en");

  return (
    <div className="min-h-screen bg-[#F0FDF8] font-sans" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Top Bar */}
      <div className="bg-[#0F766E] text-white px-6 h-14 flex items-center gap-4">
        <span className="font-bold text-lg">EduBridge</span>
        <div className="flex-1" />
        <button
          onClick={() => setLang(l => l === "en" ? "ar" : "en")}
          className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm transition-colors"
        >
          {lang === "en" ? "العربية" : "English"}
        </button>
        <div className="w-8 h-8 rounded-full bg-teal-300 flex items-center justify-center text-teal-900 font-bold text-sm">ك</div>
      </div>

      <div className="flex">
        {/* Left Nav */}
        <aside className="w-16 bg-[#0F766E] min-h-screen flex flex-col items-center py-4 gap-3">
          {["🏠", "📚", "📝", "👥", "💬", "💳", "⚙️"].map((icon, i) => (
            <button key={i} className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${i === 1 ? "bg-white/20 text-white" : "text-white/50 hover:text-white hover:bg-white/10"}`}>
              {icon}
            </button>
          ))}
        </aside>

        <main className="flex-1 p-6 overflow-y-auto">
          {/* Teacher Card */}
          <div className="bg-white rounded-2xl p-6 mb-6 flex items-center gap-5 shadow-sm border border-teal-100">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              ك
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-xl font-bold text-gray-900">{lang === "ar" ? "كريم منصور" : "Karim Mansour"}</h1>
                <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">★ 4.8</span>
              </div>
              <p className="text-gray-500 text-sm">{lang === "ar" ? "فيزياء · الصف الثاني والثالث الثانوي" : "Physics · Grades 11-12"}</p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[["156", lang === "ar" ? "طالب" : "Students"], ["9", lang === "ar" ? "كورس" : "Courses"], ["4,920 EGP", lang === "ar" ? "هذا الشهر" : "This Month"]].map(([v, l]) => (
                <div key={l}>
                  <p className="text-xl font-bold text-teal-700">{v}</p>
                  <p className="text-xs text-gray-400">{l}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-5">
            {/* Revenue Chart */}
            <div className="col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-teal-100">
              <h3 className="font-semibold text-gray-800 mb-4">{lang === "ar" ? "الإيرادات الشهرية" : "Monthly Revenue"}</h3>
              <div className="flex items-end gap-3 h-32">
                {monthlyData.map((d) => (
                  <div key={d.m} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-teal-700 font-medium">{(d.rev / 1000).toFixed(1)}k</span>
                    <div
                      className="w-full bg-teal-500 rounded-t-lg transition-all hover:bg-teal-400"
                      style={{ height: `${(d.rev / maxRev) * 100}px` }}
                    />
                    <span className="text-xs text-gray-400">{d.m}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-teal-100">
              <h3 className="font-semibold text-gray-800 mb-4">{lang === "ar" ? "آخر النشاطات" : "Recent Activity"}</h3>
              <div className="space-y-3">
                {recentActivity.map((a, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${a.color}`} />
                    <div>
                      <p className="text-xs text-gray-700">{a.text}</p>
                      <p className="text-xs text-gray-400">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Lesson Creator */}
            <div className="col-span-3 bg-white rounded-2xl p-5 shadow-sm border border-teal-100">
              <h3 className="font-semibold text-gray-800 mb-4">{lang === "ar" ? "إنشاء درس جديد" : "Create New Lesson"}</h3>
              <div className="grid grid-cols-4 gap-4">
                <input className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400" placeholder={lang === "ar" ? "عنوان الدرس" : "Lesson title"} />
                <input dir="rtl" className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 text-right" placeholder="العنوان بالعربية" />
                <select className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-500 focus:outline-none focus:border-teal-400">
                  <option>{lang === "ar" ? "اختر الكورس" : "Select course"}</option>
                  <option>Physics G11</option>
                  <option>Physics G12</option>
                </select>
                <input type="number" className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" placeholder={lang === "ar" ? "المدة (دقيقة)" : "Duration (min)"} />
                <textarea className="col-span-3 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none h-20" placeholder={lang === "ar" ? "محتوى الدرس..." : "Lesson content..."} />
                <div className="flex flex-col gap-2">
                  <button className="flex-1 bg-teal-600 text-white font-semibold text-sm py-2 rounded-xl hover:bg-teal-700 transition-colors">{lang === "ar" ? "حفظ مسودة" : "Save Draft"}</button>
                  <button className="flex-1 bg-emerald-500 text-white font-semibold text-sm py-2 rounded-xl hover:bg-emerald-600 transition-colors">{lang === "ar" ? "نشر" : "Publish"}</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

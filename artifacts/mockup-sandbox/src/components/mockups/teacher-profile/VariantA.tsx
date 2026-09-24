import { useState } from "react";

const lessons = [
  { id: 1, title: "Introduction to Algebra", duration: "45 min", students: 24, status: "published" },
  { id: 2, title: "Linear Equations", duration: "60 min", students: 24, status: "published" },
  { id: 3, title: "Quadratic Functions", duration: "50 min", students: 18, status: "draft" },
];

const stats = [
  { label: "Students", value: "142", delta: "+8 this week" },
  { label: "Courses", value: "6", delta: "2 active" },
  { label: "Rating", value: "4.9", delta: "from 87 reviews" },
  { label: "Revenue", value: "12,400 EGP", delta: "+18% this month" },
];

export function VariantA() {
  const [activeTab, setActiveTab] = useState("lessons");

  return (
    <div className="min-h-screen bg-[#0A1628] text-white font-sans flex" dir="ltr">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0D1F3C] border-r border-white/10 flex flex-col p-4 gap-2">
        <div className="px-2 py-4 mb-2">
          <span className="text-[#38BDF8] font-bold text-xl tracking-tight">EduBridge</span>
        </div>
        {["Dashboard", "My Courses", "Lessons", "Assignments", "Students", "Messages", "Payments", "Settings"].map((item) => (
          <button
            key={item}
            className={`text-left px-3 py-2 rounded-lg text-sm transition-all ${item === "Lessons" ? "bg-[#1E3A5F] text-[#38BDF8] font-semibold" : "text-white/60 hover:text-white hover:bg-white/5"}`}
          >
            {item}
          </button>
        ))}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0D1F3C] to-[#1A3A5C] p-8 flex items-end gap-6">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#38BDF8] to-[#0EA5E9] flex items-center justify-center text-3xl font-bold shadow-lg shadow-[#38BDF8]/20">
            MA
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold">Mohamed Aly</h1>
              <span className="bg-[#38BDF8]/20 text-[#38BDF8] text-xs px-2 py-0.5 rounded-full border border-[#38BDF8]/30">Verified Teacher</span>
            </div>
            <p className="text-white/60 text-sm">Mathematics · Grades 9-12 · Cairo, Egypt</p>
            <p className="text-white/40 text-xs mt-1">Member since Jan 2023</p>
          </div>
          <button className="bg-[#38BDF8] text-[#0A1628] font-semibold text-sm px-4 py-2 rounded-lg hover:bg-[#7DD3FC] transition-colors">
            Edit Profile
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 p-6">
          {stats.map((s) => (
            <div key={s.label} className="bg-[#0D1F3C] rounded-xl p-4 border border-white/5">
              <p className="text-white/40 text-xs mb-1">{s.label}</p>
              <p className="text-white text-2xl font-bold">{s.value}</p>
              <p className="text-[#38BDF8] text-xs mt-1">{s.delta}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="px-6">
          <div className="flex gap-1 bg-[#0D1F3C] rounded-lg p-1 w-fit mb-6">
            {["lessons", "assignments", "students", "announcements"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-sm capitalize transition-all ${activeTab === tab ? "bg-[#38BDF8] text-[#0A1628] font-semibold" : "text-white/50 hover:text-white"}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Lesson Creation Panel */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="col-span-2 space-y-3">
              {lessons.map((lesson) => (
                <div key={lesson.id} className="bg-[#0D1F3C] border border-white/5 rounded-xl p-4 flex items-center gap-4 hover:border-[#38BDF8]/30 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-[#1E3A5F] flex items-center justify-center text-[#38BDF8] font-bold text-sm">
                    L{lesson.id}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{lesson.title}</p>
                    <p className="text-white/40 text-xs">{lesson.duration} · {lesson.students} students</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${lesson.status === "published" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                    {lesson.status}
                  </span>
                  <button className="text-white/40 hover:text-white text-xs">Edit</button>
                </div>
              ))}
            </div>

            {/* Quick Create Panel */}
            <div className="bg-[#0D1F3C] border border-[#38BDF8]/20 rounded-xl p-4">
              <h3 className="font-semibold text-sm mb-3 text-[#38BDF8]">New Lesson</h3>
              <div className="space-y-3">
                <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm placeholder-white/30 focus:outline-none focus:border-[#38BDF8]/50" placeholder="Lesson title" />
                <textarea className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm placeholder-white/30 focus:outline-none focus:border-[#38BDF8]/50 resize-none h-20" placeholder="Description..." />
                <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/60 focus:outline-none">
                  <option>Select course</option>
                  <option>Mathematics G10</option>
                  <option>Algebra Basics</option>
                </select>
                <input type="number" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm placeholder-white/30 focus:outline-none" placeholder="Duration (mins)" />
                <button className="w-full bg-[#38BDF8] text-[#0A1628] font-semibold text-sm py-2 rounded-lg hover:bg-[#7DD3FC] transition-colors">
                  Create Lesson
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

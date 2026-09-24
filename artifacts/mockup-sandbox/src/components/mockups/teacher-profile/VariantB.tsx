import { useState } from "react";

const courses = [
  { id: 1, name: "Mathematics G10", students: 48, lessons: 12, revenue: "4,800 EGP", completion: 72 },
  { id: 2, name: "Algebra Basics", students: 31, lessons: 8, revenue: "2,480 EGP", completion: 55 },
  { id: 3, name: "Calculus Advanced", students: 22, lessons: 15, revenue: "3,300 EGP", completion: 88 },
];

export function VariantB() {
  const [selected, setSelected] = useState(1);

  const activeCourse = courses.find(c => c.id === selected)!;

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans flex" dir="ltr">
      {/* Top Nav */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center px-6 z-10 gap-6">
        <span className="font-bold text-amber-700 text-lg">EduBridge</span>
        <nav className="flex gap-4 text-sm text-gray-500 ml-6">
          {["Dashboard", "Courses", "Students", "Messages", "Analytics"].map(n => (
            <a key={n} className={`hover:text-amber-700 transition-colors ${n === "Courses" ? "text-amber-700 font-semibold" : ""}`}>{n}</a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 font-bold text-sm">S</div>
          <span className="text-sm font-medium text-gray-700">Sarah Hassan</span>
        </div>
      </div>

      <div className="pt-14 flex w-full">
        {/* Course List Sidebar */}
        <aside className="w-72 bg-white border-r border-gray-200 flex flex-col p-4 gap-2 min-h-screen">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-800">My Courses</h2>
            <button className="bg-amber-500 text-white text-xs px-2.5 py-1 rounded-lg hover:bg-amber-600 transition-colors">+ New</button>
          </div>
          {courses.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c.id)}
              className={`text-left p-3 rounded-xl border transition-all ${selected === c.id ? "bg-amber-50 border-amber-200" : "border-transparent hover:bg-gray-50"}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {c.name[0]}
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-medium truncate ${selected === c.id ? "text-amber-800" : "text-gray-700"}`}>{c.name}</p>
                  <p className="text-xs text-gray-400">{c.students} students · {c.lessons} lessons</p>
                </div>
              </div>
              <div className="mt-2 bg-gray-100 rounded-full h-1.5">
                <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${c.completion}%` }} />
              </div>
            </button>
          ))}
        </aside>

        {/* Course Detail + Lesson Creator */}
        <main className="flex-1 p-6">
          {/* Course Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-1">{activeCourse.name}</h1>
                <p className="text-white/80 text-sm">{activeCourse.students} enrolled · {activeCourse.lessons} lessons · {activeCourse.revenue}</p>
              </div>
              <div className="flex gap-2">
                <button className="bg-white/20 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-white/30 transition-colors">Publish</button>
                <button className="bg-white text-amber-600 font-semibold text-sm px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors">Edit Course</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Lesson Creator */}
            <div className="col-span-1 bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-800 mb-4">Add Lesson</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Title</label>
                  <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30" placeholder="e.g. Introduction to..." />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Arabic Title</label>
                  <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400 text-right" dir="rtl" placeholder="العنوان بالعربية" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Content</label>
                  <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400 resize-none h-24" placeholder="Lesson content..." />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Duration (min)</label>
                    <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" placeholder="45" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Order</label>
                    <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" placeholder="1" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Video URL</label>
                  <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" placeholder="https://..." />
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 bg-amber-500 text-white font-semibold text-sm py-2 rounded-lg hover:bg-amber-600 transition-colors">Save Draft</button>
                  <button className="flex-1 bg-amber-600 text-white font-semibold text-sm py-2 rounded-lg hover:bg-amber-700 transition-colors">Publish</button>
                </div>
              </div>
            </div>

            {/* Lesson List */}
            <div className="col-span-2 bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">Lessons ({activeCourse.lessons})</h3>
                <span className="text-xs text-gray-400">{activeCourse.completion}% completed by students</span>
              </div>
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-700 font-bold text-sm">{i + 1}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{["Introduction to Algebra", "Variables & Constants", "Linear Equations", "Solving Inequalities"][i]}</p>
                      <p className="text-xs text-gray-400">{[45, 60, 50, 40][i]} min · {[48, 44, 39, 31][i]} views</p>
                    </div>
                    <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-200">Published</span>
                    <div className="flex gap-1">
                      <button className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded">Edit</button>
                      <button className="text-xs text-gray-400 hover:text-red-500 px-2 py-1 rounded">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

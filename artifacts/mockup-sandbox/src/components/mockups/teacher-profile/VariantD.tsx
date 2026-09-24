import { useState } from "react";

const steps = ["Basic Info", "Content", "Schedule", "Preview"];

export function VariantD() {
  const [step, setStep] = useState(0);
  const [lessonData, setLessonData] = useState({ title: "", titleAr: "", content: "", duration: "", videoUrl: "", order: "" });

  return (
    <div className="min-h-screen bg-white font-sans" dir="ltr">
      {/* Minimal Top Bar */}
      <header className="border-b border-gray-100 px-6 h-12 flex items-center gap-4">
        <span className="font-semibold text-gray-900 text-sm">EduBridge</span>
        <span className="text-gray-300">/</span>
        <span className="text-gray-500 text-sm">Dr. Layla Fahmy</span>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-900 font-medium">New Lesson</span>
        <div className="ml-auto flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-xs">LF</div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Teacher Header — minimal */}
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-400 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">LF</div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Dr. Layla Fahmy</h1>
            <p className="text-sm text-gray-400">Chemistry · Al-Azhar University grad · 12 years experience</p>
          </div>
          <div className="ml-auto flex items-center gap-6 text-center">
            {[["98", "Students"], ["7", "Courses"], ["4.9★", "Rating"]].map(([v, l]) => (
              <div key={l}>
                <p className="font-semibold text-gray-900">{v}</p>
                <p className="text-xs text-gray-400">{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stepped Lesson Creator */}
        <div className="max-w-2xl mx-auto">
          {/* Step Indicator */}
          <div className="flex items-center gap-0 mb-8">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-initial">
                <button
                  onClick={() => setStep(i)}
                  className={`flex items-center gap-2 group`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${i < step ? "bg-violet-600 text-white" : i === step ? "bg-violet-600 text-white ring-4 ring-violet-100" : "bg-gray-100 text-gray-400"}`}>
                    {i < step ? "✓" : i + 1}
                  </div>
                  <span className={`text-sm transition-colors ${i === step ? "text-gray-900 font-medium" : "text-gray-400"}`}>{s}</span>
                </button>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-px mx-3 ${i < step ? "bg-violet-300" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="space-y-5">
            {step === 0 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Lesson Title <span className="text-red-400">*</span></label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-all"
                    placeholder="e.g. Introduction to Organic Chemistry"
                    value={lessonData.title}
                    onChange={e => setLessonData(d => ({...d, title: e.target.value}))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">العنوان بالعربية</label>
                  <input
                    dir="rtl"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-all text-right"
                    placeholder="مقدمة في الكيمياء العضوية"
                    value={lessonData.titleAr}
                    onChange={e => setLessonData(d => ({...d, titleAr: e.target.value}))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration (minutes)</label>
                    <input type="number" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-200" placeholder="45" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Lesson Order</label>
                    <input type="number" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-200" placeholder="1" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Course</label>
                  <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-200">
                    <option>Select a course...</option>
                    <option>Organic Chemistry G11</option>
                    <option>Physical Chemistry G12</option>
                    <option>Chemistry Basics</option>
                  </select>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Lesson Content</label>
                  <textarea
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 resize-none h-40"
                    placeholder="Write your lesson content here. You can include explanations, key concepts, and notes..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Video URL (optional)</label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-200"
                    placeholder="https://youtube.com/..."
                  />
                  <p className="text-xs text-gray-400 mt-1">YouTube, Vimeo, or direct video links supported</p>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Schedule Date & Time</label>
                  <input
                    type="datetime-local"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-200"
                  />
                </div>
                <div className="flex items-center gap-3 p-4 bg-violet-50 rounded-xl border border-violet-100">
                  <input type="checkbox" id="notify" className="w-4 h-4 accent-violet-600" />
                  <label htmlFor="notify" className="text-sm text-gray-700">Notify enrolled students when published</label>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <input type="checkbox" id="draft" className="w-4 h-4 accent-violet-600" defaultChecked />
                  <label htmlFor="draft" className="text-sm text-gray-700">Save as draft (publish later)</label>
                </div>
              </>
            )}

            {step === 3 && (
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-3">Lesson Preview</h3>
                <div className="space-y-2">
                  <div className="flex gap-2"><span className="text-xs font-medium text-gray-500 w-24">Title:</span><span className="text-sm text-gray-700">{lessonData.title || "Not set"}</span></div>
                  <div className="flex gap-2"><span className="text-xs font-medium text-gray-500 w-24">Arabic:</span><span className="text-sm text-gray-700 font-arabic">{lessonData.titleAr || "لم يُحدد"}</span></div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button className="flex-1 border border-gray-200 text-gray-600 font-medium text-sm py-2.5 rounded-xl hover:bg-gray-100 transition-colors">Save Draft</button>
                  <button className="flex-1 bg-violet-600 text-white font-semibold text-sm py-2.5 rounded-xl hover:bg-violet-700 transition-colors">Publish Lesson</button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-5 border-t border-gray-100">
            <button
              onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0}
              className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30 transition-colors"
            >
              Back
            </button>
            {step < steps.length - 1 && (
              <button
                onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))}
                className="bg-violet-600 text-white font-semibold text-sm px-5 py-2 rounded-xl hover:bg-violet-700 transition-colors"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

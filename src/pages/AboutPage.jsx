import { appCopy } from '../config/experience'
import { Btn, Panel } from '../components/UI'

export default function AboutPage({ onNav }) {
  return (
    <div className="space-y-6">
      <Panel className="max-w-4xl">
        <div className="mb-3 text-xs uppercase tracking-[0.3em] text-[#2DFF9A]/80">About</div>
        <h1 className="max-w-2xl text-2xl sm:text-3xl md:text-4xl font-semibold text-white">{appCopy.about.title}</h1>
        <div className="mt-6 sm:mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {appCopy.about.sections.map((section) => (
            <div key={section.heading} className="rounded-[1.5rem] sm:rounded-[1.75rem] border border-[#2DFF9A]/10 bg-[#0B1F18]/30 p-4 sm:p-5">
              <div className="mb-2 text-base sm:text-lg font-medium text-white">{section.heading}</div>
              <p className="text-sm leading-7 text-slate-300">{section.body}</p>
            </div>
          ))}
        </div>
      </Panel>
      <div className="flex flex-col sm:flex-row gap-3">
        <Btn onClick={() => onNav('registration')}>Go to Registration</Btn>
        <Btn variant="secondary" onClick={() => onNav('round')}>
          Start
        </Btn>
      </div>
    </div>
  )
}

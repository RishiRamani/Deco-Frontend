import { appCopy } from '../config/experience'
import { Btn, Panel } from '../components/UI'

export default function AboutPage({ onNav }) {
  return (
    <div className="space-y-6">
      <Panel className="max-w-4xl">
        <div className="mb-3 text-xs uppercase tracking-[0.3em] text-cyan-200/80">About</div>
        <h1 className="max-w-2xl text-4xl font-semibold text-white">{appCopy.about.title}</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {appCopy.about.sections.map((section) => (
            <div key={section.heading} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
              <div className="mb-2 text-lg font-medium text-white">{section.heading}</div>
              <p className="text-sm leading-7 text-slate-300">{section.body}</p>
            </div>
          ))}
        </div>
      </Panel>
      <div className="flex gap-3">
        <Btn onClick={() => onNav('registration')}>Go to Registration</Btn>
        <Btn variant="secondary" onClick={() => onNav('round')}>
          Start
        </Btn>
      </div>
    </div>
  )
}

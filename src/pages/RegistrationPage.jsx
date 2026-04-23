import { appCopy } from '../config/experience'
import { Btn, Panel } from '../components/UI'

export default function RegistrationPage({ onNav }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      <Panel>
        <div className="mb-3 text-xs uppercase tracking-[0.3em] text-amber-200/80">Registration</div>
        <h1 className="text-4xl font-semibold text-white">{appCopy.registration.title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">{appCopy.registration.body}</p>
        <div className="mt-8 space-y-3">
          {appCopy.registration.checklist.map((item, index) => (
            <div key={item} className="flex gap-3 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-300 text-sm font-semibold text-slate-950">
                {index + 1}
              </div>
              <div className="text-sm leading-7 text-slate-200">{item}</div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel className="h-fit">
        <div className="text-lg font-medium text-white">Quick actions</div>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          If you are already registered, you can jump straight into the active round flow. If not, the backend whitelist check will stop access automatically.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Btn onClick={() => onNav('round')}>Check active round</Btn>
          <Btn variant="secondary" onClick={() => onNav('leaderboard')}>
            View leaderboard
          </Btn>
        </div>
      </Panel>
    </div>
  )
}

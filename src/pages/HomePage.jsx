import { appCopy } from '../config/experience'
import { Btn, Panel } from '../components/UI'

export default function HomePage({ onNav }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Panel className="overflow-hidden">
        <div className="relative">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-300/20 blur-3xl" />
          <div className="absolute left-12 top-28 h-36 w-36 rounded-full bg-cyan-300/15 blur-3xl" />
          <div className="relative">
            <div className="mb-4 text-xs uppercase tracking-[0.35em] text-amber-200/80">{appCopy.home.eyebrow}</div>
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight text-white sm:text-6xl">
              {appCopy.home.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300">{appCopy.home.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Btn onClick={() => onNav('round')}>Start</Btn>
              {appCopy.home.buttons.map((button) => (
                <Btn key={button.id} variant="secondary" onClick={() => onNav(button.id)}>
                  {button.label}
                </Btn>
              ))}
            </div>
          </div>
        </div>
      </Panel>

      <div className="grid gap-6">
        <Panel>
          <div className="text-lg font-medium text-white">Menu</div>
          <div className="mt-5 space-y-4 text-sm leading-7 text-slate-300">
            <p>Use Start to enter the current playable round.</p>
            <p>Leaderboard shows cumulative standings.</p>
            <p>About and Registration are available from here.</p>
          </div>
        </Panel>

        <div className="grid gap-4 sm:grid-cols-3">
          {appCopy.home.stats.map((stat) => (
            <Panel key={stat.label} className="p-5">
              <div className="text-3xl font-semibold text-white">{stat.value}</div>
              <div className="mt-2 text-xs uppercase tracking-[0.25em] text-slate-400">{stat.label}</div>
            </Panel>
          ))}
        </div>
      </div>
    </div>
  )
}

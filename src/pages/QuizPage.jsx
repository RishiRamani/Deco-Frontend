import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion'
import { useApi } from '../hooks/useApi'
import { Btn, Alert, Spinner } from '../components/UI'

// ─────────────────────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────────────────────
const isImageUrl = (s) => {
  if (typeof s !== 'string') return false
  const t = s.trim()
  return /^https?:\/\//i.test(t) && /\.(png|jpe?g|gif|webp|svg|avif|bmp)(\?.*)?$/i.test(t)
}

const displayKey = (key, index) => {
  const num = Number(key)
  if (!isNaN(num)) return String(num + 1)
  return key.toUpperCase()
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFETTI
// ─────────────────────────────────────────────────────────────────────────────
const CONF_COLORS = ['#f97316','#fb923c','#fbbf24','#34d399','#60a5fa','#f472b6','#a78bfa']

function ConfettiBurst({ x, y, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 1200); return () => clearTimeout(t) }, [])
  return (
    <div className="fixed pointer-events-none z-[9999]" style={{ left: x, top: y }}>
      {Array.from({ length: 16 }, (_, i) => {
        const angle = (i / 16) * 360
        const tx = Math.cos((angle * Math.PI) / 180) * (40 + Math.random() * 50) * 2
        const ty = Math.sin((angle * Math.PI) / 180) * (40 + Math.random() * 50) * 2 + 30
        return (
          <motion.div key={i} className="absolute"
            style={{ width: i%3===0?8:5, height: i%3===0?8:11, borderRadius: i%2===0?2:50, background: CONF_COLORS[i%CONF_COLORS.length] }}
            initial={{ x:0, y:0, opacity:1, rotate:0 }}
            animate={{ x: tx, y: ty, opacity:0, rotate: (Math.random()>0.5?1:-1)*360 }}
            transition={{ duration: 0.7+Math.random()*0.4, delay: i*0.025, ease:'easeOut' }}
          />
        )
      })}
    </div>
  )
}

function PointsFloat({ pts, x, y, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 1100); return () => clearTimeout(t) }, [])
  return (
    <motion.div className="fixed pointer-events-none z-[9999] select-none font-black text-[26px]"
      style={{ left:x, top:y, color:'#f97316', textShadow:'0 0 24px rgba(249,115,22,0.9)', fontFamily:'Syne,sans-serif' }}
      initial={{ opacity:1, y:0, scale:1 }}
      animate={{ opacity:0, y:-60, scale:1.15 }}
      transition={{ duration:1, ease:'easeOut' }}
    >+{pts}</motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// LAZY IMG
// ─────────────────────────────────────────────────────────────────────────────
function LazyImg({ src, alt='', wrapClass='', imgClass='' }) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)
  if (errored) return null
  return (
    <div className={`relative ${!loaded?'min-h-[60px]':''} ${wrapClass}`}>
      {!loaded && (
        <div className="absolute inset-0 rounded-xl overflow-hidden bg-white/5">
          <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{ x:['-100%','100%'] }} transition={{ duration:1.4, repeat:Infinity, ease:'easeInOut' }}/>
        </div>
      )}
      <motion.img src={src} alt={alt}
        onLoad={()=>setLoaded(true)} onError={()=>setErrored(true)}
        className={imgClass}
        initial={{ opacity:0, scale:0.95, filter:'blur(8px)' }}
        animate={loaded?{ opacity:1, scale:1, filter:'blur(0px)' }:{}}
        transition={{ duration:0.45, ease:[0.22,1,0.36,1] }}
        style={{ display:errored?'none':'block' }}
      />
    </div>
  )
}

function QuestionImage({ src }) {
  return (
    <motion.div className="rounded-2xl overflow-hidden mb-5 border border-white/8 bg-white/3"
      initial={{ opacity:0, y:10, filter:'blur(4px)' }}
      animate={{ opacity:1, y:0, filter:'blur(0px)' }}
      transition={{ duration:0.4, delay:0.08, ease:[0.22,1,0.36,1] }}
    >
      <LazyImg src={src} wrapClass="min-h-[140px]" imgClass="w-full max-h-[300px] object-contain"/>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// IMAGE OPTION
// ─────────────────────────────────────────────────────────────────────────────
function ImageOption({ displayLabel, src, isSelected, onClick, index, disabled }) {
  return (
    <motion.button onClick={disabled?undefined:onClick}
      className={`relative overflow-hidden rounded-2xl focus:outline-none flex flex-col ${disabled?'cursor-default':'cursor-pointer'} ${isSelected?'bg-[#2DFF9A]/10':'bg-white/3'}`}
      style={{ border: isSelected?'2px solid rgba(249,115,22,0.75)':'2px solid rgba(255,255,255,0.07)', boxShadow: isSelected?'0 0 24px rgba(249,115,22,0.35)':'none', transition:'border-color 0.2s,box-shadow 0.2s,background 0.2s' }}
      initial={{ opacity:0, scale:0.88, y:14, filter:'blur(6px)' }}
      animate={{ opacity:1, scale:1, y:0, filter:'blur(0px)' }}
      transition={{ duration:0.5, delay:0.07+index*0.09, ease:[0.22,1,0.36,1] }}
      whileHover={!isSelected&&!disabled?{ scale:1.025 }:{}}
      whileTap={!disabled?{ scale:0.97 }:{}}
    >
      <div className={`absolute top-2 left-2 z-10 w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold transition-all duration-200 ${isSelected?'bg-[#2DFF9A] text-white border border-[#2DFF9A]':'bg-black/60 text-slate-400 border border-white/20'}`}
        style={{ fontFamily:'Syne,sans-serif' }}>{displayLabel}</div>
      <AnimatePresence>
        {isSelected && (
          <motion.div className="absolute inset-0 z-10 flex items-center justify-center bg-[#2DFF9A]/8"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
            <motion.div className="w-10 h-10 rounded-full bg-[#2DFF9A]/90 flex items-center justify-center text-white text-lg"
              style={{ boxShadow:'0 0 20px rgba(249,115,22,0.6)' }}
              initial={{ scale:0.3, opacity:0 }} animate={{ scale:1, opacity:1 }}
              transition={{ type:'spring', stiffness:420, damping:18 }}>✓</motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <LazyImg src={src} wrapClass="w-full min-h-[140px]" imgClass="w-full h-[140px] object-cover block"/>
    </motion.button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TEXT OPTION
// ─────────────────────────────────────────────────────────────────────────────
function TextOption({ displayLabel, val, isSelected, onClick, index, disabled }) {
  return (
    <motion.button onClick={disabled?undefined:onClick}
      className={`group relative w-full text-left px-4 py-3.5 rounded-xl flex items-center gap-3 overflow-hidden focus:outline-none transition-colors duration-200 ${disabled?'cursor-default':'cursor-pointer'} ${isSelected?'text-[#2DFF9A]/80':'text-slate-400 hover:text-slate-200'}`}
      style={{ border: isSelected?'1px solid rgba(249,115,22,0.55)':'1px solid rgba(255,255,255,0.08)', background: isSelected?'rgba(249,115,22,0.1)':'rgba(255,255,255,0.03)', boxShadow: isSelected?'0 4px 20px rgba(249,115,22,0.14)':'none' }}
      initial={{ opacity:0, x:-16 }}
      animate={{ opacity:1, x:0 }}
      transition={{ duration:0.38, delay:0.07+index*0.075, ease:[0.22,1,0.36,1] }}
      whileHover={!isSelected&&!disabled?{ x:3 }:{}}
      whileTap={!disabled?{ scale:0.99 }:{}}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background:'radial-gradient(circle at 50% 50%, rgba(249,115,22,0.1), transparent 65%)' }}/>
      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0 transition-all duration-200 ${isSelected?'text-[#2DFF9A]':'text-slate-500'}`}
        style={{ background: isSelected?'rgba(249,115,22,0.3)':'rgba(255,255,255,0.06)', border: isSelected?'1px solid rgba(249,115,22,0.55)':'1px solid rgba(255,255,255,0.1)', fontFamily:'Syne,sans-serif' }}>
        {displayLabel}
      </span>
      <span className="flex-1 text-sm leading-snug" style={{ fontFamily:'DM Sans,sans-serif' }}>{val}</span>
      <AnimatePresence>
        {isSelected && (
          <motion.span className="text-[#2DFF9A] text-base ml-auto flex-shrink-0"
            initial={{ scale:0.3, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.3, opacity:0 }}
            transition={{ type:'spring', stiffness:420, damping:18 }}>✓</motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

function MixedOptions({ optionEntries, input, setInput, disabled }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 mb-5">
      {optionEntries.map(([key, val], i) => {
        const label = displayKey(key, i)
        const isImg = isImageUrl(val)
        const isSel = input === key
        if (isImg) return (
          <ImageOption key={key} displayLabel={label} src={val} isSelected={isSel}
            onClick={() => setInput(isSel?'':key)} index={i} disabled={disabled}/>
        )
        return (
          <motion.button key={key} onClick={disabled?undefined:()=>setInput(isSel?'':key)}
            className={`group relative text-left px-3 py-3 rounded-xl flex items-center gap-2.5 overflow-hidden focus:outline-none transition-colors duration-200 ${disabled?'cursor-default':'cursor-pointer'} ${isSel?'text-[#2DFF9A]/80':'text-slate-400 hover:text-slate-200'}`}
            style={{ border:isSel?'1px solid rgba(249,115,22,0.55)':'1px solid rgba(255,255,255,0.08)', background:isSel?'rgba(249,115,22,0.1)':'rgba(255,255,255,0.03)', boxShadow:isSel?'0 4px 20px rgba(249,115,22,0.14)':'none', minHeight:56 }}
            initial={{ opacity:0, scale:0.94 }} animate={{ opacity:1, scale:1 }}
            transition={{ duration:0.38, delay:0.07+i*0.075, ease:[0.22,1,0.36,1] }}
            whileHover={!isSel&&!disabled?{ scale:1.02 }:{}} whileTap={!disabled?{ scale:0.98 }:{}}
          >
            <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${isSel?'text-[#2DFF9A]':'text-slate-500'}`}
              style={{ background:isSel?'rgba(249,115,22,0.3)':'rgba(255,255,255,0.06)', border:isSel?'1px solid rgba(249,115,22,0.55)':'1px solid rgba(255,255,255,0.1)', fontFamily:'Syne,sans-serif' }}>
              {label}
            </span>
            <span className="flex-1 text-xs leading-snug" style={{ fontFamily:'DM Sans,sans-serif' }}>{val}</span>
            <AnimatePresence>
              {isSel && <motion.span className="text-[#2DFF9A] text-sm flex-shrink-0"
                initial={{ scale:0.3, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.3, opacity:0 }}
                transition={{ type:'spring', stiffness:420, damping:18 }}>✓</motion.span>}
            </AnimatePresence>
          </motion.button>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// DRAG-DROP WORD BUILDER  — the "trick" mechanic for the last question
// ─────────────────────────────────────────────────────────────────────────────
function WordBuilder({ words: initialWords, onAnswer, submitting, questionId, submitted }) {
  // words in the "bank" (unplaced)
  const [bank, setBank] = useState(() =>
    [...initialWords].sort(() => Math.random() - 0.5).map((w, i) => ({ id: `w-${i}`, text: w }))
  )
  // words in the "answer row" (placed, in order)
  const [answer, setAnswer] = useState([])
  const [shakeBank, setShakeBank] = useState(false)

  const builtString = answer.map(w => w.text).join(' ')

  const moveToAnswer = (item) => {
    if (submitted) return
    setBank(b => b.filter(w => w.id !== item.id))
    setAnswer(a => [...a, item])
  }

  const moveToBank = (item) => {
    if (submitted) return
    setAnswer(a => a.filter(w => w.id !== item.id))
    setBank(b => [...b, item])
  }

  const handleSubmit = () => {
    if (!builtString.trim() || submitted) return
    onAnswer(builtString)
  }

  const handleClear = () => {
    if (submitted) return
    setBank([...answer, ...bank].sort(() => Math.random() - 0.5))
    setAnswer([])
  }

  return (
    <motion.div
      initial={{ opacity:0 }}
      animate={{ opacity:1 }}
      transition={{ duration:0.4 }}
      className="space-y-4"
    >
      {/* Instruction */}
      <motion.div
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
        style={{ background:'rgba(168,216,234,0.07)', border:'1px solid rgba(168,216,234,0.15)' }}
        initial={{ opacity:0, y:-8 }}
        animate={{ opacity:1, y:0 }}
        transition={{ delay:0.1 }}
      >
        <span className="text-base">🧩</span>
        <span className="text-xs text-slate-300" style={{ fontFamily:'DM Sans,sans-serif' }}>
          Drag the tiles below into the answer bar to form the correct phrase
        </span>
      </motion.div>

      {/* Answer bar — drop zone */}
      <div>
        <div className="text-[11px] text-slate-500 mb-2 tracking-widest uppercase" style={{ fontFamily:'Syne,sans-serif' }}>
          Your answer
        </div>
        <Reorder.Group
          axis="x"
          values={answer}
          onReorder={setAnswer}
          className="flex flex-wrap gap-2 min-h-[56px] p-3 rounded-xl relative"
          style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${answer.length>0?'rgba(249,115,22,0.3)':'rgba(255,255,255,0.08)'}`, transition:'border-color 0.3s' }}
        >
          <AnimatePresence mode="popLayout">
            {answer.length === 0 && (
              <motion.span
                className="absolute inset-0 flex items-center justify-center text-xs text-slate-600"
                style={{ fontFamily:'DM Sans,sans-serif', pointerEvents:'none' }}
                initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              >
                Tap words below to place them here…
              </motion.span>
            )}
            {answer.map((item) => (
              <Reorder.Item
                key={item.id}
                value={item}
                className="cursor-grab active:cursor-grabbing select-none"
              >
                <motion.div
                  onClick={() => moveToBank(item)}
                  className="px-3 py-1.5 rounded-lg font-semibold text-sm text-white relative group"
                  style={{ background:'linear-gradient(135deg,#f97316,#ea580c)', boxShadow:'0 2px 10px rgba(249,115,22,0.3)', fontFamily:'Syne,sans-serif', fontSize:13, userSelect:'none' }}
                  layout
                  initial={{ scale:0.7, opacity:0 }}
                  animate={{ scale:1, opacity:1 }}
                  exit={{ scale:0.7, opacity:0, y:-10 }}
                  transition={{ type:'spring', stiffness:400, damping:25 }}
                  whileHover={{ y:-2, boxShadow:'0 6px 18px rgba(249,115,22,0.4)' }}
                  whileTap={{ scale:0.95 }}
                  title="Click to remove"
                >
                  {item.text}
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</span>
                </motion.div>
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>
      </div>

      {/* Word bank */}
      <div>
        <div className="text-[11px] text-slate-500 mb-2 tracking-widest uppercase" style={{ fontFamily:'Syne,sans-serif' }}>
          Word bank
        </div>
        <motion.div
          className="flex flex-wrap gap-2 min-h-[48px] p-3 rounded-xl"
          style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}
          animate={shakeBank ? { x:[0,-5,5,-4,4,-2,0] } : {}}
          transition={{ duration:0.4 }}
        >
          <AnimatePresence mode="popLayout">
            {bank.map((item, i) => (
              <motion.button
                key={item.id}
                onClick={() => moveToAnswer(item)}
                disabled={submitted}
                className="px-3 py-1.5 rounded-lg font-semibold text-sm cursor-pointer select-none focus:outline-none"
                style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'#cbd5e1', fontFamily:'Syne,sans-serif', fontSize:13 }}
                layout
                initial={{ scale:0.7, opacity:0, y:10 }}
                animate={{ scale:1, opacity:1, y:0 }}
                exit={{ scale:0.7, opacity:0, y:-10 }}
                transition={{ type:'spring', stiffness:400, damping:25, delay: i * 0.04 }}
                whileHover={!submitted ? { scale:1.06, background:'rgba(255,255,255,0.1)', borderColor:'rgba(249,115,22,0.3)', color:'#fff' } : {}}
                whileTap={!submitted ? { scale:0.95 } : {}}
              >
                {item.text}
              </motion.button>
            ))}
          </AnimatePresence>
          {bank.length === 0 && (
            <span className="text-xs text-slate-700 self-center" style={{ fontFamily:'DM Sans,sans-serif' }}>
              All words placed!
            </span>
          )}
        </motion.div>
      </div>

      {/* Built string preview */}
      <AnimatePresence>
        {builtString && (
          <motion.div
            className="px-4 py-2.5 rounded-xl"
            style={{ background:'rgba(249,115,22,0.06)', border:'1px solid rgba(249,115,22,0.18)' }}
            initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
          >
            <span className="text-[11px] text-slate-500 uppercase tracking-widest mr-2" style={{ fontFamily:'Syne,sans-serif' }}>Answer:</span>
            <span className="text-sm text-[#2DFF9A] font-semibold" style={{ fontFamily:'DM Sans,sans-serif' }}>"{builtString}"</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buttons */}
      <div className="flex gap-3">
        <motion.button
          onClick={handleSubmit}
          disabled={!builtString || submitted || submitting===questionId}
          className="flex items-center gap-2.5 px-7 py-3 rounded-xl font-bold text-sm tracking-wide focus:outline-none"
          style={{
            background: builtString&&!submitted ? 'linear-gradient(135deg,#f97316,#ea580c)' : 'rgba(255,255,255,0.05)',
            color: builtString&&!submitted ? '#fff' : '#3a3a48',
            boxShadow: builtString&&!submitted ? '0 5px 20px rgba(249,115,22,0.28)' : 'none',
            fontFamily:'Syne,sans-serif',
          }}
          whileHover={builtString&&!submitted ? { y:-2, boxShadow:'0 12px 32px rgba(249,115,22,0.42)' } : {}}
          whileTap={builtString&&!submitted ? { scale:0.97 } : {}}
        >
          {submitting===questionId ? (
            <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"/>Submitting…</>
          ) : submitted ? (
            <><span className="text-[#2DFF9A]">✓</span>Answer Submitted</>
          ) : 'Submit Answer'}
        </motion.button>

        {answer.length > 0 && !submitted && (
          <motion.button
            onClick={handleClear}
            className="px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 focus:outline-none"
            style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', fontFamily:'Syne,sans-serif' }}
            initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }}
            whileHover={{ background:'rgba(255,255,255,0.08)', color:'#94a3b8' }}
            whileTap={{ scale:0.97 }}
          >
            Clear
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TRICK REVEAL — the animation that switches from fake MCQ to word-builder
// ─────────────────────────────────────────────────────────────────────────────
function TrickReveal({ optionValues, onRevealDone }) {
  // Phase:
  // 'fake'    → normal looking MCQ
  // 'glitch'  → brief glitch effect
  // 'scatter' → options fly apart
  // 'reveal'  → word builder shown

  const [phase, setPhase]           = useState('fake')
  const [glitchText, setGlitchText] = useState('')
  const [selectedFake, setSelectedFake] = useState(null)

  const GLITCH_CHARS = '!@#$%^&*<>?/\\|~`'

  // Let them "think" they're about to select one option — then trigger trick
  const triggerTrick = (key) => {
    setSelectedFake(key)
    // Brief pause like it's selecting...
    setTimeout(() => {
      setPhase('glitch')
      // Glitch text flicker
      let count = 0
      const glitchInterval = setInterval(() => {
        setGlitchText(Array.from({ length: 8 }, () => GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]).join(''))
        count++
        if (count > 12) {
          clearInterval(glitchInterval)
          setPhase('scatter')
          setTimeout(() => {
            onRevealDone()
          }, 600)
        }
      }, 80)
    }, 400)
  }

  return (
    <div className="relative">
      {/* Glitch overlay */}
      <AnimatePresence>
        {phase === 'glitch' && (
          <motion.div
            className="absolute inset-0 z-20 flex items-center justify-center rounded-xl pointer-events-none"
            style={{ background:'rgba(249,115,22,0.08)', backdropFilter:'blur(1px)' }}
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
          >
            <motion.div
              className="text-2xl font-black text-[#2DFF9A] tracking-widest"
              style={{ fontFamily:'Syne,sans-serif', textShadow:'0 0 20px rgba(249,115,22,0.8)' }}
              animate={{ opacity:[1,0,1,0,1], x:[0,-3,3,-2,0] }}
              transition={{ duration:0.08, repeat:Infinity }}
            >
              {glitchText}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The fake options */}
      <div className={`flex flex-col gap-2 mb-5 ${phase==='scatter'?'pointer-events-none':''}`}>
        {optionValues.map((val, i) => {
          const isSelected = selectedFake === String(i)
          const label = String(i + 1)

          return (
            <motion.button
              key={i}
              onClick={phase==='fake' ? () => triggerTrick(String(i)) : undefined}
              className={`relative w-full text-left px-4 py-3.5 rounded-xl flex items-center gap-3 overflow-hidden focus:outline-none cursor-pointer ${isSelected?'text-[#2DFF9A]/80':'text-slate-400'}`}
              style={{
                border: isSelected?'1px solid rgba(249,115,22,0.55)':'1px solid rgba(255,255,255,0.08)',
                background: isSelected?'rgba(249,115,22,0.1)':'rgba(255,255,255,0.03)',
                boxShadow: isSelected?'0 4px 20px rgba(249,115,22,0.14)':'none',
              }}
              initial={{ opacity:0, x:-16 }}
              animate={
                phase==='scatter'
                  ? {
                      opacity:0,
                      x: (i%2===0?-1:1) * (80 + i*30),
                      y: (i%3===0?-1:1) * (40 + i*20),
                      rotate: (Math.random()-0.5)*40,
                      scale:0.5,
                      filter:'blur(4px)',
                    }
                  : { opacity:1, x:0 }
              }
              transition={
                phase==='scatter'
                  ? { duration:0.5, delay:i*0.05, ease:[0.22,1,0.36,1] }
                  : { duration:0.38, delay:0.07+i*0.075, ease:[0.22,1,0.36,1] }
              }
              whileHover={phase==='fake'&&!isSelected ? { x:3 } : {}}
            >
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${isSelected?'text-[#2DFF9A]':'text-slate-500'}`}
                style={{ background:isSelected?'rgba(249,115,22,0.3)':'rgba(255,255,255,0.06)', border:isSelected?'1px solid rgba(249,115,22,0.55)':'1px solid rgba(255,255,255,0.1)', fontFamily:'Syne,sans-serif' }}>
                {label}
              </span>
              <span className="flex-1 text-sm" style={{ fontFamily:'DM Sans,sans-serif' }}>{val}</span>
              {isSelected && (
                <motion.span className="text-[#2DFF9A] text-base ml-auto"
                  initial={{ scale:0.3, opacity:0 }} animate={{ scale:1, opacity:1 }}
                  transition={{ type:'spring', stiffness:420, damping:18 }}>✓</motion.span>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Fake submit — disabled, just looks real */}
      <motion.div
        className="flex items-center gap-2.5 px-7 py-3 rounded-xl font-bold text-sm cursor-not-allowed"
        style={{ background:'rgba(255,255,255,0.05)', color:'#3a3a48', fontFamily:'Syne,sans-serif', display:'inline-flex' }}
        animate={phase==='scatter' ? { opacity:0, y:-20 } : {}}
        transition={{ duration:0.3 }}
      >
        Select an option above
      </motion.div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// QUESTION CARD
// ─────────────────────────────────────────────────────────────────────────────
function QuestionCard({ question, response, index, total, onSubmit, submitting, isLastQuestion }) {
  const [input, setInput]               = useState('')
  const [submitted, setSubmitted]       = useState(false)
  const [floats, setFloats]             = useState([])
  const [confetti, setConfetti]         = useState([])
  const [trickRevealed, setTrickRevealed] = useState(false)
  const cardRef = useRef(null)

  const hasOptions    = question.options && typeof question.options === 'object' && Object.keys(question.options).length > 0
  const optionEntries = hasOptions ? Object.entries(question.options) : []
  const isAnswered    = !!response
  const hasImage      = !!question.link
  const allImgOpts    = hasOptions && optionEntries.every(([,v]) => isImageUrl(v))
  const allTxtOpts    = hasOptions && optionEntries.every(([,v]) => !isImageUrl(v))
  const mixedOpts     = hasOptions && !allImgOpts && !allTxtOpts

  // The trick only applies when: it's the last question AND all text options (no images)
  const isTrickQuestion = isLastQuestion && hasOptions && allTxtOpts

  const handleSubmit = async (answerOverride) => {
    const ans = answerOverride || input
    if (!ans.trim() || submitted) return
    let answerToSend = ans
    // Only look up option value if it's a key reference (not a word-builder string)
    if (!answerOverride && hasOptions) {
      const match = optionEntries.find(([k]) => k === input)
      if (match) answerToSend = match[1]
    }
    const rect = cardRef.current?.getBoundingClientRect()
    if (rect) {
      const id = Date.now()
      setFloats(f => [...f, { id, x: rect.right-80, y: rect.top+10 }])
      setConfetti(c => [...c, { id, x: rect.left+rect.width/2, y: rect.top+rect.height*0.4 }])
    }
    setSubmitted(true)
    await onSubmit(question.id, answerToSend)
  }

  const borderColor = isAnswered ? 'rgba(249,115,22,0.25)' : 'rgba(255,255,255,0.08)'

  return (
    <motion.div ref={cardRef}
      className="relative rounded-[18px] p-7 overflow-visible"
      style={{ border:`1px solid ${borderColor}`, background:'#0e1420', transition:'border-color 0.5s ease' }}
      initial={{ opacity:0, y:28, scale:0.97, filter:'blur(5px)' }}
      animate={{ opacity:1, y:0, scale:1, filter:'blur(0px)' }}
      transition={{ duration:0.5, ease:[0.22,1,0.36,1] }}
    >
      {floats.map(f => <PointsFloat key={f.id} pts={question.reward} x={f.x} y={f.y} onDone={()=>setFloats(p=>p.filter(x=>x.id!==f.id))}/>)}
      {confetti.map(c => <ConfettiBurst key={c.id} x={c.x} y={c.y} onDone={()=>setConfetti(p=>p.filter(x=>x.id!==c.id))}/>)}

      {/* Header */}
      <div className="flex justify-between items-start gap-3 mb-5">
        <div className="flex items-start gap-3 flex-1">
          <motion.div className="flex-shrink-0 text-[11px] font-bold text-slate-500 bg-white/5 rounded-lg px-2.5 py-1 mt-0.5 tracking-widest"
            style={{ fontFamily:'Syne,sans-serif' }} initial={{ opacity:0, scale:0.7 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.06 }}>
            {index+1}<span className="opacity-35">/{total}</span>
          </motion.div>
          <motion.p className="text-[#e8edf5] text-[15px] leading-relaxed flex-1" style={{ fontFamily:'DM Sans,sans-serif' }}
            initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.09, duration:0.4 }}>
            {question.text}
          </motion.p>
        </div>
        <motion.div className="flex-shrink-0 text-[11px] font-bold text-[#2DFF9A] px-3 py-1 rounded-full whitespace-nowrap"
          style={{ background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.25)', fontFamily:'Syne,sans-serif' }}
          initial={{ opacity:0, scale:0.5 }} animate={{ opacity:1, scale:1 }} transition={{ type:'spring', stiffness:420, damping:18, delay:0.15 }}>
          +{question.reward} pts
        </motion.div>
      </div>

      {hasImage && <QuestionImage src={question.link}/>}

      {!isAnswered ? (
        <>
          {/* ── TRICK QUESTION FLOW ── */}
          {isTrickQuestion && !trickRevealed && (
            <TrickReveal
              optionValues={optionEntries.map(([,v]) => v)}
              onRevealDone={() => setTrickRevealed(true)}
            />
          )}

          {isTrickQuestion && trickRevealed && (
            <>
              {/* "Wait what??" banner */}
              <motion.div
                className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5"
                style={{ background:'rgba(168,85,247,0.08)', border:'1px solid rgba(168,85,247,0.2)' }}
                initial={{ opacity:0, scale:0.9, y:-10 }}
                animate={{ opacity:1, scale:1, y:0 }}
                transition={{ type:'spring', stiffness:300, damping:22 }}
              >
                <span className="text-xl">😈</span>
                <div>
                  <div className="text-sm font-bold text-purple-400" style={{ fontFamily:'Syne,sans-serif' }}>
                    Surprise! Those aren't options — they're words.
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5" style={{ fontFamily:'DM Sans,sans-serif' }}>
                    Arrange them in the correct order to form the answer.
                  </div>
                </div>
              </motion.div>

              <WordBuilder
                words={optionEntries.map(([,v]) => v)}
                onAnswer={handleSubmit}
                submitting={submitting}
                questionId={question.id}
                submitted={submitted}
              />
            </>
          )}

          {/* ── NORMAL QUESTION FLOW ── */}
          {!isTrickQuestion && (
            <>
              {allImgOpts && (
                <div className="grid grid-cols-2 gap-2.5 mb-5">
                  {optionEntries.map(([key,val],i) => (
                    <ImageOption key={key} displayLabel={displayKey(key,i)} src={val}
                      isSelected={input===key} onClick={()=>setInput(input===key?'':key)} index={i} disabled={submitted}/>
                  ))}
                </div>
              )}
              {allTxtOpts && (
                <div className="flex flex-col gap-2 mb-5">
                  {optionEntries.map(([key,val],i) => (
                    <TextOption key={key} displayLabel={displayKey(key,i)} val={val}
                      isSelected={input===key} onClick={()=>setInput(input===key?'':key)} index={i} disabled={submitted}/>
                  ))}
                </div>
              )}
              {mixedOpts && (
                <MixedOptions optionEntries={optionEntries} input={input} setInput={setInput} disabled={submitted}/>
              )}
              {!hasOptions && (
                <motion.div className="mb-5" initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.1, duration:0.38 }}>
                  <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSubmit()}
                    placeholder="Type your answer…" autoFocus disabled={submitted}
                    className="w-full rounded-xl px-4 py-3 text-sm text-[#e8edf5] placeholder-slate-600 focus:outline-none transition-all duration-200 disabled:opacity-50"
                    style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', caretColor:'#f97316', fontFamily:'DM Sans,sans-serif' }}
                    onFocus={e=>{ e.target.style.borderColor='rgba(249,115,22,0.45)'; e.target.style.background='rgba(249,115,22,0.05)'; e.target.style.boxShadow='0 0 0 3px rgba(249,115,22,0.13)' }}
                    onBlur={e=>{ e.target.style.borderColor='rgba(255,255,255,0.1)'; e.target.style.background='rgba(255,255,255,0.03)'; e.target.style.boxShadow='none' }}
                  />
                </motion.div>
              )}

              <motion.button onClick={()=>handleSubmit()} disabled={!input||submitted||submitting===question.id}
                className={`flex items-center gap-2.5 px-7 py-3 rounded-xl font-bold text-sm tracking-wide focus:outline-none ${input&&!submitted?'text-white cursor-pointer':'text-slate-600 cursor-not-allowed'}`}
                style={{ background:input&&!submitted?'linear-gradient(135deg,#f97316,#ea580c)':'rgba(255,255,255,0.05)', boxShadow:input&&!submitted?'0 5px 20px rgba(249,115,22,0.28)':'none', fontFamily:'Syne,sans-serif' }}
                initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.22 }}
                whileHover={input&&!submitted?{ y:-2, boxShadow:'0 12px 32px rgba(249,115,22,0.42)' }:{}}
                whileTap={input&&!submitted?{ scale:0.97 }:{}}
              >
                {submitting===question.id ? (
                  <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"/>Submitting…</>
                ) : submitted ? (
                  <><span className="text-[#2DFF9A]">✓</span>Answer Submitted</>
                ) : 'Submit Answer'}
              </motion.button>
            </>
          )}
        </>
      ) : (
        <motion.div className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl"
          style={{ background:'rgba(249,115,22,0.07)', border:'1px solid rgba(249,115,22,0.2)' }}
          initial={{ opacity:0, y:6, scale:0.98 }} animate={{ opacity:1, y:0, scale:1 }}
          transition={{ duration:0.35, ease:[0.22,1,0.36,1] }}>
          <span className="text-xl">📝</span>
          <div>
            <div className="text-sm font-bold text-[#2DFF9A]" style={{ fontFamily:'Syne,sans-serif' }}>Answer recorded</div>
            <div className="text-xs text-slate-500 mt-0.5" style={{ fontFamily:'DM Sans,sans-serif' }}>Results will be shown when the round ends</div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function QuizPage({ onNav }) {
  const api = useApi()
  const [activeRound, setActiveRound]     = useState(null)
  const [questions, setQuestions]         = useState([])
  const [responses, setResponses]         = useState([])
  const [loading, setLoading]             = useState(true)
  const [submitting, setSubmitting]       = useState(null)
  const [error, setError]                 = useState(null)
  const [currentIndex, setCurrentIndex]   = useState(0)
  const [finishing, setFinishing]         = useState(false)
  const [cardKey, setCardKey]             = useState(0)

  useEffect(() => {
    const init = async () => {
      try {
        const round = await api.get('/api/round/active')
        if (!round || !round?.id) {
          onNav('waiting')
          return
        }
        setActiveRound(round)

        try {
          const status = await api.get(`/api/round/status/${round.id}`)
          if (!status.started) {
            setError('Please start the round first')
            onNav('round')
            setLoading(false)
            return
          }
          if (status.finished) {
            onNav('leaderboard')
            setLoading(false)
            return
          }
        } catch (statusError) {
          console.warn('Round status check failed', statusError)
        }

        const qData = await api.get(`/api/question/round/${round.id}`)
        const qs = qData?.data || qData || []
        setQuestions(qs)
        const rData = await api.get(`/api/response/${round.id}/me`)
        setResponses(Array.isArray(rData) ? rData : [])
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (questions.length > 0) {
      const answeredIds = new Set(responses.map(r => r.questionId))
      const nextIdx = questions.findIndex(q => !answeredIds.has(q.id))
      setCurrentIndex(nextIdx >= 0 ? nextIdx : questions.length - 1)
    }
  }, [questions, responses])

  const submitAnswer = async (questionId, submittedAnswer) => {
    setSubmitting(questionId)
    try {
      const res = await api.post('/api/response', { questionId, submittedAnswer })
      setResponses(prev => {
        const exists = prev.findIndex(r => r.questionId === questionId)
        const updated = { questionId, submittedAnswer, ...res }
        if (exists >= 0) { const arr = [...prev]; arr[exists] = updated; return arr }
        return [...prev, updated]
      })
      setSubmitting(null)
      return res
    } catch (e) { setError(e.message); setSubmitting(null); return null }
  }

  const goTo = useCallback((idx) => {
    if (idx === currentIndex) return
    setCurrentIndex(idx)
    setCardKey(k => k + 1)
  }, [currentIndex])

  const finishRound = async () => {
    if (!activeRound) return
    setFinishing(true)
    try { await api.post(`/api/round/${activeRound._id}/finish`); onNav('leaderboard') }
    catch (e) { setError(e.message); setFinishing(false) }
  }

  const getResponse = (id) => responses.find(r => r.questionId === id)
  const answered  = responses.length
  const progress  = questions.length ? (answered / questions.length) * 100 : 0
  const allDone   = questions.length > 0 && answered === questions.length

  if (loading) return <div className="flex justify-center pt-20"><Spinner size="lg"/></div>

  if (!activeRound || (error && !questions.length)) return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-black text-[#e8edf5] mb-4" style={{ fontFamily:'Syne,sans-serif' }}>Quiz</h1>
      <Alert type="error">{error || 'No active round.'}</Alert>
      <button onClick={()=>onNav('round')} className="text-[#2DFF9A] text-sm mt-3 bg-transparent border-none cursor-pointer hover:underline">← Back to Round</button>
    </div>
  )

  const currentQuestion = questions[currentIndex]
  const isLast          = currentIndex === questions.length - 1
  const currentResponse = currentQuestion && getResponse(currentQuestion.id)

  return (
    <div className="max-w-[700px] mx-auto">

      {/* HEADER */}
      <motion.div className="flex items-start justify-between gap-4 mb-7"
        initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}>
        <div>
          <h1 className="text-[28px] font-black text-[#e8edf5] leading-none mb-2" style={{ fontFamily:'Syne,sans-serif' }}>Quiz</h1>
          <div className="flex items-center gap-2 flex-wrap text-xs" style={{ fontFamily:'DM Sans,sans-serif' }}>
            <span className="text-slate-500">Round #{activeRound._id}</span>
            <span className="text-slate-700">·</span>
            <span className="text-slate-500">{answered}/{questions.length} answered</span>
          </div>
        </div>
        <AnimatePresence>
          {answered > 0 && (
            <motion.div className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold text-[#2DFF9A]"
              style={{ background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.2)', fontFamily:'Syne,sans-serif' }}
              initial={{ opacity:0, scale:0.7 }} animate={{ opacity:1, scale:1 }} transition={{ type:'spring', stiffness:400, damping:20 }}>
              {answered} submitted ✓
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* PROGRESS */}
      {questions.length > 0 && (
        <motion.div className="mb-7" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.12 }}>
          <div className="flex justify-between text-[11px] mb-2 text-slate-600">
            <span className="flex items-center gap-1.5" style={{ fontFamily:'DM Sans,sans-serif' }}>
              {!allDone && <motion.span className="w-1.5 h-1.5 rounded-full inline-block bg-[#2DFF9A]"
                animate={{ scale:[1,0.6,1], opacity:[1,0.4,1] }} transition={{ duration:1.5, repeat:Infinity }}/>}
              {allDone ? '🎉 All done!' : `Q ${Math.min(answered+1,questions.length)} of ${questions.length}`}
            </span>
            <span className={`font-bold ${progress>0?'text-[#2DFF9A]':''}`} style={{ fontFamily:'Syne,sans-serif' }}>{Math.round(progress)}%</span>
          </div>
          <div className="h-[5px] rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.05)' }}>
            <motion.div className="h-full rounded-full"
              style={{ background:allDone?'linear-gradient(90deg,#22c55e,#4ade80)':'linear-gradient(90deg,#f97316,#fb923c)', boxShadow:progress>0?`0 0 14px ${allDone?'rgba(34,197,94,0.55)':'rgba(249,115,22,0.5)'}`:'' }}
              initial={{ width:0 }} animate={{ width:`${progress}%` }} transition={{ duration:0.65, ease:[0.22,1,0.36,1] }}/>
          </div>
          <div className="flex gap-1 mt-2.5 justify-center flex-wrap">
            {questions.map((q,i) => {
              const resp = getResponse(q.id)
              const isActive = i === currentIndex
              return (
                <motion.button key={q.id} onClick={()=>goTo(i)} title={`Q${i+1}`}
                  className="border-none cursor-pointer p-0 rounded-full"
                  animate={{ width:isActive?22:8, height:8, background:resp?'#f97316':isActive?'#fb923c':'rgba(255,255,255,0.12)', boxShadow:isActive?'0 0 10px rgba(249,115,22,0.55)':'none', opacity:resp?1:isActive?1:0.5 }}
                  transition={{ duration:0.3, ease:[0.22,1,0.36,1] }} whileHover={{ scaleY:1.6 }}/>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* QUESTION */}
      {currentQuestion ? (
        <div>
          <AnimatePresence mode="wait">
            <QuestionCard
              key={`q-${currentQuestion.id}-${cardKey}`}
              question={currentQuestion}
              index={currentIndex}
              total={questions.length}
              response={currentResponse}
              onSubmit={submitAnswer}
              submitting={submitting}
              isLastQuestion={isLast}
            />
          </AnimatePresence>

          <AnimatePresence>
            {currentResponse && (
              <motion.div className="flex justify-end mt-3.5"
                initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                transition={{ delay:0.08, duration:0.3 }}>
                {isLast ? (
                  <motion.button onClick={finishRound} disabled={finishing}
                    className="flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-sm text-white focus:outline-none tracking-wide"
                    style={{ background:'linear-gradient(135deg,#22c55e,#16a34a)', boxShadow:'0 6px 26px rgba(34,197,94,0.3)', fontFamily:'Syne,sans-serif' }}
                    whileHover={{ y:-2, boxShadow:'0 10px 32px rgba(34,197,94,0.45)' }} whileTap={{ scale:0.97 }}>
                    {finishing?<span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"/>:'🏁'}
                    Finish Round
                  </motion.button>
                ) : (
                  <motion.button onClick={()=>goTo(currentIndex+1)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-[#2DFF9A] focus:outline-none tracking-wide"
                    style={{ border:'1px solid rgba(249,115,22,0.3)', background:'rgba(249,115,22,0.08)', fontFamily:'Syne,sans-serif' }}
                    whileHover={{ x:5 }} whileTap={{ scale:0.97 }}>
                    Next Question →
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div className="rounded-[18px] p-16 text-center"
          style={{ border:'1px solid rgba(255,255,255,0.08)', background:'#0e1420' }}
          initial={{ opacity:0 }} animate={{ opacity:1 }}>
          <div className="text-4xl mb-3">📭</div>
          <h2 className="text-xl font-black text-[#e8edf5] mb-2" style={{ fontFamily:'Syne,sans-serif' }}>No questions yet</h2>
          <p className="text-sm text-slate-500" style={{ fontFamily:'DM Sans,sans-serif' }}>The organizer hasn't added questions.</p>
        </motion.div>
      )}

      {/* ALL DONE */}
      <AnimatePresence>
        {allDone && (
          <motion.div className="mt-5 rounded-[18px] p-8 text-center"
            style={{ border:'1px solid rgba(249,115,22,0.22)', background:'rgba(249,115,22,0.04)' }}
            initial={{ opacity:0, y:20, scale:0.96 }} animate={{ opacity:1, y:0, scale:1 }}
            transition={{ delay:0.1, duration:0.5, ease:[0.22,1,0.36,1] }}>
            <div className="text-4xl mb-3">🎉</div>
            <h2 className="text-xl font-black text-[#e8edf5] mb-1.5" style={{ fontFamily:'Syne,sans-serif' }}>All questions answered!</h2>
            <p className="text-sm text-slate-500 mb-5" style={{ fontFamily:'DM Sans,sans-serif' }}>
              All {answered} answers submitted. Finish the round to lock in your score.
            </p>
            <div className="flex justify-center gap-3">
              <Btn onClick={finishRound}>🏁 Finish Round</Btn>
              <Btn variant="secondary" onClick={()=>onNav('leaderboard')}>🏆 Leaderboard</Btn>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ERROR TOAST */}
      <AnimatePresence>
        {error && (
          <motion.div className="fixed bottom-6 z-[9999] text-sm text-red-300 rounded-xl px-5 py-3 whitespace-nowrap"
            style={{ left:'50%', x:'-50%', background:'#13151f', border:'1px solid rgba(239,68,68,0.3)', boxShadow:'0 10px 40px rgba(0,0,0,0.5)', fontFamily:'DM Sans,sans-serif' }}
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:20 }}>
            ⚠️ {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
import { useEffect, useMemo, useRef, useState } from 'react'
import { Activity, ArrowDownToLine, AudioLines, Check, ChevronDown, Clapperboard, Clock3, Download, ExternalLink, Film, FolderOpen, Globe2, HelpCircle, ImagePlus, Languages, LayoutDashboard, Lightbulb, Monitor, Moon, MoreHorizontal, Play, Plus, Save, Search, Settings2, Sparkles, Smartphone, Tablet, Trash2, Upload, WandSparkles, X } from 'lucide-react'
type Clip = { id: string; name: string; url: string; file: File; duration: number }
type Project = { id: string; name: string; idea: string; style: string; language: string; ratio: string; intensity: string; caption: string; title: string; subtitle: string; clips: {name:string; fileName:string; duration:number}[]; updated: number }
const STORAGE_KEY = 'bestrot-projects-v1'
const ideas = [
  { title: 'היצור שלא היה אמור להתקיים', hook: 'כולם חשבו שזה עוד סרטון AI רגיל… עד שהוא הסתובב.', style: 'AI Characters', duration: '15–30 שניות' },
  { title: 'המרוץ הכי חסר היגיון בעולם', hook: 'שלושה יצורים, חוק אחד, ואפס היגיון.', style: 'Italian Brainrot', duration: '15–30 שניות' },
  { title: 'המשחק נהיה אישי', hook: 'הוא רק רצה לעבור שלב. המשחק חשב אחרת.', style: 'Gameplay + Story', duration: '30–60 שניות' },
  { title: 'סיפוק חזותי בלתי אפשרי', hook: 'אל תמצמצו — הסוף שווה את זה.', style: 'Satisfying', duration: 'under 15s' },
  { title: 'הישרדות בעולם זעיר', hook: 'יש לו 60 שניות לצאת משם. אין לו מושג איפה הוא.', style: 'AI Cinematic', duration: '30–60 שניות' },
]
const styles = ['Italian Brainrot', 'AI Characters', 'Gameplay + Story', 'AI Cinematic', 'Satisfying / Sensory', 'Meme Edit / Hybrid', 'Original Style']
const starterScript = (idea: string) => `פתיח (0–3 שניות): ${idea || 'משהו מוזר קורה בעולם רגיל'}\n\nהסלמה (3–10 שניות): המצב הופך ליותר ויותר לא הגיוני. כל חיתוך מגלה פרט חדש.\n\nטוויסט (10–15 שניות): פרט קטן מהפתיח משנה את כל הסיפור.\n\nסיום: פריים מפתיע שמתחבר לפתיח וגורם לצופה לרצות לראות שוב.`

function readProjects(): Project[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as Project[] } catch { return [] }
}
function App() {
  const [page, setPage] = useState<'studio'|'ideas'|'clips'|'projects'|'settings'>('studio')
  const [lang, setLang] = useState<'he'|'en'>('he')
  const [projectName, setProjectName] = useState('Brainrot חדש')
  const [idea, setIdea] = useState('יצור AI מוזר שמנסה להיות מפורסם')
  const [clipSearch, setClipSearch] = useState('')
  const [style, setStyle] = useState(styles[0])
  const [duration, setDuration] = useState('15–30 שניות')
  const [ratio, setRatio] = useState('9:16')
  const [language, setLanguage] = useState('עברית')
  const [intensity, setIntensity] = useState('Extreme Brainrot')
  const [title, setTitle] = useState('היצור הזה יצא משליטה 💀')
  const [subtitle, setSubtitle] = useState('חכו לסוף…')
  const [caption, setCaption] = useState('זה לא אמיתי 😭')
  const [captionColor, setCaptionColor] = useState('#ffe45e')
  const [script, setScript] = useState(starterScript('יצור AI מוזר שמנסה להיות מפורסם'))
  const [clips, setClips] = useState<Clip[]>([])
  const [projects, setProjects] = useState<Project[]>(readProjects)
  const [activeClip, setActiveClip] = useState(0)
  const [exporting, setExporting] = useState(false)
  const [notice, setNotice] = useState('')
  const [theme, setTheme] = useState<'dark'|'light'>('dark')
  const [previewDevice, setPreviewDevice] = useState('tablet')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [aiMode, setAiMode] = useState('guided')
  const [audioVolume, setAudioVolume] = useState(85)
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('bestrot-gemini-key') || '')
  const [aiWorking, setAiWorking] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const currentClip = clips[activeClip]
  const isHebrew = lang === 'he'

  useEffect(() => { document.documentElement.lang = lang; document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr' }, [lang])
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(projects)) }, [projects])
  useEffect(() => { if (currentClip && videoRef.current) videoRef.current.src = currentClip.url }, [currentClip])
  useEffect(() => { if (!notice) return; const t = window.setTimeout(() => setNotice(''), 3200); return () => window.clearTimeout(t) }, [notice])

  const totalDuration = useMemo(() => clips.reduce((sum, clip) => sum + (clip.duration || 0), 0), [clips])
  const saveProject = () => {
    const item: Project = { id: crypto.randomUUID(), name: projectName, idea, style, language, ratio, intensity, caption, title, subtitle, clips: clips.map(c => ({name:c.name, fileName:c.file.name, duration:c.duration})), updated: Date.now() }
    setProjects(old => [item, ...old.filter(p => p.name !== projectName)].slice(0, 50))
    setNotice(isHebrew ? 'הפרויקט נשמר במכשיר הזה' : 'Project saved on this device')
  }
  const addClips = (files: FileList | null) => {
    if (!files) return
    const valid = Array.from(files).filter(f => f.type.startsWith('video/'))
    if (!valid.length) { setNotice(isHebrew ? 'יש לבחור קובצי וידאו' : 'Please select video files'); return }
    const added: Clip[] = valid.map(file => ({ id: crypto.randomUUID(), name: file.name.replace(/\.[^.]+$/, ''), url: URL.createObjectURL(file), file, duration: 0 }))
    setClips(old => [...old, ...added])
    setActiveClip(clips.length)
    setNotice(isHebrew ? `נוספו ${added.length} קטעי וידאו` : `${added.length} video clip(s) added`)
  }
  const removeClip = (id: string) => {
    setClips(old => { const target = old.find(c => c.id === id); if (target) URL.revokeObjectURL(target.url); return old.filter(c => c.id !== id) })
    setActiveClip(0)
  }
  const generateIdea = () => {
    const pick = ideas[Math.floor(Math.random() * ideas.length)]
    setIdea(pick.title); setStyle(pick.style); setDuration(pick.duration); setTitle(pick.hook); setScript(starterScript(pick.title)); setNotice(isHebrew ? 'רעיון חדש נוצר מתבניות מקומיות' : 'New idea generated from local templates')
  }
  const useIdea = (pick: typeof ideas[number]) => { setIdea(pick.title); setStyle(pick.style); setDuration(pick.duration); setTitle(pick.hook); setScript(starterScript(pick.title)); setPage('studio'); setNotice(isHebrew ? 'הרעיון נוסף לסטודיו' : 'Idea added to studio') }
  const exportProjectData = () => {
    const data = { app:'BestRot', version:'0.1.0', exportedAt:new Date().toISOString(), settings:{projectName,idea,style,duration,ratio,language,intensity,title,subtitle,caption,captionColor,script}, clips:clips.map(c=>({name:c.name,fileName:c.file.name,duration:c.duration})), note:'Video source files are not embedded in this project JSON. Keep the original video files separately.' }
    downloadBlob(new Blob([JSON.stringify(data,null,2)], {type:'application/json'}), `${safeName(projectName)}-project.json`)
  }
  const exportScript = () => downloadBlob(new Blob([`# ${title}\n\n${idea}\n\n${script}\n\n---\nCreated with BestRot`], {type:'text/markdown;charset=utf-8'}), `${safeName(projectName)}-script.md`)

  // Optional text AI: runs only after the user explicitly clicks the button.
  const generateAIScript = async () => {
    if (!geminiKey.trim()) { setNotice(isHebrew ? 'הוסף מפתח Gemini בהגדרות כדי להפעיל יצירת תסריט AI' : 'Add a Gemini API key in Settings to enable AI scripts'); setPage('settings'); return }
    setAiWorking(true)
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + encodeURIComponent(geminiKey.trim()), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: `You are a short-form Brainrot video writer. Create an original, punchy ${duration} video concept. Output in ${language}. Style: ${style}. Intensity: ${intensity}. Idea: ${idea}. Return: 1) clickable title, 2) a 1-second hook, 3) 4-6 timestamped scenes with visual direction and on-screen caption, 4) ending/loop. Keep it practical for a solo creator. Avoid copyrighted characters and existing scripts.` }] }], generationConfig: { temperature: 0.9, maxOutputTokens: 1200 } })
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload?.error?.message || `API error ${response.status}`)
      const text = payload?.candidates?.[0]?.content?.parts?.map((part: {text?:string}) => part.text || '').join('\n').trim()
      if (!text) throw new Error('The AI returned an empty response')
      setScript(text)
      const firstLine = text.split('\n').find((line: string) => line.trim())?.replace(/^#+\s*/, '').replace(/^\d+[.)]\s*/, '')
      if (firstLine) setTitle(firstLine.slice(0, 100))
      setNotice(isHebrew ? 'תסריט נוצר באמצעות Gemini. בדוק וערוך לפני פרסום.' : 'Gemini script generated. Review and edit before publishing.')
    } catch (error) {
      setNotice((isHebrew ? 'יצירת ה-AI נכשלה: ' : 'AI generation failed: ') + (error instanceof Error ? error.message : 'Unknown error'))
    } finally { setAiWorking(false) }
  }

  // Generates an actual animated text/graphic video locally in the browser. This is not generative-AI footage.
  const generateMotionVideo = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (!('MediaRecorder' in window) || !canvas.captureStream) { setNotice(isHebrew ? 'הדפדפן לא תומך ביצירת וידאו. נסה Chrome או Safari מעודכן.' : 'This browser cannot record video. Try an updated Chrome or Safari.'); return }
    setExporting(true)
    try {
      const portrait = ratio === '9:16'
      canvas.width = portrait ? 720 : ratio === '1:1' ? 720 : 1280
      canvas.height = portrait ? 1280 : ratio === '1:1' ? 720 : 720
      const ctx = canvas.getContext('2d')!
      const stream = canvas.captureStream(30)
      const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm'
      const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 5_000_000 })
      const chunks: BlobPart[] = []
      recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data) }
      const stopped = new Promise<void>(resolve => { recorder.onstop = () => resolve() })
      const sceneTexts = [idea || 'Something strange is happening', title || 'WAIT FOR IT 💀', caption || 'You were not ready', subtitle || 'Part 2?']
      const emojis = ['👾', '🌀', '💀', '🚀']
      const palettes = [['#7c3aed','#ec4899'], ['#0f766e','#22d3ee'], ['#be123c','#f59e0b'], ['#1d4ed8','#a78bfa']]
      const started = performance.now()
      const durationMs = 12000
      const draw = (now: number) => {
        const elapsed = now - started
        const scene = Math.min(3, Math.floor(elapsed / (durationMs / 4)))
        const progress = (elapsed % (durationMs / 4)) / (durationMs / 4)
        const [c1,c2] = palettes[scene]
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
        gradient.addColorStop(0, c1); gradient.addColorStop(1, c2)
        ctx.fillStyle = gradient; ctx.fillRect(0,0,canvas.width,canvas.height)
        // Moving decorative circles create motion even without uploaded footage.
        for (let i=0;i<18;i++) {
          const x = ((i*137 + elapsed*(0.025 + i%3*0.012)) % (canvas.width+120)) - 60
          const y = (i*211 + Math.sin(elapsed/430+i)*70) % canvas.height
          ctx.beginPath(); ctx.arc(x,y,10+(i%5)*9,0,Math.PI*2); ctx.fillStyle = 'rgba(255,255,255,.10)'; ctx.fill()
        }
        ctx.save(); ctx.translate(canvas.width/2, canvas.height*.33); ctx.rotate(Math.sin(elapsed/420)*.12); ctx.font = `${Math.round(canvas.width*.24)}px system-ui, sans-serif`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(emojis[scene], 0, Math.sin(elapsed/260)*20); ctx.restore()
        ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.direction = language === 'עברית' ? 'rtl' : 'ltr'
        ctx.font = `900 ${Math.round(canvas.width*.064)}px system-ui, sans-serif`; ctx.lineWidth = Math.max(4,canvas.width*.009); ctx.strokeStyle='#111'; ctx.fillStyle='#fff'
        wrapCanvasText(ctx, sceneTexts[scene], canvas.width*.88, canvas.height*.58, canvas.width*.84, canvas.width*.074)
        ctx.fillStyle = '#fff'; ctx.globalAlpha=.8; ctx.fillRect(canvas.width*.12,canvas.height*.78,canvas.width*.76,8); ctx.globalAlpha=1
        ctx.fillStyle = '#ffe45e'; ctx.fillRect(canvas.width*.12,canvas.height*.78,canvas.width*.76*progress,8)
        ctx.font=`800 ${Math.round(canvas.width*.025)}px system-ui, sans-serif`; ctx.fillStyle='rgba(255,255,255,.9)'; ctx.fillText('BESTROT • ORIGINAL MOTION VIDEO',canvas.width/2,canvas.height*.93)
        if (elapsed < durationMs) requestAnimationFrame(draw)
        else { recorder.stop() }
      }
      recorder.start(250); requestAnimationFrame(draw)
      await stopped
      stream.getTracks().forEach(track => track.stop())
      const blob = new Blob(chunks, {type: mime})
      if (!blob.size) throw new Error('The browser produced an empty video')
      downloadBlob(blob, `${safeName(projectName)}-motion-video.webm`)
      setNotice(isHebrew ? 'נוצר סרטון אנימציה והורד למכשיר. זהו וידאו גרפי, לא קטעי צילום שנוצרו ב-AI.' : 'Motion video downloaded. This is animated graphics, not AI-generated footage.')
    } catch (error) {
      setNotice((isHebrew ? 'יצירת הסרטון נכשלה: ' : 'Video creation failed: ') + (error instanceof Error ? error.message : 'Unknown error'))
    } finally { setExporting(false) }
  }

  const exportVideo = async () => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return
    if (!clips.length) { setNotice(isHebrew ? 'הוסף לפחות קטע וידאו אחד לפני הייצוא' : 'Add at least one video clip before exporting'); return }
    if (!('MediaRecorder' in window) || !canvas.captureStream) { setNotice(isHebrew ? 'הדפדפן הזה לא תומך בייצוא וידאו. נסה Chrome מעודכן.' : 'This browser does not support video export. Try updated Chrome.'); return }
    setExporting(true)
    try {
      const ctx = canvas.getContext('2d')!
      const portrait = ratio === '9:16'
      canvas.width = portrait ? 720 : ratio === '1:1' ? 720 : 1280
      canvas.height = portrait ? 1280 : ratio === '1:1' ? 720 : 720
      const stream = canvas.captureStream(30)
      let audioContext: AudioContext | null = null
      let audioSource: MediaElementAudioSourceNode | null = null
      try {
        audioContext = new AudioContext()
        audioSource = audioContext.createMediaElementSource(video)
        const gain = audioContext.createGain(); gain.gain.value = audioVolume / 100
        const destination = audioContext.createMediaStreamDestination()
        audioSource.connect(gain); gain.connect(destination); destination.stream.getAudioTracks().forEach(track => stream.addTrack(track))
        await audioContext.resume()
      } catch { /* Browser audio capture can be unavailable; video export still works. */ }
      const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' : 'video/webm'
      const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 5_000_000 })
      const chunks: BlobPart[] = []
      recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data) }
      const stopped = new Promise<void>(resolve => { recorder.onstop = () => resolve() })
      const drawFrame = (label: string) => {
        ctx.fillStyle = '#101014'; ctx.fillRect(0,0,canvas.width,canvas.height)
        if (video.readyState >= 2 && video.videoWidth > 0) {
          const scale = Math.max(canvas.width/video.videoWidth, canvas.height/video.videoHeight)
          const w = video.videoWidth*scale, h = video.videoHeight*scale
          ctx.drawImage(video,(canvas.width-w)/2,(canvas.height-h)/2,w,h)
        }
        ctx.fillStyle = 'rgba(0,0,0,.38)'; ctx.fillRect(0,0,canvas.width,canvas.height)
        ctx.textAlign='center'; ctx.direction = language === 'עברית' ? 'rtl' : 'ltr'
        ctx.font = `900 ${Math.max(24,canvas.width*0.052)}px Arial`; ctx.lineWidth = Math.max(3,canvas.width*0.006); ctx.strokeStyle='#151515'; ctx.fillStyle='#ffffff'
        wrapCanvasText(ctx,title,canvas.width*.88,canvas.height*.17,canvas.width*.82,canvas.width*.065); 
        ctx.font = `900 ${Math.max(30,canvas.width*0.07)}px Arial`; ctx.lineWidth=Math.max(4,canvas.width*.008); ctx.strokeStyle='#151515'; ctx.fillStyle=captionColor
        wrapCanvasText(ctx,label || caption,canvas.width*.86,canvas.height*.73,canvas.width*.84,canvas.width*.085)
        ctx.font=`700 ${Math.max(18,canvas.width*.025)}px Arial`; ctx.fillStyle='rgba(255,255,255,.86)'; ctx.fillText('BESTROT',canvas.width/2,canvas.height*.94)
      }
      recorder.start(250)
      for (const clip of clips) {
        video.pause(); video.src = clip.url; video.load()
        await new Promise<void>((resolve,reject) => { video.onloadedmetadata=()=>resolve(); video.onerror=()=>reject(new Error('Could not load a video clip')) })
        video.currentTime = 0
        drawFrame(caption)
        await video.play()
        await new Promise<void>(resolve => {
          let raf = 0
          const draw = () => { drawFrame(caption); if (!video.ended && !video.paused) raf=requestAnimationFrame(draw); else { cancelAnimationFrame(raf); resolve() } }
          raf=requestAnimationFrame(draw)
          video.onended=()=>resolve()
        })
      }
      recorder.stop(); await stopped
      stream.getTracks().forEach(t=>t.stop()); if (audioSource) audioSource.disconnect(); if (audioContext) await audioContext.close()
      const blob = new Blob(chunks,{type:'video/webm'})
      downloadBlob(blob,`${safeName(projectName)}.webm`)
      setNotice(isHebrew ? 'הייצוא הושלם — קובץ WebM הורד למכשיר' : 'Export complete — WebM file downloaded')
    } catch (err) {
      console.error(err); setNotice(isHebrew ? 'הייצוא נכשל. נסה קובץ וידאו אחר או Chrome מעודכן.' : 'Export failed. Try another video or updated Chrome.')
    } finally { setExporting(false); if (video) { video.pause(); video.onended=null } }
  }

  return <div className={`app-shell ${theme}`}>
    <aside className="sidebar">
      <button className="brand" onClick={() => setPage('studio')}><span className="brand-mark"><Clapperboard size={22}/></span><span>Best<span className="brand-accent">Rot</span><small>AI BRAINROT STUDIO</small></span></button>
      <div className="side-label">{isHebrew ? 'סביבת עבודה' : 'WORKSPACE'}</div>
      <nav className="nav-list">
        <button className={page==='studio'?'nav-item active':'nav-item'} onClick={()=>setPage('studio')}><LayoutDashboard size={18}/>{isHebrew?'הסטודיו שלי':'My Studio'}<span className="nav-dot"/></button>
        <button className={page==='ideas'?'nav-item active':'nav-item'} onClick={()=>setPage('ideas')}><Lightbulb size={18}/>{isHebrew?'מעבדת רעיונות':'Idea Lab'}<span className="new-pill">NEW</span></button>
        <button className={page==='clips'?'nav-item active':'nav-item'} onClick={()=>{setClipSearch(idea);setPage('clips')}}><Search size={18}/>{isHebrew?'חיפוש קטעים':'Clip Finder'}<span className="new-pill">NEW</span></button>
        <button className={page==='projects'?'nav-item active':'nav-item'} onClick={()=>setPage('projects')}><FolderOpen size={18}/>{isHebrew?'הפרויקטים שלי':'My Projects'}<span className="nav-count">{projects.length}</span></button>
      </nav>
      <div className="side-label side-label-spaced">{isHebrew?'התאמה אישית':'PREFERENCES'}</div>
      <nav className="nav-list">
        <button className={page==='settings'?'nav-item active':'nav-item'} onClick={()=>setPage('settings')}><Settings2 size={18}/>{isHebrew?'הגדרות':'Settings'}</button>
      </nav>
      <div className="sidebar-bottom">
        <div className="local-card"><span className="local-icon"><Check size={15}/></span><div><strong>{isHebrew?'שמירה מקומית':'Local-first'}</strong><p>{isHebrew?'הפרויקטים נשמרים בדפדפן':'Projects stay in this browser'}</p></div></div>
        <button className="profile-row" onClick={()=>setLang(lang==='he'?'en':'he')}><div className="avatar">BR</div><div className="profile-info"><strong>BestRot Studio</strong><span>{isHebrew?'מצב אישי · חינמי':'Personal · Free'}</span></div><Languages size={17}/></button>
      </div>
    </aside>

    <main className="main-content">
      <header className="topbar"><div className="breadcrumb"><span>{isHebrew?'סטודיו':'Studio'}</span><span className="crumb-sep">/</span><strong>{page==='studio'?(isHebrew?'עורך וידאו': 'Video Editor'):page==='ideas'?(isHebrew?'מעבדת רעיונות':'Idea Lab'):page==='projects'?(isHebrew?'הפרויקטים שלי':'My Projects'):page==='clips'?(isHebrew?'חיפוש קטעים ויראליים':'Clip Finder'):(isHebrew?'הגדרות':'Settings')}</strong></div><div className="top-actions"><span className="status-chip"><span className="status-dot"/>{isHebrew?'גרסת התחלה':'Starter build'}</span><button className="icon-button" onClick={()=>setTheme(theme==='dark'?'light':'dark')} aria-label="Toggle theme"><Moon size={18}/></button><button className="language-button" onClick={()=>setLang(lang==='he'?'en':'he')}><Globe2 size={16}/>{lang==='he'?'עברית':'English'}<ChevronDown size={14}/></button></div></header>
      {page==='studio' && <>
        <section className="welcome-row"><div><div className="eyebrow"><Sparkles size={14}/>{isHebrew?'היצירתיות שלך, בלי גבולות':'YOUR CREATIVE PLAYGROUND'}</div><h1>{isHebrew?'בוא ניצור משהו':'Let’s make something'} <span>{isHebrew?'בלתי נשכח.':'unforgettable.'}</span></h1><p>{isHebrew?'מרעיון קטן לסרטון Brainrot — בנה, ערוך וייצא במקום אחד.':'From a spark of an idea to a Brainrot video — build, edit and export in one place.'}</p></div><div className="welcome-actions"><button className="button button-primary" onClick={generateMotionVideo} disabled={exporting}>{exporting?<span className="spinner"/>:<Film size={16}/>}{isHebrew?'צור סרטון מטקסט':'Create motion video'}</button><button className="button button-ghost" onClick={saveProject}><Save size={16}/>{isHebrew?'שמור פרויקט':'Save project'}</button></div></section>
        <div className="studio-grid">
          <section className="panel settings-panel">
            <div className="panel-heading"><div className="heading-icon purple"><WandSparkles size={18}/></div><div><h2>{isHebrew?'בנה את הסרטון שלך':'Build your video'}</h2><p>{isHebrew?'הגדר את הבסיס — אפשר לשנות הכול בהמשך':'Set the direction. Everything can be changed later.'}</p></div><span className="step-label">01 / 03</span></div>
            <label className="field-label">{isHebrew?'שם הפרויקט':'Project name'}</label><input className="text-input" value={projectName} onChange={e=>setProjectName(e.target.value)} placeholder="My Brainrot #01" />
            <div className="field-label label-with-action"><span>{isHebrew?'מה הרעיון לסרטון?':'What’s the video idea?'}</span><button className="text-action" onClick={generateIdea}><Sparkles size={13}/>{isHebrew?'הפתע אותי':'Surprise me'}</button></div>
            <textarea className="text-area idea-area" value={idea} onChange={e=>{setIdea(e.target.value);setScript(starterScript(e.target.value))}} placeholder={isHebrew?'תאר את הרעיון שלך...':'Describe your idea...'} rows={3}/>
            <div className="two-fields"><div><label className="field-label">{isHebrew?'סגנון':'Style'}</label><select className="select-input" value={style} onChange={e=>setStyle(e.target.value)}>{styles.map(s=><option key={s}>{s}</option>)}</select></div><div><label className="field-label">{isHebrew?'משך הסרטון':'Video length'}</label><select className="select-input" value={duration} onChange={e=>setDuration(e.target.value)}>{['under 15s','15–30 שניות','30–60 שניות','1–3 דקות'].map(s=><option key={s}>{s}</option>)}</select></div></div>
            <label className="field-label">{isHebrew?'שפת התוכן':'Content language'}</label><select className="select-input" value={language} onChange={e=>setLanguage(e.target.value)}>{['עברית','English','Italiano','Español','العربية','Auto / לפי הטרנד'].map(s=><option key={s}>{s}</option>)}</select>
            <label className="field-label">{isHebrew?'עוצמת העריכה':'Edit intensity'}</label><div className="intensity-options">{[{id:'Extreme Brainrot',label:isHebrew?'כאוס מוחלט':'Maximum chaos',desc:isHebrew?'חיתוכים, צבעים, ממים':'Fast cuts, memes'},{id:'Balanced',label:isHebrew?'מאוזן':'Balanced',desc:isHebrew?'קצב חזק וברור':'Paced & punchy'},{id:'Cinematic',label:isHebrew?'קולנועי':'Cinematic',desc:isHebrew?'נקי, סיפור ואווירה':'Clean & story-led'}].map(x=><button key={x.id} className={intensity===x.id?'intensity-card selected':'intensity-card'} onClick={()=>setIntensity(x.id)}><span className="radio-dot"/><strong>{x.label}</strong><small>{x.desc}</small></button>)}</div>
            <button className="advanced-toggle" onClick={()=>setShowAdvanced(!showAdvanced)}><Settings2 size={15}/>{isHebrew?'הגדרות מתקדמות':'Advanced settings'}<ChevronDown size={15} className={showAdvanced?'rotated':''}/></button>
            {showAdvanced && <div className="advanced-box"><label className="field-label">{isHebrew?'מצב עבודה':'Workflow mode'}</label><select className="select-input" value={aiMode} onChange={e=>setAiMode(e.target.value)}><option value="auto">{isHebrew?'אוטומטי':'Automatic'}</option><option value="guided">{isHebrew?'אישור בכל שלב':'Guided approval'}</option><option value="manual">{isHebrew?'שליטה ידנית':'Manual control'}</option></select><label className="field-label">{isHebrew?'יחס מסך':'Aspect ratio'}</label><div className="ratio-options">{['9:16','16:9','1:1'].map(r=><button key={r} onClick={()=>setRatio(r)} className={ratio===r?'ratio-option selected':'ratio-option'}>{r}</button>)}</div><label className="field-label">{isHebrew?'עוצמת שמע מקורית':'Source audio volume'} · {audioVolume}%</label><input type="range" min="0" max="100" value={audioVolume} onChange={e=>setAudioVolume(Number(e.target.value))} className="range-input"/></div>}
            <button className="button button-primary full-button" onClick={()=>{setScript(starterScript(idea));setNotice(isHebrew?'התסריט נבנה מתבנית מקומית — לא נדרש API':'Script built from a local template — no API required')}}><Sparkles size={17}/>{isHebrew?'בנה תסריט ראשוני':'Draft a script'}<span className="button-arrow">↗</span></button>
          </section>

          <section className="panel preview-panel">
            <div className="panel-heading"><div className="heading-icon orange"><Film size={18}/></div><div><h2>{isHebrew?'תצוגה מקדימה':'Live preview'}</h2><p>{isHebrew?'בדוק את הפריים והכתוביות שלך':'See your frame and captions'}</p></div><button className="more-button" onClick={()=>setNotice(isHebrew?'טיפ: העלה קטע וידאו כדי לראות אותו בתצוגה':'Tip: upload a clip to preview it')}><MoreHorizontal size={20}/></button></div>
            <div className="preview-toolbar"><div className="device-switch"><button className={previewDevice==='phone'?'device active':'device'} onClick={()=>setPreviewDevice('phone')} title="Phone"><Smartphone size={15}/></button><button className={previewDevice==='tablet'?'device active':'device'} onClick={()=>setPreviewDevice('tablet')} title="Tablet"><Tablet size={15}/></button><button className={previewDevice==='desktop'?'device active':'device'} onClick={()=>setPreviewDevice('desktop')} title="Desktop"><Monitor size={15}/></button></div><span className="ratio-tag">{ratio} · {ratio==='9:16'?'Portrait':ratio==='16:9'?'Landscape':'Square'}</span></div>
            <div className={`preview-stage ${previewDevice}`}><div className={`video-frame ratio-${ratio.replace(':','-')}`}>
              {currentClip ? <video ref={videoRef} className="preview-video" src={currentClip.url} controls playsInline onLoadedMetadata={e=>{const d=(e.currentTarget as HTMLVideoElement).duration;setClips(old=>old.map(c=>c.id===currentClip.id?{...c,duration:d}:c))}} /> : <div className="empty-preview"><div className="preview-glow"/><div className="empty-icon"><Clapperboard size={27}/></div><strong>{isHebrew?'הסיפור שלך מתחיל כאן':'Your story starts here'}</strong><span>{isHebrew?'העלה וידאו או בחר רעיון כדי להתחיל':'Upload a video or pick an idea to get started'}</span><button className="button button-small button-outline" onClick={()=>fileInput.current?.click()}><Upload size={14}/>{isHebrew?'העלה קטע וידאו':'Upload video'}</button></div>}
              <div className="preview-overlay"><div className="overlay-title" dir={language==='עברית'?'rtl':'ltr'}>{title}</div><div className="overlay-subtitle">{subtitle}</div><div className="overlay-caption" style={{color:captionColor}}>{caption}</div><div className="overlay-watermark">BESTROT</div></div>
            </div></div>
            <div className="preview-bottom"><div className="preview-meta"><span className="live-dot"/>{isHebrew?'תצוגת כתוביות':'Caption preview'}<span className="meta-divider"/><span>{clips.length} {isHebrew?'קטעים':'clips'}</span></div><button className="text-action" onClick={()=>setShowAdvanced(!showAdvanced)}><Settings2 size={14}/>{isHebrew?'שנה פורמט':'Format'}</button></div>
            <div className="caption-controls"><div className="caption-control"><label>{isHebrew?'כותרת':'Title'}</label><input value={title} onChange={e=>setTitle(e.target.value)} className="mini-input" /></div><div className="caption-control"><label>{isHebrew?'כתובית בולטת':'Main caption'}</label><div className="color-input-wrap"><input value={caption} onChange={e=>setCaption(e.target.value)} className="mini-input"/><input type="color" value={captionColor} onChange={e=>setCaptionColor(e.target.value)} className="color-picker" aria-label="Caption color"/></div></div></div>
          </section>
        </div>

        <section className="panel timeline-panel"><div className="panel-heading timeline-heading"><div className="heading-icon blue"><Activity size={18}/></div><div><h2>{isHebrew?'ציר הזמן והמדיה':'Timeline & media'}</h2><p>{isHebrew?'סדר את הקטעים שיופיעו בסרטון המיוצא':'Arrange the clips used in your export'}</p></div><div className="timeline-actions"><button className="button button-ghost button-small" onClick={()=>fileInput.current?.click()}><Plus size={15}/>{isHebrew?'הוסף מדיה':'Add media'}</button><button className="button button-primary button-small" onClick={exportVideo} disabled={exporting}>{exporting?<span className="spinner"/>:<Download size={15} />}{exporting?(isHebrew?'מייצא…':'Exporting…'):(isHebrew?'ייצא וידאו':'Export video')}</button></div></div>
          <input ref={fileInput} type="file" accept="video/*" multiple hidden onChange={e=>addClips(e.target.files)} />
          {clips.length===0 ? <button className="upload-drop" onClick={()=>fileInput.current?.click()}><div className="upload-icon"><Upload size={21}/></div><strong>{isHebrew?'גרור לכאן סרטונים או לחץ להעלאה':'Drop videos here or click to upload'}</strong><span>{isHebrew?'MP4, MOV, WebM · הקבצים נשארים במכשיר שלך':'MP4, MOV, WebM · files stay on your device'}</span></button> : <div className="clip-list">{clips.map((clip,i)=><div key={clip.id} className={activeClip===i?'clip-item active':'clip-item'} onClick={()=>setActiveClip(i)}><div className="clip-thumb"><Film size={18}/><span>{String(i+1).padStart(2,'0')}</span></div><div className="clip-info"><strong>{clip.name}</strong><span>{clip.file.name} · {clip.duration?formatTime(clip.duration):'Duration loading'}</span></div><button className="icon-button tiny" onClick={e=>{e.stopPropagation();removeClip(clip.id)}} aria-label="Remove clip"><Trash2 size={15}/></button></div>)}<button className="add-another" onClick={()=>fileInput.current?.click()}><Plus size={15}/>{isHebrew?'הוסף קטע נוסף':'Add another clip'}</button></div>}
          <div className="timeline-footer"><div className="timeline-stat"><Clock3 size={15}/><span>{isHebrew?'משך כולל':'Total duration'}</span><strong>{formatTime(totalDuration)}</strong></div><div className="timeline-stat"><Film size={15}/><span>{isHebrew?'קטעי וידאו':'Video clips'}</span><strong>{clips.length}</strong></div><div className="timeline-stat"><AudioLines size={15}/><span>{isHebrew?'אודיו מקור':'Source audio'}</span><strong>{audioVolume===0?(isHebrew?'מושתק':'Muted'):`${audioVolume}%`}</strong></div></div>
        </section>
        <section className="lower-grid"><div className="panel script-panel"><div className="panel-heading"><div className="heading-icon pink"><Clapperboard size={18}/></div><div><h2>{isHebrew?'תסריט הסרטון':'Video script'}</h2><p>{isHebrew?'ערוך את המבנה והקצב של הסיפור':'Edit your story structure and pacing'}</p></div></div><textarea className="text-area script-area" value={script} onChange={e=>setScript(e.target.value)} rows={6}/><div className="panel-footer"><span className="muted-small">{isHebrew?'טיוטה מקומית · לא נוצרה על ידי מודל AI חיצוני':'Local draft · no external AI model used'}</span><div className="script-actions"><button className="text-action" onClick={generateAIScript} disabled={aiWorking}>{aiWorking?<span className="spinner"/>:<Sparkles size={14}/>}{isHebrew?'כתוב עם AI':'Write with AI'}</button><button className="text-action" onClick={exportScript}><ArrowDownToLine size={14}/>{isHebrew?'הורד תסריט':'Download script'}</button></div></div></div>
          <div className="panel quick-panel"><div className="panel-heading"><div className="heading-icon green"><Sparkles size={18}/></div><div><h2>{isHebrew?'הצעדים הבאים':'Next steps'}</h2><p>{isHebrew?'הפוך את הטיוטה לסרטון':'Turn your draft into a video'}</p></div></div><div className="checklist"><div className="check-row"><span className={idea?'check-circle done':'check-circle'}>{idea?<Check size={13}/>:1}</span><div><strong>{isHebrew?'בחר רעיון וסגנון':'Choose an idea & style'}</strong><small>{isHebrew?'הגדר את הקונספט':'Set the concept'}</small></div></div><div className="check-row"><span className={clips.length?'check-circle done':'check-circle'}>{clips.length?<Check size={13}/>:2}</span><div><strong>{isHebrew?'העלה קטעי וידאו':'Upload video clips'}</strong><small>{isHebrew?'הוסף מדיה לעריכה ולייצוא':'Add media to edit and export'}</small></div></div><div className="check-row"><span className="check-circle">3</span><div><strong>{isHebrew?'ייצא וידאו':'Export your video'}</strong><small>{isHebrew?'הורד קובץ WebM מהמכשיר':'Download a WebM file'}</small></div></div></div><button className="button button-ghost full-button" onClick={exportProjectData}><Download size={16}/>{isHebrew?'ייצא נתוני פרויקט':'Export project data'}</button></div></section>
      </>}
      {page==='ideas' && <section className="page-section"><div className="page-intro"><div className="eyebrow"><Lightbulb size={14}/>{isHebrew?'רעיון הוא רק ההתחלה':'EVERY VIRAL VIDEO STARTS SOMEWHERE'}</div><h1>{isHebrew?'מעבדת רעיונות':'Idea Lab'} <span>✦</span></h1><p>{isHebrew?'מצא כיוון, בחר רעיון והעבר אותו ישירות לסטודיו. הרעיונות כאן הם הצעות מקומיות, לא נתוני טרנדים חיים.':'Explore concepts and send one straight to your studio. These are local suggestions, not live trend data.'}</p><button className="button button-primary" onClick={generateIdea}><Sparkles size={16}/>{isHebrew?'הגרל רעיון חדש':'Generate an idea'}</button></div><div className="ideas-grid">{ideas.map((item,i)=><article className="idea-card" key={item.title}><div className={`idea-art art-${i+1}`}><span className="idea-number">IDEA 0{i+1}</span><span className="idea-art-icon">{['👾','🌀','🎮','🫧','🌌'][i]}</span><span className="idea-art-tag">{item.style}</span></div><div className="idea-card-body"><div className="idea-card-top"><span className="duration-pill"><Clock3 size={12}/>{item.duration}</span><button className="icon-button" onClick={()=>useIdea(item)} aria-label="Use idea"><Plus size={17}/></button></div><h3>{item.title}</h3><p>{item.hook}</p><button className="text-action" onClick={()=>useIdea(item)}>{isHebrew?'השתמש ברעיון':'Use this idea'}<span>↗</span></button></div></article>)}</div></section>}
      {page==='clips' && <section className="page-section clip-finder-page">
        <div className="page-intro"><div className="eyebrow"><Search size={14}/>{isHebrew?'מצא חומר גלם לסרטון':'FIND FOOTAGE FOR YOUR EDIT'}</div><h1>{isHebrew?'חיפוש קטעים ויראליים':'Viral Clip Finder'} <span>✦</span></h1><p>{isHebrew?'חפש לפי רעיון הסרטון שלך ברשתות ובספריות וידאו. פתיחת התוצאות מתבצעת באתר המקור; אחר כך אפשר להעלות קבצים שיש לך זכות להשתמש בהם לציר הזמן.':'Search social platforms and stock-video libraries for footage matching your idea. Results open on the source site; upload clips you have rights to use into the timeline.'}</p></div>
        <div className="panel finder-search-panel"><label className="field-label" htmlFor="clip-search">{isHebrew?'מה אתה מחפש?':'What footage are you looking for?'}</label><input id="clip-search" className="text-input finder-input" value={clipSearch} onChange={e=>setClipSearch(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){const q=encodeURIComponent((clipSearch||idea)+' viral video');window.open('https://www.youtube.com/results?search_query='+q,'_blank','noopener,noreferrer')}}} placeholder={isHebrew?'למשל: funny animals, Minecraft parkour, surreal meme…':'e.g. funny animals, Minecraft parkour, surreal meme…'}/><div className="finder-actions"><button className="button button-primary" onClick={()=>{setIdea(clipSearch||idea);setPage('studio')}}><Clapperboard size={15}/>{isHebrew?'השתמש בחיפוש וחזור לסטודיו':'Use idea in Studio'}</button><button className="button button-ghost" onClick={()=>setClipSearch(idea)}><WandSparkles size={15}/>{isHebrew?'השתמש ברעיון שלי':'Use my video idea'}</button></div></div>
        <div className="finder-section-title"><h2>{isHebrew?'חיפוש ברשתות חברתיות':'Search social platforms'}</h2><span>{isHebrew?'נפתח בחלון חדש':'Opens in a new tab'}</span></div>
        <div className="finder-grid">{[
          {name:'YouTube',desc:isHebrew?'חפש Shorts וקטעים פופולריים':'Search Shorts and popular clips',url:(q:string)=>'https://www.youtube.com/results?search_query='+encodeURIComponent(q+' viral shorts')},
          {name:'TikTok',desc:isHebrew?'חיפוש סרטונים לפי מילת מפתח':'Search videos by keyword',url:(q:string)=>'https://www.tiktok.com/search?q='+encodeURIComponent(q)},
          {name:'Instagram Reels',desc:isHebrew?'חפש Reels קשורים':'Search related Reels',url:(q:string)=>'https://www.google.com/search?q='+encodeURIComponent('site:instagram.com/reel '+q)},
          {name:'Facebook Video',desc:isHebrew?'חיפוש סרטונים ציבוריים':'Search public videos',url:(q:string)=>'https://www.facebook.com/search/videos/?q='+encodeURIComponent(q)},
          {name:'Reddit',desc:isHebrew?'קליפים וממים מקהילות':'Clips and memes from communities',url:(q:string)=>'https://www.reddit.com/search/?q='+encodeURIComponent(q+' video')},
          {name:'Google Videos',desc:isHebrew?'חיפוש רחב בין אתרים':'Broad video search across sites',url:(q:string)=>'https://www.google.com/search?tbm=vid&q='+encodeURIComponent(q+' viral video')}
        ].map(item=><article className="finder-card" key={item.name}><div className="finder-card-icon"><Film size={19}/></div><div className="finder-card-copy"><strong>{item.name}</strong><span>{item.desc}</span></div><button className="button button-ghost button-small" onClick={()=>window.open(item.url((clipSearch||idea).trim()),'_blank','noopener,noreferrer')}><ExternalLink size={13}/>{isHebrew?'חפש':'Search'}</button></article>)}</div>
        <div className="finder-section-title"><h2>{isHebrew?'ספריות עם קטעים להורדה':'Stock libraries with downloadable clips'}</h2><span>{isHebrew?'בדוק את הרישיון של כל קובץ':'Check each asset’s license'}</span></div>
        <div className="finder-grid">{[
          {name:'Pexels Videos',desc:isHebrew?'ספריית קטעי וידאו חינמיים':'Free stock video library',url:(q:string)=>'https://www.pexels.com/search/videos/'+encodeURIComponent(q).replace(/%20/g,'%20')+'/'},
          {name:'Pixabay Videos',desc:isHebrew?'וידאו ותוכן לשימוש לפי רישיון האתר':'Videos under the site’s content license',url:(q:string)=>'https://pixabay.com/videos/search/'+encodeURIComponent(q).replace(/%20/g,'%20')+'/'},
        ].map(item=><article className="finder-card stock-card" key={item.name}><div className="finder-card-icon stock-icon"><Download size={19}/></div><div className="finder-card-copy"><strong>{item.name}</strong><span>{item.desc}</span></div><button className="button button-primary button-small" onClick={()=>window.open(item.url((clipSearch||idea).trim()),'_blank','noopener,noreferrer')}><ExternalLink size={13}/>{isHebrew?'מצא קטעים':'Find clips'}</button></article>)}</div>
        <div className="finder-warning"><HelpCircle size={18}/><div><strong>{isHebrew?'חשוב לגבי זכויות יוצרים':'Important: copyright and platform limits'}</strong><p>{isHebrew?'החיפוש פותח תוצאות ציבוריות, אך אינו מוריד סרטונים אוטומטית מרשתות חברתיות. לרוב הפלטפורמות יש הגבלות הורדה ושימוש. השתמש בקטעים מקוריים שלך, בחומרים עם רישיון מתאים או בקבצים שקיבלת מהם אישור. לאחר הורדה חוקית למכשיר, חזור לסטודיו ולחץ ״הוסף מדיה״.':'This finder opens public search results; it does not automatically download videos from social networks. Platforms restrict downloads and reuse. Use your own footage, properly licensed assets, or clips you have permission to use. After legally saving a clip to your device, return to Studio and click Add media.'}</p><button className="button button-ghost button-small" onClick={()=>{setPage('studio');setNotice(isHebrew?'בסטודיו, לחץ על ״הוסף מדיה״ והעלה את הקבצים שהורדת כחוק.':'In Studio, click Add media and upload clips you are allowed to use.')}}><Upload size={14}/>{isHebrew?'חזרה לסטודיו להעלאת קטעים':'Return to Studio to upload clips'}</button></div></div>
      </section>}
      {page==='projects' && <section className="page-section"><div className="page-intro"><div className="eyebrow"><FolderOpen size={14}/>{isHebrew?'העבודה שלך, במקום אחד':'YOUR WORKSPACE'}</div><h1>{isHebrew?'הפרויקטים שלי':'My Projects'}</h1><p>{isHebrew?'פרויקטים נשמרים מקומית בדפדפן הנוכחי. הם לא מסתנכרנים אוטומטית בין מכשירים.':'Projects are stored in this browser only and do not sync across devices.'}</p><button className="button button-primary" onClick={()=>{setPage('studio');setProjectName('Brainrot חדש')}}><Plus size={16}/>{isHebrew?'פרויקט חדש':'New project'}</button></div>{projects.length===0?<div className="empty-projects"><FolderOpen size={36}/><h3>{isHebrew?'עוד אין פרויקטים שמורים':'No saved projects yet'}</h3><p>{isHebrew?'שמור את הפרויקט הראשון שלך מתוך הסטודיו.':'Save your first project from the studio.'}</p><button className="button button-ghost" onClick={()=>setPage('studio')}>{isHebrew?'חזרה לסטודיו':'Go to studio'}</button></div>:<div className="projects-list">{projects.map(p=><div className="project-row" key={p.id}><div className="project-cover"><Clapperboard size={22}/></div><div className="project-details"><strong>{p.name}</strong><span>{p.style} · {p.ratio} · {p.clips.length} clips</span><small>{new Date(p.updated).toLocaleString()}</small></div><button className="button button-ghost button-small" onClick={()=>{setProjectName(p.name);setIdea(p.idea);setStyle(p.style);setLanguage(p.language);setRatio(p.ratio);setIntensity(p.intensity);setTitle(p.title);setSubtitle(p.subtitle);setCaption(p.caption);setPage('studio');setNotice(isHebrew?'הגדרות הפרויקט נטענו. יש להעלות מחדש קובצי מדיה.':'Project settings loaded. Re-upload media files.')}}><FolderOpen size={14}/>{isHebrew?'פתח הגדרות':'Load settings'}</button><button className="icon-button" onClick={()=>setProjects(old=>old.filter(x=>x.id!==p.id))} aria-label="Delete project"><Trash2 size={16}/></button></div>)}</div>}</section>}
      {page==='settings' && <section className="page-section settings-page"><div className="page-intro"><div className="eyebrow"><Settings2 size={14}/>{isHebrew?'הגדרות סביבת העבודה':'WORKSPACE PREFERENCES'}</div><h1>{isHebrew?'הגדרות':'Settings'}</h1><p>{isHebrew?'התאם את סביבת BestRot לצורת העבודה שלך.':'Make BestRot work the way you like.'}</p></div><div className="panel settings-card"><div className="setting-row"><div className="setting-icon"><Languages size={19}/></div><div className="setting-copy"><strong>{isHebrew?'שפת ממשק':'Interface language'}</strong><span>{isHebrew?'בחר בין עברית לאנגלית':'Choose Hebrew or English'}</span></div><select className="select-input setting-select" value={lang} onChange={e=>setLang(e.target.value as 'he'|'en')}><option value="he">עברית</option><option value="en">English</option></select></div><div className="setting-row"><div className="setting-icon"><Moon size={19}/></div><div className="setting-copy"><strong>{isHebrew?'ערכת נושא':'Theme'}</strong><span>{isHebrew?'מצב כהה או בהיר':'Dark or light appearance'}</span></div><select className="select-input setting-select" value={theme} onChange={e=>setTheme(e.target.value as 'dark'|'light')}><option value="dark">{isHebrew?'כהה':'Dark'}</option><option value="light">{isHebrew?'בהיר':'Light'}</option></select></div><div className="setting-row"><div className="setting-icon"><Save size={19}/></div><div className="setting-copy"><strong>{isHebrew?'שמירה מקומית':'Local storage'}</strong><span>{isHebrew?'הפרויקטים נשמרים בדפדפן במכשיר הזה בלבד':'Projects are saved in this browser on this device only'}</span></div><span className="status-chip"><span className="status-dot"/>{isHebrew?'פעיל':'Active'}</span></div><div className="setting-row api-key-row"><div className="setting-icon"><WandSparkles size={19}/></div><div className="setting-copy"><strong>{isHebrew?'מפתח Gemini AI (אופציונלי)':'Gemini AI key (optional)'}</strong><span>{isHebrew?'מאפשר יצירת תסריטים. בקשות נשלחות ל-Google רק כשלוחצים על כתוב עם AI. מפתח נשמר בדפדפן הזה.':'Enables script generation. Requests go to Google only when you click Write with AI. Key is stored in this browser.'}</span><input className="text-input api-key-input" type="password" autoComplete="off" value={geminiKey} onChange={e=>{setGeminiKey(e.target.value);localStorage.setItem('bestrot-gemini-key',e.target.value)}} placeholder="AIza…"/><small>{isHebrew?'יצירת וידאו באמצעות מודל וידאו חיצוני אינה מחוברת, ושירותי וידאו עשויים לעלות כסף.':'External generative-video models are not connected; video generation APIs may cost money.'}</small></div><span className={`status-chip ${geminiKey?'':'muted-chip'}`}>{geminiKey?(isHebrew?'מפתח שמור':'Key saved'):(isHebrew?'לא הוגדר':'Not set')}</span></div><div className="setting-row"><div className="setting-icon"><Globe2 size={19}/></div><div className="setting-copy"><strong>{isHebrew?'מחקר טרנדים':'Trend research'}</strong><span>{isHebrew?'טרנדים חיים מ־YouTube/TikTok ידרשו חיבור API מתאים.':'Live YouTube/TikTok trends require an appropriate API integration.'}</span></div><span className="status-chip muted-chip">{isHebrew?'שלב עתידי':'Future phase'}</span></div><div className="settings-note"><HelpCircle size={17}/><p>{isHebrew?'הגרסה הנוכחית אינה שולחת קבצים לשום שרת. ייצוא וידאו מתבצע בדפדפן ותלוי בתמיכת המכשיר.':'This version does not upload your files to a server. Video export happens in the browser and depends on device support.'}</p></div><button className="button button-ghost" onClick={exportProjectData}><Download size={15}/>{isHebrew?'ייצא גיבוי הגדרות':'Export settings backup'}</button></div></section>}
      <footer className="app-footer"><span>© 2026 BestRot Studio</span><span>{isHebrew?'נבנה ליוצרים, בלי רעש מיותר.':'Made for creators. No unnecessary noise.'}</span><span className="footer-version">v0.1.0</span></footer>
    </main>
    {notice && <div className="toast"><span className="toast-icon"><Check size={15}/></span>{notice}<button onClick={()=>setNotice('')}><X size={15}/></button></div>}
    <canvas ref={canvasRef} className="hidden-canvas" />
  </div>
}
function downloadBlob(blob: Blob, filename: string) { const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove(); window.setTimeout(()=>URL.revokeObjectURL(url),1000) }
function safeName(name:string) { return (name.trim().replace(/[^\p{L}\p{N}_-]+/gu,'-').replace(/^-+|-+$/g,'') || 'bestrot-video').slice(0,70) }
function formatTime(seconds:number) { if (!Number.isFinite(seconds)||seconds<0) return '00:00'; const m=Math.floor(seconds/60); const s=Math.floor(seconds%60); return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` }
function wrapCanvasText(ctx:CanvasRenderingContext2D,text:string,x:number,y:number,maxWidth:number,lineHeight:number) { const words=text.split(' '); let line=''; const lines:string[]=[]; for(const word of words){const test=line?`${line} ${word}`:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word}else line=test}if(line)lines.push(line);const start=y-(lines.length-1)*lineHeight/2;lines.forEach((l,i)=>{ctx.strokeText(l,x,start+i*lineHeight,maxWidth);ctx.fillText(l,x,start+i*lineHeight,maxWidth)}) }

export default App

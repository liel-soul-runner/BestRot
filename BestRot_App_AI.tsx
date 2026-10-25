import { useEffect, useMemo, useRef, useState } from 'react'
import { Activity, ArrowDownToLine, AudioLines, Check, ChevronDown, Clapperboard, Clock3, Download, Film, FolderOpen, Globe2, HelpCircle, ImagePlus, Languages, LayoutDashboard, Lightbulb, Monitor, Moon, MoreHorizontal, Play, Plus, Save, Settings2, Sparkles, Smartphone, Tablet, Trash2, Upload, WandSparkles, X } from 'lucide-react'

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
  const [page, setPage] = useState<'studio'|'ideas'|'projects'|'settings'>('studio')
  const [lang, setLang] = useState<'he'|'en'>('he')
  const [projectName, setProjectName] = useState('Brainrot חדש')
  const [idea, setIdea] = useState('יצור AI מוזר שמנסה להיות מפורסם')
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
  const [aiGenerating, setAiGenerating] = useState(false)
  const [notice, setNotice] = useState('')
  const [theme, setTheme] = useState<'dark'|'light'>('dark')
  const [previewDevice, setPreviewDevice] = useState('tablet')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [aiMode, setAiMode] = useState('guided')
  const [audioVolume, setAudioVolume] = useState(85)
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
  const generateAiScript = async () => {
    if (!idea.trim()) {
      setNotice(isHebrew ? 'כתוב קודם רעיון לסרטון' : 'Enter a video idea first')
      return
    }

    setAiGenerating(true)
    setNotice('')

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Create a ${duration} ${style} short video.
Editing intensity: ${intensity}.
Aspect ratio: ${ratio}.
Project title: ${projectName}.
Idea: ${idea}.
Return a catchy hook, narration, and five numbered scene descriptions with visual details and suggested on-screen captions. Write the result in ${language}.`
        })
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || `Request failed (${response.status})`)
      }
      if (!data.result || typeof data.result !== 'string') {
        throw new Error('The AI returned an empty result')
      }

      setScript(data.result)
      setTitle(idea.slice(0, 80))
      setNotice(isHebrew ? 'התסריט נוצר בעזרת AI' : 'AI script generated successfully')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setNotice((isHebrew ? 'יצירת התסריט נכשלה: ' : 'AI script generation failed: ') + message)
    } finally {
      setAiGenerating(false)
    }
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
      <header className="topbar"><div className="breadcrumb"><span>{isHebrew?'סטודיו':'Studio'}</span><span className="crumb-sep">/</span><strong>{page==='studio'?(isHebrew?'עורך וידאו': 'Video Editor'):page==='ideas'?(isHebrew?'מעבדת רעיונות':'Idea Lab'):page==='projects'?(isHebrew?'הפרויקטים שלי':'My Projects'):(isHebrew?'הגדרות':'Settings')}</strong></div><div className="top-actions"><span className="status-chip"><span className="status-dot"/>{isHebrew?'גרסת התחלה':'Starter build'}</span><button className="icon-button" onClick={()=>setTheme(theme==='dark'?'light':'dark')} aria-label="Toggle theme"><Moon size={18}/></button><button className="language-button" onClick={()=>setLang(lang==='he'?'en':'he')}><Globe2 size={16}/>{lang==='he'?'עברית':'English'}<ChevronDown size={14}/></button></div></header>
      {page==='studio' && <>
        <section className="welcome-row"><div><div className="eyebrow"><Sparkles size={14}/>{isHebrew?'היצירתיות שלך, בלי גבולות':'YOUR CREATIVE PLAYGROUND'}</div><h1>{isHebrew?'בוא ניצור משהו':'Let’s make something'} <span>{isHebrew?'בלתי נשכח.':'unforgettable.'}</span></h1><p>{isHebrew?'מרעיון קטן לסרטון Brainrot — בנה, ערוך וייצא במקום אחד.':'From a spark of an idea to a Brainrot video — build, edit and export in one place.'}</p></div><button className="button button-ghost" onClick={saveProject}><Save size={16}/>{isHebrew?'שמור פרויקט':'Save project'}</button></section>
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
            <button className="button button-primary full-button" onClick={generateAiScript} disabled={aiGenerating}><Sparkles size={17}/>{aiGenerating ? (isHebrew ? 'יוצר תסריט בעזרת AI…' : 'Generating AI script…') : (isHebrew ? 'צור תסריט בעזרת AI' : 'Generate script with AI')}<span className="button-arrow">↗</span></button>
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
        <section className="lower-grid"><div className="panel script-panel"><div className="panel-heading"><div className="heading-icon pink"><Clapperboard size={18}/></div><div><h2>{isHebrew?'תסריט הסרטון':'Video script'}</h2><p>{isHebrew?'ערוך את המבנה והקצב של הסיפור':'Edit your story structure and pacing'}</p></div></div><textarea className="text-area script-area" value={script} onChange={e=>setScript(e.target.value)} rows={6}/><div className="panel-footer"><span className="muted-small">{isHebrew?'טיוטה מקומית · לא נוצרה על ידי מודל AI חיצוני':'Local draft · no external AI model used'}</span><button className="text-action" onClick={exportScript}><ArrowDownToLine size={14}/>{isHebrew?'הורד תסריט':'Download script'}</button></div></div>
          <div className="panel quick-panel"><div className="panel-heading"><div className="heading-icon green"><Sparkles size={18}/></div><div><h2>{isHebrew?'הצעדים הבאים':'Next steps'}</h2><p>{isHebrew?'הפוך את הטיוטה לסרטון':'Turn your draft into a video'}</p></div></div><div className="checklist"><div className="check-row"><span className={idea?'check-circle done':'check-circle'}>{idea?<Check size={13}/>:1}</span><div><strong>{isHebrew?'בחר רעיון וסגנון':'Choose an idea & style'}</strong><small>{isHebrew?'הגדר את הקונספט':'Set the concept'}</small></div></div><div className="check-row"><span className={clips.length?'check-circle done':'check-circle'}>{clips.length?<Check size={13}/>:2}</span><div><strong>{isHebrew?'העלה קטעי וידאו':'Upload video clips'}</strong><small>{isHebrew?'הוסף מדיה לעריכה ולייצוא':'Add media to edit and export'}</small></div></div><div className="check-row"><span className="check-circle">3</span><div><strong>{isHebrew?'ייצא וידאו':'Export your video'}</strong><small>{isHebrew?'הורד קובץ WebM מהמכשיר':'Download a WebM file'}</small></div></div></div><button className="button button-ghost full-button" onClick={exportProjectData}><Download size={16}/>{isHebrew?'ייצא נתוני פרויקט':'Export project data'}</button></div></section>
      </>}
      {page==='ideas' && <section className="page-section"><div className="page-intro"><div className="eyebrow"><Lightbulb size={14}/>{isHebrew?'רעיון הוא רק ההתחלה':'EVERY VIRAL VIDEO STARTS SOMEWHERE'}</div><h1>{isHebrew?'מעבדת רעיונות':'Idea Lab'} <span>✦</span></h1><p>{isHebrew?'מצא כיוון, בחר רעיון והעבר אותו ישירות לסטודיו. הרעיונות כאן הם הצעות מקומיות, לא נתוני טרנדים חיים.':'Explore concepts and send one straight to your studio. These are local suggestions, not live trend data.'}</p><button className="button button-primary" onClick={generateIdea}><Sparkles size={16}/>{isHebrew?'הגרל רעיון חדש':'Generate an idea'}</button></div><div className="ideas-grid">{ideas.map((item,i)=><article className="idea-card" key={item.title}><div className={`idea-art art-${i+1}`}><span className="idea-number">IDEA 0{i+1}</span><span className="idea-art-icon">{['👾','🌀','🎮','🫧','🌌'][i]}</span><span className="idea-art-tag">{item.style}</span></div><div className="idea-card-body"><div className="idea-card-top"><span className="duration-pill"><Clock3 size={12}/>{item.duration}</span><button className="icon-button" onClick={()=>useIdea(item)} aria-label="Use idea"><Plus size={17}/></button></div><h3>{item.title}</h3><p>{item.hook}</p><button className="text-action" onClick={()=>useIdea(item)}>{isHebrew?'השתמש ברעיון':'Use this idea'}<span>↗</span></button></div></article>)}</div></section>}
      {page==='projects' && <section className="page-section"><div className="page-intro"><div className="eyebrow"><FolderOpen size={14}/>{isHebrew?'העבודה שלך, במקום אחד':'YOUR WORKSPACE'}</div><h1>{isHebrew?'הפרויקטים שלי':'My Projects'}</h1><p>{isHebrew?'פרויקטים נשמרים מקומית בדפדפן הנוכחי. הם לא מסתנכרנים אוטומטית בין מכשירים.':'Projects are stored in this browser only and do not sync across devices.'}</p><button className="button button-primary" onClick={()=>{setPage('studio');setProjectName('Brainrot חדש')}}><Plus size={16}/>{isHebrew?'פרויקט חדש':'New project'}</button></div>{projects.length===0?<div className="empty-projects"><FolderOpen size={36}/><h3>{isHebrew?'עוד אין פרויקטים שמורים':'No saved projects yet'}</h3><p>{isHebrew?'שמור את הפרויקט הראשון שלך מתוך הסטודיו.':'Save your first project from the studio.'}</p><button className="button button-ghost" onClick={()=>setPage('studio')}>{isHebrew?'חזרה לסטודיו':'Go to studio'}</button></div>:<div className="projects-list">{projects.map(p=><div className="project-row" key={p.id}><div className="project-cover"><Clapperboard size={22}/></div><div className="project-details"><strong>{p.name}</strong><span>{p.style} · {p.ratio} · {p.clips.length} clips</span><small>{new Date(p.updated).toLocaleString()}</small></div><button className="button button-ghost button-small" onClick={()=>{setProjectName(p.name);setIdea(p.idea);setStyle(p.style);setLanguage(p.language);setRatio(p.ratio);setIntensity(p.intensity);setTitle(p.title);setSubtitle(p.subtitle);setCaption(p.caption);setPage('studio');setNotice(isHebrew?'הגדרות הפרויקט נטענו. יש להעלות מחדש קובצי מדיה.':'Project settings loaded. Re-upload media files.')}}><FolderOpen size={14}/>{isHebrew?'פתח הגדרות':'Load settings'}</button><button className="icon-button" onClick={()=>setProjects(old=>old.filter(x=>x.id!==p.id))} aria-label="Delete project"><Trash2 size={16}/></button></div>)}</div>}</section>}
      {page==='settings' && <section className="page-section settings-page"><div className="page-intro"><div className="eyebrow"><Settings2 size={14}/>{isHebrew?'הגדרות סביבת העבודה':'WORKSPACE PREFERENCES'}</div><h1>{isHebrew?'הגדרות':'Settings'}</h1><p>{isHebrew?'התאם את סביבת BestRot לצורת העבודה שלך.':'Make BestRot work the way you like.'}</p></div><div className="panel settings-card"><div className="setting-row"><div className="setting-icon"><Languages size={19}/></div><div className="setting-copy"><strong>{isHebrew?'שפת ממשק':'Interface language'}</strong><span>{isHebrew?'בחר בין עברית לאנגלית':'Choose Hebrew or English'}</span></div><select className="select-input setting-select" value={lang} onChange={e=>setLang(e.target.value as 'he'|'en')}><option value="he">עברית</option><option value="en">English</option></select></div><div className="setting-row"><div className="setting-icon"><Moon size={19}/></div><div className="setting-copy"><strong>{isHebrew?'ערכת נושא':'Theme'}</strong><span>{isHebrew?'מצב כהה או בהיר':'Dark or light appearance'}</span></div><select className="select-input setting-select" value={theme} onChange={e=>setTheme(e.target.value as 'dark'|'light')}><option value="dark">{isHebrew?'כהה':'Dark'}</option><option value="light">{isHebrew?'בהיר':'Light'}</option></select></div><div className="setting-row"><div className="setting-icon"><Save size={19}/></div><div className="setting-copy"><strong>{isHebrew?'שמירה מקומית':'Local storage'}</strong><span>{isHebrew?'הפרויקטים נשמרים בדפדפן במכשיר הזה בלבד':'Projects are saved in this browser on this device only'}</span></div><span className="status-chip"><span className="status-dot"/>{isHebrew?'פעיל':'Active'}</span></div><div className="setting-row"><div className="setting-icon"><WandSparkles size={19}/></div><div className="setting-copy"><strong>{isHebrew?'חיבורי AI':'AI integrations'}</strong><span>{isHebrew?'לא מחובר כרגע שום ספק AI חיצוני. לא מתבצעים חיובים.':'No external AI provider connected. No charges are made.'}</span></div><span className="status-chip muted-chip">{isHebrew?'לא מחובר':'Not connected'}</span></div><div className="setting-row"><div className="setting-icon"><Globe2 size={19}/></div><div className="setting-copy"><strong>{isHebrew?'מחקר טרנדים':'Trend research'}</strong><span>{isHebrew?'טרנדים חיים מ־YouTube/TikTok ידרשו חיבור API מתאים.':'Live YouTube/TikTok trends require an appropriate API integration.'}</span></div><span className="status-chip muted-chip">{isHebrew?'שלב עתידי':'Future phase'}</span></div><div className="settings-note"><HelpCircle size={17}/><p>{isHebrew?'הגרסה הנוכחית אינה שולחת קבצים לשום שרת. ייצוא וידאו מתבצע בדפדפן ותלוי בתמיכת המכשיר.':'This version does not upload your files to a server. Video export happens in the browser and depends on device support.'}</p></div><button className="button button-ghost" onClick={exportProjectData}><Download size={15}/>{isHebrew?'ייצא גיבוי הגדרות':'Export settings backup'}</button></div></section>}
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

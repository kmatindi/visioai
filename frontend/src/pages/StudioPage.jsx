import { useState, useRef, useCallback, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { aiDirectorAPI, videoAPI, voiceAPI, musicAPI, exportAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  Wand2, Upload, Film, Mic2, Music, Download,
  ChevronRight, Loader2, Check, Play, Pause, RefreshCw,
  Sparkles, Globe, Zap, Image, X, Layers, AlertCircle, UserPlus
} from 'lucide-react';

const STEPS = [
  { id: 'image',    icon: Image,    label: 'Image' },
  { id: 'director', icon: Wand2,    label: 'AI Director' },
  { id: 'video',    icon: Film,     label: 'Animate' },
  { id: 'voice',    icon: Mic2,     label: 'Voice' },
  { id: 'music',    icon: Music,    label: 'Music' },
  { id: 'export',   icon: Download, label: 'Export' },
];

const ASPECT_RATIOS = [
  { value: '9:16',  label: '9:16',  sub: 'TikTok / Reels' },
  { value: '16:9',  label: '16:9',  sub: 'YouTube / Broadcast' },
  { value: '1:1',   label: '1:1',   sub: 'Instagram Feed' },
];

const MODELS = [
  { id: 'auto',           label: 'Auto Route',      sub: 'Best for your input',   badge: 'Recommended' },
  { id: 'kling-omni-v2',  label: 'Kling Omni v2',   sub: 'Best overall quality' },
  { id: 'veo-3-1',        label: 'Veo 3.1',          sub: 'Best for long clips' },
  { id: 'kling-standard', label: 'Kling Standard',   sub: 'Fast & efficient' },
];

const VOICE_IDS = [
  { id: 'voice_aria',   name: 'Aria',   style: 'Conversational · Female' },
  { id: 'voice_marcus', name: 'Marcus', style: 'Professional · Male' },
  { id: 'voice_nova',   name: 'Nova',   style: 'Energetic · Female' },
  { id: 'voice_rex',    name: 'Rex',    style: 'Deep · Male' },
  { id: 'voice_sofia',  name: 'Sofia',  style: 'Warm · Female' },
  { id: 'voice_kai',    name: 'Kai',    style: 'Calm · Neutral' },
];

const MUSIC_MOODS = [
  { id: 'cinematic',  label: 'Cinematic',  emoji: '🎬' },
  { id: 'energetic',  label: 'Energetic',  emoji: '⚡' },
  { id: 'relaxed',    label: 'Relaxed',    emoji: '🌿' },
  { id: 'dramatic',   label: 'Dramatic',   emoji: '🎭' },
  { id: 'corporate',  label: 'Corporate',  emoji: '💼' },
  { id: 'inspiring',  label: 'Inspiring',  emoji: '🌟' },
];

const EXPORT_PLATFORMS = [
  { id: 'tiktok',           label: 'TikTok' },
  { id: 'instagram_reels',  label: 'Reels' },
  { id: 'youtube_shorts',   label: 'YT Shorts' },
  { id: 'youtube',          label: 'YouTube' },
  { id: 'instagram_feed',   label: 'IG Feed' },
  { id: 'facebook',         label: 'Facebook' },
];

const MOOD_NOTES = {
  cinematic:  [261.63, 311.13, 349.23, 392.00, 466.16],
  energetic:  [349.23, 392.00, 440.00, 493.88, 523.25],
  relaxed:    [220.00, 261.63, 293.66, 329.63, 349.23],
  dramatic:   [185.00, 220.00, 246.94, 293.66, 329.63],
  corporate:  [293.66, 329.63, 369.99, 415.30, 466.16],
  inspiring:  [261.63, 329.63, 392.00, 440.00, 523.25],
};

function isVideoUrl(url) {
  return url && url.match(/\.(mp4|webm|mov)(\?|$)/i);
}

export default function StudioPage() {
  const [activeStep, setActiveStep] = useState('image');
  const [completedSteps, setCompletedSteps] = useState([]);

  // Image
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // AI Director
  const [rawPrompt, setRawPrompt] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [enhancing, setEnhancing] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [style, setStyle] = useState('cinematic');

  // Video
  const [selectedModel, setSelectedModel] = useState('auto');
  const [duration, setDuration] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [generationJob, setGenerationJob] = useState(null);
  const [videoResult, setVideoResult] = useState(null);

  // Voice
  const [voiceText, setVoiceText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('voice_aria');
  const [voiceLanguage, setVoiceLanguage] = useState('en');
  const [generatingVoice, setGeneratingVoice] = useState(false);
  const [voiceResult, setVoiceResult] = useState(null);
  const [voicePreviewPlaying, setVoicePreviewPlaying] = useState(false);
  // Custom voice cloning
  const [voiceMode, setVoiceMode] = useState('preset'); // 'preset' | 'custom'
  const [customVoiceName, setCustomVoiceName] = useState('');
  const [customVoiceFile, setCustomVoiceFile] = useState(null);
  const [customVoiceDragging, setCustomVoiceDragging] = useState(false);
  const [cloningVoice, setCloningVoice] = useState(false);
  const [clonedVoice, setClonedVoice] = useState(null); // { voiceId, name, mockMode }
  const customVoiceInputRef = useRef(null);

  // Music
  const [selectedMood, setSelectedMood] = useState('cinematic');
  const [musicDuration, setMusicDuration] = useState(30);
  const [generatingMusic, setGeneratingMusic] = useState(false);
  const [musicResult, setMusicResult] = useState(null);
  const [musicPreviewPlaying, setMusicPreviewPlaying] = useState(false);
  const audioCtxRef = useRef(null);

  // Export
  const [exportPlatforms, setExportPlatforms] = useState(['tiktok']);
  const [exportResolution, setExportResolution] = useState('1080p');
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState(null);
  const [mixVolumes, setMixVolumes] = useState({ voice: 80, music: 40 });

  // ─── Poll video job ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!generationJob || generationJob.status === 'completed' || generationJob.id?.startsWith('mock_')) return;
    const interval = setInterval(async () => {
      try {
        const { data } = await videoAPI.status(generationJob.id);
        setGenerationJob(data);
        if (data.status === 'completed') {
          setVideoResult(data);
          markComplete('video');
          toast.success('Video generated!');
        } else if (data.status === 'failed') {
          toast.error('Generation failed: ' + (data.error || 'unknown error'));
        }
      } catch {}
    }, 2000);
    return () => clearInterval(interval);
  }, [generationJob?.id, generationJob?.status]);

  const markComplete = (stepId) =>
    setCompletedSteps(prev => prev.includes(stepId) ? prev : [...prev, stepId]);

  const stepDone = (id) => completedSteps.includes(id);

  // ─── Navigate to voice step: auto-suggest script ──────────────────────────
  const goToVoice = () => {
    // Auto-populate voice script from the enhanced prompt if script is empty
    if (!voiceText && (enhancedPrompt || rawPrompt)) {
      const basePrompt = rawPrompt || enhancedPrompt;
      // Derive a short script suggestion from the raw prompt
      const suggestion = basePrompt.length < 120
        ? basePrompt
        : basePrompt.slice(0, 120).trim() + '…';
      setVoiceText(suggestion);
    }
    setActiveStep('voice');
  };

  // ─── Navigate to music step: sync duration ────────────────────────────────
  const goToMusic = () => {
    // Keep music duration in sync with video duration
    setMusicDuration(Math.max(duration * 2, 20)); // at least 2x video, min 20s
    setActiveStep('music');
  };

  // ─── Image drag/drop ──────────────────────────────────────────────────────
  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0] || e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Please upload an image file');
    setImagePreview(URL.createObjectURL(file));
    markComplete('image');
    setActiveStep('director');
    toast.success('Image uploaded!');
  }, []);

  // ─── AI Director ──────────────────────────────────────────────────────────
  const handleEnhance = async () => {
    if (!rawPrompt.trim()) return toast.error('Enter a prompt first');
    setEnhancing(true);
    try {
      const { data } = await aiDirectorAPI.enhance({ prompt: rawPrompt, aspectRatio, style });
      setEnhancedPrompt(data.enhanced);
      markComplete('director');
      toast.success('AI Director enhanced your prompt!');
    } catch {
      const fallback = `Professional ${aspectRatio} video: ${rawPrompt}. Camera: slow dolly-in with gentle upward tilt. Lighting: soft natural daylight at 5600K with warm practical accents. Colour grade: ${style} teal-and-orange look. Shallow depth of field with fine bokeh particles. ${duration} seconds at 24fps. Commercial quality, optimised for social distribution.`;
      setEnhancedPrompt(fallback);
      markComplete('director');
      toast.success('Prompt enhanced (offline mode)');
    } finally {
      setEnhancing(false);
    }
  };

  // ─── Video generate ───────────────────────────────────────────────────────
  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data } = await videoAPI.generate({
        prompt: enhancedPrompt || rawPrompt,
        imageUrl: imagePreview,
        aspectRatio, duration, model: selectedModel, style,
      });
      setGenerationJob({ id: data.jobId, status: 'queued', progress: 0, model: data.model });
      toast.success(`Generation started with ${data.model}!`);
    } catch {
      // Local mock fallback
      const mockJob = { id: `mock_${Date.now()}`, status: 'processing', progress: 0 };
      setGenerationJob(mockJob);
      let p = 0;
      const sim = setInterval(() => {
        p += Math.floor(Math.random() * 20) + 5;
        if (p >= 100) {
          clearInterval(sim);
          const completed = { ...mockJob, status: 'completed', progress: 100, resultUrl: imagePreview };
          setGenerationJob(completed);
          setVideoResult(completed);
          markComplete('video');
          toast.success('Video generated! (mock mode — add REPLICATE_API_KEY for real video)');
        } else {
          setGenerationJob(prev => ({ ...prev, progress: p, status: 'processing' }));
        }
      }, 1500);
    } finally {
      setGenerating(false);
    }
  };

  // ─── Voice generate ───────────────────────────────────────────────────────
  const handleVoice = async () => {
    if (!voiceText.trim()) return toast.error('Enter script text');
    setGeneratingVoice(true);
    try {
      const { data } = await voiceAPI.generate({ text: voiceText, voiceId: selectedVoice, language: voiceLanguage });
      setVoiceResult(data);
      markComplete('voice');
      toast.success('Voice-over generated!');
    } catch {
      setVoiceResult({ mockMode: true, duration: Math.round(voiceText.split(' ').length / 2.5), characters: voiceText.length });
      markComplete('voice');
      toast.success('Voice track ready (add ELEVENLABS_API_KEY for real audio)');
    } finally {
      setGeneratingVoice(false);
    }
  };

  // ─── Custom voice clone ───────────────────────────────────────────────────
  const handleCloneVoice = async () => {
    if (!customVoiceName.trim()) return toast.error('Enter a name for your voice');
    if (!customVoiceFile) return toast.error('Upload an audio sample first');
    setCloningVoice(true);
    try {
      const formData = new FormData();
      formData.append('name', customVoiceName.trim());
      formData.append('file', customVoiceFile);
      const { data } = await voiceAPI.cloneWithFile(formData);
      setClonedVoice({ voiceId: data.voiceId, name: data.name, mockMode: data.mockMode });
      setSelectedVoice(data.voiceId);
      toast.success(`Voice "${data.name}" ${data.mockMode ? 'registered (mock)' : 'cloned!'}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Voice cloning failed');
    } finally {
      setCloningVoice(false);
    }
  };

  const onCustomVoiceDrop = (e) => {
    e.preventDefault();
    setCustomVoiceDragging(false);
    const file = e.dataTransfer?.files?.[0] || e.target.files?.[0];
    if (!file) return;
    const ok = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/m4a', 'audio/webm', 'audio/ogg'].includes(file.type)
      || file.name.match(/\.(mp3|wav|m4a|webm|ogg|flac)$/i);
    if (!ok) return toast.error('Upload an audio file (mp3, wav, m4a…)');
    setCustomVoiceFile(file);
  };

  // ─── Music generate ───────────────────────────────────────────────────────
  const handleMusic = async () => {
    setGeneratingMusic(true);
    try {
      const { data } = await musicAPI.generate({ mood: selectedMood, duration: musicDuration });
      setMusicResult(data);
      markComplete('music');
      toast.success('Music track generated!');
    } catch {
      setMusicResult({ mockMode: true, mood: selectedMood, duration: musicDuration });
      markComplete('music');
      toast.success('Music track ready (add SUNO_API_KEY for real audio)');
    } finally {
      setGeneratingMusic(false);
    }
  };

  // ─── Export (with composition) ────────────────────────────────────────────
  const handleExport = async () => {
    if (!videoResult) return toast.error('Generate a video first');
    setExporting(true);
    try {
      const { data } = await exportAPI.render({
        platforms: exportPlatforms,
        resolution: exportResolution,
        videoUrl: videoResult?.resultUrl,
        voiceUrl: voiceResult?.audioUrl,
        musicUrl: musicResult?.audioUrl,
        voiceVolume: mixVolumes.voice,
        musicVolume: mixVolumes.music,
        hasVoice: !!voiceResult,
        hasMusic: !!musicResult,
      });
      setExportResult(data);
      markComplete('export');
      toast.success('Export complete!');
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error(err.response.data.error);
      } else {
        setExportResult({ mockMode: true, platforms: exportPlatforms, resolution: exportResolution });
        markComplete('export');
        toast.success('Export ready! (mock mode)');
      }
    } finally {
      setExporting(false);
    }
  };

  // ─── Audio preview helpers ─────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      audioCtxRef.current?.close().catch(() => {});
    };
  }, []);

  const handleVoicePreview = () => {
    if (!voiceText.trim()) return toast.error('Enter a script to preview');
    if (voicePreviewPlaying) {
      window.speechSynthesis.cancel();
      setVoicePreviewPlaying(false);
      return;
    }
    const utter = new SpeechSynthesisUtterance(voiceText);
    utter.rate = 1.0;
    utter.onend = () => setVoicePreviewPlaying(false);
    utter.onerror = () => setVoicePreviewPlaying(false);
    window.speechSynthesis.speak(utter);
    setVoicePreviewPlaying(true);
  };

  const handleMusicPreview = () => {
    if (musicPreviewPlaying) {
      audioCtxRef.current?.close().catch(() => {});
      audioCtxRef.current = null;
      setMusicPreviewPlaying(false);
      return;
    }
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;
      const notes = MOOD_NOTES[selectedMood] || MOOD_NOTES.cinematic;
      let t = ctx.currentTime + 0.05;
      [0, 1].forEach(pass => {
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = pass % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0, t + i * 0.35);
          gain.gain.linearRampToValueAtTime(0.07, t + i * 0.35 + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.35 + 0.30);
          osc.start(t + i * 0.35);
          osc.stop(t + i * 0.35 + 0.35);
        });
        t += notes.length * 0.35;
      });
      const totalMs = notes.length * 0.35 * 2 * 1000 + 300;
      setTimeout(() => {
        ctx.close().catch(() => {});
        setMusicPreviewPlaying(false);
      }, totalMs);
      setMusicPreviewPlaying(true);
    } catch {
      toast.error('Audio preview not available in this browser');
    }
  };

  // ─── Download helper ──────────────────────────────────────────────────────
  const handleDownload = async (url, filename) => {
    if (!url) return toast.error('No file to download yet');
    try {
      if (url.startsWith('blob:') || url.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        const res = await fetch(url);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      }
      toast.success('Download started!');
    } catch {
      window.open(url, '_blank');
      toast.success('Opened in new tab — right-click to save');
    }
  };

  const downloadVideo = () => {
    const url = exportResult?.downloadUrl || videoResult?.resultUrl;
    if (!url) return toast.error('No video to download yet');
    const ext = isVideoUrl(url) ? 'mp4' : 'jpg';
    handleDownload(url, `visioai-export-${exportResolution}-${Date.now()}.${ext}`);
  };

  const previewAspect = { '9:16': '9/16', '16:9': '16/9', '1:1': '1/1' }[aspectRatio];

  const selectedVoiceName = clonedVoice?.voiceId === selectedVoice
    ? clonedVoice.name
    : VOICE_IDS.find(v => v.id === selectedVoice)?.name || 'Unknown';

  // ─── Composition status helpers ───────────────────────────────────────────
  const layers = [
    { id: 'video', label: 'Video',     icon: Film,  result: videoResult, color: '#C9A84C' },
    { id: 'voice', label: 'Voice-over', icon: Mic2,  result: voiceResult, color: '#818CF8' },
    { id: 'music', label: 'Music',      icon: Music, result: musicResult, color: '#34D399' },
  ];
  const compositionReady = videoResult && (voiceResult || musicResult);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Studio</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Image → Animate → Voice → Music → Export as one composition
          </p>
        </div>

        {/* Step nav */}
        <div className="flex items-center gap-1 mb-8 p-1 rounded-2xl overflow-x-auto"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          {STEPS.map(({ id, icon: Icon, label }, idx) => {
            const done = stepDone(id);
            const active = activeStep === id;
            return (
              <button key={id} onClick={() => setActiveStep(id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap"
                style={
                  active ? { background: 'linear-gradient(135deg, #E8C96A, #C9A84C)', color: '#000' }
                  : done  ? { color: '#22C55E' }
                  : { color: 'var(--text-muted)' }
                }>
                {done && !active ? <Check size={14} /> : <Icon size={14} />}
                {label}
                {idx < STEPS.length - 1 && !active && <ChevronRight size={12} className="opacity-30" />}
              </button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ── Main workspace ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* STEP: Image */}
            {activeStep === 'image' && (
              <div className="p-6 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <Image size={18} style={{ color: 'var(--gold)' }} />
                  <h2 className="font-bold">Upload your image</h2>
                </div>

                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Uploaded" className="w-full rounded-xl max-h-80 object-cover" />
                    <button onClick={() => { setImagePreview(null); setVideoResult(null); setGenerationJob(null); }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(0,0,0,0.7)' }}>
                      <X size={14} />
                    </button>
                    <button onClick={() => setActiveStep('director')}
                      className="btn-gold mt-4 w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
                      Continue to AI Director <ChevronRight size={16} />
                    </button>
                  </div>
                ) : (
                  <div
                    className={`upload-zone rounded-2xl p-12 text-center cursor-pointer ${isDragging ? 'drag-active' : ''}`}
                    onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onDrop} />
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      style={{ background: 'rgba(201,168,76,0.1)' }}>
                      <Upload size={28} style={{ color: 'var(--gold)' }} />
                    </div>
                    <p className="font-semibold mb-1">Drop your image here</p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>PNG, JPG, WEBP — up to 50MB</p>
                    <button className="btn-outline mt-4 py-2 px-6 rounded-xl text-sm font-semibold">Browse files</button>
                  </div>
                )}

                <div className="mt-4 p-3 rounded-xl flex items-start gap-2"
                  style={{ background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.2)' }}>
                  <Sparkles size={14} style={{ color: 'var(--gold)', marginTop: 2 }} />
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Tip: High-quality photos with clear subjects animate best. Portrait orientation works great for 9:16 vertical video.
                  </p>
                </div>
              </div>
            )}

            {/* STEP: AI Director */}
            {activeStep === 'director' && (
              <div className="p-6 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Wand2 size={18} style={{ color: 'var(--gold)' }} />
                  <h2 className="font-bold">AI Director Engine</h2>
                  <span className="badge-gold text-xs">Core Feature</span>
                </div>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Type a simple description. The AI Director rewrites it into a cinematic prompt and auto-suggests your voice script.
                </p>

                <textarea
                  value={rawPrompt}
                  onChange={e => setRawPrompt(e.target.value)}
                  placeholder="coffee cup on a marble surface…"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />

                <div className="flex gap-3 mt-3">
                  <div className="flex-1">
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Aspect Ratio</label>
                    <div className="flex gap-2">
                      {ASPECT_RATIOS.map(r => (
                        <button key={r.value} onClick={() => setAspectRatio(r.value)}
                          className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                          style={aspectRatio === r.value
                            ? { background: 'var(--gold)', color: '#000' }
                            : { background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Style</label>
                    <select value={style} onChange={e => setStyle(e.target.value)}
                      className="w-full py-2 px-3 rounded-lg text-xs outline-none"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                      {['cinematic', 'commercial', 'dramatic', 'minimal', 'social'].map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button onClick={handleEnhance} disabled={enhancing || !rawPrompt.trim()}
                  className="btn-gold w-full mt-4 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                  {enhancing ? <><Loader2 size={15} className="animate-spin" /> Enhancing…</> : <><Wand2 size={15} /> Enhance with AI Director</>}
                </button>

                {enhancedPrompt && (
                  <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.25)' }}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Check size={13} style={{ color: 'var(--gold)' }} />
                      <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--gold)' }}>Enhanced Prompt</span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{enhancedPrompt}</p>
                    <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                      ✓ Your voice script will be auto-suggested from this prompt
                    </p>
                    <button onClick={() => setActiveStep('video')}
                      className="btn-gold mt-3 w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
                      Animate this <ChevronRight size={15} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STEP: Video / Animate */}
            {activeStep === 'video' && (
              <div className="p-6 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <Film size={18} style={{ color: 'var(--gold)' }} />
                  <h2 className="font-bold">Animate</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(201,168,76,0.1)', color: 'var(--gold)', border: '1px solid rgba(201,168,76,0.2)' }}>
                    Layer 1 of 3
                  </span>
                </div>

                {/* Model selection */}
                <label className="text-xs font-semibold uppercase tracking-wider mb-3 block" style={{ color: 'var(--text-muted)' }}>AI Model</label>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {MODELS.map(m => (
                    <button key={m.id} onClick={() => setSelectedModel(m.id)}
                      className="p-3 rounded-xl text-left transition-all"
                      style={selectedModel === m.id
                        ? { border: '1px solid var(--gold)', background: 'rgba(201,168,76,0.08)' }
                        : { border: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-sm font-semibold">{m.label}</span>
                        {m.badge && <span className="badge-gold" style={{ fontSize: 10 }}>{m.badge}</span>}
                      </div>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{m.sub}</span>
                    </button>
                  ))}
                </div>

                {/* Duration */}
                <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>
                  Duration: {duration}s
                </label>
                <input type="range" min={2} max={30} value={duration} onChange={e => setDuration(+e.target.value)}
                  className="w-full accent-yellow-500 mb-1" />
                <div className="flex justify-between text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                  <span>2s</span><span>30s</span>
                </div>

                {(enhancedPrompt || rawPrompt) && (
                  <div className="p-3 rounded-xl mb-4 text-xs" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--gold)' }}>Prompt: </strong>
                    {(enhancedPrompt || rawPrompt).slice(0, 120)}…
                  </div>
                )}

                {/* Progress bar */}
                {generationJob && !['completed', 'failed'].includes(generationJob.status) && (
                  <div className="mb-4 p-4 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                    <div className="flex justify-between text-sm mb-2">
                      <span style={{ color: 'var(--text-secondary)' }}>Generating with {generationJob.model || selectedModel}…</span>
                      <span style={{ color: 'var(--gold)' }}>{generationJob.progress || 0}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${generationJob.progress || 0}%` }} />
                    </div>
                  </div>
                )}

                {generationJob?.status === 'failed' && (
                  <div className="mb-4 p-3 rounded-xl flex items-center gap-2" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                    <AlertCircle size={14} style={{ color: '#EF4444' }} />
                    <span className="text-sm" style={{ color: '#EF4444' }}>{generationJob.error || 'Generation failed'}</span>
                  </div>
                )}

                {videoResult && (
                  <div className="mb-4 p-3 rounded-xl flex items-center gap-3"
                    style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
                    <Check size={16} style={{ color: '#22C55E' }} />
                    <span className="text-sm font-semibold" style={{ color: '#22C55E' }}>Video layer ready!</span>
                    <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>Next: add voice-over</span>
                  </div>
                )}

                <button onClick={handleGenerate}
                  disabled={generating || (generationJob?.status === 'processing') || (generationJob?.status === 'queued')}
                  className="btn-gold w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                  {generating || ['processing', 'queued'].includes(generationJob?.status)
                    ? <><Loader2 size={15} className="animate-spin" /> Generating…</>
                    : videoResult
                    ? <><RefreshCw size={15} /> Regenerate Video</>
                    : <><Zap size={15} /> Generate Video</>}
                </button>

                {videoResult && (
                  <button onClick={goToVoice}
                    className="btn-outline w-full mt-2 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
                    <Mic2 size={15} /> Add Voice-over <ChevronRight size={15} />
                  </button>
                )}
              </div>
            )}

            {/* STEP: Voice */}
            {activeStep === 'voice' && (
              <div className="p-6 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Mic2 size={18} style={{ color: '#818CF8' }} />
                  <h2 className="font-bold">AI Voice-over</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(129,140,248,0.1)', color: '#818CF8', border: '1px solid rgba(129,140,248,0.25)' }}>
                    Layer 2 of 3
                  </span>
                </div>

                {!videoResult && (
                  <div className="mb-4 p-3 rounded-xl flex items-center gap-2" style={{ background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.2)' }}>
                    <AlertCircle size={13} style={{ color: 'var(--gold)' }} />
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      Generate a video first — your voice-over will be layered onto it.{' '}
                      <button onClick={() => setActiveStep('video')} className="underline" style={{ color: 'var(--gold)' }}>Go to Animate →</button>
                    </p>
                  </div>
                )}

                {/* Mode tabs */}
                <div className="flex gap-1 mb-4 p-1 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
                  {[
                    { id: 'preset', label: 'Preset Voices', icon: Mic2 },
                    { id: 'custom', label: 'Custom Voice', icon: UserPlus },
                  ].map(({ id, label, icon: Icon }) => (
                    <button key={id} onClick={() => setVoiceMode(id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all"
                      style={voiceMode === id
                        ? { background: 'linear-gradient(135deg, #818CF8, #6366F1)', color: '#fff' }
                        : { color: 'var(--text-muted)' }}>
                      <Icon size={12} /> {label}
                      {id === 'custom' && clonedVoice && <Check size={10} />}
                    </button>
                  ))}
                </div>

                {/* Script textarea — shown in both modes */}
                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                  {voiceMode === 'preset' ? 'Write a script and choose a voice character.' : 'Write a script and use your cloned voice.'}
                </p>

                <textarea
                  value={voiceText}
                  onChange={e => setVoiceText(e.target.value)}
                  placeholder="Enter your script… (e.g. 'Discover the perfect cup, crafted with care every morning.')"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none mb-1"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
                {voiceText && (
                  <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                    ~{Math.round(voiceText.split(' ').length / 2.5)}s read · {voiceText.length} chars
                  </p>
                )}

                {/* ── PRESET mode ── */}
                {voiceMode === 'preset' && (
                  <>
                    <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>Voice Character</label>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {VOICE_IDS.map(v => (
                        <button key={v.id} onClick={() => setSelectedVoice(v.id)}
                          className="p-2.5 rounded-xl text-left transition-all"
                          style={selectedVoice === v.id
                            ? { border: '1px solid #818CF8', background: 'rgba(129,140,248,0.08)' }
                            : { border: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                          <p className="text-sm font-semibold">{v.name}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{v.style}</p>
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <Globe size={14} style={{ color: '#818CF8' }} />
                      <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Language</label>
                      <select value={voiceLanguage} onChange={e => setVoiceLanguage(e.target.value)}
                        className="flex-1 py-1.5 px-3 rounded-lg text-xs outline-none"
                        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                        {[
                          ['en','English'],['es','Spanish'],['fr','French'],['de','German'],
                          ['ja','Japanese'],['ko','Korean'],['zh','Chinese'],['ar','Arabic'],
                          ['hi','Hindi'],['pt','Portuguese'],
                        ].map(([code, name]) => (
                          <option key={code} value={code}>{name}</option>
                        ))}
                      </select>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>+40 more</span>
                    </div>
                  </>
                )}

                {/* ── CUSTOM mode ── */}
                {voiceMode === 'custom' && (
                  <div className="mb-4 space-y-3">
                    {clonedVoice ? (
                      /* Already cloned — show summary */
                      <div className="p-4 rounded-xl flex items-center gap-3"
                        style={{ background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.3)' }}>
                        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #818CF8, #6366F1)' }}>
                          <UserPlus size={14} style={{ color: '#fff' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{clonedVoice.name}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {clonedVoice.mockMode ? 'Registered (mock mode)' : 'Cloned via ElevenLabs'}
                          </p>
                        </div>
                        <Check size={16} style={{ color: '#22C55E' }} />
                        <button onClick={() => { setClonedVoice(null); setCustomVoiceFile(null); setCustomVoiceName(''); setSelectedVoice('voice_aria'); }}
                          className="w-6 h-6 rounded-full flex items-center justify-center ml-1"
                          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                          <X size={11} />
                        </button>
                      </div>
                    ) : (
                      /* Clone form */
                      <>
                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Voice Name</label>
                          <input
                            type="text"
                            value={customVoiceName}
                            onChange={e => setCustomVoiceName(e.target.value)}
                            placeholder="e.g. My Voice, Brand Narrator…"
                            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                            onFocus={e => e.target.style.borderColor = '#818CF8'}
                            onBlur={e => e.target.style.borderColor = 'var(--border)'}
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Voice Sample</label>
                          {customVoiceFile ? (
                            <div className="p-3 rounded-xl flex items-center gap-3"
                              style={{ background: 'rgba(129,140,248,0.06)', border: '1px solid rgba(129,140,248,0.25)' }}>
                              <Mic2 size={14} style={{ color: '#818CF8' }} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate">{customVoiceFile.name}</p>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                  {(customVoiceFile.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                              </div>
                              <button onClick={() => setCustomVoiceFile(null)}
                                className="w-6 h-6 rounded-full flex items-center justify-center"
                                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                                <X size={11} />
                              </button>
                            </div>
                          ) : (
                            <div
                              className={`rounded-xl p-6 text-center cursor-pointer transition-all ${customVoiceDragging ? 'drag-active' : ''}`}
                              style={{ border: `2px dashed ${customVoiceDragging ? '#818CF8' : 'var(--border)'}`, background: customVoiceDragging ? 'rgba(129,140,248,0.05)' : 'var(--bg-elevated)' }}
                              onDragOver={e => { e.preventDefault(); setCustomVoiceDragging(true); }}
                              onDragLeave={() => setCustomVoiceDragging(false)}
                              onDrop={onCustomVoiceDrop}
                              onClick={() => customVoiceInputRef.current?.click()}>
                              <input ref={customVoiceInputRef} type="file" accept="audio/*,.mp3,.wav,.m4a,.webm,.ogg,.flac" className="hidden" onChange={onCustomVoiceDrop} />
                              <Upload size={20} className="mx-auto mb-2" style={{ color: '#818CF8' }} />
                              <p className="text-sm font-semibold mb-0.5">Drop your audio sample</p>
                              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>MP3, WAV, M4A — 30s to 5min, under 10 MB</p>
                            </div>
                          )}
                        </div>

                        <div className="p-3 rounded-xl text-xs" style={{ background: 'rgba(129,140,248,0.06)', border: '1px solid rgba(129,140,248,0.15)', color: 'var(--text-muted)' }}>
                          <strong style={{ color: '#818CF8' }}>Tips for best results: </strong>
                          Use a clear recording with no background noise. 1–3 minutes of natural speech works best.
                        </div>

                        <button onClick={handleCloneVoice}
                          disabled={cloningVoice || !customVoiceName.trim() || !customVoiceFile}
                          className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                          style={{ background: 'linear-gradient(135deg, #818CF8, #6366F1)', color: '#fff' }}>
                          {cloningVoice
                            ? <><Loader2 size={15} className="animate-spin" /> Cloning voice…</>
                            : <><UserPlus size={15} /> Clone This Voice</>}
                        </button>
                      </>
                    )}
                  </div>
                )}

                {voiceResult && (
                  <div className="mb-4 p-4 rounded-xl space-y-3"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(129,140,248,0.3)' }}>
                    <div className="flex items-center gap-2">
                      <Check size={14} style={{ color: '#22C55E' }} />
                      <span className="text-sm font-semibold" style={{ color: '#22C55E' }}>Voice track ready</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        ~{voiceResult.duration}s · {selectedVoiceName}
                      </span>
                    </div>
                    {voiceResult.audioUrl ? (
                      <audio controls src={voiceResult.audioUrl} className="w-full" />
                    ) : (
                      <>
                        <div className="flex items-center gap-px h-8 px-1">
                          {Array.from({ length: 48 }, (_, i) => (
                            <div key={i} style={{
                              flex: 1,
                              height: `${18 + Math.abs(Math.sin(i * 1.1)) * 65 + Math.abs(Math.cos(i * 0.5)) * 17}%`,
                              background: voicePreviewPlaying ? '#818CF8' : 'var(--border)',
                              borderRadius: 1, transition: 'background 0.25s',
                            }} />
                          ))}
                        </div>
                        <button onClick={handleVoicePreview}
                          className="w-full py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: voicePreviewPlaying ? '#818CF8' : 'var(--text-primary)' }}>
                          {voicePreviewPlaying ? <><Pause size={13} /> Stop</> : <><Play size={13} /> Preview voice</>}
                        </button>
                        {voiceResult.mockMode && (
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Add <code style={{ fontSize: 11, padding: '1px 4px', borderRadius: 3, background: 'var(--bg-card)' }}>ELEVENLABS_API_KEY</code> for real audio
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}

                <button onClick={handleVoice} disabled={generatingVoice || !voiceText.trim() || (voiceMode === 'custom' && !clonedVoice)}
                  className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                  style={{ background: 'linear-gradient(135deg, #818CF8, #6366F1)', color: '#fff' }}>
                  {generatingVoice ? <><Loader2 size={15} className="animate-spin" /> Generating…</> : <><Mic2 size={15} /> Generate Voice-over</>}
                </button>
                {voiceMode === 'custom' && !clonedVoice && (
                  <p className="text-xs text-center mt-1" style={{ color: 'var(--text-muted)' }}>Clone a voice above first</p>
                )}

                {voiceResult && (
                  <button onClick={goToMusic}
                    className="btn-outline w-full mt-2 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
                    <Music size={15} /> Add Music <ChevronRight size={15} />
                  </button>
                )}
              </div>
            )}

            {/* STEP: Music */}
            {activeStep === 'music' && (
              <div className="p-6 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <Music size={18} style={{ color: '#34D399' }} />
                  <h2 className="font-bold">AI Music</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(52,211,153,0.1)', color: '#34D399', border: '1px solid rgba(52,211,153,0.25)' }}>
                    Layer 3 of 3
                  </span>
                </div>

                {!videoResult && (
                  <div className="mb-4 p-3 rounded-xl flex items-center gap-2" style={{ background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.2)' }}>
                    <AlertCircle size={13} style={{ color: 'var(--gold)' }} />
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      Generate a video first — music will be layered underneath.{' '}
                      <button onClick={() => setActiveStep('video')} className="underline" style={{ color: 'var(--gold)' }}>Go to Animate →</button>
                    </p>
                  </div>
                )}

                <label className="text-xs font-semibold uppercase tracking-wider mb-3 block" style={{ color: 'var(--text-muted)' }}>Mood</label>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {MUSIC_MOODS.map(m => (
                    <button key={m.id} onClick={() => setSelectedMood(m.id)}
                      className="p-3 rounded-xl text-center transition-all"
                      style={selectedMood === m.id
                        ? { border: '1px solid #34D399', background: 'rgba(52,211,153,0.08)' }
                        : { border: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                      <div className="text-xl mb-1">{m.emoji}</div>
                      <p className="text-xs font-semibold">{m.label}</p>
                    </button>
                  ))}
                </div>

                <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>
                  Duration: {musicDuration}s
                  {duration > 0 && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> (video is {duration}s)</span>}
                </label>
                <input type="range" min={10} max={120} value={musicDuration} onChange={e => setMusicDuration(+e.target.value)}
                  className="w-full accent-green-400 mb-4" />

                {musicResult && (
                  <div className="mb-4 p-4 rounded-xl space-y-3"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(52,211,153,0.3)' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Check size={14} style={{ color: '#22C55E' }} />
                        <span className="text-sm font-semibold" style={{ color: '#22C55E' }}>
                          {musicResult.mood?.charAt(0).toUpperCase() + musicResult.mood?.slice(1)} track ready
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{musicResult.duration}s</span>
                      </div>
                    </div>
                    {musicResult.audioUrl ? (
                      <audio controls src={musicResult.audioUrl} className="w-full" />
                    ) : (
                      <>
                        <div className="flex items-end gap-px h-8">
                          {Array.from({ length: 32 }, (_, i) => (
                            <div key={i} style={{
                              flex: 1,
                              height: `${12 + Math.abs(Math.sin(i * 0.9)) * 70 + Math.abs(Math.cos(i * 0.4)) * 18}%`,
                              background: musicPreviewPlaying ? '#34D399' : 'var(--border)',
                              borderRadius: '1px 1px 0 0', transition: 'background 0.25s',
                            }} />
                          ))}
                        </div>
                        <button onClick={handleMusicPreview}
                          className="w-full py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: musicPreviewPlaying ? '#34D399' : 'var(--text-primary)' }}>
                          {musicPreviewPlaying ? <><Pause size={13} /> Stop</> : <><Play size={13} /> Preview tones</>}
                        </button>
                        {musicResult.mockMode && (
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Add <code style={{ fontSize: 11, padding: '1px 4px', borderRadius: 3, background: 'var(--bg-card)' }}>SUNO_API_KEY</code> for AI music
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}

                <button onClick={handleMusic} disabled={generatingMusic}
                  className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                  style={{ background: 'linear-gradient(135deg, #34D399, #10B981)', color: '#fff' }}>
                  {generatingMusic ? <><Loader2 size={15} className="animate-spin" /> Generating…</> : <><Music size={15} /> Generate Music</>}
                </button>

                {musicResult && (
                  <button onClick={() => setActiveStep('export')}
                    className="btn-outline w-full mt-2 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
                    <Download size={15} /> Export Composition <ChevronRight size={15} />
                  </button>
                )}
              </div>
            )}

            {/* STEP: Export */}
            {activeStep === 'export' && (
              <div className="p-6 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <Download size={18} style={{ color: 'var(--gold)' }} />
                  <h2 className="font-bold">Export Composition</h2>
                </div>

                {/* Composition summary — what's being merged */}
                <div className="mb-5 p-4 rounded-xl space-y-2"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                    Tracks being combined
                  </p>
                  {layers.map(({ id, label, icon: Icon, result, color }) => (
                    <div key={id} className="flex items-center gap-3 py-2 px-3 rounded-lg"
                      style={{ background: result ? `${color}12` : 'transparent', border: `1px solid ${result ? color + '30' : 'var(--border)'}` }}>
                      <Icon size={13} style={{ color: result ? color : 'var(--text-muted)' }} />
                      <span className="text-sm font-medium" style={{ color: result ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {label}
                      </span>
                      {result ? (
                        <span className="ml-auto flex items-center gap-1 text-xs" style={{ color }}>
                          <Check size={11} /> Ready
                        </span>
                      ) : (
                        <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>Not added</span>
                      )}
                    </div>
                  ))}

                  {!videoResult && (
                    <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: '#EF4444' }}>
                      <AlertCircle size={12} />
                      Video is required. <button onClick={() => setActiveStep('video')} className="underline">Generate one →</button>
                    </div>
                  )}
                </div>

                {/* Mix levels (only when both voice and music exist) */}
                {voiceResult && musicResult && (
                  <div className="mb-5 p-4 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Audio Mix</p>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                          <span className="flex items-center gap-1"><Mic2 size={11} style={{ color: '#818CF8' }} /> Voice-over</span>
                          <span style={{ color: '#818CF8' }}>{mixVolumes.voice}%</span>
                        </div>
                        <input type="range" min={0} max={100} value={mixVolumes.voice}
                          onChange={e => setMixVolumes(v => ({ ...v, voice: +e.target.value }))}
                          className="w-full" style={{ accentColor: '#818CF8' }} />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                          <span className="flex items-center gap-1"><Music size={11} style={{ color: '#34D399' }} /> Music</span>
                          <span style={{ color: '#34D399' }}>{mixVolumes.music}%</span>
                        </div>
                        <input type="range" min={0} max={100} value={mixVolumes.music}
                          onChange={e => setMixVolumes(v => ({ ...v, music: +e.target.value }))}
                          className="w-full" style={{ accentColor: '#34D399' }} />
                      </div>
                    </div>
                  </div>
                )}

                <label className="text-xs font-semibold uppercase tracking-wider mb-3 block" style={{ color: 'var(--text-muted)' }}>Target Platforms</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {EXPORT_PLATFORMS.map(p => (
                    <button key={p.id}
                      onClick={() => setExportPlatforms(prev =>
                        prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id]
                      )}
                      className="px-3 py-1.5 rounded-xl text-sm font-semibold transition-all"
                      style={exportPlatforms.includes(p.id)
                        ? { background: 'var(--gold)', color: '#000' }
                        : { border: '1px solid var(--border)', color: 'var(--text-secondary)', background: 'var(--bg-elevated)' }}>
                      {p.label}
                    </button>
                  ))}
                </div>

                <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>Resolution</label>
                <div className="flex gap-2 mb-6">
                  {['720p', '1080p', '4K'].map(r => (
                    <button key={r} onClick={() => setExportResolution(r)}
                      className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                      style={exportResolution === r
                        ? { background: 'var(--gold)', color: '#000' }
                        : { border: '1px solid var(--border)', color: 'var(--text-secondary)', background: 'var(--bg-elevated)' }}>
                      {r} {r === '4K' && <span className="text-xs opacity-60">Studio+</span>}
                    </button>
                  ))}
                </div>

                {exportResult && (
                  <div className="mb-4 space-y-2">
                    <div className="p-3 rounded-xl flex items-center gap-3"
                      style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
                      <Check size={16} style={{ color: '#22C55E' }} />
                      <span className="text-sm font-semibold" style={{ color: '#22C55E' }}>
                        Composition ready — {exportResolution} · {exportResult.platforms?.length || exportPlatforms.length} platform(s)
                      </span>
                    </div>
                    <button onClick={downloadVideo}
                      className="btn-gold w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
                      <Download size={15} /> Download Final Video
                    </button>
                  </div>
                )}

                <button onClick={handleExport} disabled={exporting || !videoResult || !exportPlatforms.length}
                  className="btn-gold w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                  {exporting
                    ? <><Loader2 size={15} className="animate-spin" /> Rendering composition…</>
                    : <><Layers size={15} /> Combine & Export</>}
                </button>
                {!videoResult && (
                  <p className="text-xs text-center mt-2" style={{ color: 'var(--text-muted)' }}>
                    Generate a video first to export
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ── Right panel ── */}
          <div className="space-y-4">

            {/* Preview */}
            <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Preview</p>
              <div className="relative w-full rounded-xl overflow-hidden"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', aspectRatio: previewAspect }}>
                {videoResult?.resultUrl ? (
                  isVideoUrl(videoResult.resultUrl) ? (
                    <video src={videoResult.resultUrl} autoPlay loop muted playsInline controls className="w-full h-full object-cover" />
                  ) : (
                    <img src={videoResult.resultUrl} alt="Result" className="w-full h-full object-cover" />
                  )
                ) : imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <Film size={24} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Preview appears here</p>
                  </div>
                )}

                {/* Layer indicators overlaid on preview */}
                {(voiceResult || musicResult) && (
                  <div className="absolute bottom-2 left-2 flex gap-1">
                    {voiceResult && (
                      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold"
                        style={{ background: 'rgba(129,140,248,0.85)', color: '#fff' }}>
                        <Mic2 size={10} /> Voice
                      </div>
                    )}
                    {musicResult && (
                      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold"
                        style={{ background: 'rgba(52,211,153,0.85)', color: '#fff' }}>
                        <Music size={10} /> Music
                      </div>
                    )}
                  </div>
                )}
              </div>

              <p className="text-center text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{aspectRatio} · {duration}s</p>
              {videoResult?.resultUrl && (
                <button onClick={downloadVideo}
                  className="btn-gold w-full mt-3 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
                  <Download size={15} /> Download
                </button>
              )}
            </div>

            {/* Composition layers panel */}
            <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Layers size={13} style={{ color: 'var(--gold)' }} />
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Composition Layers
                </p>
              </div>

              <div className="space-y-2">
                {layers.map(({ id, label, icon: Icon, result, color }) => (
                  <button key={id} onClick={() => setActiveStep(id === 'video' ? 'video' : id)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left"
                    style={{
                      background: result ? `${color}10` : activeStep === id ? 'var(--bg-elevated)' : 'transparent',
                      border: `1px solid ${result ? color + '35' : activeStep === id ? 'var(--border)' : 'transparent'}`,
                    }}>
                    <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ background: result ? `${color}20` : 'var(--bg-elevated)' }}>
                      <Icon size={12} style={{ color: result ? color : 'var(--text-muted)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold" style={{ color: result ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {label}
                      </p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                        {result
                          ? id === 'video'   ? `${result.model || selectedModel} · ${duration}s`
                          : id === 'voice'   ? `${selectedVoiceName} · ~${result.duration}s`
                          : `${result.mood} · ${result.duration}s`
                          : 'Not generated yet'}
                      </p>
                    </div>
                    {result ? (
                      <Check size={12} style={{ color: '#22C55E', flexShrink: 0 }} />
                    ) : (
                      <ChevronRight size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    )}
                  </button>
                ))}
              </div>

              {compositionReady && (
                <button onClick={() => setActiveStep('export')}
                  className="btn-gold w-full mt-3 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
                  <Download size={14} /> Export Composition
                </button>
              )}
              {!compositionReady && videoResult && (
                <p className="text-xs text-center mt-3" style={{ color: 'var(--text-muted)' }}>
                  Add voice or music to complete your composition
                </p>
              )}
              {!videoResult && (
                <p className="text-xs text-center mt-3" style={{ color: 'var(--text-muted)' }}>
                  Start by generating a video
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

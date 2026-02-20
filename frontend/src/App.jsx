import { useMemo, useRef, useState } from 'react';

const MAX_CHARACTERS = 20000;
const LANGUAGES = [
  { label: 'English (US)', value: 'en-US' },
  { label: 'English (UK)', value: 'en-GB' },
  { label: 'Spanish (Spain)', value: 'es-ES' }
];

const VOICES_BY_LANGUAGE = {
  'en-US': [
    { label: 'Jenny (Neural)', value: 'en-US-JennyNeural' },
    { label: 'Aria (Neural)', value: 'en-US-AriaNeural' }
  ],
  'en-GB': [{ label: 'Sonia (Neural)', value: 'en-GB-SoniaNeural' }],
  'es-ES': [{ label: 'Elvira (Neural)', value: 'es-ES-ElviraNeural' }]
};

export default function App() {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('en-US');
  const [voice, setVoice] = useState(VOICES_BY_LANGUAGE['en-US'][0].value);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(0);
  const [audioUrl, setAudioUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  const voices = useMemo(() => VOICES_BY_LANGUAGE[language] ?? [], [language]);

  const validate = () => {
    if (!text.trim()) return 'Please enter text before converting to speech.';
    if (text.length > MAX_CHARACTERS) return `Text cannot exceed ${MAX_CHARACTERS} characters.`;
    return '';
  };

  const onLanguageChange = (nextLanguage) => {
    setLanguage(nextLanguage);
    const firstVoice = VOICES_BY_LANGUAGE[nextLanguage]?.[0]?.value ?? '';
    setVoice(firstVoice);
  };

  const convertToSpeech = async () => {
    const validationError = validate();
    setError(validationError);
    if (validationError) return;

    setIsGenerating(true);
    setProgress(0);

    try {
      const response = await fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language, voice, rate, pitch })
      });

      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Failed to convert text to speech.');

      setAudioUrl(body.audioUrl);
      setIsPlaying(false);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayPause = async () => {
    const audioEl = audioRef.current;
    if (!audioEl || !audioUrl) return;

    if (audioEl.paused) {
      await audioEl.play();
      setIsPlaying(true);
    } else {
      audioEl.pause();
      setIsPlaying(false);
    }
  };

  return (
    <main className="app-shell">
      <section className="card">
        <h1>Speakify</h1>
        <p className="subtext">Copyright-safe Text-to-Speech generation for commercial content workflows.</p>

        <label htmlFor="inputText">Input text</label>
        <textarea
          id="inputText"
          rows={12}
          value={text}
          onChange={(event) => setText(event.target.value)}
          aria-describedby="charCount"
          placeholder="Type or paste original text you have rights to use..."
        />
        <p id="charCount" className="hint">{text.length} / {MAX_CHARACTERS} characters</p>

        <div className="grid">
          <label>
            Language
            <select value={language} onChange={(event) => onLanguageChange(event.target.value)}>
              {LANGUAGES.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label>
            Voice
            <select value={voice} onChange={(event) => setVoice(event.target.value)}>
              {voices.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label>
            Speech rate ({rate}x)
            <input type="range" min="0.5" max="2" step="0.1" value={rate} onChange={(event) => setRate(Number(event.target.value))} />
          </label>

          <label>
            Pitch ({pitch})
            <input type="range" min="-20" max="20" step="1" value={pitch} onChange={(event) => setPitch(Number(event.target.value))} />
          </label>
        </div>

        <div className="actions">
          <button type="button" onClick={convertToSpeech} disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Convert to Speech'}
          </button>
          <button type="button" onClick={togglePlayPause} disabled={!audioUrl || isGenerating}>
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <a className={`download ${!audioUrl ? 'disabled' : ''}`} href={audioUrl || '#'} download="speakify.wav" aria-disabled={!audioUrl}>
            Download Audio
          </a>
        </div>

        <audio
          ref={audioRef}
          src={audioUrl}
          controls
          controlsList="nodownload"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={(event) => {
            const el = event.currentTarget;
            const value = el.duration ? (el.currentTime / el.duration) * 100 : 0;
            setProgress(value);
          }}
        />
        <progress value={progress} max="100" aria-label="Playback progress" />

        {error ? <p role="alert" className="error">{error}</p> : null}
      </section>
    </main>
  );
}

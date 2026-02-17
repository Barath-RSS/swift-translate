import { useState } from "react";
import { Languages, ArrowRightLeft, Copy, Check, Loader2, Globe, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "tr", name: "Turkish", flag: "🇹🇷" },
  { code: "nl", name: "Dutch", flag: "🇳🇱" },
  { code: "pl", name: "Polish", flag: "🇵🇱" },
  { code: "sv", name: "Swedish", flag: "🇸🇪" },
  { code: "da", name: "Danish", flag: "🇩🇰" },
  { code: "fi", name: "Finnish", flag: "🇫🇮" },
  { code: "no", name: "Norwegian", flag: "🇳🇴" },
  { code: "cs", name: "Czech", flag: "🇨🇿" },
];

const TranslatorPage = () => {
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("es");
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSwapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      toast.error("Please enter text to translate");
      return;
    }

    if (sourceLang === targetLang) {
      toast.error("Source and target languages must be different");
      return;
    }

    setIsTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke("translate", {
        body: { text: sourceText, sourceLang, targetLang },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setTranslatedText(data.translatedText);
    } catch (err: any) {
      toast.error(err.message || "Translation failed. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = async () => {
    if (!translatedText) return;
    await navigator.clipboard.writeText(translatedText);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/60 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--translator-gradient)' }}>
            <Globe className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-foreground">LinguaFlow</h1>
            <p className="text-xs text-muted-foreground">AI-Powered Translation</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
            <Sparkles className="w-3 h-3 text-accent" />
            <span>Powered by AI</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl">
          {/* Hero text */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
              Translate Anything, Instantly
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              20+ languages supported with AI-powered accuracy. Just type, select, and translate.
            </p>
          </div>

          {/* Language selector bar */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <LanguageSelect value={sourceLang} onChange={setSourceLang} label="From" />
            <button
              onClick={handleSwapLanguages}
              className="w-10 h-10 rounded-full bg-card border border-border hover:border-primary/40 flex items-center justify-center transition-all hover:shadow-md group"
              aria-label="Swap languages"
            >
              <ArrowRightLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
            <LanguageSelect value={targetLang} onChange={setTargetLang} label="To" />
          </div>

          {/* Translation panels */}
          <div className="grid md:grid-cols-2 gap-4" style={{ boxShadow: 'var(--translator-card-shadow)' }}>
            {/* Source */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  {LANGUAGES.find(l => l.code === sourceLang)?.flag}{" "}
                  {LANGUAGES.find(l => l.code === sourceLang)?.name}
                </span>
                <span className="text-xs text-muted-foreground">{sourceText.length}/5000</span>
              </div>
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Enter text to translate..."
                maxLength={5000}
                className="flex-1 min-h-[200px] p-4 bg-transparent text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none text-base leading-relaxed"
              />
            </div>

            {/* Target */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  {LANGUAGES.find(l => l.code === targetLang)?.flag}{" "}
                  {LANGUAGES.find(l => l.code === targetLang)?.name}
                </span>
                {translatedText && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                )}
              </div>
              <div className="flex-1 min-h-[200px] p-4 text-base leading-relaxed">
                {isTranslating ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Translating...</span>
                  </div>
                ) : translatedText ? (
                  <p className="text-foreground whitespace-pre-wrap">{translatedText}</p>
                ) : (
                  <p className="text-muted-foreground/50">Translation will appear here...</p>
                )}
              </div>
            </div>
          </div>

          {/* Translate button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={handleTranslate}
              disabled={isTranslating || !sourceText.trim()}
              className="px-8 py-3 rounded-xl text-primary-foreground font-medium text-base flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg active:scale-[0.98]"
              style={{ background: 'var(--translator-gradient)', boxShadow: sourceText.trim() ? 'var(--translator-glow)' : 'none' }}
            >
              {isTranslating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Languages className="w-5 h-5" />
              )}
              {isTranslating ? "Translating..." : "Translate"}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-4">
        <p className="text-center text-xs text-muted-foreground">
          CodeAlpha Internship Project · AI Translation App · Built with React & Lovable AI
        </p>
      </footer>
    </div>
  );
};

const LanguageSelect = ({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (val: string) => void;
  label: string;
}) => (
  <div className="flex flex-col items-center gap-1">
    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground font-medium appearance-none cursor-pointer hover:border-primary/40 transition-colors focus:outline-none focus:ring-2 focus:ring-ring/20 min-w-[140px] text-center"
    >
      {LANGUAGES.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.flag} {lang.name}
        </option>
      ))}
    </select>
  </div>
);

export default TranslatorPage;

import { useState, useEffect, useCallback, useRef } from 'react';
import { BookOpen, Share2, Check, Download, Loader } from 'lucide-react';

// Collection of Bible verses (NIV)
const bibleVerses = [
  { verse: "For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future.", reference: "Jeremiah 29:11", book: "Jeremiah" },
  { verse: "Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.", reference: "Proverbs 3:5-6", book: "Proverbs" },
  { verse: "I can do all this through him who gives me strength.", reference: "Philippians 4:13", book: "Philippians" },
  { verse: "Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go.", reference: "Joshua 1:9", book: "Joshua" },
  { verse: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.", reference: "John 3:16", book: "John" },
  { verse: "The LORD is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul.", reference: "Psalm 23:1-3", book: "Psalms" },
  { verse: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.", reference: "Romans 8:28", book: "Romans" },
  { verse: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.", reference: "Philippians 4:6", book: "Philippians" },
  { verse: "The LORD is close to the brokenhearted and saves those who are crushed in spirit.", reference: "Psalm 34:18", book: "Psalms" },
  { verse: "Come to me, all you who are weary and burdened, and I will give you rest.", reference: "Matthew 11:28", book: "Matthew" },
  { verse: "But those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.", reference: "Isaiah 40:31", book: "Isaiah" },
  { verse: "Be joyful in hope, patient in affliction, faithful in prayer.", reference: "Romans 12:12", book: "Romans" },
  { verse: "The LORD gives strength to his people; the LORD blesses his people with peace.", reference: "Psalm 29:11", book: "Psalms" },
  { verse: "But seek first his kingdom and his righteousness, and all these things will be given to you as well.", reference: "Matthew 6:33", book: "Matthew" },
  { verse: "Your word is a lamp for my feet, a light on my path.", reference: "Psalm 119:105", book: "Psalms" },
  { verse: "Cast all your anxiety on him because he cares for you.", reference: "1 Peter 5:7", book: "1 Peter" },
  { verse: "Delight yourself in the LORD, and he will give you the desires of your heart.", reference: "Psalm 37:4", book: "Psalms" },
  { verse: "Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!", reference: "2 Corinthians 5:17", book: "2 Corinthians" },
  { verse: "Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up.", reference: "Galatians 6:9", book: "Galatians" },
  { verse: "This is the day the LORD has made; let us rejoice and be glad in it.", reference: "Psalm 118:24", book: "Psalms" },
  { verse: "In all your ways acknowledge him, and he will make your paths straight.", reference: "Proverbs 3:6", book: "Proverbs" },
  { verse: "The grace of our Lord Jesus Christ be with your spirit. Amen.", reference: "Philippians 4:23", book: "Philippians" },
  { verse: "Do everything in love.", reference: "1 Corinthians 16:14", book: "1 Corinthians" },
  { verse: "Be completely humble and gentle; be patient, bearing with one another in love.", reference: "Ephesians 4:2", book: "Ephesians" },
  { verse: "A new command I give you: Love one another. As I have loved you, so you must love one another.", reference: "John 13:34", book: "John" },
  { verse: "For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline.", reference: "2 Timothy 1:7", book: "2 Timothy" },
  { verse: "But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control.", reference: "Galatians 5:22-23", book: "Galatians" },
  { verse: "Finally, be strong in the Lord and in his mighty power.", reference: "Ephesians 6:10", book: "Ephesians" },
  { verse: "Commit to the LORD whatever you do, and he will establish your plans.", reference: "Proverbs 16:3", book: "Proverbs" },
  { verse: "The LORD is good, a refuge in times of trouble. He cares for those who trust in him.", reference: "Nahum 1:7", book: "Nahum" },
  { verse: "Rejoice always, pray continually, give thanks in all circumstances; for this is God's will for you in Christ Jesus.", reference: "1 Thessalonians 5:16-18", book: "1 Thessalonians" },
  { verse: "But those who wait upon the LORD shall renew their strength.", reference: "Isaiah 40:31", book: "Isaiah" },
  { verse: "He has shown you, O mortal, what is good. And what does the LORD require of you? To act justly and to love mercy and to walk humbly with your God.", reference: "Micah 6:8", book: "Micah" },
  { verse: "Do not conform to the pattern of this world, but be transformed by the renewing of your mind.", reference: "Romans 12:2", book: "Romans" },
  { verse: "Let the peace of Christ rule in your hearts, since as members of one body you were called to peace.", reference: "Colossians 3:15", book: "Colossians" },
  { verse: "But God demonstrates his own love for us in this: While we were still sinners, Christ died for us.", reference: "Romans 5:8", book: "Romans" },
];

// Get verse of the day based on date (same verse for same day)
function getVerseOfTheDay() {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const index = dayOfYear % bibleVerses.length;
  return bibleVerses[index];
}

// Generate safe filename from reference
function getSafeFileName(reference: string) {
  return reference.replace(/[:\s/-]/g, '_') + '.png';
}

export default function DailyVerse() {
  const [verse, setVerse] = useState<typeof bibleVerses[0] | null>(null);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const todayVerse = getVerseOfTheDay();
    setVerse(todayVerse);
  }, []);

  // Wrap text and return lines
  function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    for (const word of words) {
      const testLine = currentLine ? currentLine + ' ' + word : word;
      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  // Generate image with logo and watermark
  const generateImage = useCallback(async () => {
    if (!verse || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const W = 1080;
    const H = 1080;
    canvas.width = W;
    canvas.height = H;

    // === BACKGROUND: deep navy gradient ===
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#070F25');
    bg.addColorStop(0.45, '#0F1B3D');
    bg.addColorStop(1, '#040A1A');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Subtle radial glow at center
    const glow = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 520);
    glow.addColorStop(0, 'rgba(201,162,39,0.07)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // === BORDER FRAMES ===
    const p = 30;
    ctx.strokeStyle = '#C9A227';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(p, p, W - p * 2, H - p * 2);
    ctx.strokeStyle = 'rgba(201,162,39,0.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(p + 10, p + 10, W - (p + 10) * 2, H - (p + 10) * 2);

    // Corner ornaments
    const cornerSize = 24;
    const cp = p + 2;
    ctx.strokeStyle = '#C9A227';
    ctx.lineWidth = 2;
    for (const [cx, cy, sx, sy] of [[cp, cp, 1, 1], [W - cp, cp, -1, 1], [cp, H - cp, 1, -1], [W - cp, H - cp, -1, -1]] as [number,number,number,number][]) {
      ctx.beginPath();
      ctx.moveTo(cx + sx * cornerSize, cy);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx, cy + sy * cornerSize);
      ctx.stroke();
    }

    // === LOGO ===
    let logoBottom = 90;
    try {
      const logoImg = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = '/logo.png';
      });
      const logoSize = 110;
      const logoH = logoSize * (logoImg.height / logoImg.width);
      ctx.save();
      ctx.beginPath();
      ctx.arc(W / 2, logoBottom + logoH / 2, logoH / 2 + 4, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(201,162,39,0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
      ctx.drawImage(logoImg, (W - logoSize) / 2, logoBottom, logoSize, logoH);
      logoBottom += logoH + 16;
    } catch {
      // no logo
    }

    // College name
    ctx.fillStyle = '#E8D48B';
    ctx.font = 'bold 26px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('AIZAWL BIBLE COLLEGE', W / 2, logoBottom + 4);
    logoBottom += 34;

    // Gold line divider
    const drawHRule = (y: number, halfW: number, alpha = 1) => {
      ctx.strokeStyle = `rgba(201,162,39,${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(W / 2 - halfW, y);
      ctx.lineTo(W / 2 + halfW, y);
      ctx.stroke();
    };
    drawHRule(logoBottom, 200);
    logoBottom += 22;

    // "VERSE OF THE DAY" label
    ctx.fillStyle = '#C9A227';
    ctx.font = 'bold 18px Georgia, serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('VERSE  OF  THE  DAY', W / 2, logoBottom);
    logoBottom += 24;

    // Date
    ctx.fillStyle = 'rgba(232,212,139,0.7)';
    ctx.font = 'italic 15px Georgia, serif';
    const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    ctx.fillText(dateStr, W / 2, logoBottom);
    logoBottom += 18;

    drawHRule(logoBottom, 260, 0.4);
    logoBottom += 18;

    // === VERSE TEXT — auto-size to fill available space ===
    const textPad = 80; // horizontal padding from edges
    const maxTextW = W - textPad * 2;
    const bottomReserved = 120; // space for reference + footer
    const availableH = H - logoBottom - bottomReserved;

    // Try font sizes from large to small until content fits
    let fontSize = 46;
    let verseLines: string[] = [];
    while (fontSize >= 22) {
      ctx.font = `italic ${fontSize}px Georgia, serif`;
      verseLines = wrapText(ctx, `\u201C${verse.verse}\u201D`, maxTextW);
      const lineH = fontSize * 1.42;
      const totalH = verseLines.length * lineH;
      if (totalH <= availableH * 0.82) break;
      fontSize -= 2;
    }

    const lineH = fontSize * 1.42;
    const totalVerseH = verseLines.length * lineH;
    const verseStartY = logoBottom + (availableH - totalVerseH) / 2;

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `italic ${fontSize}px Georgia, serif`;
    ctx.textAlign = 'center';
    verseLines.forEach((line, i) => {
      ctx.fillText(line, W / 2, verseStartY + i * lineH);
    });

    const afterVerseY = verseStartY + totalVerseH + 28;

    // Thin divider above reference
    drawHRule(afterVerseY, 180, 0.45);

    // Reference
    ctx.fillStyle = '#C9A227';
    ctx.font = `bold ${Math.min(28, fontSize - 4)}px Georgia, serif`;
    ctx.fillText(`\u2014 ${verse.reference}`, W / 2, afterVerseY + 36);

    // NIV label
    ctx.fillStyle = 'rgba(201,162,39,0.55)';
    ctx.font = 'italic 15px Georgia, serif';
    ctx.fillText('(New International Version)', W / 2, afterVerseY + 60);

    // === FOOTER ===
    drawHRule(H - 58, 120, 0.35);
    ctx.fillStyle = 'rgba(232,212,139,0.45)';
    ctx.font = '14px Arial, sans-serif';
    ctx.fillText('aizawlbiblecollege.in', W / 2, H - 40);

    // Convert to blob URL
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/png');
    });

    if (blob) {
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
      return url;
    }
    return null;
  }, [verse]);

  const handleShareAsImage = useCallback(async () => {
    if (!verse) return;

    setGenerating(true);
    try {
      const url = await generateImage();
      if (!url) return;

      const fileName = getSafeFileName(verse.reference);

      // Try Web Share API with file
      if (navigator.share && navigator.canShare) {
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          const file = new File([blob], fileName, { type: 'image/png' });

          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: 'Daily Bible Verse',
              text: `"${verse.verse}" - ${verse.reference}`,
              files: [file],
            });
            setGenerating(false);
            return;
          }
        } catch (err) {
          // Fallback to download
        }
      }

      // Fallback: Download the image
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error sharing:', err);
    }
    setGenerating(false);
  }, [verse, generateImage]);

  const handleDownload = useCallback(async () => {
    if (!verse) return;

    setGenerating(true);
    try {
      const url = await generateImage();
      if (!url) return;

      const fileName = getSafeFileName(verse.reference);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading:', err);
    }
    setGenerating(false);
  }, [verse, generateImage]);

  const handleCopyText = useCallback(() => {
    if (!verse) return;
    const shareText = `"${verse.verse}" - ${verse.reference} (NIV)\n\nShared from Aizawl Bible College\nhttps://aizawlbiblecollege.in`;
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }, [verse]);

  if (!verse) return null;

  return (
    <>
      {/* Hidden canvas for image generation */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <section className="py-8 md:py-10 bg-white border-y border-slate-200">
        <div className="page-container max-w-4xl">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 shadow-xl">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-gold-500/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-gold-500/5 rounded-full translate-x-1/3 translate-y-1/3" />

            <div className="relative px-6 py-8 md:px-10 md:py-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gold-500 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-serif font-bold text-white">Verse of the Day</h2>
                    <p className="text-gold-400 text-xs">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>

              {/* Verse */}
              <div className="relative">
                <p className="text-white/95 text-lg md:text-xl leading-relaxed font-serif italic mb-4">
                  "{verse.verse}"
                </p>
                <p className="text-gold-400 font-semibold text-sm md:text-base">
                  — {verse.reference} <span className="text-gold-400/70">(NIV)</span>
                </p>
              </div>

              {/* Share buttons */}
              <div className="flex items-center gap-3 mt-6 pt-5 border-t border-white/10">
                <button
                  onClick={handleShareAsImage}
                  disabled={generating}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold rounded-xl text-sm transition-colors disabled:opacity-70"
                >
                  {generating ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      Share as Image
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  disabled={generating}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl text-sm transition-colors disabled:opacity-70"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={handleCopyText}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    copied
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    'Copy Text'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

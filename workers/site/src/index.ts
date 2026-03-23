export default {
  async fetch(): Promise<Response> {
    return new Response(HTML, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      },
    });
  },
};

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>a real cool co. - Something Cool is Loading</title>
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23000'/%3E%3Ctext x='50' y='35' font-family='monospace' font-size='20' fill='%23fff' text-anchor='middle'%3Ea%3C/text%3E%3Ctext x='50' y='55' font-family='monospace' font-size='14' fill='%23fff' text-anchor='middle'%3Ereal%3C/text%3E%3Ctext x='50' y='75' font-family='monospace' font-size='14' fill='%23fff' text-anchor='middle'%3Ecool%3C/text%3E%3Ctext x='50' y='90' font-family='monospace' font-size='12' fill='%23fff' text-anchor='middle'%3Eco.%3C/text%3E%3C/svg%3E">
    <meta name="description" content="creative studio building the future one cool project at a time. we make stuff that doesn't suck. something cool is loading, stay tuned.">
    <meta name="keywords" content="creative studio, CerebreX, MCP, AI agents, developer tools, agent infrastructure, open source">
    <meta name="author" content="a real cool co.">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://therealcool.site">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://therealcool.site">
    <meta property="og:title" content="a real cool co. - Something Cool is Loading">
    <meta property="og:description" content="creative studio building the future one cool project at a time. we make stuff that doesn't suck. something cool is loading, stay tuned.">
    <meta property="og:site_name" content="a real cool co.">
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:creator" content="@therealcool.site">
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "a real cool co.",
        "url": "https://therealcool.site",
        "description": "creative studio building the future one cool project at a time.",
        "sameAs": [
            "https://tiktok.com/@a.real.cool.co",
            "https://www.youtube.com/@arealcoolcompany",
            "https://github.com/arealcoolco/CerebreX",
            "https://www.linkedin.com/company/a-real-cool-co",
            "https://mastodon.social/@arealcoolcompany",
            "https://bsky.app/profile/therealcool.site"
        ]
    }
    </script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-black: #000000;
            --primary-white: #ffffff;
            --glow-white: #ffffff;
            --glow-white-dim: rgba(255,255,255,0.3);
        }
        * { margin:0; padding:0; box-sizing:border-box; }
        body {
            background: var(--primary-black);
            color: var(--primary-white);
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            overflow-x: hidden;
            cursor: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iMSIgeT0iMSIgd2lkdGg9IjIyIiBoZWlnaHQ9IjIyIiBmaWxsPSIjZmZmZmZmIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K'), auto;
            min-height: 100vh;
        }
        body::before {
            content: '';
            position: fixed; top:0; left:0; width:100%; height:100%;
            background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px),
                        repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.01) 2px, rgba(255,255,255,0.01) 4px);
            pointer-events: none; z-index:1;
            animation: scanlineFlicker 0.1s linear infinite;
        }
        body::after {
            content:'';
            position:fixed; top:0; left:0; width:100%; height:100%;
            background: radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.4) 100%);
            pointer-events:none; z-index:2;
        }
        .bg-layer { position:fixed; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:-1; }
        .static-screen {
            background: repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.08) 1px, rgba(255,255,255,0.08) 2px),
                        repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(255,255,255,0.05) 1px, rgba(255,255,255,0.05) 2px);
            animation: staticFlicker 0.15s linear infinite;
        }
        .noise-overlay {
            position:fixed; top:0; left:0; width:100%; height:100%;
            opacity:0.15; z-index:3; pointer-events:none;
            background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxmaWx0ZXIgaWQ9Im5vaXNlIiB4PSIwJSIgeT0iMCUiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPgogICAgICA8ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9IjAuOSIgbnVtT2N0YXZlcz0iNCIgcmVzdWx0PSJub2lzZSIgc2VlZD0iMSIvPgogICAgICA8ZmVDb2xvck1hdHJpeCBpbj0ibm9pc2UiIHR5cGU9InNhdHVyYXRlIiB2YWx1ZXM9IjAiLz4KICAgIDwvZmlsdGVyPgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2UpIiBvcGFjaXR5PSIwLjciLz4KPC9zdmc+');
            animation: noiseShift 0.2s linear infinite;
            mix-blend-mode: screen;
        }
        .glitch-bars { position:fixed; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:4; }
        .glitch-bar {
            position:absolute; left:0; width:100%; height:1px;
            background: linear-gradient(90deg, transparent, var(--glow-white), transparent);
            opacity:0; animation: glitchFlicker 4s infinite;
            box-shadow: 0 0 10px var(--glow-white);
        }
        .glitch-bar:nth-child(1) { top:15%; animation-delay:0s; }
        .glitch-bar:nth-child(2) { top:35%; animation-delay:1.5s; }
        .glitch-bar:nth-child(3) { top:65%; animation-delay:3s; }
        .glitch-bar:nth-child(4) { top:85%; animation-delay:0.8s; }

        .container {
            min-height:100vh; display:flex; flex-direction:column;
            align-items:center; justify-content:center;
            padding:2rem; position:relative; z-index:5; gap:3rem;
            animation: fadeIn 1s ease-out;
        }
        .logo-section { display:flex; flex-direction:column; align-items:center; gap:1.5rem; }
        .logo-placeholder {
            width:200px; height:400px; background:var(--primary-black);
            border:2px solid var(--primary-white);
            display:flex; flex-direction:column; align-items:center; justify-content:center;
            font-family:'Inter',sans-serif; font-weight:300; font-size:2rem;
            color:var(--primary-white); text-align:center; line-height:0.9;
            letter-spacing:-0.02em; transition:all 0.3s cubic-bezier(0.4,0,0.2,1);
            position:relative; overflow:hidden;
            text-shadow: 0 0 10px rgba(255,255,255,0.3);
        }
        .logo-placeholder::before {
            content:''; position:absolute; top:-50%; left:-50%; width:200%; height:200%;
            background: radial-gradient(circle, var(--glow-white-dim) 0%, transparent 70%);
            opacity:0; transition:opacity 0.3s ease; z-index:-1;
        }
        .logo-placeholder:hover::before { opacity:1; }
        .logo-placeholder:hover {
            box-shadow: 0 0 40px rgba(255,255,255,0.4), inset 0 0 20px rgba(255,255,255,0.1);
            transform:scale(1.02);
            text-shadow: 0 0 15px rgba(255,255,255,0.8);
        }
        .tagline {
            font-family:'JetBrains Mono',monospace; font-size:1.2rem; font-weight:400;
            text-transform:lowercase; letter-spacing:0.1em;
            position:relative; overflow:hidden;
            text-shadow: 0 0 10px rgba(255,255,255,0.3);
            margin-bottom:0.5rem;
        }
        .tagline::after {
            content:''; position:absolute; bottom:-2px; left:0; width:100%; height:2px;
            background: linear-gradient(90deg, var(--primary-white), var(--glow-white), var(--primary-white));
            animation: typewriter 2s ease-out;
            box-shadow: 0 0 10px var(--glow-white);
        }
        .social-links { display:flex; gap:2rem; align-items:center; justify-content:center; flex-wrap:wrap; }
        .social-link {
            display:flex; align-items:center; justify-content:center;
            width:50px; height:50px;
            transition:all 0.3s cubic-bezier(0.4,0,0.2,1);
            text-decoration:none; border-radius:4px; position:relative; overflow:hidden;
        }
        .social-link::before { content:''; position:absolute; inset:0; background:rgba(255,255,255,0.1); opacity:0; transition:opacity 0.3s ease; }
        .social-link:hover::before { opacity:1; }
        .social-link:hover { transform:scale(1.1); filter:drop-shadow(0 0 15px rgba(255,255,255,0.6)); }
        .social-icon { width:32px; height:32px; fill:var(--primary-white); transition:all 0.3s ease; z-index:1; }

        /* ── CerebreX Project Tile ── */
        .projects-section { display:flex; flex-direction:column; align-items:center; gap:2rem; margin-top:2rem; width:100%; max-width:660px; }
        .project-item {
            display:flex; flex-direction:column; align-items:center; gap:1.2rem;
            padding:2.5rem 2rem; border:1px solid rgba(255,255,255,0.3);
            background:rgba(0,0,0,0.5); backdrop-filter:blur(10px);
            width:100%; text-align:center;
            transition:all 0.3s cubic-bezier(0.4,0,0.2,1);
            text-decoration:none; color:inherit; position:relative; overflow:hidden;
        }
        .project-item::before {
            content:''; position:absolute; inset:0;
            background:linear-gradient(45deg, transparent, rgba(255,255,255,0.05), transparent);
            opacity:0; transition:opacity 0.3s ease;
        }
        .project-item:hover::before { opacity:1; }
        .project-item:hover {
            border-color:var(--glow-white);
            box-shadow: 0 0 30px rgba(255,255,255,0.2), inset 0 0 20px rgba(255,255,255,0.05);
            transform:translateY(-4px);
        }

        /* Beta badge */
        .beta-badge {
            display:inline-block;
            font-family:'JetBrains Mono',monospace; font-size:0.65rem; font-weight:700;
            text-transform:uppercase; letter-spacing:0.15em;
            border:1px solid rgba(255,255,255,0.5);
            padding:0.2rem 0.7rem;
            color:rgba(255,255,255,0.7);
            background:rgba(255,255,255,0.05);
        }

        /* CerebreX logo mark */
        .cerebrex-logo {
            width:90px; height:90px;
            border:2px solid rgba(255,255,255,0.8);
            display:flex; align-items:center; justify-content:center;
            font-family:'JetBrains Mono',monospace; font-weight:700;
            font-size:0.85rem; letter-spacing:0.05em;
            color:#fff; background:rgba(255,255,255,0.04);
            transition:all 0.3s ease;
            position:relative; overflow:hidden;
        }
        .cerebrex-logo::before {
            content:'';
            position:absolute; inset:0;
            background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 0%, transparent 70%);
            opacity:0; transition:opacity 0.3s ease;
        }
        .project-item:hover .cerebrex-logo {
            transform:scale(1.08);
            border-color:#fff;
            box-shadow: 0 0 20px rgba(255,255,255,0.4);
        }
        .project-item:hover .cerebrex-logo::before { opacity:1; }
        .cerebrex-logo svg { width:56px; height:56px; }

        .project-title {
            font-family:'JetBrains Mono',monospace; font-size:1.6rem; font-weight:700;
            text-transform:lowercase; letter-spacing:0.05em;
        }
        .project-description {
            font-family:'Inter',sans-serif; font-size:0.95rem;
            line-height:1.65; opacity:0.85; max-width:520px;
        }

        /* How to test block */
        .test-block {
            width:100%; background:rgba(255,255,255,0.04);
            border:1px solid rgba(255,255,255,0.15);
            padding:1rem 1.2rem; text-align:left;
        }
        .test-block-label {
            font-family:'JetBrains Mono',monospace; font-size:0.65rem;
            text-transform:uppercase; letter-spacing:0.15em;
            color:rgba(255,255,255,0.4); margin-bottom:0.5rem;
        }
        .test-block code {
            font-family:'JetBrains Mono',monospace; font-size:0.82rem;
            color:rgba(255,255,255,0.85); display:block; line-height:1.8;
        }

        /* CTA buttons */
        .cta-row { display:flex; gap:1rem; align-items:center; justify-content:center; flex-wrap:wrap; margin-top:0.4rem; }
        .btn-primary {
            font-family:'JetBrains Mono',monospace; font-size:0.85rem; font-weight:700;
            text-transform:lowercase; letter-spacing:0.08em;
            padding:0.75rem 1.8rem;
            background:#fff; color:#000;
            border:2px solid #fff;
            text-decoration:none;
            transition:all 0.25s ease;
            cursor:pointer; display:inline-block;
        }
        .btn-primary:hover {
            background:transparent; color:#fff;
            box-shadow: 0 0 25px rgba(255,255,255,0.4);
        }
        .btn-ghost {
            font-family:'JetBrains Mono',monospace; font-size:0.85rem; font-weight:400;
            text-transform:lowercase; letter-spacing:0.08em;
            padding:0.75rem 1.8rem;
            background:transparent; color:rgba(255,255,255,0.7);
            border:1px solid rgba(255,255,255,0.35);
            text-decoration:none;
            transition:all 0.25s ease;
            display:inline-block;
        }
        .btn-ghost:hover {
            border-color:#fff; color:#fff;
            box-shadow: 0 0 15px rgba(255,255,255,0.2);
        }

        /* Audio / Spotify */
        .audio-controls { position:fixed; bottom:2rem; right:2rem; z-index:20; }
        .music-btn {
            width:50px; height:50px; border-radius:50%;
            background:rgba(0,0,0,0.8); border:1px solid rgba(255,255,255,0.5);
            color:var(--primary-white); cursor:pointer;
            display:flex; align-items:center; justify-content:center;
            transition:all 0.3s ease; backdrop-filter:blur(10px);
            box-shadow: 0 0 15px rgba(255,255,255,0.2);
        }
        .music-btn:hover { background:rgba(255,255,255,0.1); transform:scale(1.1); box-shadow:0 0 25px rgba(255,255,255,0.4); }
        .music-btn.active { background:rgba(255,255,255,0.2); box-shadow:0 0 30px rgba(255,255,255,0.6); }
        .spotify-player {
            position:fixed; bottom:6rem; right:2rem; width:320px; height:380px;
            background:var(--primary-black); border:2px solid var(--glow-white);
            opacity:0; visibility:hidden; transform:translateY(20px);
            transition:all 0.3s cubic-bezier(0.4,0,0.2,1); z-index:15;
            box-shadow:0 0 30px rgba(255,255,255,0.3);
        }
        .spotify-player.active { opacity:1; visibility:visible; transform:translateY(0); }
        .spotify-player iframe { width:100%; height:100%; filter:grayscale(1) contrast(1.2) brightness(0.9) hue-rotate(180deg); }
        .player-header {
            position:absolute; top:0; left:0; right:0; height:40px;
            background:var(--primary-black); border-bottom:1px solid var(--glow-white);
            display:flex; align-items:center; justify-content:space-between;
            padding:0 1rem; font-family:'JetBrains Mono',monospace; font-size:0.8rem;
            font-weight:600; z-index:16; text-shadow:0 0 5px var(--glow-white);
        }
        .close-player {
            background:none; border:none; color:var(--glow-white);
            cursor:pointer; font-size:1.2rem; width:20px; height:20px;
            display:flex; align-items:center; justify-content:center;
            transition:all 0.3s ease;
        }
        .close-player:hover { background:rgba(255,255,255,0.1); }

        /* Boot / Loading */
        .tv-overlay { position:fixed; top:0; left:0; width:100%; height:100%; background:var(--primary-white); z-index:10000; display:flex; align-items:center; justify-content:center; opacity:1; visibility:visible; }
        .tv-turn-on { animation:tvTurnOn 1.5s ease-out forwards; }
        .boot-sequence { position:fixed; top:0; left:0; width:100%; height:100%; background:var(--primary-black); color:var(--primary-white); font-family:'JetBrains Mono',monospace; font-size:0.9rem; z-index:9998; padding:2rem; overflow:hidden; opacity:0; visibility:hidden; }
        .boot-sequence.active { opacity:1; visibility:visible; }
        .boot-line { margin:0.2rem 0; opacity:0; animation:bootLineAppear 0.1s ease forwards; }
        .loading { position:fixed; top:0; left:0; width:100%; height:100%; background:var(--primary-black); display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:9999; opacity:0; visibility:hidden; }
        .loading.show { opacity:1; visibility:visible; }
        .loading.hide { animation:fadeOut 1s ease forwards; }
        .ascii-logo { font-family:'JetBrains Mono',monospace; font-size:0.6rem; line-height:1; white-space:pre; text-align:center; margin:2rem 0; opacity:0; text-shadow:0 0 10px rgba(255,255,255,0.3); }
        .ascii-logo.show { opacity:1; animation:asciiAppear 2s ease-in-out forwards; }
        .loading-text { font-family:'JetBrains Mono',monospace; font-size:1.5rem; font-weight:400; text-transform:lowercase; letter-spacing:0.2em; animation:pulse 1s ease-in-out infinite; text-shadow:0 0 20px var(--glow-white); }

        /* Mobile */
        @media (max-width:768px) {
            .container { gap:2rem; }
            .logo-placeholder { width:150px; height:300px; font-size:1.5rem; }
            .tagline { font-size:1rem; }
            .social-links { gap:1.5rem; }
            .social-link { width:40px; height:40px; }
            .social-icon { width:24px; height:24px; }
            .projects-section { padding:0 1rem; }
            .project-item { padding:1.75rem 1.25rem; }
            .cta-row { flex-direction:column; }
            .btn-primary, .btn-ghost { width:100%; text-align:center; }
            .spotify-player { width:calc(100vw - 2rem); right:1rem; height:300px; bottom:4rem; }
        }

        /* Animations */
        @keyframes scanlineFlicker { 0%,100%{opacity:1} 50%{opacity:0.95} }
        @keyframes staticFlicker { 0%,100%{opacity:1} 50%{opacity:0.94} }
        @keyframes noiseShift { 0%{transform:translate(0,0)} 25%{transform:translate(-0.5px,0.5px)} 50%{transform:translate(0.5px,-0.5px)} 75%{transform:translate(-0.5px,-0.5px)} 100%{transform:translate(0,0)} }
        @keyframes glitchFlicker { 0%,95%,100%{opacity:0} 2%,8%{opacity:0.8} }
        @keyframes typewriter { 0%{width:0} 100%{width:100%} }
        @keyframes fadeIn { 0%{opacity:0;transform:translateY(20px)} 100%{opacity:1;transform:translateY(0)} }
        @keyframes tvTurnOn { 0%{transform:scaleY(0.001) scaleX(1);opacity:1;background:var(--primary-white)} 30%{transform:scaleY(0.01) scaleX(1);opacity:1} 60%{transform:scaleY(0.1) scaleX(1);opacity:1;background:rgba(255,255,255,0.8)} 80%{transform:scaleY(0.5) scaleX(1);opacity:0.8} 100%{transform:scaleY(1) scaleX(1);opacity:0;visibility:hidden;background:transparent} }
        @keyframes bootLineAppear { to{opacity:1} }
        @keyframes asciiAppear { 0%{opacity:0;transform:translateY(20px)} 100%{opacity:1;transform:translateY(0)} }
        @keyframes fadeOut { to{opacity:0;visibility:hidden} }
        @keyframes pulse { 0%,100%{opacity:1;text-shadow:0 0 20px var(--glow-white)} 50%{opacity:0.3;text-shadow:0 0 10px var(--glow-white)} }
        @keyframes cursorFade { 0%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:scale(0.5)} }
    </style>
</head>
<body>
    <div class="tv-overlay tv-turn-on" id="tvOverlay"></div>
    <div class="boot-sequence" id="bootSequence"><div id="bootLines"></div></div>
    <div class="loading" id="loadingScreen">
        <div class="ascii-logo" id="asciiLogo"> ██████╗███████╗██████╗ ███████╗██████╗ ██████╗ ███████╗██╗  ██╗
██╔════╝██╔════╝██╔══██╗██╔════╝██╔══██╗██╔══██╗██╔════╝╚██╗██╔╝
██║     █████╗  ██████╔╝█████╗  ██████╔╝██████╔╝█████╗   ╚███╔╝
██║     ██╔══╝  ██╔══██╗██╔══╝  ██╔══██╗██╔══██╗██╔══╝   ██╔██╗
╚██████╗███████╗██║  ██║███████╗██████╔╝██║  ██║███████╗██╔╝ ██╗
 ╚═════╝╚══════╝╚═╝  ╚═╝╚══════╝╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝

        a real cool co.</div>
        <div class="loading-text">something cool is loading</div>
    </div>

    <div class="container">
        <div class="logo-section">
            <div class="logo-placeholder">a<br>real<br>cool<br>co.</div>
            <h1 class="tagline">something cool is loading</h1>
            <div class="social-links">
                <a href="https://bsky.app/profile/therealcool.site" class="social-link" target="_blank" rel="noopener" title="Bluesky">
                    <svg class="social-icon" viewBox="0 0 24 24"><path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-2.67-.297-5.568.628-6.383 3.364C.378 17.6 0 22.541 0 23.23c0 .688.139 1.86.902 2.202.659.299 1.664.621 4.3-1.24 2.752-1.942 5.711-5.881 6.798-7.995 1.087 2.114 4.046 6.053 6.798 7.995 2.636 1.861 3.641 1.539 4.3 1.24.763-.342.902-1.514.902-2.202 0-.689-.378-5.65-.624-6.479-.815-2.736-3.713-3.66-6.383-3.364-.139.016-.277.034-.415.056.138-.017.276-.036.415-.056 2.67.296 5.568-.628 6.383-3.364.246-.829.624-5.789.624-6.479 0-.688-.139-1.86-.902-2.202-.659-.299-1.664-.621-4.3 1.24-2.752 1.942-5.711 5.881-6.798 7.995z"/></svg>
                </a>
                <a href="https://mastodon.social/@arealcoolcompany" class="social-link" target="_blank" rel="noopener" title="Mastodon">
                    <svg class="social-icon" viewBox="0 0 24 24"><path d="M23.193 7.879c0-5.206-3.411-6.732-3.411-6.732C18.062.357 15.108.025 12.041 0h-.076c-3.068.025-6.02.357-7.74 1.147 0 0-3.411 1.526-3.411 6.732 0 1.192-.023 2.618.015 4.129.124 5.092.934 10.109 5.641 11.355 2.17.574 4.034.695 5.535.612 2.722-.15 4.25-.972 4.25-.972l-.09-1.975s-1.945.613-4.129.538c-2.165-.074-4.449-.233-4.799-2.891a5.499 5.499 0 0 1-.048-.745s2.125.519 4.817.642c1.646.075 3.19-.097 4.758-.283 3.007-.359 5.625-2.212 5.954-3.905.517-2.665.475-6.507.475-6.507zm-4.024 6.709h-2.497V8.469c0-1.29-.543-1.944-1.628-1.944-1.2 0-1.802.776-1.802 2.312v3.349h-2.483v-3.349c0-1.536-.602-2.312-1.802-2.312-1.085 0-1.628.655-1.628 1.944v6.119H4.832V8.284c0-1.289.328-2.313.987-3.07.679-.757 1.568-1.146 2.677-1.146 1.278 0 2.246.491 2.886 1.474L12 6.585l.618-1.043c.64-.983 1.608-1.474 2.886-1.474 1.109 0 1.998.389 2.677 1.146.659.757.987 1.781.987 3.07v6.304z"/></svg>
                </a>
                <a href="https://www.linkedin.com/company/a-real-cool-co" class="social-link" target="_blank" rel="noopener" title="LinkedIn">
                    <svg class="social-icon" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="https://www.youtube.com/@arealcoolcompany" class="social-link" target="_blank" rel="noopener" title="YouTube">
                    <svg class="social-icon" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
                <a href="https://tiktok.com/@a.real.cool.co" class="social-link" target="_blank" rel="noopener" title="TikTok">
                    <svg class="social-icon" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                </a>
            </div>
        </div>

        <!-- CerebreX Project Tile -->
        <div class="projects-section">
            <div class="project-item">
                <div class="cerebrex-logo">
                    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <!-- Brain / neural mesh mark -->
                        <circle cx="28" cy="28" r="20" stroke="white" stroke-width="1.5" fill="none" opacity="0.4"/>
                        <circle cx="28" cy="28" r="12" stroke="white" stroke-width="1.5" fill="none" opacity="0.6"/>
                        <circle cx="28" cy="28" r="4" fill="white" opacity="0.9"/>
                        <!-- Nodes -->
                        <circle cx="28" cy="8" r="2.5" fill="white" opacity="0.7"/>
                        <circle cx="28" cy="48" r="2.5" fill="white" opacity="0.7"/>
                        <circle cx="8" cy="28" r="2.5" fill="white" opacity="0.7"/>
                        <circle cx="48" cy="28" r="2.5" fill="white" opacity="0.7"/>
                        <!-- Connectors -->
                        <line x1="28" y1="10" x2="28" y2="16" stroke="white" stroke-width="1" opacity="0.5"/>
                        <line x1="28" y1="40" x2="28" y2="46" stroke="white" stroke-width="1" opacity="0.5"/>
                        <line x1="10" y1="28" x2="16" y2="28" stroke="white" stroke-width="1" opacity="0.5"/>
                        <line x1="40" y1="28" x2="46" y2="28" stroke="white" stroke-width="1" opacity="0.5"/>
                    </svg>
                </div>

                <span class="beta-badge">beta</span>

                <div class="project-title">cerebrex</div>

                <div class="project-description">
                    the open-source MCP registry and agent infrastructure OS for Claude and other AI agents.
                    browse, install, and publish MCP servers in one command — with a hosted registry, CLI tooling,
                    and a growing library of official packages for GitHub, NASA, weather, and more.
                    built for developers who want to extend their AI agents without the overhead.
                </div>

                <div class="test-block">
                    <div class="test-block-label">try it now</div>
                    <code>npm install -g cerebrex</code>
                    <code>cerebrex install @arealcoolco/github-mcp</code>
                    <code>cerebrex configure @arealcoolco/github-mcp --env GITHUB_TOKEN=your_token</code>
                </div>

                <div class="cta-row">
                    <a href="https://registry.therealcool.site" class="btn-primary" target="_blank" rel="noopener">
                        get early access →
                    </a>
                    <a href="https://github.com/arealcoolco/CerebreX" class="btn-ghost" target="_blank" rel="noopener">
                        view on github
                    </a>
                </div>
            </div>
        </div>
    </div>

    <div class="bg-layer static-screen"></div>
    <div class="noise-overlay"></div>
    <div class="glitch-bars">
        <div class="glitch-bar"></div><div class="glitch-bar"></div>
        <div class="glitch-bar"></div><div class="glitch-bar"></div>
    </div>

    <div class="audio-controls">
        <button class="music-btn" onclick="toggleSpotifyPlayer()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
        </button>
    </div>
    <div class="spotify-player" id="spotifyPlayer">
        <div class="player-header">
            <span>now playing</span>
            <button class="close-player" onclick="toggleSpotifyPlayer()">&#x2715;</button>
        </div>
        <iframe src="https://open.spotify.com/embed/playlist/3uf994YwtZzjP6R2aRWVSe?utm_source=generator"
            width="100%" height="352" frameBorder="0" allowfullscreen=""
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy">
        </iframe>
    </div>

    <script>
        const bootMessages = [
            'BIOS Version 2.10.1337','Memory Test: 16384KB OK','Initializing CPU... OK',
            'Loading OS Kernel...','Mounting file systems...','Starting network services...',
            'Loading display drivers...','Initializing audio system...','Starting user interface...',
            'Loading applications...','Checking system integrity...','All systems operational.',
            'Welcome to therealcool.site','','something cool is loading...'
        ];
        document.addEventListener('DOMContentLoaded', function() {
            document.querySelector('.container').style.opacity = '0';
            document.querySelector('.bg-layer').style.opacity = '0';
            document.querySelector('.noise-overlay').style.opacity = '0';
            document.querySelector('.glitch-bars').style.opacity = '0';
            startPageSequence();
        });
        function startPageSequence() { setTimeout(startBootSequence, 1500); }
        function startBootSequence() {
            const bootSequence = document.getElementById('bootSequence');
            const bootLines = document.getElementById('bootLines');
            document.getElementById('tvOverlay').style.display = 'none';
            bootSequence.classList.add('active');
            let i = 0;
            function next() {
                if (i < bootMessages.length) {
                    const line = document.createElement('div');
                    line.className = 'boot-line'; line.textContent = bootMessages[i];
                    bootLines.appendChild(line);
                    setTimeout(() => { line.style.opacity = '1'; }, 50);
                    i++;
                    setTimeout(next, i === bootMessages.length - 1 ? 1000 : 150);
                } else {
                    setTimeout(() => {
                        bootSequence.style.opacity = '0';
                        setTimeout(() => { bootSequence.style.display = 'none'; showLoadingScreen(); }, 500);
                    }, 800);
                }
            }
            next();
        }
        function showLoadingScreen() {
            const ls = document.getElementById('loadingScreen');
            const al = document.getElementById('asciiLogo');
            ls.classList.add('show');
            setTimeout(() => al.classList.add('show'), 500);
            setTimeout(() => {
                ls.classList.remove('show'); ls.classList.add('hide');
                setTimeout(() => { ls.style.display = 'none'; showMainContent(); }, 1000);
            }, 4000);
        }
        function showMainContent() {
            ['container','bg-layer','noise-overlay','glitch-bars'].forEach(c => {
                const el = document.querySelector('.' + c);
                if (el) { el.style.transition = 'opacity 1s ease'; el.style.opacity = '1'; }
            });
        }
        let isPlayerOpen = false;
        function toggleSpotifyPlayer() {
            const player = document.getElementById('spotifyPlayer');
            const btn = document.querySelector('.music-btn');
            isPlayerOpen = !isPlayerOpen;
            player.classList.toggle('active', isPlayerOpen);
            btn.classList.toggle('active', isPlayerOpen);
        }
        document.addEventListener('click', (e) => {
            const player = document.getElementById('spotifyPlayer');
            const btn = document.querySelector('.music-btn');
            if (isPlayerOpen && !player.contains(e.target) && !btn.contains(e.target)) toggleSpotifyPlayer();
        });
        document.addEventListener('mousemove', (e) => {
            const c = document.createElement('div');
            c.style.cssText = 'position:fixed;width:4px;height:4px;background:rgba(255,255,255,0.8);pointer-events:none;z-index:9999;border-radius:50%;left:' + e.clientX + 'px;top:' + e.clientY + 'px;animation:cursorFade 0.8s ease-out forwards;box-shadow:0 0 10px rgba(255,255,255,0.6);';
            document.body.appendChild(c);
            setTimeout(() => c.remove(), 800);
        });
        setInterval(() => {
            const els = document.querySelectorAll('.social-link,.logo-placeholder,.project-item');
            const el = els[Math.floor(Math.random() * els.length)];
            if (el) { el.style.boxShadow = '0 0 50px rgba(255,255,255,0.6)'; setTimeout(() => el.style.boxShadow = '', 200); }
        }, 5000);
        const s = document.createElement('style');
        s.textContent = '@keyframes cursorFade{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(0.5)}}';
        document.head.appendChild(s);
    </script>
</body>
</html>`;

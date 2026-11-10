/* RIFFOLOGIA — motore audio "amplificatore"
 *
 * Perché è fatto così (analisi del motore precedente):
 *  - prima ogni pizzico creava 5 nodi (2 oscillatori + distorsione 4x + filtro + gain) vivi 1,8 s;
 *    una pennata veloce generava centinaia di voci simultanee -> thread audio saturo (crepitii, buchi)
 *    e somma di ampiezze -> clipping/pompaggio del compressore;
 *  - una stessa corda poteva suonare decine di note sovrapposte (fisicamente impossibile);
 *  - le voci venivano tagliate di netto (click) e mai scollegate.
 *
 * Ora:
 *  - suono di corda pizzicata Karplus-Strong precalcolato UNA volta per corda (6 buffer),
 *    i tasti si ottengono variando playbackRate: ogni voce = 2 nodi soltanto;
 *  - corde monofoniche: ripizzicare una corda smorza la nota precedente con dissolvenza di 12 ms;
 *  - anti-raffica: una corda non si ripizzica prima di 35 ms; massimo 12 voci (ruba la più vecchia);
 *  - la distorsione è UNA sola, sul bus, come in un vero ampli (gli accordi intermodulano davvero),
 *    seguita da cassa simulata (filtri) e da un limiter che impedisce la saturazione digitale;
 *  - i nodi vengono scollegati a fine nota.
 */
window.RiffAudio = (function(){
  const OPEN = [82.41, 110, 146.83, 196, 246.94, 329.63]; // E A D G B e
  const MAX_VOICES = 12, RETRIGGER = .035, FADE = .012;

  function ampCurve(){
    const n = 4096, c = new Float32Array(n), k = 5, bias = .06, norm = Math.tanh(k*(1+bias)) - Math.tanh(k*bias);
    for(let i = 0; i < n; i++){
      const x = i*2/(n-1) - 1;
      c[i] = (Math.tanh(k*(x + bias)) - Math.tanh(k*bias)) / norm; // leggera asimmetria = armoniche pari "valvolari"
    }
    return c;
  }

  function ksBuffer(ctx, f){
    const sr = ctx.sampleRate, T60 = 1.5 + 130/f, dur = Math.min(3, T60*.9);
    const len = Math.floor(sr*dur), buf = ctx.createBuffer(1, len, sr), y = buf.getChannelData(0);
    const N = Math.max(2, Math.round(sr/f - .5));           // -0.5: compensa il ritardo del filtro media
    const d = Math.pow(10, -3 / (f*T60));                   // decadimento per periodo
    let lp = 0;
    for(let i = 0; i < N; i++){ lp += .55*((Math.random()*2 - 1) - lp); y[i] = lp; } // plettrata: rumore filtrato
    const pp = Math.max(1, Math.round(N*.14));              // posizione del plettro (filtro a pettine)
    for(let i = N-1; i >= pp; i--) y[i] -= y[i-pp];
    for(let i = N; i < len; i++) y[i] = d * .5 * (y[i-N] + (i-N-1 >= 0 ? y[i-N-1] : y[i-N]));
    let peak = 0; for(let i = 0; i < len; i++) peak = Math.max(peak, Math.abs(y[i]));
    const fadeN = Math.floor(sr*.05);
    for(let i = 0; i < len; i++){ y[i] = y[i]/peak*.9; if(i > len - fadeN) y[i] *= (len - i)/fadeN; }
    return buf;
  }

  function build(ctx, destination){
    const input = ctx.createGain();
    const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 75;
    const drive = ctx.createGain(); drive.gain.value = 1.6;
    const shaper = ctx.createWaveShaper(); shaper.curve = ampCurve(); shaper.oversample = "2x";
    const post = ctx.createGain(); post.gain.value = .3;
    const scoop = ctx.createBiquadFilter(); scoop.type = "peaking"; scoop.frequency.value = 750; scoop.Q.value = .8; scoop.gain.value = -4;
    const pres = ctx.createBiquadFilter(); pres.type = "peaking"; pres.frequency.value = 2300; pres.Q.value = 1; pres.gain.value = 3;
    const cab = ctx.createBiquadFilter(); cab.type = "lowpass"; cab.frequency.value = 4800; cab.Q.value = .7;
    const clean = ctx.createGain(); clean.gain.value = .45;
    const master = ctx.createGain(); master.gain.value = .8;
    const lim = ctx.createDynamicsCompressor();
    lim.threshold.value = -9; lim.knee.value = 3; lim.ratio.value = 20; lim.attack.value = .002; lim.release.value = .1;
    input.connect(hp); hp.connect(drive); drive.connect(shaper); shaper.connect(post); post.connect(scoop);
    scoop.connect(pres); pres.connect(cab); cab.connect(master); clean.connect(master);
    master.connect(lim); lim.connect(destination);

    const bufs = [], last = new Array(6).fill(-1), stats = { started:0, skipped:0, stolen:0, peakVoices:0 };
    let voices = [];

    function kill(v, t){
      if(v.dead) return; v.dead = true;
      const g = v.g.gain;
      if(g.cancelAndHoldAtTime) g.cancelAndHoldAtTime(t); else g.cancelScheduledValues(t);
      g.setTargetAtTime(0, t, FADE);
      try{ v.src.stop(t + FADE*6); }catch(e){}
    }

    function pluck(s, fret = 0, o = {}){
      const vel = Math.max(.2, Math.min(1, o.vel ?? .8)), t = ctx.currentTime + (o.when || 0);
      if(t - last[s] < RETRIGGER){ stats.skipped++; return; }
      last[s] = t;
      voices.forEach(v => { if(v.s === s) kill(v, t); });            // corda monofonica
      const alive = voices.filter(v => !v.dead);
      if(alive.length >= MAX_VOICES){ kill(alive[0], t); stats.stolen++; } // limite polifonia
      const buf = bufs[s] || (bufs[s] = ksBuffer(ctx, OPEN[s]));
      const rate = Math.pow(2, fret/12);
      const src = ctx.createBufferSource(); src.buffer = buf; src.playbackRate.value = rate;
      const g = ctx.createGain(), peak = .5 * vel;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + .002);
      if(o.mute) g.gain.setTargetAtTime(0, t + .03, .05);            // palm mute
      src.connect(g); g.connect(input);
      const v = { s, src, g, dead:false };
      src.onended = () => { v.dead = true; g.disconnect(); voices = voices.filter(x => x !== v); };
      src.start(t); src.stop(t + (o.mute ? .45 : buf.duration/rate));
      voices.push(v); stats.started++;
      stats.peakVoices = Math.max(stats.peakVoices, voices.filter(x => !x.dead).length);
    }

    /* power chord: fondamentale, quinta, ottava, pennata dall'alto in basso (7 ms tra le corde) */
    function power(root = 0, fret = 0, o = {}){
      [[root, fret], [root+1, fret+2], [root+2, fret+2]].forEach(([s, f], i) => { if(s < 6) pluck(s, f, { ...o, when:(o.when || 0) + i*.007 }); });
    }
    function chug(){ power(Math.random() < .6 ? 0 : 1, [0, 3, 5, 7][Math.random()*4 | 0], { mute:true, vel:.9 }); }

    function crash(){
      const t = ctx.currentTime, len = Math.floor(ctx.sampleRate*1.3);
      const nb = ctx.createBuffer(1, len, ctx.sampleRate), d = nb.getChannelData(0);
      for(let i = 0; i < len; i++) d[i] = (Math.random()*2 - 1) * Math.pow(1 - i/len, 3);
      const n = ctx.createBufferSource(); n.buffer = nb;
      const nhp = ctx.createBiquadFilter(); nhp.type = "highpass"; nhp.frequency.value = 900;
      const ng = ctx.createGain(); ng.gain.value = .6;
      n.connect(nhp); nhp.connect(ng); ng.connect(clean); n.start(t);
      n.onended = () => ng.disconnect();
      const o = ctx.createOscillator(), og = ctx.createGain(); o.type = "sine";
      o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(35, t + .5);
      og.gain.setValueAtTime(.0001, t); og.gain.exponentialRampToValueAtTime(.9, t + .01); og.gain.exponentialRampToValueAtTime(.0001, t + .7);
      o.connect(og); og.connect(clean); o.start(t); o.stop(t + .75); o.onended = () => og.disconnect();
      power(0, 0, { vel:1 });
    }

    return { pluck, power, chug, crash, stats, voices:() => voices.filter(v => !v.dead).length };
  }

  return { OPEN, build };
})();

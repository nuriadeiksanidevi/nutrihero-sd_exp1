import { useEffect, useRef, useState } from "react";
import "./app.css";
import "./visual-edit.css";
import axios from "axios";
import { Camera, ChevronRight, CircleHelp, Gamepad2, History, Leaf, Medal, ScanLine, Sparkles, Trophy, Upload, X, Check, RotateCcw, Calculator as CalcIcon, LogOut, Wand2, Minus, Plus, BookOpen } from "lucide-react";
import { Toaster, toast } from "sonner";

const mascot = "https://images.unsplash.com/photo-1745135705289-370c61a0f091?crop=entropy&cs=srgb&fm=jpg&q=80&w=500";
const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function Onboarding({ onDone }) {
  const [name, setName] = useState(""); const [age, setAge] = useState(9); const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Tulis namamu dulu ya");
    setBusy(true);
    try { const {data} = await axios.post(`${API}/profiles`, {name, age}); onDone(data); }
    catch { toast.error("Belum berhasil masuk. Coba lagi ya."); }
    finally { setBusy(false); }
  };
  return <main className="welcome">
    <div className="welcome-art">
      <div className="sun-shape" />
      <img src={mascot} alt="Maskot sayur ceria" data-testid="onboarding-mascot" />
      <span className="sticker sticker-yellow">Yuk, kenali!</span>
      <span className="sticker sticker-pink">Gizi itu seru ✦</span>
    </div>
    <section className="welcome-form">
      <div className="brand small"><span className="brand-mark">✦</span><span>NutriHero <b>SD</b></span></div>
      <p className="eyebrow">TEMAN DETEKTIF GIZI</p>
      <h1>Hai, calon<br/><em>pahlawan sehat!</em></h1>
      <p className="lead">Kita akan belajar membaca rahasia di balik kemasan makanan, bermain, dan jadi makin pintar memilih.</p>
      <form onSubmit={submit} data-testid="onboarding-form">
        <label htmlFor="name">Siapa namamu?</label>
        <input id="name" data-testid="onboarding-name-input" value={name} onChange={e=>setName(e.target.value)} placeholder="Tulis nama panggilanmu" autoComplete="off"/>
        <label htmlFor="age">Umurmu sekarang?</label>
        <div className="age-row">
          <input id="age" type="number" min="5" max="18" data-testid="onboarding-age-input" value={age} onChange={e=>setAge(Number(e.target.value))}/>
          <span>tahun</span>
        </div>
        <button className="primary wide" disabled={busy} data-testid="onboarding-submit-button">
          {busy ? "Menyiapkan petualangan..." : "Mulai petualangan"}<ChevronRight size={20}/>
        </button>
      </form>
      <p className="privacy"><CircleHelp size={15}/> Data ini hanya untuk menemani belajarmu</p>
    </section>
  </main>;
}

function Shell({ profile, page, setPage, onLogout, children }) {
  return <div className="app-shell">
    <aside>
      <div className="brand"><span className="brand-mark">✦</span><span>NutriHero <b>SD</b></span></div>
      <div className="profile-mini">
        <div className="avatar">{profile.name[0]}</div>
        <div><strong data-testid="profile-name">{profile.name}</strong><small data-testid="profile-age">Penjelajah • {profile.age} tahun</small></div>
      </div>
      <nav>
        <button className={page === "home" ? "active" : ""} onClick={()=>setPage("home")} data-testid="nav-home"><Leaf size={19}/> Beranda</button>
        <button className={page === "scan" ? "active" : ""} onClick={()=>setPage("scan")} data-testid="nav-scan"><ScanLine size={19}/> Scan label</button>
        <button className={page === "calc" ? "active" : ""} onClick={()=>setPage("calc")} data-testid="nav-calc"><CalcIcon size={19}/> Kalkulator porsi</button>
        <button className={page === "game" ? "active" : ""} onClick={()=>setPage("game")} data-testid="nav-game"><Gamepad2 size={19}/> Lab game</button>
        <button className={page === "history" ? "active" : ""} onClick={()=>setPage("history")} data-testid="nav-history"><History size={19}/> Perjalananku</button>
      </nav>
      <div className="sidebar-tip">
        <Sparkles size={19}/><strong>Tip hari ini</strong>
        <p>Minum air putih membantu tubuh tetap segar!</p>
      </div>
      <button className="help-button" onClick={onLogout} data-testid="logout-button"><LogOut size={18}/> Keluar (data tersimpan)</button>
    </aside>
    <div className="main-area">
      <header className="topbar">
        <span className="mobile-brand">✦ NutriHero SD</span>
        <span className="top-note">Misi hari ini: <b>Kenali 1 label makanan</b></span>
        <div className="mobile-nav">
          <button onClick={()=>setPage("home")} data-testid="mnav-home" aria-label="Beranda"><Leaf size={17}/></button>
          <button onClick={()=>setPage("scan")} data-testid="mnav-scan" aria-label="Scan"><ScanLine size={17}/></button>
          <button onClick={()=>setPage("calc")} data-testid="mnav-calc" aria-label="Kalkulator"><CalcIcon size={17}/></button>
          <button onClick={()=>setPage("game")} data-testid="mnav-game" aria-label="Game"><Gamepad2 size={17}/></button>
          <button onClick={()=>setPage("history")} data-testid="mnav-history" aria-label="Riwayat"><History size={17}/></button>
        </div>
        <div className="streak"><span>🔥</span><b>3</b> hari</div>
      </header>
      {children}
    </div>
  </div>;
}

function Dashboard({ profile, setPage }) {
  return <div className="page">
    <div className="hero-row">
      <div>
        <p className="eyebrow">SELAMAT DATANG KEMBALI, {profile.name.toUpperCase()}!</p>
        <h1>Jadi <em>detektif gizi</em>!</h1>
        <p className="lead">Ayo cari tahu apa ada pada makanan favoritmu...!!!</p>
        <button className="primary" onClick={()=>setPage("scan")} data-testid="dashboard-scan-button"><ScanLine size={19}/> Scan label sekarang</button>
      </div>
      <div className="hero-illustration">
        <div className="doodle">✦</div>
        <img src={mascot} alt="Maskot NutriHero" data-testid="dashboard-mascot"/>
      </div>
    </div>
    <div className="section-heading">
      <div><p className="eyebrow">PILIH PETUALANGANMU</p><h2>Hari ini mau belajar apa?</h2></div>
      <span className="progress-pill"><Trophy size={17}/> <b>{profile.points || 0}</b> poin terkumpul</span>
    </div>
    <div className="mission-grid">
      <button className="mission scan-card" onClick={()=>setPage("scan")} data-testid="mission-scan-card">
        <div className="mission-icon"><Camera/></div>
        <div><h3>Jadi Detektif Label</h3><p>Foto kemasan dan bongkar rahasianya</p></div>
        <ChevronRight/>
      </button>
      <button className="mission game-card" onClick={()=>setPage("game")} data-testid="mission-game-card">
        <div className="mission-icon"><Gamepad2/></div>
        <div><h3>Lab Gizi Ceria</h3><p>Uji pengetahuanmu sambil bermain</p></div>
        <ChevronRight/>
      </button>
    </div>
    <div className="tip-band">
      <div className="tip-sun">☀</div>
      <div>
        <span className="eyebrow">PESAN DARI NUTRIHERO</span>
        <p>"Tidak ada makanan yang harus ditakuti. Yang penting, kita tahu <b>berapa banyak</b> dan <b>seberapa sering</b>."</p>
      </div>
      <span className="leaf-doodle">❧</span>
    </div>
  </div>;
}

function Scanner({ profile, setPage, onResult }) {
  const fileRef = useRef();
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [camera, setCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef();
  const pick = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Pilih file gambar ya");
    setPreview(URL.createObjectURL(file));
    upload(file);
  };
  const upload = async file => {
    setBusy(true);
    const fd = new FormData();
    fd.append("file", file); fd.append("profile_id", profile.id); fd.append("profile_name", profile.name);
    try { const {data}=await axios.post(`${API}/scan`, fd); onResult(data); setPage("result"); toast.success("Label berhasil dibaca!"); }
    catch(e) { toast.error(e.response?.data?.detail || "Foto belum terbaca, coba lebih dekat ya"); }
    finally { setBusy(false); }
  };
  const openCamera = async () => {
    try {
      const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});
      setStream(s); setCamera(true);
      setTimeout(()=>{if(videoRef.current) videoRef.current.srcObject=s},50);
    } catch { toast.error("Kamera belum bisa dibuka. Kamu tetap bisa upload foto."); }
  };
  const snap = () => {
    const canvas=document.createElement("canvas");
    canvas.width=videoRef.current.videoWidth;
    canvas.height=videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current,0,0);
    canvas.toBlob(blob=>{
      stream?.getTracks().forEach(t=>t.stop());
      setCamera(false);
      pick(new File([blob],"label.jpg",{type:"image/jpeg"}));
    },"image/jpeg",.88);
  };
  return <div className="page">
    <div className="page-title">
      <div>
        <p className="eyebrow">MISI 01 • DETEKTIF LABEL</p>
        <h1>Foto, lalu kita <em>temukan jawabannya.</em></h1>
        <p className="lead">Pastikan tulisan komposisi terlihat jelas. NutriHero akan membacanya untukmu.</p>
      </div>
      <div className="scan-progress"><span className="dot active"/><span/><span/> 1 dari 3</div>
    </div>
    <div className="scanner-layout">
      <section className="scan-zone">
        <div className="scan-inner">
          {camera ? <div className="camera-view">
            <video ref={videoRef} autoPlay playsInline data-testid="camera-video"/>
            <button className="capture" onClick={snap} data-testid="camera-capture-button"><Camera/></button>
            <button className="close-camera" onClick={()=>{stream?.getTracks().forEach(t=>t.stop());setCamera(false)}} data-testid="camera-close-button"><X/></button>
          </div> : preview ? <div className="preview-wrap">
            <img src={preview} alt="Pratinjau label" data-testid="scan-preview"/>
            <div className="loading-overlay">
              {busy ? <><span className="loader"/><b>Sedang membaca label...</b><small>NutriHero sedang mencari petunjuk gizi</small></> : null}
            </div>
          </div> : <>
            <div className="scan-symbol"><ScanLine size={38}/></div>
            <h2>Letakkan foto label di sini</h2>
            <p>Foto bagian <b>komposisi</b> dan <b>informasi nilai gizi</b></p>
            <div className="scan-actions">
              <button className="primary" onClick={openCamera} data-testid="open-camera-button"><Camera size={18}/> Buka kamera</button>
              <button className="secondary" onClick={()=>fileRef.current?.click()} data-testid="upload-label-button"><Upload size={18}/> Upload foto</button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e=>pick(e.target.files?.[0])} data-testid="label-file-input"/>
            </div>
          </>}
        </div>
      </section>
      <aside className="scan-guide">
        <div className="guide-number">01</div>
        <h3>Tips foto jelas</h3>
        <ul>
          <li><Check size={16}/> Cahaya cukup, tidak silau</li>
          <li><Check size={16}/> Label tidak terlipat</li>
          <li><Check size={16}/> Jarak sekitar satu telapak tangan</li>
        </ul>
        <div className="guide-image"><img src="https://images.pexels.com/photos/10822135/pexels-photo-10822135.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500" alt="Kemasan makanan berwarna"/></div>
      </aside>
    </div>
  </div>;
}

function Result({ result, profile, setPage }) {
  const [expanded, setExpanded] = useState(null);
  const [showRaw, setShowRaw] = useState(false);
  const a=result?.analysis || {};
  const ingredients = a.ingredients || [];
  return <div className="page">
    <div className="result-head">
      <button className="back-link" onClick={()=>setPage("scan")} data-testid="result-back-button">← Scan lagi</button>
      <p className="eyebrow">HASIL PENYELIDIKAN</p>
      <h1>Ini dia rahasianya,<br/><em>{a.product_name || "produk ini"}.</em></h1>
      <p className="lead">Yuk baca pelan-pelan bersama NutriHero, {profile.name}.</p>
    </div>
    <div className="result-grid">
      <section>
        <div className="result-section-heading"><h2>Ukuran takaran</h2><span className="tag">Baca dulu</span></div>
        <div className="serving-box">
          <div><small>TAKARAN PER KALI MAKAN</small><strong data-testid="serving-size">{a.serving_size || "Belum terbaca"}</strong></div>
          <div><small>JUMLAH TAKARAN PER KEMASAN</small><strong data-testid="serving-count">{a.servings_per_package || "Belum terbaca"}</strong></div>
        </div>
        <div className="result-section-heading"><h2>Kandungan gizinya</h2><span className="tag green">Per porsi</span></div>
        <div className="nutrition-list">
          {(a.nutrition || [{name:"Data belum terbaca",value:"-",unit:"",level:"medium",kid_tip:"Coba foto ulang lebih dekat."}]).map((n,i)=>
            <div className="nutrition-row" key={i} data-testid={`nutrition-item-${i}`}>
              <span className={`level ${n.level}`}/>
              <div><b>{n.name}</b><p>{n.kid_tip}</p></div>
              <strong>{n.value} <small>{n.unit}</small></strong>
            </div>
          )}
        </div>
        <button className="secondary calc-cta" onClick={()=>setPage("calc")} data-testid="result-calc-cta">
          <CalcIcon size={17}/> Hitung dengan Kalkulator Porsi Detektif
        </button>
      </section>
      <aside className="insight-panel">
        <div className="insight-top"><Sparkles/><span>NUTRIHERO MENJELASKAN</span></div>
        <h2>{a.summary || "Mari kenali isi makananmu."}</h2>
        <div className="advice"><strong>💡 Ingat ya!</strong><p>{a.daily_advice || "Nikmati secukupnya dan tetap makan beragam makanan."}</p></div>
        {a.final_reminder && <div className="advice final"><strong>📣 Nasihat penutup</strong><p data-testid="final-reminder">{a.final_reminder}</p></div>}
      </aside>
    </div>
    <div className="ingredients-section">
      <div className="result-section-heading">
        <div><p className="eyebrow">SATU-SATU KITA KENALI</p><h2>Apa saja bahannya?</h2></div>
        <span data-testid="ingredient-count">{ingredients.length} bahan ditemukan</span>
      </div>
      {ingredients.length===0 && <p className="empty-note">Belum ada bahan yang terbaca. Coba foto bagian komposisi lebih dekat.</p>}
      <div className="ingredient-grid">
        {ingredients.map((item,i)=>
          <button className={`ingredient ${expanded===i?"open":""}`} onClick={()=>setExpanded(expanded===i?null:i)} key={i} data-testid={`ingredient-item-${i}`}>
            <div className="ingredient-icon">
              {item.category === "Pemanis" ? "🍯"
                : item.category === "Pengawet" ? "🫙"
                : item.category === "Pewarna" ? "🎨"
                : item.category === "Penguat rasa" ? "🧂"
                : item.category === "Pengemulsi" ? "🥄"
                : item.category === "Antioksidan" ? "🛡️"
                : item.category === "Vitamin" ? "💊"
                : "🌾"}
            </div>
            <div className="ingredient-copy">
              <span>{item.category || "Lainnya"}</span>
              <h3>{item.name}</h3>
              {expanded===i && <div className="ingredient-detail">
                <p><b>Gunanya:</b> {item.purpose}</p>
                <p><b>Kalau kebanyakan:</b> {item.too_much}</p>
                {item.fun_fact && <p><b>Tahukah kamu?</b> {item.fun_fact}</p>}
              </div>}
            </div>
            <ChevronRight className="ingredient-arrow"/>
          </button>
        )}
      </div>
      {a.raw_label_text && <div className="raw-label-block">
        <button className="raw-toggle" onClick={()=>setShowRaw(!showRaw)} data-testid="raw-label-toggle">
          <BookOpen size={16}/> {showRaw?"Sembunyikan":"Lihat"} tulisan label yang terbaca
        </button>
        {showRaw && <pre className="raw-label" data-testid="raw-label-text">{a.raw_label_text}</pre>}
      </div>}
      <div className="result-actions-row">
        <button className="primary reflection-cta" onClick={()=>setPage("reflection")} data-testid="reflection-cta"><Sparkles size={18}/> Lanjut ke refleksi</button>
        <button className="secondary" onClick={()=>setPage("game")} data-testid="result-quiz-cta"><Wand2 size={17}/> Buat kuis dari scan ini</button>
      </div>
    </div>
  </div>;
}

const QUESTION_BANK = [
  {level:"Mudah",emoji:"🍯",q:"Aspartam biasanya dipakai sebagai apa dalam makanan?",opts:["Pemanis pengganti gula","Pengawet daging","Pewarna kue"],answer:0,explain:"Aspartam adalah pemanis buatan yang rasanya jauh lebih manis dari gula."},
  {level:"Mudah",emoji:"🫙",q:"Natrium benzoat sering ditambahkan agar makanan…",opts:["Lebih awet dan tidak cepat rusak","Berwarna cerah","Terasa lebih manis"],answer:0,explain:"Natrium benzoat adalah pengawet yang menahan pertumbuhan jamur dan bakteri."},
  {level:"Mudah",emoji:"🎨",q:"Tartrazin (Kuning FCF) adalah contoh dari…",opts:["Pewarna makanan","Bahan pengawet","Vitamin"],answer:0,explain:"Tartrazin adalah pewarna sintetis yang membuat warna kuning terang."},
  {level:"Mudah",emoji:"🧂",q:"MSG dalam bahasa lengkapnya adalah…",opts:["Mononatrium Glutamat","Manisan Sari Gula","Minuman Sehat Gizi"],answer:0,explain:"MSG = Mononatrium Glutamat, penguat rasa gurih."},
  {level:"Mudah",emoji:"🍬",q:"Sukralosa termasuk kelompok bahan apa?",opts:["Pemanis buatan","Pengemulsi","Pewarna alami"],answer:0,explain:"Sukralosa adalah pemanis buatan berkalori sangat rendah."},
  {level:"Sedang",emoji:"🛡️",q:"BHA dan BHT ditambahkan ke makanan agar…",opts:["Lemak tidak cepat tengik","Rasa lebih manis","Warna makin merah"],answer:0,explain:"BHA/BHT adalah antioksidan yang melindungi minyak/lemak dari kerusakan."},
  {level:"Sedang",emoji:"🥄",q:"Lesitin biasanya bertugas sebagai…",opts:["Pengemulsi agar bahan tercampur rata","Pemanis","Pengawet"],answer:0,explain:"Lesitin adalah pengemulsi, membuat air dan minyak bisa bercampur."},
  {level:"Sedang",emoji:"🥤",q:"Kalau minum minuman dengan tinggi gula setiap hari, akibatnya…",opts:["Gigi berlubang & risiko diabetes","Tinggi badan naik cepat","Bisa terbang"],answer:0,explain:"Terlalu banyak gula berhubungan dengan karies gigi dan obesitas."},
  {level:"Sedang",emoji:"🍟",q:"Nasihat terbaik untuk snack tinggi natrium (garam) adalah…",opts:["Batasi & selingi buah/sayur","Habiskan tiap hari","Makan sambil jalan"],answer:0,explain:"Natrium berlebih memberatkan ginjal dan tekanan darah."},
  {level:"Sedang",emoji:"📏",q:"Kenapa penting membaca 'takaran saji' di label?",opts:["Agar tahu berapa yang benar-benar kita makan","Supaya bungkus cepat habis","Karena wajib berteriak"],answer:0,explain:"Takaran saji menunjukkan porsi yang gizinya dihitung di label."},
  {level:"Sulit",emoji:"🧪",q:"Natrium nitrit paling sering dipakai untuk mengawetkan…",opts:["Sosis & daging olahan","Air minum","Sayur segar"],answer:0,explain:"Nitrit menjaga warna & mencegah bakteri berbahaya pada daging olahan."},
  {level:"Sulit",emoji:"🔬",q:"Kalau bahan yang sama muncul di 3 makanan yang kamu makan hari ini, sebaiknya…",opts:["Kurangi salah satu","Tambah porsi semua","Abaikan saja"],answer:0,explain:"Bahan aditif punya batas harian, jadi total dari semua sumber ikut dihitung."},
  {level:"Sulit",emoji:"🍧",q:"Sakarin dan siklamat sama-sama termasuk…",opts:["Pemanis buatan","Pewarna","Antioksidan"],answer:0,explain:"Keduanya pemanis buatan yang bebas kalori."},
  {level:"Sulit",emoji:"⚗️",q:"Kenapa pengawet TBHQ dibatasi jumlahnya oleh BPOM?",opts:["Aman hanya dalam jumlah kecil","Karena mahal","Karena manis"],answer:0,explain:"Aditif punya ADI (batas aman harian) yang tidak boleh dilampaui."},
  {level:"Sulit",emoji:"🍭",q:"Kalau di label ada 'Ponceau 4R', itu artinya ada…",opts:["Pewarna merah sintetis","Pemanis alami","Serat"],answer:0,explain:"Ponceau 4R adalah pewarna merah sintetis yang izinnya diatur BPOM."}
];

function Game({ profile, setPage, lastScanId }) {
  const [level, setLevel] = useState(null);
  const [mode, setMode] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [finished, setFinished] = useState(false);
  const [loadingDyn, setLoadingDyn] = useState(false);

  const startStatic = (lv) => {
    const pool = QUESTION_BANK.filter(q=>q.level===lv);
    const shuffled = [...pool].sort(()=>Math.random()-.5).slice(0,5);
    setQuestions(shuffled); setLevel(lv); setMode("static");
    setStep(0); setScore(0); setChosen(null); setFinished(false);
  };
  const startDynamic = async () => {
    if (!lastScanId) return toast.error("Belum ada scan terbaru untuk dijadikan kuis");
    setLoadingDyn(true);
    try {
      const {data} = await axios.post(`${API}/quiz/dynamic`, {scan_id:lastScanId, profile_id:profile.id});
      if (!data.questions?.length) throw new Error();
      setQuestions(data.questions); setLevel("Dinamis"); setMode("dynamic");
      setStep(0); setScore(0); setChosen(null); setFinished(false);
      toast.success("Kuis khusus dari scan-mu sudah siap! +5 poin");
    } catch { toast.error("Belum bisa membuat kuis, coba lagi ya"); }
    finally { setLoadingDyn(false); }
  };
  const pick = (i) => {
    if(chosen!==null) return;
    setChosen(i);
    if(i===questions[step].answer) setScore(score+1);
  };
  const next = async () => {
    if (step < questions.length-1) { setStep(step+1); setChosen(null); return; }
    setFinished(true);
    try {
      const {data}=await axios.post(`${API}/quiz/score`,{profile_id:profile.id, score, total:questions.length});
      toast.success(`Kerja bagus! +${data.points_earned} poin`);
    } catch{}
  };
  const reset = () => { setLevel(null); setMode(null); setQuestions([]); setStep(0); setScore(0); setChosen(null); setFinished(false); };

  if (!level) return <div className="page game-page">
    <button className="back-link" onClick={()=>setPage("home")} data-testid="game-back-button">← Kembali ke beranda</button>
    <div className="game-hero">
      <div>
        <p className="eyebrow">LAB GIZI CERIA</p>
        <h1>Pilih misi <em>quiz-mu!</em></h1>
        <p className="lead">Semakin sering main, semakin jago mengenali bahan makanan.</p>
      </div>
      <div className="game-badge"><Trophy size={30}/><strong>{profile.points||0}</strong><span>poin total</span></div>
    </div>
    <div className="level-grid">
      {["Mudah","Sedang","Sulit"].map(lv=>
        <button key={lv} className={`level-card level-${lv.toLowerCase()}`} onClick={()=>startStatic(lv)} data-testid={`level-${lv.toLowerCase()}`}>
          <div className="level-emoji">{lv==="Mudah"?"🌱":lv==="Sedang"?"🌿":"🌳"}</div>
          <h3>Level {lv}</h3>
          <p>{lv==="Mudah"?"Kenali nama bahan-bahan":lv==="Sedang"?"Pahami fungsi setiap bahan":"Tantangan bahan kimia jarang"}</p>
          <span className="pts">+3 poin / jawaban benar</span>
        </button>
      )}
      <button className="level-card level-dynamic" onClick={startDynamic} disabled={loadingDyn||!lastScanId} data-testid="level-dynamic">
        <div className="level-emoji">{loadingDyn?"⏳":"🪄"}</div>
        <h3>Quiz Dinamis</h3>
        <p>{lastScanId?"Kuis khusus dari bahan yang baru kamu scan":"Scan label dulu untuk membuka misi ini"}</p>
        <span className="pts">+5 poin bonus</span>
      </button>
    </div>
  </div>;

  if (finished) return <div className="page game-page">
    <div className="finish-card" data-testid="quiz-finished">
      <div className="finish-emoji">🏆</div>
      <h1>Kerja bagus, {profile.name}!</h1>
      <p className="lead">Skormu <b data-testid="final-score">{score}</b> dari {questions.length}. Poin baru sudah masuk ke sakumu.</p>
      <div className="finish-actions">
        <button className="primary" onClick={()=>{ mode==="dynamic"?startDynamic():startStatic(level); }} data-testid="quiz-play-again"><RotateCcw size={17}/> Main lagi</button>
        <button className="secondary" onClick={reset} data-testid="quiz-choose-level">Pilih level lain</button>
      </div>
    </div>
  </div>;

  const q = questions[step];
  return <div className="page game-page">
    <button className="back-link" onClick={reset} data-testid="game-back-button">← Ganti level</button>
    <div className="game-hero">
      <div>
        <p className="eyebrow">LEVEL {level.toUpperCase()} • MINI GAME</p>
        <h1>Uji kemampuan<br/><em>detektifmu!</em></h1>
        <p className="lead">Jawab pertanyaan, kumpulkan bintang, dan jadilah pahlawan label.</p>
      </div>
      <div className="game-badge"><Trophy size={30}/><strong>{score}</strong><span>bintang</span></div>
    </div>
    <div className="quiz-card">
      <div className="quiz-meta">
        <span>Pertanyaan {step+1} dari {questions.length}</span>
        <div>{questions.map((_,i)=><i className={i<=step?"done":""} key={i}/>)}</div>
      </div>
      <div className="quiz-question">
        <div className="quiz-emoji">{q.emoji || "❓"}</div>
        <h2>{q.q}</h2>
      </div>
      <div className="option-list">
        {q.opts.map((o,i)=>
          <button className={`quiz-option ${chosen!==null && i===q.answer?"correct":""} ${chosen===i && i!==q.answer?"wrong":""}`} onClick={()=>pick(i)} key={o+i} data-testid={`quiz-option-${i}`}>
            <span>{String.fromCharCode(65+i)}</span>{o}{chosen!==null&&i===q.answer?<Check size={20}/>:null}
          </button>
        )}
      </div>
      {chosen!==null && q.explain && <div className="quiz-explain" data-testid="quiz-explain"><Sparkles size={15}/> {q.explain}</div>}
      {chosen!==null&&<button className="primary next-question" onClick={next} data-testid="quiz-next-button">
        {step===questions.length-1?"Lihat hasil":"Pertanyaan berikutnya"}<ChevronRight size={18}/>
      </button>}
    </div>
  </div>;
}

function Calculator({ profile, setPage }) {
  const [scans, setScans] = useState([]);
  const [pick, setPick] = useState(null);
  const [portions, setPortions] = useState(1);
  useEffect(()=>{
    axios.get(`${API}/profiles/${profile.id}/scans`).then(r=>{
      setScans(r.data||[]);
      if((r.data||[]).length) setPick(r.data[0]);
    }).catch(()=>{});
  },[profile.id]);
  const num = (v) => {
    if(v==null) return null;
    const m=String(v).match(/[\d.,]+/);
    if(!m) return null;
    return parseFloat(m[0].replace(",", "."));
  };
  const nut = pick?.analysis?.nutrition || [];
  const findN = (names) => {
    const it = nut.find(n=> names.some(k=>(n.name||"").toLowerCase().includes(k)));
    return it ? {value:num(it.value), unit:it.unit||"", level:it.level, name:it.name} : null;
  };
  const cal = findN(["energi","kalori","calor"]) || (pick?.analysis?.calories_per_serving ? {value:num(pick.analysis.calories_per_serving), unit:"kkal", name:"Energi"} : null);
  const sugar = findN(["gula","sugar"]);
  const salt = findN(["natrium","garam","sodium"]);
  const fat = findN(["lemak","fat"]);
  const totals = (m) => m && m.value!=null ? +(m.value*portions).toFixed(1) : null;
  const LIMIT = { sugar:25, salt:1500, fat:60, cal:1800 };
  const pct = (v, cap) => v==null? null : Math.min(999, Math.round(v/cap*100));
  const rows = [
    {label:"Energi", data:cal, cap:LIMIT.cal, unit:"kkal", emoji:"⚡"},
    {label:"Gula", data:sugar, cap:LIMIT.sugar, unit:"g", emoji:"🍬"},
    {label:"Lemak total", data:fat, cap:LIMIT.fat, unit:"g", emoji:"🥑"},
    {label:"Natrium", data:salt, cap:LIMIT.salt, unit:"mg", emoji:"🧂"}
  ];
  const advice = (() => {
    if (!pick) return "Pilih hasil scan dulu untuk memulai perhitungan.";
    const sugarTotal = totals(sugar);
    const saltTotal = totals(salt);
    if (sugarTotal!=null && sugarTotal > LIMIT.sugar*0.7)
      return `Ups! ${portions} porsi ${pick.analysis.product_name||"makanan ini"} sudah mencapai sekitar ${Math.round(sugarTotal/LIMIT.sugar*100)}% batas gula harianmu. Kalau setiap hari, bisa bikin gigi berlubang dan tubuh cepat lelah. Coba selingi dengan buah ya.`;
    if (saltTotal!=null && saltTotal > LIMIT.salt*0.7)
      return `Perhatian! ${portions} porsi ini mengandung ${Math.round(saltTotal/LIMIT.salt*100)}% batas natrium harian. Kalau tiap hari, ginjal bisa lelah. Imbangi dengan sayur & air putih.`;
    if (portions>=3)
      return `Wih, ${portions} porsi cukup banyak untuk anak seusiamu. Ingat: takaran saji bukan berarti sekali habis. Bagi dengan teman atau simpan untuk besok.`;
    return `Pilihan yang bijak! ${portions} porsi masih ramah untuk hari ini. Tetap makan beragam supaya energi seimbang.`;
  })();
  return <div className="page">
    <div className="page-title">
      <div>
        <p className="eyebrow">MISI 02 • KALKULATOR PORSI DETEKTIF</p>
        <h1>Hitung <em>porsimu</em> hari ini</h1>
        <p className="lead">Pilih makanan yang pernah kamu scan, atur jumlah porsi, dan lihat dampaknya.</p>
      </div>
    </div>
    <div className="calc-layout">
      <section className="calc-panel">
        <label className="calc-label">Pilih hasil scan</label>
        {scans.length===0 ?
          <div className="empty-note">
            <p>Belum ada scan. Scan label dulu ya.</p>
            <button className="secondary" onClick={()=>setPage("scan")} data-testid="calc-goto-scan">Scan sekarang</button>
          </div>
          :
          <select className="calc-select" value={pick?.id||""} onChange={e=>setPick(scans.find(s=>s.id===e.target.value))} data-testid="calc-scan-select">
            {scans.map(s=><option key={s.id} value={s.id}>{s.analysis?.product_name||"Produk"} — {new Date(s.created_at).toLocaleDateString("id-ID")}</option>)}
          </select>
        }
        {pick && <>
          <label className="calc-label">Berapa porsi yang akan kamu makan?</label>
          <div className="portion-stepper">
            <button onClick={()=>setPortions(Math.max(0.5, +(portions-0.5).toFixed(1)))} data-testid="portion-minus"><Minus size={17}/></button>
            <div><strong data-testid="portion-value">{portions}</strong><small>porsi × {pick.analysis?.serving_size||"?"}</small></div>
            <button onClick={()=>setPortions(+(portions+0.5).toFixed(1))} data-testid="portion-plus"><Plus size={17}/></button>
          </div>
          <div className="calc-rows">
            {rows.map((r,i)=>{
              const t=totals(r.data);
              const p=pct(t, r.cap);
              return <div className="calc-row" key={i} data-testid={`calc-row-${r.label.toLowerCase()}`}>
                <span className="calc-emoji">{r.emoji}</span>
                <div className="calc-info"><b>{r.label}</b><small>{r.data?.value!=null?`${r.data.value} ${r.data.unit||r.unit} per porsi`:"Data belum terbaca"}</small></div>
                <div className="calc-total">
                  <strong>{t!=null?`${t} ${r.unit}`:"—"}</strong>
                  {p!=null && <span className={`bar-mini ${p>=70?"hot":p>=40?"warm":"cool"}`}><i style={{width:`${Math.min(100,p)}%`}}/><small>{p}% batas harian</small></span>}
                </div>
              </div>;
            })}
          </div>
        </>}
      </section>
      <aside className="calc-aside">
        <div className="calc-advice" data-testid="calc-advice">
          <div className="ca-top"><Sparkles size={17}/><span>NASIHAT NUTRIHERO</span></div>
          <p>{advice}</p>
        </div>
        <div className="calc-note">
          <b>📚 Yang perlu kamu tahu</b>
          <p>Batas gula anak SD ± 25 g/hari, natrium ± 1500 mg/hari, dan energi ± 1800 kkal (Kemenkes). Angka ini kasar & bisa berbeda per anak.</p>
        </div>
      </aside>
    </div>
  </div>;
}

function Reflection({ profile, result, setPage }) {
  const [choice,setChoice]=useState("");
  const [note,setNote]=useState("");
  const save=async()=>{
    if(!choice)return toast.error("Pilih jawabanmu dulu ya");
    try {
      await axios.post(`${API}/reflections`,{profile_id:profile.id,product_name:result?.analysis?.product_name||"Makanan ini",choice,note});
      toast.success("Refleksi tersimpan! +10 poin");
      setPage("home");
    } catch{toast.error("Refleksi belum tersimpan")}
  };
  return <div className="page reflection-page">
    <div className="reflection-art">
      <div className="thought">Hmm, setelah tahu isinya...</div>
      <img src={mascot} alt="Maskot berpikir"/>
    </div>
    <div className="reflection-content">
      <p className="eyebrow">MISI 03 • REFLEKSI DIRI</p>
      <h1>Kalau setiap hari,<br/><em>kamu akan memilih apa?</em></h1>
      <p className="lead">Tidak ada jawaban salah. Dengarkan tubuh dan pikiranmu sendiri.</p>
      <div className="choice-list">
        {["Ya, dengan porsi secukupnya","Sesekali saja, tidak setiap hari","Aku ingin cari pilihan yang lebih sehat"].map(c=>
          <button className={choice===c?"selected":""} onClick={()=>setChoice(c)} key={c} data-testid={`reflection-choice-${c.slice(0,5)}`}>
            <span>{choice===c?<Check size={17}/>:""}</span>{c}
          </button>
        )}
      </div>
      <label htmlFor="reflection-note">Apa yang kamu pelajari hari ini? <small>opsional</small></label>
      <textarea id="reflection-note" value={note} onChange={e=>setNote(e.target.value)} placeholder="Tulis pemikiranmu di sini..." data-testid="reflection-note-input"/>
      <button className="primary wide" onClick={save} data-testid="reflection-submit-button">Simpan refleksiku <ChevronRight size={19}/></button>
    </div>
  </div>;
}

function HistoryPage({ profile, setPage, setResult }) {
  const [scans,setScans]=useState([]);
  useEffect(()=>{axios.get(`${API}/profiles/${profile.id}/scans`).then(r=>setScans(r.data)).catch(()=>{})},[profile.id]);
  return <div className="page">
    <p className="eyebrow">PERJALANAN BELAJARMU</p>
    <h1>Jejak <em>pahlawan sehat.</em></h1>
    <p className="lead">Setiap scan dan refleksi membuatmu makin jago memilih.</p>
    <div className="stats-row">
      <div><Medal/><strong>{profile.points||0}</strong><span>Total poin</span></div>
      <div><ScanLine/><strong>{profile.scans||scans.length}</strong><span>Label dipelajari</span></div>
      <div><Trophy/><strong>3</strong><span>Hari beruntun</span></div>
    </div>
    <h2 className="history-title">Label yang pernah kamu lihat</h2>
    {scans.length ?
      <div className="history-list">
        {scans.map(s=>
          <button onClick={()=>{setResult(s);setPage("result")}} className="history-item" key={s.id} data-testid={`history-item-${s.id}`}>
            <span className="history-icon">🔎</span>
            <span><b>{s.analysis?.product_name||"Produk makanan"}</b><small>{new Date(s.created_at).toLocaleDateString("id-ID")}</small></span>
            <ChevronRight/>
          </button>
        )}
      </div>
      :
      <div className="empty-history">
        <History size={30}/>
        <h3>Belum ada jejak</h3>
        <p>Scan label pertamamu untuk mulai mengisi perjalanan.</p>
        <button className="secondary" onClick={()=>setPage("scan")} data-testid="empty-history-scan-button">Mulai scan</button>
      </div>
    }
  </div>;
}

function App() {
  const [profile,setProfile]=useState(()=>JSON.parse(localStorage.getItem("nutri-profile")||"null"));
  const [page,setPage]=useState("home");
  const [result,setResult]=useState(null);
  const handleLogin = (p) => { localStorage.setItem("nutri-profile", JSON.stringify(p)); setProfile(p); };
  const logout = () => { localStorage.removeItem("nutri-profile"); setProfile(null); setPage("home"); setResult(null); };
  if(!profile) return <><Onboarding onDone={handleLogin}/><Toaster position="top-center"/></>;
  const content = page==="home"?<Dashboard profile={profile} setPage={setPage}/>
    : page==="scan"?<Scanner profile={profile} setPage={setPage} onResult={setResult}/>
    : page==="result"?<Result result={result} profile={profile} setPage={setPage}/>
    : page==="calc"?<Calculator profile={profile} setPage={setPage}/>
    : page==="game"?<Game profile={profile} setPage={setPage} lastScanId={result?.id}/>
    : page==="reflection"?<Reflection profile={profile} result={result} setPage={setPage}/>
    : <HistoryPage profile={profile} setPage={setPage} setResult={setResult}/>;
  return <><Shell profile={profile} page={page} setPage={setPage} onLogout={logout}>{content}</Shell><Toaster position="top-center"/></>;
}

export default App;
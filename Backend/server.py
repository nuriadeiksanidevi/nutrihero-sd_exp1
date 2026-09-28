from fastapi import FastAPI, APIRouter, UploadFile, File, Form, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Any
import uuid
from datetime import datetime, timezone
import json

# Library Resmi Google Gemini Gratis
from google import genai
from google.genai import types

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Inisialisasi Client Google Gemini
gemini_key = os.environ.get("GEMINI_API_KEY")
gemini_client = genai.Client(api_key=gemini_key) if gemini_key else None

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class ProfileCreate(BaseModel):
    name: str
    age: int

class ReflectionCreate(BaseModel):
    profile_id: str
    product_name: str = "Makanan yang dipindai"
    choice: str
    note: str = ""

@api_router.get("/")
async def root():
    return {"message": "NutriHero SD API aktif"}

@api_router.post("/profiles")
async def create_profile(profile: ProfileCreate):
    name = profile.name.strip()
    if not name or profile.age < 5 or profile.age > 18:
        raise HTTPException(status_code=400, detail="Nama dan umur belum sesuai")
    
    existing = await db.profiles.find_one({"name_key": name.lower(), "age": profile.age}, {"_id": 0, "name_key": 0, "created_at": 0})
    if existing:
        return existing
    profile_id = str(uuid.uuid4())
    result = {"id": profile_id, "name": name, "age": profile.age, "points": 0, "scans": 0}
    await db.profiles.insert_one({**result, "name_key": name.lower(), "created_at": datetime.now(timezone.utc).isoformat()})
    return result

async def analyze_label(image_bytes: bytes, mime_type: str, profile_name: str) -> dict:
    if not os.environ.get("GEMINI_API_KEY") or not gemini_client:
        raise HTTPException(status_code=503, detail="Layanan analisis belum siap. Cek GEMINI_API_KEY di .env")
    
    prompt = f'''Kamu adalah NutriHero, teman belajar gizi untuk anak SD Indonesia. Analisis foto label makanan/minuman.
Nama murid: {profile_name}. Jawab HANYA JSON valid dengan bentuk:
{{
 "product_name":"...",
 "serving_size":"...",
 "servings_per_package":"...",
 "calories_per_serving":"...",
 "raw_label_text":"...",
 "nutrition":[{"name":"Gula","value":"...","unit":"...","level":"low|medium|high","kid_tip":"..."}],
 "ingredients":[{"name":"...","category":"Pemanis|Pengawet|Pewarna|Penguat rasa|Pengemulsi|Antioksidan|Bahan utama|Vitamin|Lainnya","purpose":"...","too_much":"...","friendly":"...","fun_fact":"..."}],
 "summary":"...",
 "daily_advice":"...",
 "final_reminder":"..."
}}
Aturan penting:
1. Ketik SETIAP bahan yang terbaca di label komposisi (jangan disaring) — termasuk pemanis (aspartam, sukralosa, sakarin, siklamat, sorbitol), pengawet (natrium benzoat, kalium sorbat, natrium nitrit), pewarna (tartrazin/Kuning FCF, karmoisin, Ponceau 4R, biru berlian), penguat rasa (MSG/mononatrium glutamat, dinatrium inosinat, dinatrium guanilat), pengemulsi (lesitin, mono-digliserida), antioksidan (BHA, BHT, TBHQ), perisa sintetis, dan bahan kimia lain yang jarang diketahui.
2. Untuk tiap bahan, tulis `purpose` (kegunaan), `too_much` (akibat kalau tiap hari berlebihan) dan `fun_fact` (satu wawasan menarik untuk anak SD).
3. `raw_label_text` harus memuat SELURUH tulisan label yang berhasil dikenali, termasuk urutan komposisi apa adanya.
4. Bila ada bagian yang tidak terbaca, tulis "Tidak terbaca" — JANGAN mengarang angka.
5. Bahasa Indonesia sederhana, hangat, aman untuk anak SD. Ini edukasi, bukan diagnosis medis.'''

    try:
        response = gemini_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                prompt
            ],
            config=types.GenerateContentConfig(
                system_instruction="Kamu selalu mengutamakan keselamatan anak dan JSON valid.",
                response_mime_type="application/json"
            )
        )
        return json.loads(response.text)
    except Exception as e:
        logging.error(f"Error Gemini API: {e}")
        raise HTTPException(status_code=502, detail="Jawaban analisis belum terbaca. Silakan foto ulang dengan lebih jelas.")

@api_router.post("/scan")
async def scan_label(file: UploadFile = File(...), profile_id: str = Form(...), profile_name: str = Form(...)):
    if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(status_code=400, detail="Gunakan foto JPG, PNG, atau WEBP")
    image_bytes = await file.read()
    if len(image_bytes) > 8 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Ukuran foto maksimal 8MB")
    analysis = await analyze_label(image_bytes, file.content_type, profile_name)
    scan_id = str(uuid.uuid4())
    scan = {"id": scan_id, "profile_id": profile_id, "analysis": analysis, "created_at": datetime.now(timezone.utc).isoformat()}
    await db.scans.insert_one(scan.copy())
    await db.profiles.update_one({"id": profile_id}, {"$inc": {"scans": 1}})
    return scan

@api_router.get("/profiles/{profile_id}/scans")
async def get_scans(profile_id: str):
    scans = await db.scans.find({"profile_id": profile_id}, {"_id": 0}).sort("created_at", -1).to_list(20)
    return scans

@api_router.post("/reflections")
async def create_reflection(reflection: ReflectionCreate):
    record = reflection.model_dump()
    record["id"] = str(uuid.uuid4())
    record["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.reflections.insert_one(record.copy())
    await db.profiles.update_one({"id": reflection.profile_id}, {"$inc": {"points": 10}})
    return {"id": record["id"], "message": "Refleksi tersimpan", "points_earned": 10}

class DynamicQuizRequest(BaseModel):
    scan_id: str
    profile_id: str

class QuizScorePayload(BaseModel):
    profile_id: str
    score: int
    total: int

@api_router.post("/quiz/score")
async def save_quiz_score(payload: QuizScorePayload):
    earned = max(0, payload.score) * 3
    await db.profiles.update_one({"id": payload.profile_id}, {"$inc": {"points": earned}})
    await db.quiz_scores.insert_one({"id": str(uuid.uuid4()), "profile_id": payload.profile_id, "score": payload.score, "total": payload.total, "created_at": datetime.now(timezone.utc).isoformat()})
    return {"points_earned": earned}

@api_router.post("/quiz/dynamic")
async def build_dynamic_quiz(req: DynamicQuizRequest):
    scan = await db.scans.find_one({"id": req.scan_id}, {"_id": 0})
    if not scan:
        raise HTTPException(status_code=404, detail="Scan tidak ditemukan")
    ingredients = scan.get("analysis", {}).get("ingredients", [])
    if not ingredients:
        raise HTTPException(status_code=400, detail="Belum ada daftar bahan dari scan ini")
    
    if not os.environ.get("GEMINI_API_KEY") or not gemini_client:
        raise HTTPException(status_code=503, detail="Layanan quiz belum siap")
    
    bahan_text = "; ".join([f"{b.get('name')} ({b.get('category','Lainnya')})" for b in ingredients[:12]])
    prompt = f'''Buat 5 soal kuis pilihan ganda RAMAH ANAK SD Indonesia berdasarkan bahan-bahan berikut yang baru dipindai: {bahan_text}.
Jawab HANYA JSON valid dengan bentuk:
{{"questions":[{"q":"...","opts":["...","...","..."],"answer":0,"emoji":"🍯","explain":"penjelasan singkat kenapa jawaban itu benar"}]}}
Aturan: bahasa sederhana, satu soal fokus pada satu bahan, jawaban benar ditulis dalam field answer (index 0-2), tiga pilihan saja.'''

    try:
        response = gemini_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction="Kamu membuat kuis edukasi gizi yang aman dan JSON valid.",
                response_mime_type="application/json"
            )
        )
        data = json.loads(response.text)
        await db.profiles.update_one({"id": req.profile_id}, {"$inc": {"points": 5}})
        return data
    except Exception as e:
        logging.error(f"Error Gemini Quiz: {e}")
        raise HTTPException(status_code=502, detail="Kuis belum bisa dibuat, coba lagi ya")

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
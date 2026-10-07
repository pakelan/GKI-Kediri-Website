from dotenv import load_dotenv
load_dotenv()

import asyncio
import json
import logging
import os
import re
import time
import uuid
import xml.etree.ElementTree as ET
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import List

import bcrypt
import httpx
import jwt
from bson import ObjectId
from fastapi import APIRouter, Depends, FastAPI, File, HTTPException, Request, Response, UploadFile
from pydantic import BaseModel, Field
from starlette.middleware.cors import CORSMiddleware

from lib.db import client, db, ensure_indexes
from lib.emailer import notify_majelis
from lib.storage import get_object, init_storage, put_object

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

ROOT_DIR = Path(__file__).parent
JWT_ALGORITHM = "HS256"
ACCESS_MINUTES = 30
REFRESH_DAYS = 7


def jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "type": "access",
               "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_MINUTES)}
    return jwt.encode(payload, jwt_secret(), algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "type": "refresh",
               "exp": datetime.now(timezone.utc) + timedelta(days=REFRESH_DAYS)}
    return jwt.encode(payload, jwt_secret(), algorithm=JWT_ALGORITHM)


def set_auth_cookies(response: Response, user_id: str, email: str) -> None:
    response.set_cookie("access_token", create_access_token(user_id, email), httponly=True,
                        secure=True, samesite="lax", max_age=ACCESS_MINUTES * 60, path="/")
    response.set_cookie("refresh_token", create_refresh_token(user_id), httponly=True,
                        secure=True, samesite="lax", max_age=REFRESH_DAYS * 86400, path="/")


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        header = request.headers.get("Authorization", "")
        if header.startswith("Bearer "):
            token = header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Belum masuk")
    try:
        payload = jwt.decode(token, jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Token tidak valid")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Sesi berakhir, silakan masuk kembali")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token tidak valid")
    user = await db.users.find_one({"id": payload["sub"]})
    if not user:
        raise HTTPException(status_code=401, detail="Pengguna tidak ditemukan")
    return {"id": user["id"], "email": user["email"], "name": user.get("name", "Admin"), "role": user.get("role", "admin")}


# ---------- Models ----------
class LoginIn(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: str
    email: str
    name: str
    role: str


class PrayerIn(BaseModel):
    name: str = ""
    category: str = "Lainnya"
    request: str = Field(min_length=3, max_length=2000)
    is_anonymous: bool = False
    show_public: bool = True


class Prayer(PrayerIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str = "baru"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PrayerPublic(BaseModel):
    id: str
    name: str
    category: str
    request: str
    created_at: datetime


class StatusIn(BaseModel):
    status: str


class FeedbackIn(BaseModel):
    name: str = ""
    contact: str = ""
    category: str = "Lainnya"
    message: str = Field(min_length=3, max_length=2000)


class Feedback(FeedbackIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str = "baru"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class WartaIn(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    issue_date: str = ""
    url: str = ""
    file_path: str = ""


class Warta(WartaIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class FormIn(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = ""
    category: str = "Administrasi"
    url: str = ""
    file_path: str = ""


class FormItem(FormIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class RenunganIn(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    passage: str = ""
    body: str = Field(min_length=10)
    published_date: str = ""
    cover_path: str = ""


class Renungan(RenunganIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class SiteSettings(BaseModel):
    phone: str = ""
    address: str = ""
    email: str = ""
    instagram: str = ""
    youtube: str = ""
    office_hours: str = ""


class JadwalIn(BaseModel):
    day: str = Field(min_length=2, max_length=30)
    name: str = Field(min_length=2, max_length=120)
    time: str = ""
    place: str = ""
    note: str = ""
    tag: str = "minggu"


class Jadwal(JadwalIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class SiteContent(BaseModel):
    hero_overline: str = "Syaloom — Gereja Kristen Indonesia Kediri"
    hero_line1: str = "Bertumbuh dalam"
    hero_line2: str = "iman, berjalan"
    hero_line3: str = "bersama."
    hero_description: str = "GKI Kediri adalah rumah bagi setiap generasi — tempat kamu dikenal, dikasihi, dan bertumbuh. Datang sebagaimana adanya kamu; pulang dengan hati yang penuh."
    hero_image_path: str = ""
    about_heading: str = "Gereja yang tua usianya, muda semangatnya"
    about_story: str = "Gereja Kristen Indonesia (GKI) lahir dari semangat kesatuan gereja-gereja di Indonesia. GKI Kediri hadir di tengah kota Kediri sebagai rumah rohani bagi ratusan keluarga — dari kakek-nenek hingga generasi muda.\n\nDari ibadah raya yang khidmat hingga youth service yang penuh energi, kami percaya setiap generasi punya tempat dan peran dalam tubuh Kristus."
    about_image_path: str = ""
    visi: str = "Menjadi gereja yang bertumbuh dalam iman, mengasihi tanpa syarat, dan menjadi terang bagi kota Kediri."
    misi: str = "Menghadirkan ibadah yang hidup dan relevan bagi semua generasi.\nMembangun persekutuan yang hangat melalui komisi dan kelompok kecil.\nMelayani masyarakat lewat diakonia dan kesaksian nyata."
    worship_times: str = "Minggu Pagi | 06.00 WIB\nMinggu Siang | 08.30 WIB\nIbadah Pemuda (Jumat) | 18.30 WIB"

    announcement_enabled: bool = False
    announcement_text: str = ""
    announcement_link: str = ""


class KomisiIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    alias: str = ""
    desc: str = ""
    schedule: str = ""
    image_path: str = ""


class Komisi(KomisiIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class GalleryItem(BaseModel):
    title: str
    image_url: str
    category: str = "Umum"
    description: str = ""


# ---------- Seed ----------
async def seed_admin() -> None:
    email = os.environ["ADMIN_EMAIL"].lower().strip()
    password = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": email})
    if existing is None:
        await db.users.insert_one({
            "id": str(uuid.uuid4()), "email": email, "password_hash": hash_password(password),
            "name": "Admin GKI Kediri", "role": "admin",
            "created_at": datetime.now(timezone.utc),
        })
        logger.info("Seeded admin %s", email)
    elif not verify_password(password, existing["password_hash"]):
        await db.users.update_one({"email": email}, {"$set": {"password_hash": hash_password(password)}})


async def seed_samples() -> None:
    now = datetime.now(timezone.utc)
    if await db.warta.count_documents({}) == 0:
        await db.warta.insert_many([
            {"id": str(uuid.uuid4()), "title": "Warta Jemaat — Minggu, 12 Juli 2026",
             "issue_date": "2026-07-12", "url": "https://drive.google.com/", "created_at": now},
            {"id": str(uuid.uuid4()), "title": "Warta Jemaat — Minggu, 5 Juli 2026",
             "issue_date": "2026-07-05", "url": "https://drive.google.com/", "created_at": now},
        ])
    if await db.formulir.count_documents({}) == 0:
        await db.formulir.insert_many([
            {"id": str(uuid.uuid4()), "title": "Formulir Permohonan Baptisan",
             "description": "Formulir pendaftaran baptisan kudus & anak.", "category": "Baptisan & Sidi",
             "url": "https://drive.google.com/", "created_at": now},
            {"id": str(uuid.uuid4()), "title": "Formulir Pemberkatan Nikah",
             "description": "Permohonan pemberkatan nikah di GKI Kediri.", "category": "Pemberkatan Nikah",
             "url": "https://drive.google.com/", "created_at": now},
            {"id": str(uuid.uuid4()), "title": "Formulir Penatalayanan Jemaat",
             "description": "Permohonan penatalayanan (kunjungan, kedukaan, dll).", "category": "Administrasi",
             "url": "https://drive.google.com/", "created_at": now},
        ])


DEFAULT_SETTINGS = {
    "phone": "0852-3535-3637",
    "address": "Jalan Yos Sudarso 31, Kediri",
    "email": "mmgkikediri@gmail.com",
    "instagram": "https://www.instagram.com/gkikediri/",
    "youtube": "https://www.youtube.com/channel/UCsEHrioFb_5LnzjdphttcwA",
    "office_hours": "Selasa – Sabtu, 09.00 – 15.00 WIB",
}


async def seed_settings() -> None:
    if await db.settings.find_one({"id": "site"}) is None:
        await db.settings.insert_one({"id": "site", **DEFAULT_SETTINGS})
        logger.info("Seeded site settings")


DEFAULT_JADWAL = [
    {"day": "Minggu", "name": "Ibadah Raya 1", "time": "06.00 WIB", "place": "Gedung Utama", "note": "Ibadah pagi dengan liturgi Kidung Jemaat", "tag": "minggu"},
    {"day": "Minggu", "name": "Ibadah Raya 2", "time": "08.30 WIB", "place": "Gedung Utama", "note": "Ibadah keluarga — Sekolah Minggu tersedia", "tag": "minggu"},
    {"day": "Minggu", "name": "Sekolah Minggu", "time": "08.30 WIB", "place": "Ruang Anak", "note": "Ibadah anak penuh lagu & cerita Alkitab", "tag": "muda"},
    {"day": "Minggu", "name": "Ibadah Remaja", "time": "10.30 WIB", "place": "Ruang Youth", "note": "Kebaktian remaja yang seru dan relevan", "tag": "muda"},
    {"day": "Jumat", "name": "Ibadah Pemuda", "time": "18.30 WIB", "place": "Ruang Youth", "note": "Youth service — pujian, firman, komunitas", "tag": "muda"},
    {"day": "Rabu", "name": "Persekutuan Doa", "time": "18.00 WIB", "place": "Gedung Utama", "note": "Berdoa bagi jemaat, kota, dan bangsa", "tag": "komisi"},
    {"day": "Selasa", "name": "Persekutuan Wanita", "time": "17.00 WIB", "place": "Ruang Serbaguna", "note": "Persekutuan Komisi Wanita", "tag": "komisi"},
    {"day": "Sabtu", "name": "Persekutuan Usia Indah", "time": "16.00 WIB", "place": "Ruang Serbaguna", "note": "Fellowship oma & opa yang hangat", "tag": "komisi"},
]


async def seed_content() -> None:
    if await db.content.find_one({"id": "site"}) is None:
        await db.content.insert_one({"id": "site", **SiteContent().model_dump()})
        logger.info("Seeded site content")


async def seed_jadwal() -> None:
    if await db.jadwal.count_documents({}) == 0:
        now = datetime.now(timezone.utc)
        await db.jadwal.insert_many([{"id": str(uuid.uuid4()), **j, "created_at": now} for j in DEFAULT_JADWAL])
        logger.info("Seeded %d jadwal", len(DEFAULT_JADWAL))


DEFAULT_KOMISI = [
    {"name": "Komisi Anak", "alias": "Sekolah Minggu", "desc": "Melayani anak-anak bertumbuh mengenal Tuhan lewat lagu, permainan, dan cerita Alkitab.", "schedule": "Minggu, 08.30 WIB"},
    {"name": "Komisi Pemuda-Remaja", "alias": "Youth Service", "desc": "Komunitas anak muda yang hidup — pujian kontemporer, firman yang membumi, dan persahabatan sejati.", "schedule": "Minggu, 10.30 WIB"},
    {"name": "Komisi Dewasa", "alias": "Persekutuan Dewasa", "desc": "Wadah untuk kaum dewasa saling menguatkan dalam iman, keluarga, dan pelayanan.", "schedule": "Selasa, 17.00 WIB"},
    {"name": "Komisi Kesaksian dan Pelayanan", "alias": "Kespel", "desc": "Wadah untuk jemaat yang ingin melayani jemaat dan masyarakat", "schedule": "Sabtu, 16.00 WIB"},
    {"name": "Komisi Musik Gerejawi", "alias": "Pujian & Penyembahan", "desc": "Worship leader, singer, pemusik, dan tim multimedia yang melayani setiap ibadah.", "schedule": "Latihan sesuai jadwal ibadah"},
    {"name": "Tim Pelawatan dan Pelayanan Paliatif", "alias": "Diakonia", "desc": "Menjangkau jemaat dan masyarakat yang membutuhkan lewat aksi kasih nyata.", "schedule": "Sepanjang tahun"},
]


async def seed_komisi() -> None:
    if await db.komisi.count_documents({}) == 0:
        now = datetime.now(timezone.utc)
        await db.komisi.insert_many([{"id": str(uuid.uuid4()), "image_path": "", **k, "created_at": now} for k in DEFAULT_KOMISI])
        logger.info("Seeded %d komisi", len(DEFAULT_KOMISI))


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.index_task = asyncio.create_task(ensure_indexes())
    await seed_admin()
    await seed_samples()
    await seed_settings()
    await seed_content()
    await seed_jadwal()
    await seed_komisi()
    try:
        await asyncio.to_thread(init_storage)
        logger.info("Object storage initialized")
    except Exception:
        logger.exception("Storage init failed")
    yield
    client.close()


app = FastAPI(lifespan=lifespan)

# PASANG CORS DI ATAS SEBELUM ROUTER
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {"message": "GKI Kediri API"}


# ---------- Auth ----------
@api_router.post("/auth/login", response_model=UserOut)
async def login(body: LoginIn, request: Request, response: Response):
    email = body.email.lower().strip()
    ip = request.client.host if request.client else "unknown"
    identifier = f"{ip}:{email}"
    now = datetime.now(timezone.utc)
    attempt = await db.login_attempts.find_one({"identifier": identifier})
    if attempt and attempt.get("locked_until"):
        locked = attempt["locked_until"]
        if locked.tzinfo is None:
            locked = locked.replace(tzinfo=timezone.utc)
        if locked > now:
            raise HTTPException(status_code=429, detail="Terlalu banyak percobaan gagal. Coba lagi 15 menit kemudian.")
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        count = (attempt or {}).get("count", 0) + 1
        update: dict = {"identifier": identifier, "count": count}
        if count >= 5:
            update = {"identifier": identifier, "count": 0, "locked_until": now + timedelta(minutes=15)}
        await db.login_attempts.update_one({"identifier": identifier}, {"$set": update}, upsert=True)
        raise HTTPException(status_code=401, detail="Email atau kata sandi salah")
    await db.login_attempts.delete_one({"identifier": identifier})
    set_auth_cookies(response, user["id"], email)
    return UserOut(id=user["id"], email=email, name=user.get("name", "Admin"), role=user.get("role", "admin"))


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"ok": True}


@api_router.get("/auth/me", response_model=UserOut)
async def me(user: dict = Depends(get_current_user)):
    return UserOut(**user)


@api_router.post("/auth/refresh")
async def refresh(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="Tidak ada sesi")
    try:
        payload = jwt.decode(token, jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Token tidak valid")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Sesi tidak valid")
    user = await db.users.find_one({"id": payload["sub"]})
    if not user:
        raise HTTPException(status_code=401, detail="Pengguna tidak ditemukan")
    response.set_cookie("access_token", create_access_token(user["id"], user["email"]),
                        httponly=True, secure=True, samesite="lax", max_age=ACCESS_MINUTES * 60, path="/")
    return {"ok": True}


# ---------- Pokok Doa ----------
@api_router.post("/pokok-doa", response_model=Prayer)
async def create_prayer(body: PrayerIn):
    prayer = Prayer(**body.model_dump())
    if prayer.is_anonymous:
        prayer.name = ""
        prayer.show_public = False
    await db.pokok_doa.insert_one(prayer.model_dump())
    asyncio.create_task(notify_majelis(
        "Pokok doa", prayer.category, prayer.request,
        "Anonim" if prayer.is_anonymous else (prayer.name or "Tanpa nama"),
    ))
    return prayer


@api_router.get("/pokok-doa/public", response_model=List[PrayerPublic])
async def list_public_prayers():
    docs = await db.pokok_doa.find({"show_public": True}).sort("created_at", -1).to_list(30)
    return [PrayerPublic(**d) for d in docs]


@api_router.get("/admin/pokok-doa", response_model=List[Prayer])
async def admin_list_prayers(_: dict = Depends(get_current_user)):
    docs = await db.pokok_doa.find().sort("created_at", -1).to_list(500)
    return [Prayer(**d) for d in docs]


@api_router.patch("/admin/pokok-doa/{prayer_id}", response_model=Prayer)
async def admin_update_prayer(prayer_id: str, body: StatusIn, _: dict = Depends(get_current_user)):
    if body.status not in ("baru", "didukung", "selesai"):
        raise HTTPException(status_code=400, detail="Status tidak dikenal")
    res = await db.pokok_doa.find_one_and_update({"id": prayer_id}, {"$set": {"status": body.status}},
                                                 return_document=True)
    if not res:
        raise HTTPException(status_code=404, detail="Pokok doa tidak ditemukan")
    return Prayer(**res)


@api_router.delete("/admin/pokok-doa/{prayer_id}")
async def admin_delete_prayer(prayer_id: str, _: dict = Depends(get_current_user)):
    res = await db.pokok_doa.delete_one({"id": prayer_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Pokok doa tidak ditemukan")
    return {"ok": True}


# ---------- Kritik & Saran ----------
@api_router.post("/kritik-saran", response_model=Feedback)
async def create_feedback(body: FeedbackIn):
    item = Feedback(**body.model_dump())
    await db.kritik_saran.insert_one(item.model_dump())
    asyncio.create_task(notify_majelis(
        "Kritik & saran", item.category, item.message, item.name or "Tanpa nama",
    ))
    return item


@api_router.get("/admin/kritik-saran", response_model=List[Feedback])
async def admin_list_feedback(_: dict = Depends(get_current_user)):
    docs = await db.kritik_saran.find().sort("created_at", -1).to_list(500)
    return [Feedback(**d) for d in docs]


@api_router.delete("/admin/kritik-saran/{feedback_id}")
async def admin_delete_feedback(feedback_id: str, _: dict = Depends(get_current_user)):
    res = await db.kritik_saran.delete_one({"id": feedback_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Aspirasi tidak ditemukan")
    return {"ok": True}


# ---------- Warta Jemaat ----------
@api_router.get("/warta", response_model=List[Warta])
async def list_warta():
    docs = await db.warta.find().sort("issue_date", -1).to_list(200)
    return [Warta(**d) for d in docs]


@api_router.post("/admin/warta", response_model=Warta)
async def admin_create_warta(body: WartaIn, _: dict = Depends(get_current_user)):
    if not body.url and not body.file_path:
        raise HTTPException(status_code=400, detail="Isi link unduhan atau unggah berkas")
    item = Warta(**body.model_dump())
    await db.warta.insert_one(item.model_dump())
    return item


@api_router.delete("/admin/warta/{warta_id}")
async def admin_delete_warta(warta_id: str, _: dict = Depends(get_current_user)):
    res = await db.warta.delete_one({"id": warta_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Warta tidak ditemukan")
    return {"ok": True}


# ---------- Formulir ----------
@api_router.get("/formulir", response_model=List[FormItem])
async def list_formulir():
    docs = await db.formulir.find().sort("created_at", -1).to_list(200)
    return [FormItem(**d) for d in docs]


@api_router.post("/admin/formulir", response_model=FormItem)
async def admin_create_formulir(body: FormIn, _: dict = Depends(get_current_user)):
    if not body.url and not body.file_path:
        raise HTTPException(status_code=400, detail="Isi link unduhan atau unggah berkas")
    item = FormItem(**body.model_dump())
    await db.formulir.insert_one(item.model_dump())
    return item


@api_router.delete("/admin/formulir/{form_id}")
async def admin_delete_formulir(form_id: str, _: dict = Depends(get_current_user)):
    res = await db.formulir.delete_one({"id": form_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Formulir tidak ditemukan")
    return {"ok": True}


# ---------- Upload & Berkas ----------
ALLOWED_UPLOAD_TYPES = {"application/pdf", "image/png", "image/jpeg"}
MAX_UPLOAD_BYTES = 10 * 1024 * 1024


@api_router.post("/admin/upload")
async def admin_upload(file: UploadFile = File(...), _: dict = Depends(get_current_user)):
    content_type = file.content_type or "application/octet-stream"
    if content_type not in ALLOWED_UPLOAD_TYPES:
        raise HTTPException(status_code=400, detail="Hanya berkas PDF, PNG, atau JPG yang diperbolehkan")
    data = await file.read()
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="Ukuran berkas maksimal 10 MB")
    filename = file.filename or "file.bin"
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "bin"
    path = f"gki-kediri/uploads/{uuid.uuid4()}.{ext}"
    try:
        result = await asyncio.to_thread(put_object, path, data, content_type)
    except Exception:
        logger.exception("upload failed")
        raise HTTPException(status_code=502, detail="Gagal mengunggah berkas")
    return {"path": result["path"], "size": result["size"]}


@api_router.get("/files/{path:path}")
async def download_file(path: str):
    if not path.startswith("gki-kediri/"):
        raise HTTPException(status_code=404, detail="Berkas tidak ditemukan")
    try:
        data, content_type = await asyncio.to_thread(get_object, path)
    except Exception:
        raise HTTPException(status_code=404, detail="Berkas tidak ditemukan")
    return Response(content=data, media_type=content_type)


# ---------- Renungan ----------
@api_router.get("/renungan", response_model=List[Renungan])
async def list_renungan():
    docs = await db.renungan.find().sort("published_date", -1).to_list(200)
    return [Renungan(**d) for d in docs]


@api_router.get("/renungan/{renungan_id}", response_model=Renungan)
async def get_renungan(renungan_id: str):
    doc = await db.renungan.find_one({"id": renungan_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Renungan tidak ditemukan")
    return Renungan(**doc)


@api_router.post("/admin/renungan", response_model=Renungan)
async def admin_create_renungan(body: RenunganIn, _: dict = Depends(get_current_user)):
    item = Renungan(**body.model_dump())
    await db.renungan.insert_one(item.model_dump())
    return item


@api_router.delete("/admin/renungan/{renungan_id}")
async def admin_delete_renungan(renungan_id: str, _: dict = Depends(get_current_user)):
    res = await db.renungan.delete_one({"id": renungan_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Renungan tidak ditemukan")
    return {"ok": True}


# ---------- Pengaturan Situs ----------
@api_router.get("/settings", response_model=SiteSettings)
async def get_settings():
    doc = await db.settings.find_one({"id": "site"})
    if not doc:
        return SiteSettings()
    return SiteSettings(**{k: doc.get(k, "") for k in SiteSettings.model_fields})


@api_router.put("/admin/settings", response_model=SiteSettings)
async def update_settings(body: SiteSettings, _: dict = Depends(get_current_user)):
    await db.settings.update_one({"id": "site"}, {"$set": body.model_dump()}, upsert=True)
    return body


# ---------- Edit Konten ----------
@api_router.put("/admin/warta/{warta_id}", response_model=Warta)
async def admin_update_warta(warta_id: str, body: WartaIn, _: dict = Depends(get_current_user)):
    if not body.url and not body.file_path:
        raise HTTPException(status_code=400, detail="Isi link unduhan atau unggah berkas")
    res = await db.warta.find_one_and_update({"id": warta_id}, {"$set": body.model_dump()}, return_document=True)
    if not res:
        raise HTTPException(status_code=404, detail="Warta tidak ditemukan")
    return Warta(**res)


@api_router.put("/admin/formulir/{form_id}", response_model=FormItem)
async def admin_update_formulir(form_id: str, body: FormIn, _: dict = Depends(get_current_user)):
    if not body.url and not body.file_path:
        raise HTTPException(status_code=400, detail="Isi link unduhan atau unggah berkas")
    res = await db.formulir.find_one_and_update({"id": form_id}, {"$set": body.model_dump()}, return_document=True)
    if not res:
        raise HTTPException(status_code=404, detail="Formulir tidak ditemukan")
    return FormItem(**res)


@api_router.put("/admin/renungan/{renungan_id}", response_model=Renungan)
async def admin_update_renungan(renungan_id: str, body: RenunganIn, _: dict = Depends(get_current_user)):
    res = await db.renungan.find_one_and_update({"id": renungan_id}, {"$set": body.model_dump()}, return_document=True)
    if not res:
        raise HTTPException(status_code

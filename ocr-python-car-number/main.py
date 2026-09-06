"""HyperLPR3 车牌识别 Web 服务。"""

from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

import cv2
import hyperlpr3 as lpr3
import numpy as np
import uvicorn
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

ROOT = Path(__file__).resolve().parent
INDEX_HTML = ROOT / "index.html"
ALLOWED_SUFFIXES = {".png", ".jpg", ".jpeg", ".webp", ".bmp"}

PLATE_TYPE_NAMES = {
    0: "蓝牌",
    1: "黄牌单层",
    2: "白牌单层",
    3: "绿牌新能源",
    4: "黑牌港澳",
    5: "香港单层",
    6: "香港双层",
    7: "澳门单层",
    8: "澳门双层",
    9: "黄牌双层",
}

catcher: lpr3.LicensePlateCatcher | None = None


@asynccontextmanager
async def lifespan(_: FastAPI):
    global catcher
    catcher = lpr3.LicensePlateCatcher(detect_level=lpr3.DETECT_LEVEL_HIGH)
    yield
    catcher = None


app = FastAPI(
    title="车牌识别服务",
    description="基于 HyperLPR3 的中文车牌识别",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def decode_image(content: bytes) -> np.ndarray:
    arr = np.frombuffer(content, dtype=np.uint8)
    image = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if image is None:
        raise HTTPException(status_code=400, detail="无法解析图片，请上传有效的图片文件")
    return image


def recognize_plates(image: np.ndarray) -> list[dict[str, Any]]:
    if catcher is None:
        raise HTTPException(status_code=503, detail="识别引擎尚未就绪")

    raw_results = catcher(image)
    plates: list[dict[str, Any]] = []
    for item in raw_results:
        code, conf, plate_type, box = item
        conf_value = float(conf)
        if conf_value != conf_value:  # NaN
            continue
        plates.append(
            {
                "code": str(code),
                "confidence": round(conf_value, 4),
                "plate_type": PLATE_TYPE_NAMES.get(int(plate_type), f"未知({plate_type})"),
                "plate_type_id": int(plate_type),
                "box": [int(v) for v in box],
            }
        )
    plates.sort(key=lambda x: x["confidence"], reverse=True)
    return plates


@app.get("/")
async def index() -> FileResponse:
    if not INDEX_HTML.exists():
        raise HTTPException(status_code=404, detail="未找到前端页面 index.html")
    return FileResponse(INDEX_HTML)


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "engine": "HyperLPR3"}


@app.post("/api/recognize")
async def recognize(file: UploadFile = File(...)) -> dict[str, Any]:
    filename = file.filename or "upload.jpg"
    suffix = Path(filename).suffix.lower()
    if suffix and suffix not in ALLOWED_SUFFIXES:
        raise HTTPException(
            status_code=400,
            detail=f"仅支持图片格式: {', '.join(sorted(ALLOWED_SUFFIXES))}",
        )

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="上传文件为空")

    image = decode_image(content)
    plates = recognize_plates(image)
    return {
        "filename": filename,
        "count": len(plates),
        "plates": plates,
        "best": plates[0] if plates else None,
    }


def run() -> None:
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)


if __name__ == "__main__":
    run()

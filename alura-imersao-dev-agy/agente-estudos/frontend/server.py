import csv
import io
import os
import pathlib
import uuid
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from google.adk.runners import Runner
from google.genai import types
from pydantic import BaseModel

from app.agent import app as adk_app
from app.app_utils import services

load_dotenv()

BASE_DIR = pathlib.Path(__file__).parent.resolve()
STATIC_DIR = BASE_DIR / "static"
PLANOS_DIR = (BASE_DIR.parent / "planos").resolve()
CSV_PATH = PLANOS_DIR / "plano-de-estudos.csv"

app = FastAPI(title="Mentor de Estudos - Interface Web")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

runner = Runner(
    app=adk_app,
    session_service=services.get_session_service(),
    artifact_service=services.get_artifact_service(),
    auto_create_session=True,
)


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


def read_csv_info():
    """Lê e formata os dados do CSV se ele existir."""
    if not CSV_PATH.exists():
        return None

    try:
        with open(CSV_PATH, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            rows = list(reader)
            return {
                "count": len(rows),
                "headers": reader.fieldnames or [],
                "rows": rows,
                "modified": os.path.getmtime(CSV_PATH),
            }
    except Exception as e:
        print(f"Erro ao ler CSV: {e}")
        return None


@app.post("/api/chat")
async def chat_endpoint(payload: ChatRequest):
    """Envia a mensagem para o agente de estudos e retorna a resposta e eventos."""
    user_message = payload.message.strip()
    if not user_message:
        raise HTTPException(status_code=400, detail="Mensagem não pode ser vazia.")

    session_id = payload.session_id or str(uuid.uuid4())
    user_id = "estudante_default"

    # Garante que a sessão exista no SessionService
    session = await runner.session_service.get_session(
        app_name=adk_app.name, user_id=user_id, session_id=session_id
    )
    if session is None:
        await runner.session_service.create_session(
            app_name=adk_app.name, user_id=user_id, session_id=session_id
        )

    # Prepara a mensagem do usuário
    content = types.Content(
        role="user", parts=[types.Part.from_text(text=user_message)]
    )

    text_parts = []
    tools_called = []

    try:
        async for event in runner.run_async(
            user_id=user_id,
            session_id=session_id,
            new_message=content,
        ):
            # Coleta texto da resposta
            if event.content and event.content.parts:
                for p in event.content.parts:
                    if getattr(p, "text", None):
                        text_parts.append(p.text)

            # Coleta chamadas de ferramentas executadas
            calls = event.get_function_calls()
            if calls:
                for call in calls:
                    tools_called.append({
                        "name": call.name,
                        "args": {
                            k: (v if not isinstance(v, (dict, list)) else str(v)[:80])
                            for k, v in (call.args or {}).items()
                        },
                    })

    except Exception as e:
        import traceback

        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro ao processar mensagem: {e}")

    full_reply = "".join(text_parts)
    csv_data = read_csv_info()

    return {
        "reply": full_reply,
        "session_id": session_id,
        "tools": tools_called,
        "has_csv": CSV_PATH.exists(),
        "csv_summary": {
            "total_sessions": csv_data["count"] if csv_data else 0,
            "modified": csv_data["modified"] if csv_data else None,
        }
        if csv_data
        else None,
    }


@app.get("/api/csv-data")
def get_csv_data():
    """Retorna os dados estruturados do CSV atual."""
    data = read_csv_info()
    if not data:
        raise HTTPException(
            status_code=404, detail="Nenhum plano gerado até o momento."
        )
    return data


@app.get("/api/download-csv")
def download_csv():
    """Permite baixar o arquivo CSV diretamente para importar no Google Agenda."""
    if not CSV_PATH.exists():
        raise HTTPException(
            status_code=404, detail="Arquivo plano-de-estudos.csv ainda não foi gerado."
        )
    return FileResponse(
        path=CSV_PATH,
        filename="plano-de-estudos.csv",
        media_type="text/csv",
    )


@app.post("/api/reset")
async def reset_session():
    """Cria um novo identificador de sessão para reiniciar o diálogo."""
    new_id = str(uuid.uuid4())
    user_id = "estudante_default"
    await runner.session_service.create_session(
        app_name=adk_app.name, user_id=user_id, session_id=new_id
    )
    return {"session_id": new_id, "message": "Sessão reiniciada com sucesso."}


# Servir arquivos estáticos do frontend
app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")

if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "5000"))
    print(f"\n[OK] Mentor de Estudos Frontend rodando em: http://127.0.0.1:{port}\n")
    uvicorn.run("frontend.server:app", host="0.0.0.0", port=port, reload=False)

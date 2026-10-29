# ruff: noqa
import datetime
import os
import pathlib
from typing import Optional

from dotenv import load_dotenv
from google.adk.agents import Agent
from google.adk.agents.readonly_context import ReadonlyContext
from google.adk.apps import App
from google.adk.environment import LocalEnvironment
from google.adk.models import Gemini
from google.adk.skills import load_skill_from_dir
from google.adk.tools.environment import EnvironmentToolset
from google.adk.tools.skill_toolset import SkillToolset
from google.genai import types

load_dotenv()

# Modelo lido da variável de ambiente MODEL (padrão gemini-3.8-flash)
MODEL = os.getenv("MODEL", "gemini-3.8-flash")


class FerramentasDeArquivo(EnvironmentToolset):
    """Toolset de ambiente restrito para leitura e escrita de arquivos locais."""

    async def get_tools(self, readonly_context: Optional[ReadonlyContext] = None):
        tools = await super().get_tools(readonly_context)
        return [t for t in tools if t.name in ("ReadFile", "WriteFile")]


# Caminhos absolutos calculados a partir de agent.py
BASE_DIR = pathlib.Path(__file__).parent.resolve()
SKILL_DIR = BASE_DIR / "skills" / "plano-de-estudos"
PLANOS_DIR = (BASE_DIR.parent / "planos").resolve()
PLANOS_DIR.mkdir(parents=True, exist_ok=True)

# Carregamento da skill e das ferramentas de arquivo
skill_plano = load_skill_from_dir(SKILL_DIR)
skill_toolset = SkillToolset(skills=[skill_plano])
ferramentas_arquivo = FerramentasDeArquivo(
    environment=LocalEnvironment(working_dir=PLANOS_DIR)
)


def instruction_provider(context: ReadonlyContext) -> str:
    """Instruction provider dinâmico que injeta a data de hoje e orientações gerais."""
    hoje = datetime.date.today()
    dias_semana = {
        0: "segunda-feira",
        1: "terça-feira",
        2: "quarta-feira",
        3: "quinta-feira",
        4: "sexta-feira",
        5: "sábado",
        6: "domingo",
    }
    dia_pt = dias_semana.get(hoje.weekday(), "hoje")
    data_formatada = hoje.strftime("%d/%m/%Y")

    return (
        f"Você é um mentor especialista em organização e planejamento de estudos.\n"
        f"Hoje é {dia_pt}, data: {data_formatada}.\n\n"
        f"Você possui a skill 'plano-de-estudos' para planejar e replanejar cronogramas de estudo.\n"
        f"Siga estritamente as regras de ativação (gating rule) da skill antes de carregar seus recursos: "
        f"sem objetivo, prazo, disponibilidade e nível atual, pergunte apenas o que está faltando e NÃO carregue recursos da skill.\n"
        f"Quando todas as informações estiverem presentes, siga o fluxo de trabalho da skill e use a ferramenta WriteFile para salvar a agenda em 'plano-de-estudos.csv'.\n"
        f"Responda sempre em português do Brasil, em tom de mentor: direto, empático e encorajador."
    )


root_agent = Agent(
    name="agente_estudos",
    model=Gemini(
        model=MODEL,
        retry_options=types.HttpRetryOptions(attempts=3),
    ),
    instruction=instruction_provider,
    tools=[skill_toolset, ferramentas_arquivo],
)

app = App(
    root_agent=root_agent,
    name="app",
)

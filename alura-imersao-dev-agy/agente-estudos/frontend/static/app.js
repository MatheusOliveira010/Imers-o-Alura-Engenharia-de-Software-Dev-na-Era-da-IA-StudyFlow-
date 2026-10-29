// State
let sessionId = localStorage.getItem("mentor_session_id") || null;
let isWaiting = false;

// DOM Elements
const chatMessages = document.getElementById("chat-messages");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const btnSend = document.getElementById("btn-send");
const btnNewChat = document.getElementById("btn-new-chat");
const btnToggleCsv = document.getElementById("btn-toggle-csv");
const btnCloseSidebar = document.getElementById("btn-close-sidebar");
const csvSidebar = document.getElementById("csv-sidebar");
const csvBadgeCount = document.getElementById("csv-badge-count");
const csvStatusTag = document.getElementById("csv-status-tag");
const csvActionsPanel = document.getElementById("csv-actions-panel");
const csvEmptyState = document.getElementById("csv-empty-state");
const csvPreviewTable = document.getElementById("csv-preview-table");
const csvTableHeaders = document.getElementById("csv-table-headers");
const csvTableBody = document.getElementById("csv-table-body");
const welcomeCard = document.getElementById("welcome-card");

// Configure Marked.js
if (typeof marked !== "undefined") {
  marked.setOptions({
    gfm: true,
    breaks: true,
  });
}

// Auto-resize input
userInput.addEventListener("input", () => {
  userInput.style.height = "auto";
  userInput.style.height = Math.min(userInput.scrollHeight, 160) + "px";
});

// Enter to submit (Shift+Enter for newline)
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    chatForm.dispatchEvent(new Event("submit"));
  }
});

// Quick prompt clicks
document.querySelectorAll(".quick-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const text = btn.getAttribute("data-text");
    userInput.value = text;
    userInput.style.height = "auto";
    chatForm.dispatchEvent(new Event("submit"));
  });
});

// Sidebar Toggle
btnToggleCsv.addEventListener("click", () => {
  csvSidebar.classList.toggle("collapsed");
  checkCsvData();
});

btnCloseSidebar.addEventListener("click", () => {
  csvSidebar.classList.add("collapsed");
});

// Reset Chat
btnNewChat.addEventListener("click", async () => {
  if (confirm("Deseja iniciar uma nova conversa com o mentor?")) {
    try {
      const res = await fetch("/api/reset", { method: "POST" });
      const data = await res.json();
      sessionId = data.session_id;
      localStorage.setItem("mentor_session_id", sessionId);

      // Clear messages and keep welcome card
      chatMessages.innerHTML = "";
      if (welcomeCard) {
        chatMessages.appendChild(welcomeCard);
      }
      userInput.value = "";
      checkCsvData();
    } catch (err) {
      console.error("Erro ao resetar conversa:", err);
    }
  }
});

// Form Submission
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = userInput.value.trim();
  if (!text || isWaiting) return;

  // Hide welcome card if present
  if (welcomeCard && welcomeCard.parentNode) {
    welcomeCard.style.display = "none";
  }

  // Render User Message
  appendUserMessage(text);
  userInput.value = "";
  userInput.style.height = "auto";
  userInput.disabled = true;
  btnSend.disabled = true;
  isWaiting = true;

  // Render typing indicator
  const typingRow = showTypingIndicator();

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, session_id: sessionId }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Erro do servidor (${res.status})`);
    }

    const data = await res.json();
    sessionId = data.session_id;
    localStorage.setItem("mentor_session_id", sessionId);

    // Remove typing indicator
    typingRow.remove();

    // Render Assistant Message with tools badges
    appendAssistantMessage(data.reply, data.tools);

    // Update CSV panel if generated
    if (data.has_csv) {
      checkCsvData();
    }
  } catch (error) {
    typingRow.remove();
    appendAssistantMessage(`❌ **Erro:** ${error.message}\n\nVerifique se o servidor está ativo e com a API Key configurada.`);
  } finally {
    userInput.disabled = false;
    btnSend.disabled = false;
    isWaiting = false;
    userInput.focus();
  }
});

function appendUserMessage(text) {
  const row = document.createElement("div");
  row.className = "message-row user";
  row.innerHTML = `
    <div class="bubble">${escapeHtml(text)}</div>
    <div class="avatar user">👤</div>
  `;
  chatMessages.appendChild(row);
  scrollToBottom();
}

function appendAssistantMessage(text, tools = []) {
  const row = document.createElement("div");
  row.className = "message-row assistant";

  let toolsHtml = "";
  if (tools && tools.length > 0) {
    toolsHtml = '<div class="tools-container">';
    tools.forEach((t) => {
      let icon = "⚙️";
      if (t.name.includes("WriteFile")) icon = "💾 Salvo:";
      else if (t.name.includes("ReadFile")) icon = "📖 Lido:";
      else if (t.name.includes("skill")) icon = "🧩 Skill:";
      
      const paramStr = t.args?.path || t.args?.skill_name || t.args?.resource_path || "";
      toolsHtml += `<span class="tool-pill">${icon} ${t.name} ${paramStr ? `(${paramStr})` : ""}</span>`;
    });
    toolsHtml += "</div>";
  }

  const parsedMarkdown = typeof marked !== "undefined" ? marked.parse(text) : escapeHtml(text);

  row.innerHTML = `
    <div class="avatar assistant">🎓</div>
    <div class="bubble">
      ${toolsHtml}
      <div class="content">${parsedMarkdown}</div>
    </div>
  `;
  chatMessages.appendChild(row);
  scrollToBottom();
}

function showTypingIndicator() {
  const row = document.createElement("div");
  row.className = "message-row assistant typing-row";
  row.innerHTML = `
    <div class="avatar assistant">🎓</div>
    <div class="bubble">
      <div class="typing-indicator">
        <span>Mentor pensando e estruturando...</span>
        <div class="typing-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
  `;
  chatMessages.appendChild(row);
  scrollToBottom();
  return row;
}

function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Check CSV Data and update sidebar
async function checkCsvData() {
  try {
    const res = await fetch("/api/csv-data");
    if (!res.ok) {
      csvBadgeCount.textContent = "0";
      csvStatusTag.textContent = "Nenhum CSV gerado";
      csvStatusTag.className = "tag tag-empty";
      csvActionsPanel.classList.add("hidden");
      csvEmptyState.classList.remove("hidden");
      csvPreviewTable.classList.add("hidden");
      return;
    }

    const data = await res.json();
    const count = data.count || 0;
    csvBadgeCount.textContent = count;
    csvStatusTag.textContent = `✅ ${count} sessões ativas`;
    csvStatusTag.className = "tag tag-active";

    csvActionsPanel.classList.remove("hidden");
    csvEmptyState.classList.add("hidden");
    csvPreviewTable.classList.remove("hidden");

    // Populate table
    renderCsvTable(data.headers, data.rows);
  } catch (err) {
    console.error("Erro ao verificar dados de CSV:", err);
  }
}

function renderCsvTable(headers, rows) {
  csvTableHeaders.innerHTML = "";
  csvTableBody.innerHTML = "";

  if (!headers || headers.length === 0) return;

  // Important headers to prioritize for display
  const displayHeaders = headers.slice(0, 4);

  displayHeaders.forEach((h) => {
    const th = document.createElement("th");
    th.textContent = h;
    csvTableHeaders.appendChild(th);
  });

  rows.forEach((row) => {
    const tr = document.createElement("tr");
    displayHeaders.forEach((h) => {
      const td = document.createElement("td");
      td.textContent = row[h] || "";
      tr.appendChild(td);
    });
    csvTableBody.appendChild(tr);
  });
}

// Initial load check
checkCsvData();

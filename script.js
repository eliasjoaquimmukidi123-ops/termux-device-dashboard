const REFRESH_MS = 5000;

function setBarLevel(el, percentage, invert = false) {
  // invert = true significa "quanto mais alto, pior" (usado no storage)
  el.style.width = `${percentage}%`;
  el.classList.remove("low", "medium", "high");
  const bad = invert ? percentage > 85 : percentage < 20;
  const warn = invert ? percentage > 65 : percentage < 50;
  if (bad) el.classList.add(invert ? "high" : "low");
  else if (warn) el.classList.add("medium");
}

function renderBattery(data) {
  const fill = document.getElementById("battery-fill");
  const pct = document.getElementById("battery-percentage");
  const details = document.getElementById("battery-details");

  if (!data || data.error) {
    pct.textContent = "N/D";
    details.innerHTML = `<li class="error-text">${data?.error || "Sem dados"}</li>`;
    return;
  }

  const percentage = data.percentage ?? 0;
  setBarLevel(fill, percentage, false);
  pct.textContent = `${percentage}%`;
  details.innerHTML = `
    <li><span>Estado</span><span>${data.status || "-"}</span></li>
    <li><span>Ligado à corrente</span><span>${data.plugged || "-"}</span></li>
    <li><span>Temperatura</span><span>${data.temperature ?? "-"}°C</span></li>
    <li><span>Saúde</span><span>${data.health || "-"}</span></li>
  `;
}

function renderNetwork(data) {
  const ssid = document.getElementById("network-ssid");
  const details = document.getElementById("network-details");

  if (!data || data.error) {
    ssid.textContent = "Sem Wi-Fi";
    details.innerHTML = `<li class="error-text">${data?.error || "Sem dados"}</li>`;
    return;
  }

  ssid.textContent = data.ssid ? data.ssid.replace(/"/g, "") : "Desconhecido";
  details.innerHTML = `
    <li><span>Força do sinal</span><span>${data.rssi ?? "-"} dBm</span></li>
    <li><span>Velocidade</span><span>${data.link_speed_mbps ?? "-"} Mbps</span></li>
    <li><span>IP</span><span>${data.ip ?? "-"}</span></li>
  `;
}

function renderStorage(data) {
  const fill = document.getElementById("storage-fill");
  const pct = document.getElementById("storage-percentage");
  const details = document.getElementById("storage-details");

  if (!data || data.error) {
    pct.textContent = "N/D";
    details.innerHTML = `<li class="error-text">${data?.error || "Sem dados"}</li>`;
    return;
  }

  const usePercentStr = data["Use%"] || data["Capacity"] || "0%";
  const usePercent = parseInt(usePercentStr.replace("%", ""), 10) || 0;
  setBarLevel(fill, usePercent, true);
  pct.textContent = `${usePercent}%`;
  details.innerHTML = `
    <li><span>Usado</span><span>${data.Used ?? "-"}</span></li>
    <li><span>Disponível</span><span>${data.Avail ?? "-"}</span></li>
    <li><span>Total</span><span>${data.Size ?? "-"}</span></li>
  `;
}

async function refreshDashboard() {
  try {
    const res = await fetch("/api/all");
    const data = await res.json();

    renderBattery(data.battery);
    renderNetwork(data.network);
    renderStorage(data.storage);

    document.getElementById("last-update").textContent =
      "Última actualização: " + new Date().toLocaleTimeString("pt-PT");
  } catch (err) {
    document.getElementById("last-update").textContent =
      "Erro ao ligar ao servidor";
  }
}

refreshDashboard();
setInterval(refreshDashboard, REFRESH_MS);

"""
Dashboard de Monitorização Pessoal - Termux
--------------------------------------------
Backend Flask que recolhe métricas do telemóvel usando o pacote termux-api
e expõe-nas como endpoints JSON, consumidos pelo frontend em templates/index.html.

Requisitos (dentro do Termux):
    pkg install python
    pkg install termux-api          # ferramentas de linha de comando
    (instalar também a app "Termux:API" na Play Store / F-Droid)
    pip install flask

Execução:
    python app.py

Depois abrir no browser do telemóvel: http://127.0.0.1:8080
"""

import json
import subprocess
import shutil

from flask import Flask, jsonify, render_template

app = Flask(__name__)


def run_termux_cmd(cmd):
    """Executa um comando termux-api e devolve o output já convertido de JSON.
    Se o comando não existir ou falhar, devolve None em vez de rebentar o servidor."""
    if shutil.which(cmd.split()[0]) is None:
        return None
    try:
        result = subprocess.run(
            cmd.split(), capture_output=True, text=True, timeout=8
        )
        if result.returncode != 0 or not result.stdout.strip():
            return None
        return json.loads(result.stdout)
    except (subprocess.TimeoutExpired, json.JSONDecodeError, FileNotFoundError):
        return None


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/battery")
def battery():
    """Usa termux-battery-status. Ex.: {"health": "GOOD", "percentage": 87,
    "plugged": "UNPLUGGED", "status": "DISCHARGING", "temperature": 30.1}"""
    data = _battery_data()
    if data is None:
        return jsonify({"error": "termux-battery-status indisponível"}), 503
    return jsonify(data)


@app.route("/api/network")
def network():
    """Usa termux-wifi-connectioninfo. Devolve SSID, força do sinal, etc."""
    data = _network_data()
    if data is None:
        return jsonify({"error": "termux-wifi-connectioninfo indisponível"}), 503
    return jsonify(data)


@app.route("/api/storage")
def storage():
    """Usa 'df' para obter uso de armazenamento do armazenamento interno."""
    data = _storage_data()
    if data is None:
        return jsonify({"error": "não foi possível ler o armazenamento"}), 503
    return jsonify(data)


def _battery_data():
    return run_termux_cmd("termux-battery-status")


def _network_data():
    return run_termux_cmd("termux-wifi-connectioninfo")


def _storage_data():
    try:
        result = subprocess.run(
            ["df", "-h", "/data"], capture_output=True, text=True, timeout=5
        )
        lines = result.stdout.strip().split("\n")
        if len(lines) < 2:
            return None
        headers = lines[0].split()
        values = lines[1].split()
        return dict(zip(headers, values))
    except Exception:
        return None


@app.route("/api/all")
def all_metrics():
    """Endpoint único que agrega tudo — usado pelo frontend para simplificar o polling."""
    return jsonify({
        "battery": _battery_data(),
        "network": _network_data(),
        "storage": _storage_data(),
    })


if __name__ == "__main__":
    # host 0.0.0.0 permite aceder a partir de outro dispositivo na mesma rede,
    # se preferir manter só no telemóvel, muda para 127.0.0.1
    app.run(host="0.0.0.0", port=8080, debug=False)

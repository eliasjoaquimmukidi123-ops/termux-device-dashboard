# 📱 Dashboard de Monitorização Pessoal (Termux)

Dashboard web local que mostra bateria, rede Wi-Fi e armazenamento do próprio
telemóvel, usando o Termux e o pacote **termux-api**. Ideal como projecto de
portfólio: junta backend (Flask), integração com APIs de sistema Android, e
frontend responsivo.

## Como funciona

- O backend Flask corre localmente no telemóvel (`127.0.0.1:8080` ou na rede
  local se preferires aceder de outro dispositivo).
- Usa os comandos `termux-battery-status` e `termux-wifi-connectioninfo`
  (do pacote `termux-api`) mais o comando Unix `df` para recolher dados.
- O frontend (HTML/CSS/JS puro, sem frameworks) faz *polling* a cada 5
  segundos ao endpoint `/api/all` e actualiza a interface.

## Instalação no Termux

```bash
# Actualizar pacotes
pkg update && pkg upgrade

# Instalar Python e as ferramentas termux-api
pkg install python termux-api -y

# Dar permissão de armazenamento (necessário para o comando df funcionar bem)
termux-setup-storage
```

Também precisas de instalar a app **Termux:API** (separada do Termux) via
F-Droid ou Play Store — é ela que fornece os dados reais do sistema aos
comandos `termux-*`.

```bash
# Dentro da pasta do projecto
pip install -r requirements.txt

# Correr o servidor
python app.py
```

Depois abre o browser do telemóvel em:

```
http://127.0.0.1:8080
```

## Testar noutro dispositivo da mesma rede

Se quiseres ver o dashboard no computador (útil para gravar vídeo/screenshots
para o portfólio), descobre o IP local do telemóvel com `ifconfig` ou
`ip addr`, e acede a `http://<IP-DO-TELEMOVEL>:8080` a partir de outro
dispositivo na mesma rede Wi-Fi.

## Estrutura do projecto

```
dashboard-termux/
├── app.py                 # Backend Flask
├── requirements.txt
├── templates/
│   └── index.html         # Página principal
└── static/
    ├── style.css
    └── script.js
```

## Possíveis melhorias (boas para mostrar evolução no portfólio)

- Guardar histórico de bateria/armazenamento numa base de dados SQLite e
  mostrar um gráfico de evolução ao longo do tempo.
- Adicionar autenticação simples (password) antes de expor na rede local.
- Adicionar notificações quando a bateria estiver baixa, usando
  `termux-notification`.
- Adicionar métricas de sensores (luz, acelerómetro) com
  `termux-sensor -s "light,accelerometer"`.

## Nota importante

Este projecto lê **apenas dados do próprio telemóvel onde está a correr**,
não acede a outros dispositivos nem à rede de terceiros. É pensado como
ferramenta pessoal de monitorização, não como ferramenta de vigilância.

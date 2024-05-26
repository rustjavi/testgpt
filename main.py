import os

from src import bot
from dotenv import load_dotenv
from g4f.cookies import set_cookies


if __name__ == '__main__':
    set_cookies(".bing.com", {
    "_U": str(os.getenv("BING_COOKIE"))
    })
    set_cookies(".google.com", {
    "__Secure-1PSID": str(os.getenv("GOOGLE_PSID"))
    })
    bot.run_discord_bot()

from flask import Flask, send_file

app = Flask(__name__)
port = 3000

@app.route('/')
def home():
    image_path = os.path.join(os.path.dirname(__file__), 'index.html')
    return send_file(image_path)

if __name__ == '__main__':
    app.run(port=port)
    print(f"🔗 Listening to GlaceYT : http://localhost:{port}")

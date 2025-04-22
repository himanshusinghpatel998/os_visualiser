# server.py
from flask import Flask, request, jsonify
from os_simulator import execute_command, parse_dsl_line
import io
import sys

app = Flask(__name__)

@app.route('/run', methods=['POST'])
def run_command():
    data = request.get_json()
    command_line = data.get("command", "")

    # Capture output
    old_stdout = sys.stdout
    sys.stdout = mystdout = io.StringIO()

    try:
        cmd, args = parse_dsl_line(command_line)
        if cmd:
            execute_command(cmd, args)
        output = mystdout.getvalue()
    except Exception as e:
        output = f"❌ Error: {e}"

    sys.stdout = old_stdout
    return output

if __name__ == '__main__':
    app.run(debug=True)

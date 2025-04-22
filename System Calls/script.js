function sendCommand() {
  const commandInput = document.getElementById("commandInput");
  const outputBox = document.getElementById("outputBox");
  const command = commandInput.value.trim();

  if (!command) return;

  fetch('/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command })
  })
  .then(res => res.text())
  .then(output => {
    outputBox.textContent += "> " + command + "\n" + output + "\n\n";
    commandInput.value = "";
  })
  .catch(err => {
    outputBox.textContent += "❌ Error: " + err + "\n";
  });
}

function clearOutput() {
  document.getElementById("outputBox").textContent = "";
}

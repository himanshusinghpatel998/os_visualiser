// Tab switching
function switchTab(tabId) {
    document.querySelectorAll(".section").forEach(sec => sec.classList.add("hidden"));
    document.getElementById(tabId).classList.remove("hidden");
  
    // Show main nav only after leaving homepage
    const mainTabs = document.getElementById("mainTabs");
    if (tabId !== "home") {
      mainTabs.classList.remove("hidden");
    } else {
      mainTabs.classList.add("hidden");
    }
  }
  
  // Existing simulator code below...
  
  
  // Simulator logic for contiguous allocation
  const totalBlocks = 100;
  const blocks = new Array(totalBlocks).fill(null);
  const blockContainer = document.getElementById("blockContainer");
  
  function renderBlocks() {
    blockContainer.innerHTML = "";
    blocks.forEach((block, i) => {
      const div = document.createElement("div");
      div.classList.add("block");
      if (block !== null) {
        div.classList.add("allocated");
        div.textContent = block;
      }
      blockContainer.appendChild(div);
    });
  }
  
  function allocateContiguous(filename, size) {
    let start = -1, count = 0;
    for (let i = 0; i < totalBlocks; i++) {
      if (blocks[i] === null) {
        if (start === -1) start = i;
        count++;
        if (count === size) {
          for (let j = start; j < start + size; j++) {
            blocks[j] = filename;
          }
          renderBlocks();
          return;
        }
      } else {
        start = -1;
        count = 0;
      }
    }
    alert("Not enough contiguous space!");
  }
  
  document.getElementById("fileForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("filename").value;
    const size = parseInt(document.getElementById("filesize").value);
    if (!name || size < 1) return alert("Enter valid filename and size.");
    allocateContiguous(name, size);
  });
  
  renderBlocks();
  
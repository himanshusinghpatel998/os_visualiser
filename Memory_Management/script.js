let currentTechnique = '';
let inputHTML = '';

function generateInputs() {
  currentTechnique = document.getElementById('techniqueSelect').value;
  let container = document.getElementById('inputContainer');
  inputHTML = '';

  if (currentTechnique === 'mft') {
    inputHTML = `
      <label>Total Memory (Bytes): <input type="number" id="totalMemory" /></label><br/>
      <label>Block Size (Bytes): <input type="number" id="blockSize" /></label><br/>
      <label>Number of Processes: <input type="number" id="numProcesses" /></label><br/>
      <div id="processInputs"></div>
      <button onclick="addMFTInputs()">Add Process Inputs</button>
    `;
  } else if (currentTechnique === 'mvt') {
    inputHTML = `
      <label>Total Memory (Bytes): <input type="number" id="totalMemory" /></label><br/>
      <label>Process Sizes (comma separated): <input type="text" id="mvtProcesses" /></label>
    `;
  } else if (currentTechnique === 'paging') {
    inputHTML = `
      <label>Total Memory (Bytes): <input type="number" id="totalMemory" /></label><br/>
      <label>Frame Size (Bytes): <input type="number" id="frameSize" /></label><br/>
      <label>Process Sizes (comma separated): <input type="text" id="pagingProcesses" /></label>
    `;
  }

  container.innerHTML = inputHTML;
  document.getElementById("outputContainer").innerText = '';
}

function addMFTInputs() {
  const num = parseInt(document.getElementById('numProcesses').value);
  let inputs = '';
  for (let i = 1; i <= num; i++) {
    inputs += `<label>Memory required for process ${i} (Bytes): <input type="number" class="mftProcess" /></label><br/>`;
  }
  document.getElementById('processInputs').innerHTML = inputs;
}

function runSimulation() {
  let output = '';
  const total = parseInt(document.getElementById('totalMemory').value);

  if (currentTechnique === 'mft') {
    const blockSize = parseInt(document.getElementById('blockSize').value);
    const processInputs = document.querySelectorAll('.mftProcess');
    const blockCount = Math.floor(total / blockSize);
    let usedBlocks = 0, internalFrag = 0;
    output += `No. of Blocks available in memory -- ${blockCount}\n`;
    processInputs.forEach((el, i) => {
      const mem = parseInt(el.value);
      if (usedBlocks < blockCount && mem <= blockSize) {
        internalFrag += (blockSize - mem);
        output += `Process ${i + 1} of size ${mem} allocated to Block ${usedBlocks + 1} | Internal Fragmentation: ${blockSize - mem}\n`;
        usedBlocks++;
      } else if (mem > blockSize) {
        output += `Process ${i + 1} of size ${mem} is too large and skipped\n`;
      } else {
        output += `No available block for Process ${i + 1}\n`;
      }
    });
    output += `Total Internal Fragmentation: ${internalFrag}`;
  }

  else if (currentTechnique === 'mvt') {
    const processSizes = document.getElementById('mvtProcesses').value.split(',').map(n => parseInt(n.trim()));
    let freeMem = total, externalFrag = 0;
    processSizes.forEach((mem, i) => {
      if (mem <= freeMem) {
        output += `Memory is allocated for Process ${i + 1} (${mem} Bytes)\n`;
        freeMem -= mem;
      } else {
        output += `Cannot allocate memory for Process ${i + 1} (${mem} Bytes)\n`;
      }
    });
    output += `External Fragmentation: ${freeMem}`;
  }

  else if (currentTechnique === 'paging') {
    const frameSize = parseInt(document.getElementById('frameSize').value);
    const processSizes = document.getElementById('pagingProcesses').value.split(',').map(n => parseInt(n.trim()));
    const frameCount = Math.floor(total / frameSize);
    let framesUsed = 0, internalFrag = 0;

    output += `Total Frames: ${frameCount} (Each ${frameSize} Bytes)\n`;

    for (let i = 0; i < processSizes.length && framesUsed < frameCount; i++) {
      const pages = Math.ceil(processSizes[i] / frameSize);
      for (let p = 0; p < pages && framesUsed < frameCount; p++) {
        const lastPage = (p === pages - 1);
        const frag = lastPage ? (frameSize - (processSizes[i] % frameSize || frameSize)) : 0;
        output += `Process ${i + 1}, Page ${p + 1} → Frame ${framesUsed + 1}`;
        if (frag > 0) output += ` (Internal Fragmentation: ${frag})`;
        output += `\n`;
        internalFrag += frag;
        framesUsed++;
      }
    }
    output += `Total Internal Fragmentation: ${internalFrag}`;
  }

  document.getElementById('outputContainer').innerText = output;
}

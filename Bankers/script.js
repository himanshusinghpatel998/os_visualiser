// Global variables
let bankerProcesses = 5;
let bankerResources = 3;
let detectionProcesses = 5;
let detectionResources = 3;

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initBankerMatrices();
    initDetectionMatrices();
});

// Tab functionality
function openTab(tabName) {
    const tabContents = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('active');
    }
    
    const tabButtons = document.getElementsByClassName('tab-btn');
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove('active');
    }
    
    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');
}

// Banker's Algorithm Functions
function initBankerMatrices() {
    bankerProcesses = parseInt(document.getElementById('banker-processes').value);
    bankerResources = parseInt(document.getElementById('banker-resources').value);
    
    // Initialize Available Resources
    const availableContainer = document.getElementById('banker-available-container');
    availableContainer.innerHTML = '';
    for (let i = 0; i < bankerResources; i++) {
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.value = '0';
        input.id = `banker-available-${i}`;
        input.className = 'vector-item';
        availableContainer.appendChild(input);
    }
    
    // Initialize Allocation Matrix
    const allocationHeader = document.getElementById('banker-allocation-header');
    const allocationBody = document.getElementById('banker-allocation-body');
    allocationHeader.innerHTML = '';
    allocationBody.innerHTML = '';
    
    // Create header row
    let headerRow = document.createElement('tr');
    let emptyHeader = document.createElement('th');
    headerRow.appendChild(emptyHeader);
    
    for (let j = 0; j < bankerResources; j++) {
        let th = document.createElement('th');
        th.textContent = `R${j}`;
        headerRow.appendChild(th);
    }
    allocationHeader.appendChild(headerRow);
    
    // Create data rows
    for (let i = 0; i < bankerProcesses; i++) {
        let row = document.createElement('tr');
        let processHeader = document.createElement('th');
        processHeader.textContent = `P${i}`;
        row.appendChild(processHeader);
        
        for (let j = 0; j < bankerResources; j++) {
            let cell = document.createElement('td');
            let input = document.createElement('input');
            input.type = 'number';
            input.min = '0';
            input.value = '0';
            input.id = `banker-allocation-${i}-${j}`;
            cell.appendChild(input);
            row.appendChild(cell);
        }
        allocationBody.appendChild(row);
    }
    
    // Initialize Max Matrix
    const maxHeader = document.getElementById('banker-max-header');
    const maxBody = document.getElementById('banker-max-body');
    maxHeader.innerHTML = '';
    maxBody.innerHTML = '';
    
    // Create header row
    headerRow = document.createElement('tr');
    emptyHeader = document.createElement('th');
    headerRow.appendChild(emptyHeader);
    
    for (let j = 0; j < bankerResources; j++) {
        let th = document.createElement('th');
        th.textContent = `R${j}`;
        headerRow.appendChild(th);
    }
    maxHeader.appendChild(headerRow);
    
    // Create data rows
    for (let i = 0; i < bankerProcesses; i++) {
        let row = document.createElement('tr');
        let processHeader = document.createElement('th');
        processHeader.textContent = `P${i}`;
        row.appendChild(processHeader);
        
        for (let j = 0; j < bankerResources; j++) {
            let cell = document.createElement('td');
            let input = document.createElement('input');
            input.type = 'number';
            input.min = '0';
            input.value = '0';
            input.id = `banker-max-${i}-${j}`;
            cell.appendChild(input);
            row.appendChild(cell);
        }
        maxBody.appendChild(row);
    }
    
    // Initialize Need Matrix (empty)
    const needHeader = document.getElementById('banker-need-header');
    const needBody = document.getElementById('banker-need-body');
    needHeader.innerHTML = '';
    needBody.innerHTML = '';
    
    // Create header row
    headerRow = document.createElement('tr');
    emptyHeader = document.createElement('th');
    headerRow.appendChild(emptyHeader);
    
    for (let j = 0; j < bankerResources; j++) {
        let th = document.createElement('th');
        th.textContent = `R${j}`;
        headerRow.appendChild(th);
    }
    needHeader.appendChild(headerRow);
    
    // Create empty data rows
    for (let i = 0; i < bankerProcesses; i++) {
        let row = document.createElement('tr');
        let processHeader = document.createElement('th');
        processHeader.textContent = `P${i}`;
        row.appendChild(processHeader);
        
        for (let j = 0; j < bankerResources; j++) {
            let cell = document.createElement('td');
            cell.textContent = '-';
            cell.id = `banker-need-${i}-${j}`;
            row.appendChild(cell);
        }
        needBody.appendChild(row);
    }
    
    // Initialize Request Process Selector
    const requestProcessSelect = document.getElementById('request-process');
    requestProcessSelect.innerHTML = '';
    for (let i = 0; i < bankerProcesses; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Process ${i}`;
        requestProcessSelect.appendChild(option);
    }
    
    // Initialize Request Vector
    const requestVectorContainer = document.getElementById('request-vector-container');
    requestVectorContainer.innerHTML = '';
    for (let i = 0; i < bankerResources; i++) {
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.value = '0';
        input.id = `request-vector-${i}`;
        input.className = 'vector-item';
        requestVectorContainer.appendChild(input);
    }
    
    // Clear results
    document.getElementById('banker-result').innerHTML = '';
    document.getElementById('request-result').innerHTML = '';
}

function loadBankerSample() {
    // Set sample data for Banker's algorithm
    bankerProcesses = 5;
    bankerResources = 3;
    
    document.getElementById('banker-processes').value = bankerProcesses;
    document.getElementById('banker-resources').value = bankerResources;
    
    initBankerMatrices();
    
    // Sample Available Resources
    document.getElementById('banker-available-0').value = '3';
    document.getElementById('banker-available-1').value = '3';
    document.getElementById('banker-available-2').value = '2';
    
    // Sample Allocation Matrix
    const allocationValues = [
        [0, 1, 0],
        [2, 0, 0],
        [3, 0, 2],
        [2, 1, 1],
        [0, 0, 2]
    ];
    
    for (let i = 0; i < bankerProcesses; i++) {
        for (let j = 0; j < bankerResources; j++) {
            document.getElementById(`banker-allocation-${i}-${j}`).value = allocationValues[i][j];
        }
    }
    
    // Sample Max Matrix
    const maxValues = [
        [7, 5, 3],
        [3, 2, 2],
        [9, 0, 2],
        [2, 2, 2],
        [4, 3, 3]
    ];
    
    for (let i = 0; i < bankerProcesses; i++) {
        for (let j = 0; j < bankerResources; j++) {
            document.getElementById(`banker-max-${i}-${j}`).value = maxValues[i][j];
        }
    }
    
    // Sample Request
    document.getElementById('request-process').selectedIndex = 1; // Process 1
    document.getElementById('request-vector-0').value = '1';
    document.getElementById('request-vector-1').value = '0';
    document.getElementById('request-vector-2').value = '2';
}

function clearBankerData() {
    document.getElementById('banker-processes').value = '5';
    document.getElementById('banker-resources').value = '3';
    initBankerMatrices();
}

function calculateNeedMatrix() {
    for (let i = 0; i < bankerProcesses; i++) {
        for (let j = 0; j < bankerResources; j++) {
            const allocation = parseInt(document.getElementById(`banker-allocation-${i}-${j}`).value) || 0;
            const max = parseInt(document.getElementById(`banker-max-${i}-${j}`).value) || 0;
            const need = max - allocation;
            
            document.getElementById(`banker-need-${i}-${j}`).textContent = need;
        }
    }
}

function checkSafety() {
    // Get Available Resources
    const available = [];
    for (let j = 0; j < bankerResources; j++) {
        available.push(parseInt(document.getElementById(`banker-available-${j}`).value) || 0);
    }
    
    // Get Allocation Matrix
    const allocation = [];
    for (let i = 0; i < bankerProcesses; i++) {
        const row = [];
        for (let j = 0; j < bankerResources; j++) {
            row.push(parseInt(document.getElementById(`banker-allocation-${i}-${j}`).value) || 0);
        }
        allocation.push(row);
    }
    
    // Get Max Matrix
    const max = [];
    for (let i = 0; i < bankerProcesses; i++) {
        const row = [];
        for (let j = 0; j < bankerResources; j++) {
            row.push(parseInt(document.getElementById(`banker-max-${i}-${j}`).value) || 0);
        }
        max.push(row);
    }
    
    // Calculate Need Matrix
    const need = [];
    for (let i = 0; i < bankerProcesses; i++) {
        const row = [];
        for (let j = 0; j < bankerResources; j++) {
            row.push(max[i][j] - allocation[i][j]);
        }
        need.push(row);
    }
    
    // Safety Algorithm
    const work = [...available];
    const finish = new Array(bankerProcesses).fill(false);
    const safeSequence = [];
    let count = 0;
    
    while (count < bankerProcesses) {
        let found = false;
        
        for (let i = 0; i < bankerProcesses; i++) {
            if (!finish[i]) {
                let canAllocate = true;
                
                for (let j = 0; j < bankerResources; j++) {
                    if (need[i][j] > work[j]) {
                        canAllocate = false;
                        break;
                    }
                }
                
                if (canAllocate) {
                    for (let j = 0; j < bankerResources; j++) {
                        work[j] += allocation[i][j];
                    }
                    
                    safeSequence.push(i);
                    finish[i] = true;
                    found = true;
                    count++;
                }
            }
        }
        
        if (!found) {
            break; // No safe sequence found
        }
    }
    
    // Display results
    const resultContainer = document.getElementById('banker-result');
    
    if (count === bankerProcesses) {
        resultContainer.innerHTML = `<p class="success">System is in a safe state.</p>
                                   <p>Safe sequence: ${safeSequence.map(p => `P${p}`).join(' → ')}</p>`;
    } else {
        resultContainer.innerHTML = `<p class="danger">System is not in a safe state.</p>`;
    }
}

function processRequest() {
    const processId = parseInt(document.getElementById('request-process').value);
    
    // Get Request Vector
    const request = [];
    for (let j = 0; j < bankerResources; j++) {
        request.push(parseInt(document.getElementById(`request-vector-${j}`).value) || 0);
    }
    
    // Get Available Resources
    const available = [];
    for (let j = 0; j < bankerResources; j++) {
        available.push(parseInt(document.getElementById(`banker-available-${j}`).value) || 0);
    }
    
    // Get Allocation Matrix
    const allocation = [];
    for (let i = 0; i < bankerProcesses; i++) {
        const row = [];
        for (let j = 0; j < bankerResources; j++) {
            row.push(parseInt(document.getElementById(`banker-allocation-${i}-${j}`).value) || 0);
        }
        allocation.push(row);
    }
    
    // Get Max Matrix
    const max = [];
    for (let i = 0; i < bankerProcesses; i++) {
        const row = [];
        for (let j = 0; j < bankerResources; j++) {
            row.push(parseInt(document.getElementById(`banker-max-${i}-${j}`).value) || 0);
        }
        max.push(row);
    }
    
    // Calculate Need Matrix
    const need = [];
    for (let i = 0; i < bankerProcesses; i++) {
        const row = [];
        for (let j = 0; j < bankerResources; j++) {
            row.push(max[i][j] - allocation[i][j]);
        }
        need.push(row);
    }
    
    // Check if request is valid
    for (let j = 0; j < bankerResources; j++) {
        if (request[j] > need[processId][j]) {
            document.getElementById('request-result').innerHTML = 
                `<p class="danger">Error: Process has exceeded its maximum claim.</p>`;
            return;
        }
    }
    
    for (let j = 0; j < bankerResources; j++) {
        if (request[j] > available[j]) {
            document.getElementById('request-result').innerHTML = 
                `<p class="warning">Process must wait: Resources not available.</p>`;
            return;
        }
    }
    
    // Pretend to allocate resources
    const newAvailable = [...available];
    const newAllocation = allocation.map(row => [...row]);
    const newNeed = need.map(row => [...row]);
    
    for (let j = 0; j < bankerResources; j++) {
        newAvailable[j] -= request[j];
        newAllocation[processId][j] += request[j];
        newNeed[processId][j] -= request[j];
    }
    
    // Check if the new state is safe
    const work = [...newAvailable];
    const finish = new Array(bankerProcesses).fill(false);
    const safeSequence = [];
    let count = 0;
    
    while (count < bankerProcesses) {
        let found = false;
        
        for (let i = 0; i < bankerProcesses; i++) {
            if (!finish[i]) {
                let canAllocate = true;
                
                for (let j = 0; j < bankerResources; j++) {
                    if (newNeed[i][j] > work[j]) {
                        canAllocate = false;
                        break;
                    }
                }
                
                if (canAllocate) {
                    for (let j = 0; j < bankerResources; j++) {
                        work[j] += newAllocation[i][j];
                    }
                    
                    safeSequence.push(i);
                    finish[i] = true;
                    found = true;
                    count++;
                }
            }
        }
        
        if (!found) {
            break; // No safe sequence found
        }
    }
    
    // Display results
    const resultContainer = document.getElementById('request-result');
    
    if (count === bankerProcesses) {
        resultContainer.innerHTML = `
            <p class="success">Request can be granted.</p>
            <p>New safe sequence: ${safeSequence.map(p => `P${p}`).join(' → ')}</p>
            <p>New available resources: [${newAvailable.join(', ')}]</p>
        `;
    } else {
        resultContainer.innerHTML = `
            <p class="danger">Request cannot be granted - would lead to unsafe state.</p>
            <p>System would remain in current state.</p>
        `;
    }
}

// Deadlock Detection Functions
function initDetectionMatrices() {
    detectionProcesses = parseInt(document.getElementById('detection-processes').value);
    detectionResources = parseInt(document.getElementById('detection-resources').value);
    
    // Initialize Available Resources
    const availableContainer = document.getElementById('detection-available-container');
    availableContainer.innerHTML = '';
    for (let i = 0; i < detectionResources; i++) {
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.value = '0';
        input.id = `detection-available-${i}`;
        input.className = 'vector-item';
        availableContainer.appendChild(input);
    }
    
    // Initialize Allocation Matrix
    const allocationHeader = document.getElementById('detection-allocation-header');
    const allocationBody = document.getElementById('detection-allocation-body');
    allocationHeader.innerHTML = '';
    allocationBody.innerHTML = '';
    
    // Create header row
    let headerRow = document.createElement('tr');
    let emptyHeader = document.createElement('th');
    headerRow.appendChild(emptyHeader);
    
    for (let j = 0; j < detectionResources; j++) {
        let th = document.createElement('th');
        th.textContent = `R${j}`;
        headerRow.appendChild(th);
    }
    allocationHeader.appendChild(headerRow);
    
    // Create data rows
    for (let i = 0; i < detectionProcesses; i++) {
        let row = document.createElement('tr');
        let processHeader = document.createElement('th');
        processHeader.textContent = `P${i}`;
        row.appendChild(processHeader);
        
        for (let j = 0; j < detectionResources; j++) {
            let cell = document.createElement('td');
            let input = document.createElement('input');
            input.type = 'number';
            input.min = '0';
            input.value = '0';
            input.id = `detection-allocation-${i}-${j}`;
            cell.appendChild(input);
            row.appendChild(cell);
        }
        allocationBody.appendChild(row);
    }
    
    // Initialize Request Matrix
    const requestHeader = document.getElementById('detection-request-header');
    const requestBody = document.getElementById('detection-request-body');
    requestHeader.innerHTML = '';
    requestBody.innerHTML = '';
    
    // Create header row
    headerRow = document.createElement('tr');
    emptyHeader = document.createElement('th');
    headerRow.appendChild(emptyHeader);
    
    for (let j = 0; j < detectionResources; j++) {
        let th = document.createElement('th');
        th.textContent = `R${j}`;
        headerRow.appendChild(th);
    }
    requestHeader.appendChild(headerRow);
    
    // Create data rows
    for (let i = 0; i < detectionProcesses; i++) {
        let row = document.createElement('tr');
        let processHeader = document.createElement('th');
        processHeader.textContent = `P${i}`;
        row.appendChild(processHeader);
        
        for (let j = 0; j < detectionResources; j++) {
            let cell = document.createElement('td');
            let input = document.createElement('input');
            input.type = 'number';
            input.min = '0';
            input.value = '0';
            input.id = `detection-request-${i}-${j}`;
            cell.appendChild(input);
            row.appendChild(cell);
        }
        requestBody.appendChild(row);
    }
    
    // Clear results
    document.getElementById('detection-result').innerHTML = '';
}

function loadDetectionSample() {
    // Set sample data for Deadlock Detection
    detectionProcesses = 5;
    detectionResources = 3;
    
    document.getElementById('detection-processes').value = detectionProcesses;
    document.getElementById('detection-resources').value = detectionResources;
    
    initDetectionMatrices();
    
    // Sample Available Resources
    document.getElementById('detection-available-0').value = '0';
    document.getElementById('detection-available-1').value = '0';
    document.getElementById('detection-available-2').value = '0';
    
    // Sample Allocation Matrix
    const allocationValues = [
        [0, 1, 0],
        [2, 0, 0],
        [3, 0, 3],
        [2, 1, 1],
        [0, 0, 2]
    ];
    
    for (let i = 0; i < detectionProcesses; i++) {
        for (let j = 0; j < detectionResources; j++) {
            document.getElementById(`detection-allocation-${i}-${j}`).value = allocationValues[i][j];
        }
    }
    
    // Sample Request Matrix
    const requestValues = [
        [0, 0, 0],
        [2, 0, 2],
        [0, 0, 0],
        [1, 0, 0],
        [0, 0, 2]
    ];
    
    for (let i = 0; i < detectionProcesses; i++) {
        for (let j = 0; j < detectionResources; j++) {
            document.getElementById(`detection-request-${i}-${j}`).value = requestValues[i][j];
        }
    }
}

function clearDetectionData() {
    document.getElementById('detection-processes').value = '5';
    document.getElementById('detection-resources').value = '3';
    initDetectionMatrices();
}

function detectDeadlock() {
    // Get Available Resources
    const available = [];
    for (let j = 0; j < detectionResources; j++) {
        available.push(parseInt(document.getElementById(`detection-available-${j}`).value) || 0);
    }
    
    // Get Allocation Matrix
    const allocation = [];
    for (let i = 0; i < detectionProcesses; i++) {
        const row = [];
        for (let j = 0; j < detectionResources; j++) {
            row.push(parseInt(document.getElementById(`detection-allocation-${i}-${j}`).value) || 0);
        }
        allocation.push(row);
    }
    
    // Get Request Matrix
    const request = [];
    for (let i = 0; i < detectionProcesses; i++) {
        const row = [];
        for (let j = 0; j < detectionResources; j++) {
            row.push(parseInt(document.getElementById(`detection-request-${i}-${j}`).value) || 0);
        }
        request.push(row);
    }
    
    // Deadlock Detection Algorithm
    const work = [...available];
    const finish = new Array(detectionProcesses).fill(false);
    
    // Initialize finish array
    for (let i = 0; i < detectionProcesses; i++) {
        let allZero = true;
        for (let j = 0; j < detectionResources; j++) {
            if (allocation[i][j] !== 0) {
                allZero = false;
                break;
            }
        }
        finish[i] = allZero;
    }
    
    let found;
    do {
        found = false;
        
        for (let i = 0; i < detectionProcesses; i++) {
            if (!finish[i]) {
                let canExecute = true;
                
                for (let j = 0; j < detectionResources; j++) {
                    if (request[i][j] > work[j]) {
                        canExecute = false;
                        break;
                    }
                }
                
                if (canExecute) {
                    for (let j = 0; j < detectionResources; j++) {
                        work[j] += allocation[i][j];
                    }
                    
                    finish[i] = true;
                    found = true;
                }
            }
        }
    } while (found);
    
    // Check for deadlock
    const deadlockedProcesses = [];
    for (let i = 0; i < detectionProcesses; i++) {
        if (!finish[i]) {
            deadlockedProcesses.push(i);
        }
    }
    
    // Display results
    const resultContainer = document.getElementById('detection-result');
    
    if (deadlockedProcesses.length === 0) {
        resultContainer.innerHTML = `<p class="success">No deadlock detected.</p>`;
    } else {
        resultContainer.innerHTML = `
            <p class="danger">Deadlock detected!</p>
            <p>Deadlocked processes: ${deadlockedProcesses.map(p => `P${p}`).join(', ')}</p>
        `;
    }
}
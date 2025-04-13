document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const algorithmSelect = document.getElementById('algorithm');
    const timeQuantumGroup = document.getElementById('timeQuantumGroup');
    const processInputs = document.getElementById('processInputs');
    const addProcessBtn = document.getElementById('addProcess');
    const simulateBtn = document.getElementById('simulate');
    const resetBtn = document.getElementById('reset');
    const resultsDiv = document.getElementById('results');
    const ganttChart = document.getElementById('ganttChart');
    const ganttContainer = document.getElementById('ganttContainer');
    const statsDiv = document.getElementById('stats');
    const processTable = document.getElementById('processTable');
    const chartContainer = document.getElementById('chartContainer');
    const infoTabs = document.querySelectorAll('.info-tab');
    const infoContents = document.querySelectorAll('.info-content');
    const tooltip = document.getElementById('tooltip');
    const algorithmDetails = document.getElementById('algorithmDetails');

    // Create floating particles
    createParticles();

    // Algorithm information
    const algorithmInfo = {
        fcfs: {
            description: "First Come First Serve (FCFS) is the simplest CPU scheduling algorithm where the process that arrives first is executed first. Processes are executed in the order of their arrival time.",
            formula: "1. Completion Time (CT): Time at which process completes execution\n2. Turnaround Time (TAT) = CT - Arrival Time\n3. Waiting Time (WT) = TAT - Burst Time\n4. Response Time (RT) = WT (for FCFS)",
            advantages: [
                "Simple to understand and implement",
                "No starvation as every process gets chance to execute",
                "Fair in the sense of first come first serve"
            ],
            disadvantages: [
                "Poor performance as average waiting time is high",
                "Not suitable for time-sharing systems",
                "Convoy effect may occur (short process behind long process)"
            ],
            comparison: {
                description: "FCFS is the simplest algorithm but often performs poorly compared to other algorithms in terms of average waiting time.",
                metrics: {
                    "Average Waiting Time": "High",
                    "Average Turnaround Time": "High",
                    "Average Response Time": "High",
                    "Throughput": "Low",
                    "Fairness": "High",
                    "Starvation": "None"
                }
            },
            details: {
                title: "First Come First Serve (FCFS)",
                description: "FCFS is the simplest CPU scheduling algorithm that schedules processes in the order they arrive in the ready queue.",
                steps: [
                    "Processes are executed in order of arrival (first come, first served)",
                    "No preemption - once a process starts, it runs to completion",
                    "Implemented using a simple FIFO queue",
                    "The scheduler selects the process at the front of the queue"
                ],
                example: "If processes arrive in order P1, P2, P3, they will execute in that exact order regardless of burst times.",
                characteristics: [
                    "Simple to implement with minimal overhead",
                    "No starvation - every process gets to execute",
                    "Poor performance for short processes behind long ones (convoy effect)",
                    "Average waiting time is often quite high"
                ]
            }
        },
        sjf: {
            description: "Shortest Job First (SJF) is a non-preemptive scheduling algorithm where the process with the smallest burst time is selected for execution next. If two processes have the same burst time, FCFS is used to break the tie.",
            formula: "1. Completion Time (CT): Time at which process completes execution\n2. Turnaround Time (TAT) = CT - Arrival Time\n3. Waiting Time (WT) = TAT - Burst Time\n4. Response Time (RT) = WT (for non-preemptive SJF)",
            advantages: [
                "Minimizes the average waiting time for given set of processes",
                "Optimal for minimizing average waiting time",
                "Better than FCFS in terms of average waiting time"
            ],
            disadvantages: [
                "May lead to starvation for longer processes",
                "Burst time of processes can't be known in advance",
                "Not suitable for interactive systems"
            ],
            comparison: {
                description: "SJF provides better average waiting times than FCFS but requires knowledge of burst times and can starve longer processes.",
                metrics: {
                    "Average Waiting Time": "Low",
                    "Average Turnaround Time": "Low",
                    "Average Response Time": "Medium",
                    "Throughput": "Medium",
                    "Fairness": "Low",
                    "Starvation": "Possible"
                }
            },
            details: {
                title: "Shortest Job First (SJF)",
                description: "SJF selects the process with the smallest burst time from the ready queue. This minimizes average waiting time.",
                steps: [
                    "Scheduler looks at all available processes in ready queue",
                    "Process with shortest burst time is selected next",
                    "If two processes have same burst time, FCFS is used as tie-breaker",
                    "Non-preemptive - runs selected process to completion"
                ],
                example: "Given P1(6ms), P2(8ms), P3(7ms), P4(3ms), the order would be P4, P1, P3, P2.",
                characteristics: [
                    "Optimal for minimizing average waiting time",
                    "Requires knowledge of burst times in advance",
                    "Can lead to starvation of longer processes",
                    "Not practical for interactive systems"
                ]
            }
        },
        srtf: {
            description: "Shortest Remaining Time First (SRTF) is the preemptive version of SJF where the currently executing process is preempted if a new process arrives with a shorter burst time than the remaining time of the current process.",
            formula: "1. Completion Time (CT): Time at which process completes execution\n2. Turnaround Time (TAT) = CT - Arrival Time\n3. Waiting Time (WT) = TAT - Burst Time\n4. Response Time (RT) = Time when process first gets CPU - Arrival Time",
            advantages: [
                "Better than SJF in terms of average waiting time",
                "More responsive for short processes",
                "Minimizes average waiting time for given set of processes"
            ],
            disadvantages: [
                "More complex to implement than SJF",
                "Can lead to starvation for longer processes",
                "Context switching overhead"
            ],
            comparison: {
                description: "SRTF provides the best average waiting times among non-priority algorithms but has higher overhead due to preemption.",
                metrics: {
                    "Average Waiting Time": "Very Low",
                    "Average Turnaround Time": "Very Low",
                    "Average Response Time": "Low",
                    "Throughput": "High",
                    "Fairness": "Low",
                    "Starvation": "Possible"
                }
            },
            details: {
                title: "Shortest Remaining Time First (SRTF)",
                description: "SRTF is the preemptive version of SJF where the scheduler always chooses the process with the shortest remaining burst time.",
                steps: [
                    "When a new process arrives, compare its burst time with remaining time of current process",
                    "If new process has shorter burst time, preempt current process",
                    "Context switch occurs to run the new shorter process",
                    "Processes may be interrupted multiple times"
                ],
                example: "P1(6ms) starts at 0, P2(3ms) arrives at 2. P1 is preempted at 2, P2 runs to 5, then P1 resumes.",
                characteristics: [
                    "Better average waiting time than SJF",
                    "Higher overhead due to frequent context switches",
                    "More complex implementation than SJF",
                    "Can starve longer processes"
                ]
            }
        },
        rr: {
            description: "Round Robin (RR) is a preemptive scheduling algorithm where each process is assigned a fixed time slot (time quantum) in cyclic order. If a process doesn't complete within its time quantum, it's preempted and moved to the end of the ready queue.",
            formula: "1. Completion Time (CT): Time at which process completes execution\n2. Turnaround Time (TAT) = CT - Arrival Time\n3. Waiting Time (WT) = TAT - Burst Time\n4. Response Time (RT) = Time when process first gets CPU - Arrival Time",
            advantages: [
                "Fair allocation of CPU across all processes",
                "No starvation as each process gets regular CPU time",
                "Good for time-sharing systems"
            ],
            disadvantages: [
                "Performance depends heavily on time quantum size",
                "High context switching overhead if quantum is too small",
                "Average waiting time is often longer than SJF"
            ],
            comparison: {
                description: "RR provides good response times and fairness but may have higher waiting times compared to SJF/SRTF. Performance depends on time quantum size.",
                metrics: {
                    "Average Waiting Time": "Medium",
                    "Average Turnaround Time": "Medium",
                    "Average Response Time": "Low",
                    "Throughput": "Medium",
                    "Fairness": "High",
                    "Starvation": "None"
                }
            },
            details: {
                title: "Round Robin (RR)",
                description: "RR assigns a fixed time unit per process (time quantum) and cycles through all processes in the ready queue.",
                steps: [
                    "Each process gets a small unit of CPU time (time quantum)",
                    "After time expires, process is preempted and added to end of ready queue",
                    "Scheduler selects next process in queue",
                    "If process completes before quantum, it releases CPU voluntarily"
                ],
                example: "With quantum=4 and processes P1(6), P2(3), P3(1): P1 runs 4ms, P2 runs 3ms, P3 runs 1ms, then P1 runs remaining 2ms.",
                characteristics: [
                    "Fair allocation of CPU time to all processes",
                    "Performance depends heavily on quantum size",
                    "No starvation - all processes get regular CPU time",
                    "Good for time-sharing systems"
                ]
            }
        },
        priority: {
            description: "Priority Scheduling is a non-preemptive algorithm where each process is assigned a priority, and the process with the highest priority is executed next. If two processes have the same priority, FCFS is used to break the tie.",
            formula: "1. Completion Time (CT): Time at which process completes execution\n2. Turnaround Time (TAT) = CT - Arrival Time\n3. Waiting Time (WT) = TAT - Burst Time\n4. Response Time (RT) = WT (for non-preemptive version)",
            advantages: [
                "Important processes can be prioritized",
                "Simple to understand and implement",
                "Flexible based on priority assignments"
            ],
            disadvantages: [
                "Can lead to starvation for low priority processes",
                "Priority inversion problem can occur",
                "Priorities may need to be adjusted dynamically"
            ],
            comparison: {
                description: "Priority scheduling is useful when processes have different importance levels but can starve low-priority processes.",
                metrics: {
                    "Average Waiting Time": "Depends on priorities",
                    "Average Turnaround Time": "Depends on priorities",
                    "Average Response Time": "Depends on priorities",
                    "Throughput": "Depends on priorities",
                    "Fairness": "Low",
                    "Starvation": "Possible"
                }
            },
            details: {
                title: "Priority Scheduling (Non-Preemptive)",
                description: "Each process is assigned a priority, and the scheduler selects the process with the highest priority (smallest number).",
                steps: [
                    "Processes are assigned priority numbers (typically lower number = higher priority)",
                    "Scheduler selects process with highest priority",
                    "If priorities are equal, FCFS is used as tie-breaker",
                    "Non-preemptive version runs selected process to completion"
                ],
                example: "P1(pri=3), P2(pri=1), P3(pri=2) would run in order P2, P3, P1 regardless of arrival times.",
                characteristics: [
                    "Important processes can be prioritized",
                    "Can lead to starvation of low-priority processes",
                    "Priority inversion problem can occur",
                    "Static priorities may need dynamic adjustment"
                ]
            }
        },
        priority_p: {
            description: "Preemptive Priority Scheduling is similar to Priority Scheduling but allows the currently running process to be preempted if a higher priority process arrives in the ready queue.",
            formula: "1. Completion Time (CT): Time at which process completes execution\n2. Turnaround Time (TAT) = CT - Arrival Time\n3. Waiting Time (WT) = TAT - Burst Time\n4. Response Time (RT) = Time when process first gets CPU - Arrival Time",
            advantages: [
                "More responsive to high priority processes",
                "Important processes get CPU immediately",
                "Better for real-time systems"
            ],
            disadvantages: [
                "More complex implementation",
                "Higher context switching overhead",
                "Severe starvation for low priority processes"
            ],
            comparison: {
                description: "Preemptive priority provides better responsiveness for high-priority processes but with more overhead and potential for starvation.",
                metrics: {
                    "Average Waiting Time": "Depends on priorities",
                    "Average Turnaround Time": "Depends on priorities",
                    "Average Response Time": "Depends on priorities",
                    "Throughput": "Depends on priorities",
                    "Fairness": "Very Low",
                    "Starvation": "Very Possible"
                }
            },
            details: {
                title: "Priority Scheduling (Preemptive)",
                description: "Preemptive version of priority scheduling where a running process can be preempted if a higher priority process arrives.",
                steps: [
                    "Newly arrived process is compared with currently running process",
                    "If new process has higher priority, current process is preempted",
                    "Preempted process returns to ready queue",
                    "Scheduler always runs highest priority available process"
                ],
                example: "P1(pri=3) starts running, P2(pri=1) arrives. P1 is immediately preempted to run P2.",
                characteristics: [
                    "More responsive to high-priority processes",
                    "Higher overhead than non-preemptive version",
                    "Severe starvation possible for low-priority processes",
                    "Good for real-time systems"
                ]
            }
        }
    };

    // Color palette for processes
    const colorPalette = [
        '#4361ee', '#3a0ca3', '#4cc9f0', '#4895ef', '#560bad',
        '#7209b7', '#b5179e', '#f72585', '#480ca8', '#3f37c9',
        '#4cc9f0', '#4895ef', '#4361ee', '#3f37c9', '#3a0ca3',
        '#480ca8', '#560bad', '#7209b7', '#b5179e', '#f72585'
    ];

    // Chart references
    let waitingTimeChart = null;
    let turnaroundTimeChart = null;
    let responseTimeChart = null;
    let comparisonChart = null;

    // Event listeners
    algorithmSelect.addEventListener('change', updateInputFields);
    addProcessBtn.addEventListener('click', addProcessRow);
    simulateBtn.addEventListener('click', simulate);
    resetBtn.addEventListener('click', reset);

    // Number input controls
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('decrease-btn') || e.target.closest('.decrease-btn')) {
            const targetId = e.target.getAttribute('data-target') || 
                            e.target.closest('.decrease-btn').getAttribute('data-target');
            const input = e.target.closest('.process-row') ? 
                        e.target.closest('.process-row').querySelector(`.${targetId}`) :
                        document.getElementById(targetId);
            if (input) {
                input.stepDown();
                input.dispatchEvent(new Event('change'));
            }
        }
        
        if (e.target.classList.contains('increase-btn') || e.target.closest('.increase-btn')) {
            const targetId = e.target.getAttribute('data-target') || 
                            e.target.closest('.increase-btn').getAttribute('data-target');
            const input = e.target.closest('.process-row') ? 
                        e.target.closest('.process-row').querySelector(`.${targetId}`) :
                        document.getElementById(targetId);
            if (input) {
                input.stepUp();
                input.dispatchEvent(new Event('change'));
            }
        }
    });

    // Info tabs switching
    infoTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            infoTabs.forEach(t => t.classList.remove('active'));
            infoContents.forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
            
            // Special handling for comparison tab
            if (tabId === 'comparison') {
                updateComparisonTable();
            }
        });
    });

    // Initialize
    updateInputFields();
    updateAlgorithmInfo();
    updateAlgorithmDetails();

    // Create floating particles
    function createParticles() {
        const particlesContainer = document.getElementById('particles');
        const particleCount = window.innerWidth < 768 ? 20 : 50;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            
            // Random size between 2px and 8px
            const size = Math.random() * 6 + 2;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // Random position
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            
            // Random animation duration and delay
            const duration = Math.random() * 20 + 10;
            const delay = Math.random() * 5;
            particle.style.animationDuration = `${duration}s`;
            particle.style.animationDelay = `${delay}s`;
            
            particlesContainer.appendChild(particle);
        }
    }

    // Update input fields based on selected algorithm
    function updateInputFields() {
        const algorithm = algorithmSelect.value;
        
        // Show/hide time quantum for Round Robin
        if (algorithm === 'rr') {
            timeQuantumGroup.style.display = 'block';
        } else {
            timeQuantumGroup.style.display = 'none';
        }

        // Show/hide priority field for priority-based algorithms
        const priorityFields = document.querySelectorAll('.priority');
        const priorityContainers = document.querySelectorAll('.process-input-container:nth-child(4)');
        if (algorithm === 'priority' || algorithm === 'priority_p') {
            priorityFields.forEach(field => field.style.display = 'block');
            priorityContainers.forEach(container => container.style.display = 'block');
        } else {
            priorityFields.forEach(field => field.style.display = 'none');
            priorityContainers.forEach(container => container.style.display = 'none');
        }

        updateAlgorithmInfo();
        updateAlgorithmDetails();
    }

    // Update algorithm information
    function updateAlgorithmInfo() {
        const algorithm = algorithmSelect.value;
        const info = algorithmInfo[algorithm];

        document.getElementById('description').innerHTML = `<p>${info.description}</p>`;
        document.getElementById('formula').innerHTML = `<div class="formula">${info.formula.replace(/\n/g, '<br>')}</div>`;
        
        const advantagesList = info.advantages.map(adv => `<li>${adv}</li>`).join('');
        document.getElementById('advantages').innerHTML = `<ul class="advantages">${advantagesList}</ul>`;
        
        const disadvantagesList = info.disadvantages.map(dis => `<li>${dis}</li>`).join('');
        document.getElementById('disadvantages').innerHTML = `<ul class="disadvantages">${disadvantagesList}</ul>`;
        
        // Update comparison table
        updateComparisonTable();
    }

    // Update algorithm details section
    function updateAlgorithmDetails() {
        const algorithm = algorithmSelect.value;
        const info = algorithmInfo[algorithm].details;
        
        let characteristicsHTML = '';
        info.characteristics.forEach(char => {
            characteristicsHTML += `
                <div class="characteristic-card">
                    <h4>${char}</h4>
                </div>
            `;
        });
        
        algorithmDetails.innerHTML = `
            <h3>${info.title}</h3>
            <p>${info.description}</p>
            
            <h4>How it works:</h4>
            <ul class="algorithm-steps">
                ${info.steps.map(step => `<li>${step}</li>`).join('')}
            </ul>
            
            <div class="key-characteristics">
                ${characteristicsHTML}
            </div>
            
            <div class="algorithm-example">
                <strong>Example:</strong><br>
                ${info.example}
            </div>
        `;
    }

    // Update comparison table
    function updateComparisonTable() {
        const algorithm = algorithmSelect.value;
        const info = algorithmInfo[algorithm];
        
        if (!info.comparison) return;
        
        let tableHTML = `
            <p>${info.comparison.description}</p>
            <table class="comparison-chart">
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Performance</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        for (const [metric, performance] of Object.entries(info.comparison.metrics)) {
            tableHTML += `
                <tr>
                    <td>${metric}</td>
                    <td>${performance}</td>
                </tr>
            `;
        }
        
        tableHTML += `</tbody></table>`;
        document.getElementById('comparison').innerHTML = tableHTML;
    }

    // Add new process row
    function addProcessRow() {
        const newRow = document.createElement('div');
        newRow.className = 'process-row';
        const processNumber = processInputs.children.length + 1;
        newRow.setAttribute('data-process-number', processNumber);
        
        // Process ID
        const pidContainer = document.createElement('div');
        pidContainer.className = 'process-input-container';
        const pidLabel = document.createElement('div');
        pidLabel.className = 'process-label';
        pidLabel.textContent = 'Process ID';
        const pidDiv = document.createElement('div');
        pidDiv.className = 'input-with-icon';
        const pidIcon = document.createElement('i');
        pidIcon.className = 'fas fa-tag';
        const pidInput = document.createElement('input');
        pidInput.type = 'text';
        pidInput.placeholder = 'Process ID';
        pidInput.className = 'pid';
        pidInput.value = 'P' + processNumber;
        pidDiv.appendChild(pidIcon);
        pidDiv.appendChild(pidInput);
        pidContainer.appendChild(pidLabel);
        pidContainer.appendChild(pidDiv);
        
        // Arrival Time
        const arrivalContainer = document.createElement('div');
        arrivalContainer.className = 'process-input-container';
        const arrivalLabel = document.createElement('div');
        arrivalLabel.className = 'process-label';
        arrivalLabel.textContent = 'Arrival Time';
        const arrivalDiv = document.createElement('div');
        arrivalDiv.className = 'input-with-icon';
        const arrivalIcon = document.createElement('i');
        arrivalIcon.className = 'fas fa-clock';
        const arrivalInput = document.createElement('input');
        arrivalInput.type = 'number';
        arrivalInput.placeholder = 'Arrival Time';
        arrivalInput.className = 'arrival';
        arrivalInput.value = '0';
        arrivalInput.min = '0';
        arrivalDiv.appendChild(arrivalIcon);
        arrivalDiv.appendChild(arrivalInput);
        arrivalContainer.appendChild(arrivalLabel);
        arrivalContainer.appendChild(arrivalDiv);
        
        // Burst Time
        const burstContainer = document.createElement('div');
        burstContainer.className = 'process-input-container';
        const burstLabel = document.createElement('div');
        burstLabel.className = 'process-label';
        burstLabel.textContent = 'Burst Time';
        const burstDiv = document.createElement('div');
        burstDiv.className = 'number-control';
        const decreaseBtn = document.createElement('button');
        decreaseBtn.className = 'number-btn decrease-btn';
        decreaseBtn.setAttribute('data-target', 'burst');
        decreaseBtn.innerHTML = '<i class="fas fa-minus"></i>';
        const burstInput = document.createElement('input');
        burstInput.type = 'number';
        burstInput.placeholder = 'Burst Time';
        burstInput.className = 'burst';
        burstInput.value = '3';
        burstInput.min = '1';
        const increaseBtn = document.createElement('button');
        increaseBtn.className = 'number-btn increase-btn';
        increaseBtn.setAttribute('data-target', 'burst');
        increaseBtn.innerHTML = '<i class="fas fa-plus"></i>';
        burstDiv.appendChild(decreaseBtn);
        burstDiv.appendChild(burstInput);
        burstDiv.appendChild(increaseBtn);
        burstContainer.appendChild(burstLabel);
        burstContainer.appendChild(burstDiv);
        
        // Priority
        const priorityContainer = document.createElement('div');
        priorityContainer.className = 'process-input-container';
        priorityContainer.style.display = 'none';
        const priorityLabel = document.createElement('div');
        priorityLabel.className = 'process-label';
        priorityLabel.textContent = 'Priority';
        const priorityInput = document.createElement('input');
        priorityInput.type = 'number';
        priorityInput.placeholder = 'Priority';
        priorityInput.className = 'priority';
        priorityInput.value = '1';
        priorityInput.min = '1';
        priorityContainer.appendChild(priorityLabel);
        priorityContainer.appendChild(priorityInput);
        
        // Remove button
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '<i class="fas fa-trash"></i>';
        removeBtn.addEventListener('click', function() {
            processInputs.removeChild(newRow);
            // Update process numbers
            const rows = processInputs.querySelectorAll('.process-row');
            rows.forEach((row, index) => {
                row.setAttribute('data-process-number', index + 1);
            });
        });
        
        // Assemble row
        newRow.appendChild(pidContainer);
        newRow.appendChild(arrivalContainer);
        newRow.appendChild(burstContainer);
        newRow.appendChild(priorityContainer);
        newRow.appendChild(removeBtn);
        
        processInputs.appendChild(newRow);
        
        // Update priority visibility based on current algorithm
        updateInputFields();
    }

    // Get processes from input fields
    function getProcesses() {
        const processes = [];
        const rows = processInputs.querySelectorAll('.process-row');
        
        rows.forEach((row, index) => {
            const pid = row.querySelector('.pid').value || `P${index + 1}`;
            const arrivalTime = parseInt(row.querySelector('.arrival').value) || 0;
            const burstTime = parseInt(row.querySelector('.burst').value) || 1;
            const priority = parseInt(row.querySelector('.priority')?.value) || 1;
            const color = colorPalette[index % colorPalette.length];
            
            processes.push({
                pid,
                arrivalTime,
                burstTime,
                remainingTime: burstTime,
                priority,
                color,
                startTime: null,
                endTime: null,
                waitingTime: 0,
                turnaroundTime: 0,
                responseTime: -1 // -1 means not responded yet
            });
        });
        
        return processes;
    }

    // Simulate scheduling algorithm
    function simulate() {
        const algorithm = algorithmSelect.value;
        const processes = getProcesses();
        
        if (processes.length === 0) {
            alert('Please add at least one process');
            return;
        }
        
        let timeQuantum = 0;
        if (algorithm === 'rr') {
            timeQuantum = parseInt(document.getElementById('timeQuantum').value) || 2;
        }
        
        // Sort processes by arrival time (for initial ready queue)
        processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
        
        let currentTime = 0;
        let completedProcesses = 0;
        const totalProcesses = processes.length;
        const ganttChartData = [];
        const readyQueue = [];
        let currentProcess = null;
        let remainingQuantum = 0;
        let isIdle = false;
        
        // Reset process stats
        processes.forEach(process => {
            process.remainingTime = process.burstTime;
            process.startTime = null;
            process.endTime = null;
            process.waitingTime = 0;
            process.turnaroundTime = 0;
            process.responseTime = -1;
        });
        
        // Main simulation loop
        while (completedProcesses < totalProcesses) {
            // Add arriving processes to ready queue
            processes.forEach(process => {
                if (process.arrivalTime === currentTime && process.remainingTime > 0) {
                    readyQueue.push(process);
                }
            });
            
            // Check if we need to select a new process
            let needNewProcess = false;
            if (currentProcess === null) {
                needNewProcess = true;
            } else if (currentProcess.remainingTime === 0) {
                // Current process completed
                currentProcess.endTime = currentTime;
                completedProcesses++;
                needNewProcess = true;
            } else if (algorithm === 'rr' && remainingQuantum === 0) {
                // Round Robin time quantum expired
                needNewProcess = true;
            } else if (algorithm === 'srtf') {
                // For SRTF, we need to always select the process with shortest remaining time
                let allProcesses = [...readyQueue];
                if (currentProcess && currentProcess.remainingTime > 0) {
                    allProcesses.push(currentProcess);
                }
                
                // Include newly arrived processes at this time
                processes.forEach(process => {
                    if (process.arrivalTime === currentTime && process.remainingTime > 0) {
                        allProcesses.push(process);
                    }
                });
                
                if (allProcesses.length > 0) {
                    // Find process with shortest remaining time
                    allProcesses.sort((a, b) => a.remainingTime - b.remainingTime);
                    const shortestProcess = allProcesses[0];
                    
                    if (currentProcess !== shortestProcess) {
                        // Need to preempt current process if it's not the shortest
                        needNewProcess = true;
                        
                        // Return current process to ready queue if it's not finished
                        if (currentProcess && currentProcess.remainingTime > 0) {
                            readyQueue.push(currentProcess);
                        }
                    }
                }
            } else if (algorithm === 'priority_p' && 
                      readyQueue.some(p => p.priority < currentProcess.priority)) {
                // Priority preemption - higher priority process available
                needNewProcess = true;
            }
            
            // Handle process selection/preemption
            if (needNewProcess) {
                if (currentProcess !== null && currentProcess.remainingTime > 0 && algorithm !== 'srtf') {
                    // Return the current process to the appropriate queue if not finished
                    // (For SRTF, we already handled this above)
                    if (algorithm === 'rr') {
                        readyQueue.push(currentProcess);
                    } else if (algorithm !== 'priority_p') {
                        readyQueue.push(currentProcess);
                    }
                }
                
                // Select next process
                let nextProcess = null;
                
                if (algorithm === 'sjf' || algorithm === 'srtf') {
                    // SJF/SRTF: Select process with shortest burst/remaining time
                    // For SRTF, we need to consider all available processes (including current)
                    let candidates = [...readyQueue];
                    if (algorithm === 'srtf' && currentProcess && currentProcess.remainingTime > 0) {
                        candidates.push(currentProcess);
                    }
                    
                    candidates.sort((a, b) => a.remainingTime - b.remainingTime);
                    nextProcess = candidates[0];
                    
                    // Remove from ready queue if it was there
                    if (nextProcess !== currentProcess) {
                        const index = readyQueue.indexOf(nextProcess);
                        if (index > -1) {
                            readyQueue.splice(index, 1);
                        }
                    }
                } else if (algorithm === 'priority' || algorithm === 'priority_p') {
                    // Priority: Select process with highest priority (lowest number)
                    readyQueue.sort((a, b) => a.priority - b.priority);
                    nextProcess = readyQueue.shift();
                } else {
                    // FCFS/RR: Select first process in queue
                    nextProcess = readyQueue.shift();
                }
                
                // Check if we found a process to run
                if (nextProcess) {
                    // End any previous idle period
                    if (isIdle) {
                        ganttChartData[ganttChartData.length - 1].endTime = currentTime;
                        isIdle = false;
                    }
                    
                    currentProcess = nextProcess;
                    
                    if (currentProcess.responseTime === -1) {
                        currentProcess.responseTime = currentTime - currentProcess.arrivalTime;
                    }
                    
                    if (algorithm === 'rr') {
                        remainingQuantum = timeQuantum;
                    }
                    
                    if (currentProcess.startTime === null) {
                        currentProcess.startTime = currentTime;
                    }
                    
                    // Add to Gantt chart
                    ganttChartData.push({
                        pid: currentProcess.pid,
                        startTime: currentTime,
                        endTime: currentTime + 1,
                        color: currentProcess.color
                    });
                } else {
                    // No process available - CPU is idle
                    if (!isIdle) {
                        // Start new idle period
                        ganttChartData.push({
                            pid: 'IDLE',
                            startTime: currentTime,
                            endTime: currentTime + 1,
                            color: '#cccccc'
                        });
                        isIdle = true;
                    } else {
                        // Extend current idle period
                        ganttChartData[ganttChartData.length - 1].endTime = currentTime + 1;
                    }
                    currentProcess = null;
                }
            }
            
            // Execute current process (if not idle)
            if (currentProcess && !isIdle) {
                currentProcess.remainingTime--;
                if (algorithm === 'rr') {
                    remainingQuantum--;
                }
                
                // Update Gantt chart for current process
                if (ganttChartData.length > 0 && 
                    ganttChartData[ganttChartData.length - 1].pid === currentProcess.pid) {
                    ganttChartData[ganttChartData.length - 1].endTime = currentTime + 1;
                }
            }
            
            // Update waiting times for processes in ready queue
            if (currentProcess && !isIdle) {
                readyQueue.forEach(process => {
                    if (process !== currentProcess) {
                        process.waitingTime++;
                    }
                });
            }
            
            currentTime++;
        }
        
        // Remove the last idle time if it exists
        if (ganttChartData.length > 0 && ganttChartData[ganttChartData.length - 1].pid === 'IDLE') {
            ganttChartData.pop();
        }
        
        // Calculate turnaround times
        processes.forEach(process => {
            process.turnaroundTime = process.endTime - process.arrivalTime;
        });
        
        // Display results
        displayResults(processes, ganttChartData, algorithm);
    }

    // Display simulation results
    function displayResults(processes, ganttChartData, algorithm) {
        // Calculate averages
        const avgWaitingTime = processes.reduce((sum, p) => sum + p.waitingTime, 0) / processes.length;
        const avgTurnaroundTime = processes.reduce((sum, p) => sum + p.turnaroundTime, 0) / processes.length;
        const avgResponseTime = processes.reduce((sum, p) => sum + p.responseTime, 0) / processes.length;
        const totalTime = ganttChartData.length > 0 ? ganttChartData[ganttChartData.length - 1].endTime : 0;
        const throughput = processes.length / totalTime;
        
        // Display stats
        statsDiv.innerHTML = `
            <div class="stat-card">
                <h3>Average Waiting Time</h3>
                <div class="stat-value">${avgWaitingTime.toFixed(2)}</div>
                <p>Total CPU idle time: ${calculateIdleTime(ganttChartData)} units</p>
            </div>
            <div class="stat-card">
                <h3>Average Turnaround Time</h3>
                <div class="stat-value">${avgTurnaroundTime.toFixed(2)}</div>
                <p>Total execution time: ${totalTime} units</p>
            </div>
            <div class="stat-card">
                <h3>Average Response Time</h3>
                <div class="stat-value">${avgResponseTime.toFixed(2)}</div>
                <p>Number of context switches: ${calculateContextSwitches(ganttChartData)}</p>
            </div>
            <div class="stat-card">
                <h3>Throughput</h3>
                <div class="stat-value">${throughput.toFixed(2)}</div>
                <p>Processes completed per unit time</p>
            </div>
        `;
        
        // Display process table
        let tableHTML = `
            <table class="process-table">
                <thead>
                    <tr>
                        <th>Process ID</th>
                        <th>Arrival Time</th>
                        <th>Burst Time</th>
                        ${algorithm === 'priority' || algorithm === 'priority_p' ? '<th>Priority</th>' : ''}
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th>Waiting Time</th>
                        <th>Turnaround Time</th>
                        <th>Response Time</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        processes.forEach(process => {
            tableHTML += `
                <tr>
                    <td>${process.pid}</td>
                    <td>${process.arrivalTime}</td>
                    <td>${process.burstTime}</td>
                    ${algorithm === 'priority' || algorithm === 'priority_p' ? `<td>${process.priority}</td>` : ''}
                    <td>${process.startTime}</td>
                    <td>${process.endTime}</td>
                    <td>${process.waitingTime}</td>
                    <td>${process.turnaroundTime}</td>
                    <td>${process.responseTime}</td>
                </tr>
            `;
        });
        
        tableHTML += `</tbody></table>`;
        processTable.innerHTML = tableHTML;
        
        // Display Gantt chart
        renderGanttChart(ganttChartData);
        
        // Render charts
        renderCharts(processes);
        
        // Show all result sections
        resultsDiv.innerHTML = `<h3>${getAlgorithmName(algorithm)} Scheduling Results</h3>`;
        ganttChart.style.display = 'block';
        statsDiv.style.display = 'grid';
        processTable.style.display = 'table';
        chartContainer.style.display = 'block';
    }

    // Calculate idle time from Gantt chart
    function calculateIdleTime(ganttData) {
        return ganttData.filter(item => item.pid === 'IDLE')
                       .reduce((sum, item) => sum + (item.endTime - item.startTime), 0);
    }

    // Calculate context switches from Gantt chart
    function calculateContextSwitches(ganttData) {
        if (ganttData.length <= 1) return 0;
        
        let switches = 0;
        for (let i = 1; i < ganttData.length; i++) {
            if (ganttData[i].pid !== ganttData[i-1].pid) {
                switches++;
            }
        }
        return switches;
    }

    // Render performance charts
    function renderCharts(processes) {
        // Destroy existing charts if they exist
        if (waitingTimeChart) waitingTimeChart.destroy();
        if (turnaroundTimeChart) turnaroundTimeChart.destroy();
        if (responseTimeChart) responseTimeChart.destroy();
        if (comparisonChart) comparisonChart.destroy();
        
        // Prepare data
        const processIds = processes.map(p => p.pid);
        const waitingTimes = processes.map(p => p.waitingTime);
        const turnaroundTimes = processes.map(p => p.turnaroundTime);
        const responseTimes = processes.map(p => p.responseTime);
        const burstTimes = processes.map(p => p.burstTime);
        const colors = processes.map(p => p.color);
        
        // Waiting Time Chart
        const waitingCtx = document.getElementById('waitingTimeChart').getContext('2d');
        waitingTimeChart = new Chart(waitingCtx, {
            type: 'bar',
            data: {
                labels: processIds,
                datasets: [{
                    label: 'Waiting Time',
                    data: waitingTimes,
                    backgroundColor: colors,
                    borderColor: colors.map(c => darkenColor(c, 20)),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Waiting Time: ${context.raw} units`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Time Units'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Process ID'
                        }
                    }
                }
            }
        });
        
        // Turnaround Time Chart
        const turnaroundCtx = document.getElementById('turnaroundTimeChart').getContext('2d');
        turnaroundTimeChart = new Chart(turnaroundCtx, {
            type: 'bar',
            data: {
                labels: processIds,
                datasets: [{
                    label: 'Turnaround Time',
                    data: turnaroundTimes,
                    backgroundColor: colors,
                    borderColor: colors.map(c => darkenColor(c, 20)),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Turnaround Time: ${context.raw} units`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Time Units'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Process ID'
                        }
                    }
                }
            }
        });
        
        // Response Time Chart
        const responseCtx = document.getElementById('responseTimeChart').getContext('2d');
        responseTimeChart = new Chart(responseCtx, {
            type: 'bar',
            data: {
                labels: processIds,
                datasets: [{
                    label: 'Response Time',
                    data: responseTimes,
                    backgroundColor: colors,
                    borderColor: colors.map(c => darkenColor(c, 20)),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Response Time: ${context.raw} units`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Time Units'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Process ID'
                        }
                    }
                }
            }
        });
        
        // Comparison Chart (Pie)
        const comparisonCtx = document.getElementById('comparisonChart').getContext('2d');
        comparisonChart = new Chart(comparisonCtx, {
            type: 'pie',
            data: {
                labels: ['Waiting Time', 'Turnaround Time', 'Response Time'],
                datasets: [{
                    data: [
                        processes.reduce((sum, p) => sum + p.waitingTime, 0),
                        processes.reduce((sum, p) => sum + p.turnaroundTime, 0),
                        processes.reduce((sum, p) => sum + p.responseTime, 0)
                    ],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} units (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Helper function to darken a color
    function darkenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return `#${(
            0x1000000 +
            (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
            (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
            (B < 255 ? (B < 1 ? 0 : B) : 255)
        ).toString(16).slice(1)}`;
    }

    // Render Gantt chart
    function renderGanttChart(ganttData) {
        ganttContainer.innerHTML = '';
        
        if (ganttData.length === 0) return;
        
        const totalTime = ganttData[ganttData.length - 1].endTime;
        const containerWidth = ganttContainer.offsetWidth;
        const scale = containerWidth / totalTime;
        
        // Create color legend
        const legend = document.createElement('div');
        legend.className = 'color-legend';
        
        const uniqueProcesses = {};
        ganttData.forEach(item => {
            if (item.pid !== 'IDLE' && !uniqueProcesses[item.pid]) {
                uniqueProcesses[item.pid] = item.color;
            }
        });
        
        Object.keys(uniqueProcesses).forEach(pid => {
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';
            
            const colorBox = document.createElement('div');
            colorBox.className = 'legend-color';
            colorBox.style.backgroundColor = uniqueProcesses[pid];
            
            const label = document.createElement('span');
            label.textContent = pid;
            
            legendItem.appendChild(colorBox);
            legendItem.appendChild(label);
            legend.appendChild(legendItem);
        });
        
        // Add IDLE to legend if present
        if (ganttData.some(item => item.pid === 'IDLE')) {
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';
            
            const colorBox = document.createElement('div');
            colorBox.className = 'legend-color';
            colorBox.style.backgroundColor = '#cccccc';
            
            const label = document.createElement('span');
            label.textContent = 'IDLE';
            
            legendItem.appendChild(colorBox);
            legendItem.appendChild(label);
            legend.appendChild(legendItem);
        }
        
        ganttContainer.appendChild(legend);
        
        // Create Gantt blocks
        ganttData.forEach((item, index) => {
            const duration = item.endTime - item.startTime;
            const width = duration * scale;
            
            const block = document.createElement('div');
            block.className = 'gantt-block';
            block.style.width = `${width}px`;
            block.style.backgroundColor = item.color;
            block.textContent = item.pid;
            
            // Add tooltip
            block.addEventListener('mousemove', (e) => {
                tooltip.innerHTML = `
                    <strong>${item.pid}</strong><br>
                    Start: ${item.startTime}<br>
                    End: ${item.endTime}<br>
                    Duration: ${duration}
                `;
                tooltip.style.left = `${e.pageX + 10}px`;
                tooltip.style.top = `${e.pageY + 10}px`;
                tooltip.style.opacity = '1';
            });
            
            block.addEventListener('mouseout', () => {
                tooltip.style.opacity = '0';
            });
            
            // Add start time marker for first block and when process changes
            if (index === 0 || item.pid !== ganttData[index - 1].pid) {
                const startMarker = document.createElement('div');
                startMarker.className = 'gantt-time';
                startMarker.textContent = item.startTime;
                startMarker.style.left = '0';
                block.appendChild(startMarker);
            }
            
            // Add end time marker for last block
            if (index === ganttData.length - 1) {
                const endMarker = document.createElement('div');
                endMarker.className = 'gantt-time';
                endMarker.textContent = item.endTime;
                endMarker.style.right = '0';
                block.appendChild(endMarker);
            }
            
            ganttContainer.appendChild(block);
        });
        
        // Add time markers every 5 units
        for (let time = 0; time <= totalTime; time += 5) {
            const marker = document.createElement('div');
            marker.className = 'time-marker';
            marker.style.left = `${time * scale}px`;
            marker.textContent = time;
            ganttContainer.appendChild(marker);
        }
        
        // Add timeline
        const timeline = document.createElement('div');
        timeline.className = 'time-line';
        timeline.style.width = `${totalTime * scale}px`;
        ganttContainer.appendChild(timeline);
    }

    // Get full algorithm name
    function getAlgorithmName(algorithm) {
        const names = {
            'fcfs': 'First Come First Serve (FCFS)',
            'sjf': 'Shortest Job First (SJF) - Non-Preemptive',
            'srtf': 'Shortest Remaining Time First (SRTF)',
            'rr': 'Round Robin (RR)',
            'priority': 'Priority - Non-Preemptive',
            'priority_p': 'Priority - Preemptive'
        };
        return names[algorithm] || algorithm;
    }

    // Reset simulation
    function reset() {
        processInputs.innerHTML = '';
        
        // Add 3 default processes
        for (let i = 0; i < 3; i++) {
            addProcessRow();
        }
        
        // Reset results display
        resultsDiv.innerHTML = '<p>Select an algorithm and click "Simulate" to see the results.</p>';
        ganttChart.style.display = 'none';
        statsDiv.style.display = 'none';
        processTable.style.display = 'none';
        chartContainer.style.display = 'none';
        
        // Destroy charts
        if (waitingTimeChart) waitingTimeChart.destroy();
        if (turnaroundTimeChart) turnaroundTimeChart.destroy();
        if (responseTimeChart) responseTimeChart.destroy();
        if (comparisonChart) comparisonChart.destroy();
        
        // Reset algorithm info to default
        updateAlgorithmInfo();
        updateAlgorithmDetails();
    }
});
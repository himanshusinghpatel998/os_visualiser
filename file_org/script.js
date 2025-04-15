document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const outputDisplay = document.getElementById('outputDisplay');
    const commandHistory = document.getElementById('commandHistory');
    const currentPathDisplay = document.getElementById('currentPath');
    
    // Command buttons and inputs
    const mkdirBtn = document.getElementById('mkdirBtn');
    const mkdirInput = document.getElementById('mkdirInput');
    const cdBtn = document.getElementById('cdBtn');
    const cdInput = document.getElementById('cdInput');
    const cdParentBtn = document.getElementById('cdParentBtn');
    const createBtn = document.getElementById('createBtn');
    const createInput = document.getElementById('createInput');
    const generateBtn = document.getElementById('generateBtn');
    const clearBtn = document.getElementById('clearBtn');
    
    // Create file system
    let fileSystem = new FileSystem();
    
    function updateCurrentPathDisplay() {
        currentPathDisplay.textContent = fileSystem.getPathString();
    }
    
    function addCommandToHistory(command, result, isError = false) {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        if (isError) {
            historyItem.innerHTML = `<span class="command">> ${command}</span> <span class="error">- ${result}</span>`;
        } else {
            historyItem.innerHTML = `<span class="command">> ${command}</span> - ${result}`;
        }
        
        commandHistory.appendChild(historyItem);
        commandHistory.scrollTop = commandHistory.scrollHeight;
    }
    
    // Button event listeners
    mkdirBtn.addEventListener('click', function() {
        const dirName = mkdirInput.value.trim();
        if (!dirName) {
            addCommandToHistory('mkdir', 'Error: Directory name is required', true);
            return;
        }
        
        const command = `mkdir ${dirName}`;
        const result = fileSystem.mkdir(dirName);
        addCommandToHistory(command, result, result.includes('already exists'));
        
        mkdirInput.value = '';
        updateCurrentPathDisplay();
    });
    
    cdBtn.addEventListener('click', function() {
        const dirName = cdInput.value.trim();
        if (!dirName) {
            addCommandToHistory('cd', 'Error: Directory name is required', true);
            return;
        }
        
        const command = `cd ${dirName}`;
        const result = fileSystem.cd(dirName);
        addCommandToHistory(command, result, result.includes('not found') || result.includes('not a directory'));
        
        cdInput.value = '';
        updateCurrentPathDisplay();
    });
    
    cdParentBtn.addEventListener('click', function() {
        const command = 'cd ..';
        const result = fileSystem.cd('..');
        addCommandToHistory(command, result);
        updateCurrentPathDisplay();
    });
    
    createBtn.addEventListener('click', function() {
        const fileName = createInput.value.trim();
        if (!fileName) {
            addCommandToHistory('create', 'Error: File name is required', true);
            return;
        }
        
        const command = `create ${fileName}`;
        const result = fileSystem.create(fileName);
        addCommandToHistory(command, result, result.includes('already exists'));
        
        createInput.value = '';
    });
    
    generateBtn.addEventListener('click', function() {
        const tree = fileSystem.generateTree();
        outputDisplay.textContent = tree;
        addCommandToHistory('generate', 'File directory structure generated');
    });
    
    clearBtn.addEventListener('click', function() {
        fileSystem = new FileSystem();
        commandHistory.innerHTML = '';
        outputDisplay.textContent = 'Click "Generate File Directory" to see the file structure...';
        updateCurrentPathDisplay();
        addCommandToHistory('reset', 'File system reset');
    });
    
    // Input keypress events to allow Enter key
    mkdirInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') mkdirBtn.click();
    });
    
    cdInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') cdBtn.click();
    });
    
    createInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') createBtn.click();
    });
    
    // FileSystem class
    function FileSystem() {
        this.root = {
            type: 'directory',
            name: '',
            children: {}
        };
        this.currentPath = [];
        this.currentDirectory = this.root;
        
        this.mkdir = function(dirName) {
            if (this.currentDirectory.children[dirName]) {
                return `Directory '${dirName}' already exists.`;
            }
            
            this.currentDirectory.children[dirName] = {
                type: 'directory',
                name: dirName,
                children: {}
            };
            return `Created directory '${dirName}'.`;
        };
        
        this.cd = function(path) {
            if (path === '..') {
                if (this.currentPath.length > 0) {
                    this.currentPath.pop();
                    this.currentDirectory = this.navigateToPath(this.currentPath);
                    return `Changed directory to ${this.getPathString()}.`;
                }
                return "Already at root.";
            }
            
            if (path === '/') {
                this.currentPath = [];
                this.currentDirectory = this.root;
                return "Changed directory to root.";
            }
            
            if (!this.currentDirectory.children[path]) {
                return `Directory '${path}' not found.`;
            }
            
            if (this.currentDirectory.children[path].type !== 'directory') {
                return `'${path}' is not a directory.`;
            }
            
            this.currentPath.push(path);
            this.currentDirectory = this.currentDirectory.children[path];
            return `Changed directory to ${this.getPathString()}.`;
        };
        
        this.create = function(fileName) {
            if (this.currentDirectory.children[fileName]) {
                return `File '${fileName}' already exists.`;
            }
            
            this.currentDirectory.children[fileName] = {
                type: 'file',
                name: fileName
            };
            return `Created file '${fileName}'.`;
        };
        
        this.navigateToPath = function(pathArray) {
            let current = this.root;
            for (const dir of pathArray) {
                current = current.children[dir];
            }
            return current;
        };
        
        this.getPathString = function() {
            return '/' + this.currentPath.join('/');
        };
        
        this.generateTree = function() {
            let output = '';
            
            const buildTree = (node, prefix = '', isLast = true, isRoot = false) => {
                output += prefix;
                
                if (!isRoot) {
                    output += isLast ? '└── ' : '├── ';
                    output += node.name + (node.type === 'directory' ? '/' : '') + '\n';
                }
                
                if (node.type === 'directory') {
                    const keys = Object.keys(node.children);
                    keys.forEach((key, index) => {
                        const child = node.children[key];
                        const newPrefix = prefix + (isRoot ? '' : (isLast ? '    ' : '│   '));
                        buildTree(child, newPrefix, index === keys.length - 1);
                    });
                }
            };
            
            buildTree(this.root, '', true, true);
            return output.trim();
        };
    }
    
    // Initialize current path display
    updateCurrentPathDisplay();
});
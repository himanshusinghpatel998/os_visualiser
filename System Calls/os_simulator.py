import time
import threading

# In-memory process table
process_table = {}
file_system = {}  # Holds actual file content
next_fd = 1  # Next available file descriptor

# Device management
AVAILABLE_DEVICES = ['printer', 'disk', 'scanner', 'keyboard']
deviceAvailability = {device: None for device in AVAILABLE_DEVICES}  # device -> pid or None
deviceMap = {}  # pid -> list of attached devices

# file_system = {
#     "data.txt": {
#         "content": "hello",
#         "size": 5,
#         "created": "...",
#         "modified": "...",
#         "readers": 0,
#         "writer": None  
#     }
# }
memory_table = {}

# Memory management constants
DEFAULT_PROCESS_SIZE = 1024  # Default process size in bytes
PAGE_SIZE = 4096  # Standard page size in bytes
STACK_SIZE = 8192  # Default stack size in bytes
HEAP_START = 0x1000000  # Starting address for heap
STACK_START = 0x7FFFFFFF  # Starting address for stack (grows downward)

# Memory management structures
memory_map = {}  # Maps memory addresses to process IDs
memory_regions = {}  # Tracks memory regions for each process
# memory_regions structure:
# {
#   pid: {
#     'heap': {'start': addr, 'end': addr, 'size': size},
#     'stack': {'start': addr, 'end': addr, 'size': size},
#     'mmap_regions': [{'start': addr, 'end': addr, 'size': size, 'prot': prot, 'flags': flags}]
#   }
# }

def get_timestamp():
    return time.strftime("%Y-%m-%d %H:%M:%S")

def simulate_completion(pid, seconds):
    time.sleep(seconds)

    while True:
        # If the process was manually killed before auto-kill
        if pid not in process_table or process_table[pid]["status"] != "running":
            return

        # Check if all child processes are terminated
        children = [child_pid for child_pid, proc in process_table.items() if proc.get("ppid") == pid]
        all_children_terminated = all(process_table[c]["status"] == "terminated" for c in children)

        if all_children_terminated:
            process_table[pid]["status"] = "terminated"
            print(f"\n⏱️ PID {pid} auto-terminated after {seconds} sec (all children completed).")
            return
        else:
            time.sleep(1)  # Poll every second

def get_all_descendants(pid):
    descendants = []
    for child_pid, proc in process_table.items():
        if proc.get("ppid") == pid:
            descendants.append(child_pid)
            descendants.extend(get_all_descendants(child_pid))
    return descendants

def print_process_tree():
    def print_subtree(pid, indent=""):
        proc = process_table[pid]
        status = proc["status"]
        command = proc["command"]
        print(f"{indent}PID {pid} [{status}] (cmd={command})")
        for child_pid, child_proc in process_table.items():
            if child_proc.get("ppid") == pid:
                print_subtree(child_pid, indent + "  ")  # Add 2 spaces for indentation

    print("📁 Process Tree:")
    roots = [pid for pid in process_table if process_table[pid].get("ppid") == "0"]
    for root in roots:
        print_subtree(root)

def handle_file_create(args):
    name = args.get("name")
    if name in file_system:
        print(f"File {name} already exists.")
        return
    file_system[name] = {
        "content": "",
        "size": 0,
        "created": get_timestamp(),
        "modified": get_timestamp(),
        "readers": 0,
        "writer": None
    }
    print(f"File {name} created.")

def handle_file_open(args):
    global next_fd
    pid = args.get("pid")  
    name = args.get("name")
    mode = args.get("mode", "r")

    print(f"📝 Attempting to open file. PID: {pid}, Name: {name}, Mode: {mode}")
    # print(f"📝 Current process table: {list(process_table.keys())}")

    if pid not in process_table:
        print(f"❌ Process PID {pid} does not exist.")
        return

    if name not in file_system:
        print(f"❌ File {name} does not exist.")
        return

    if mode not in ["r", "w", "rw"]:
        print(f"❌ Invalid file mode: {mode}. Must be 'r', 'w', or 'rw'")
        return

    file = file_system[name]

    # Writer logic
    if mode in ["w", "rw"]:
        if file["readers"] > 0 or file["writer"] is not None:
            print(f"❌ File {name} is currently being accessed. Writer blocked.")
            return
        file["writer"] = pid

    # Reader logic
    if mode == "r":
        if file["writer"] is not None:
            print(f"❌ File {name} is being written to. Reader blocked.")
            return
        file["readers"] += 1

    fd = next_fd
    next_fd += 1
    process_table[pid]["file_descriptors"][fd] = {
        "name": name,
        "mode": mode,
        "position": 0
    }

    print(f"✅ Process {pid} opened {name} in {mode} mode with FD {fd}")
    print(f"📝 Current file state: readers={file['readers']}, writer={file['writer']}")


def handle_file_write(args):
    pid = args.get("pid")  # Don't convert to int here
    fd = int(args.get("fd"))
    content = args.get("content", "")

    print(f"📝 Attempting to write. PID: {pid}, FD: {fd}")
    # print(f"📝 Current process table: {list(process_table.keys())}")

    if pid not in process_table:
        print(f"❌ Process PID {pid} does not exist.")
        return

    if pid not in process_table or "file_descriptors" not in process_table[pid]:
        print(f"❌ Process {pid} has no file descriptors.")
        return

    fd_entry = process_table[pid]["file_descriptors"].get(fd)
    if not fd_entry:
        print(f"❌ FD {fd} not found for process {pid}")
        return

    if fd_entry["mode"] not in ["w", "rw"]:
        print(f"❌ FD {fd} is not in write mode")
        return

    filename = fd_entry["name"]
    if filename not in file_system:
        print(f"❌ File {filename} no longer exists.")
        return

    file_entry = file_system[filename]
    if file_entry["writer"] != pid:
        print(f"❌ Process {pid} does not have write access to file {filename}")
        return

    file_entry["content"] += content
    file_entry["size"] = len(file_entry["content"])
    file_entry["modified"] = get_timestamp()

    print(f"✅ Wrote to file {filename}: {content}")
    print(f"📝 Current file state: readers={file_entry['readers']}, writer={file_entry['writer']}")

def handle_file_read(args):
    pid = int(args.get("pid"))
    fd = int(args.get("fd"))
    size = int(args.get("size", 100))  # default 100 chars

    if pid not in process_table:
        print(f"❌ Process PID {pid} does not exist.")
        return

    if pid not in process_table or "file_descriptors" not in process_table[pid]:
        print(f"❌ Process {pid} has no file descriptors.")
        return

    fd_entry = process_table[pid]["file_descriptors"].get(fd)
    if not fd_entry:
        print(f"❌ FD {fd} not found for process {pid}")
        return

    if fd_entry["mode"] not in ["r", "rw"]:
        print(f"❌ FD {fd} is not in read mode")
        return

    filename = fd_entry["name"]
    if filename not in file_system:
        print(f"❌ File {filename} no longer exists.")
        return

    position = fd_entry["position"]
    content = file_system[filename]["content"]

    read_data = content[position:position+size]
    fd_entry["position"] += len(read_data)

    print(f"✅ Read from {filename}: \"{read_data}\"")


def handle_file_close(args):
    pid = int(args.get("pid"))
    fd = int(args.get("fd"))

    if pid not in process_table:
        print(f"❌ Process PID {pid} does not exist.")
        return

    fd_entry = process_table[pid]["file_descriptors"].get(fd)
    if not fd_entry:
        print(f"FD {fd} not found in process {pid}")
        return

    name = fd_entry["name"]
    mode = fd_entry["mode"]
    file = file_system[name]

    if mode == "r":
        file["readers"] = max(0, file["readers"] - 1)
    elif mode in ["w", "rw"] and file["writer"] == pid:
        file["writer"] = None

    del process_table[pid]["file_descriptors"][fd]
    print(f"Process {pid} closed FD {fd}")

def handle_file_delete(args):
    name = args.get("name")

    if name not in file_system:
        print(f"❌ File {name} does not exist.")
        return

    # Ensure no one is using it
    for pid, proc in process_table.items():
        if proc["status"] == "running":  # Only check running processes
            for fd in proc["file_descriptors"].values():
                if fd["name"] == name:
                    print(f"❌ File {name} is in use by process {pid}. Cannot delete.")
                    return

    del file_system[name]
    print(f"✅ File {name} deleted.")

def handle_file_stat(args):
    name = args.get("name")

    if name not in file_system:
        print(f"File {name} not found.")
        return

    f = file_system[name]
    print(f"Stats for {name}:")
    print(f"  Size: {f['size']} bytes")
    print(f"  Created: {f['created']}")
    print(f"  Modified: {f['modified']}")
    print(f"  Readers: {f.get('readers', 0)}")
    print(f"  Writer: {f.get('writer')}")

def handle_file_seek(args):
    pid = int(args.get("pid"))
    fd = int(args.get("fd"))
    pos = int(args.get("position", 0))

    if pid not in process_table:
        print(f"❌ Process PID {pid} does not exist.")
        return

    fd_entry = process_table[pid]["file_descriptors"].get(fd)
    if not fd_entry:
        print(f"❌ FD {fd} not found for process {pid}")
        return

    filename = fd_entry["name"]
    if pos < 0 or pos > len(file_system[filename]["content"]):
        print(f"❌ Invalid seek position {pos}. Must be between 0 and {len(file_system[filename]['content'])}")
        return

    fd_entry["position"] = pos
    print(f"✅ Seeked FD {fd} to position {pos}")

def allocate(pid, size):
    block = {
        "start": 0 if pid not in memory_table else sum(b["size"] for b in memory_table[pid]),
        "size": size,
        "data": [None] * size
    }
    memory_table.setdefault(pid, []).append(block)
    print(f"✅ Allocated {size} units for PID {pid}")

def free(pid):
    if pid in memory_table:
        del memory_table[pid]
        print(f"🗑️ Freed memory for PID {pid}")
    else:
        print(f"⚠️ No memory found for PID {pid}")

def read_mem(pid, addr):
    if pid not in memory_regions:
        print(f"❌ No memory allocated for PID {pid}")
        return
        
    # Check heap
    heap = memory_regions[pid]['heap']
    if heap['start'] <= addr < heap['end']:
        val = memory_map.get(addr)
        print(f"📖 PID {pid} read heap[{hex(addr)}] = {val}")
        return val
        
    # Check stack
    stack = memory_regions[pid]['stack']
    if stack['start'] <= addr < stack['end']:
        val = memory_map.get(addr)
        print(f"📖 PID {pid} read stack[{hex(addr)}] = {val}")
        return val
        
    # Check mapped regions
    for region in memory_regions[pid]['mmap_regions']:
        if region['start'] <= addr < region['end']:
            val = memory_map.get(addr)
            print(f"📖 PID {pid} read mapped[{hex(addr)}] = {val}")
            return val
            
    print(f"❌ Address {hex(addr)} not in memory space for PID {pid}")

def write_mem(pid, addr, value):
    if pid not in memory_regions:
        print(f"❌ No memory allocated for PID {pid}")
        return
        
    # Check heap
    heap = memory_regions[pid]['heap']
    if heap['start'] <= addr < heap['end']:
        memory_map[addr] = value
        print(f"✍️ PID {pid} wrote to heap[{hex(addr)}] = {value}")
        return
        
    # Check stack
    stack = memory_regions[pid]['stack']
    if stack['start'] <= addr < stack['end']:
        memory_map[addr] = value
        print(f"✍️ PID {pid} wrote to stack[{hex(addr)}] = {value}")
        return
        
    # Check mapped regions
    for region in memory_regions[pid]['mmap_regions']:
        if region['start'] <= addr < region['end']:
            if 'w' not in region['prot']:
                print(f"❌ Write permission denied for address {hex(addr)}")
                return
            memory_map[addr] = value
            print(f"✍️ PID {pid} wrote to mapped[{hex(addr)}] = {value}")
            return
            
    print(f"❌ Address {hex(addr)} not in memory space for PID {pid}")

def print_memory_map(pid):
    if pid not in memory_regions:
        print(f"📉 PID {pid} has no memory regions")
        return
        
    regions = memory_regions[pid]
    print(f"📋 Memory map for PID {pid}:")
    
    # Print heap information
    heap = regions['heap']
    print(f"  Heap:")
    print(f"    Start: 0x{heap['start']:08x}")
    print(f"    End: 0x{heap['end']:08x}")
    print(f"    Size: {heap['size']} bytes")
    
    # Print stack information
    stack = regions['stack']
    print(f"  Stack:")
    print(f"    Start: 0x{stack['start']:08x}")
    print(f"    End: 0x{stack['end']:08x}")
    print(f"    Size: {stack['size']} bytes")
    
    # Print mapped regions
    if regions['mmap_regions']:
        print(f"  Mapped Regions:")
        for i, region in enumerate(regions['mmap_regions']):
            print(f"    Region {i+1}:")
            print(f"      Start: 0x{region['start']:08x}")
            print(f"      End: 0x{region['end']:08x}")
            print(f"      Size: {region['size']} bytes")
            print(f"      Protection: {region['prot']}")
            print(f"      Flags: {region['flags']}")
    else:
        print("  No mapped regions")

def parse_dsl_line(line):
    tokens = line.strip().split()
    if not tokens:
        return None, {}

    cmd = tokens[0]
    args = {}
    i = 1
    while i < len(tokens):
        token = tokens[i]
        if "=" in token:
            key, value = token.split("=", 1)
            # Handle quoted values
            if value.startswith('"'):
                # Collect all parts until we find the closing quote
                value_parts = [value[1:]]  # Skip the opening quote
                i += 1
                while i < len(tokens) and not tokens[i].endswith('"'):
                    value_parts.append(tokens[i])
                    i += 1
                if i < len(tokens):
                    value_parts.append(tokens[i][:-1])  # Add the last part without the closing quote
                value = " ".join(value_parts)
            else:
                value = value.strip('"')
            args[key] = value
        i += 1
    
    return cmd, args

def cleanup_process_files(pid):
    """Clean up file descriptors and devices when a process terminates"""
    if pid in process_table:
        proc = process_table[pid]
        
        # Clean up file descriptors
        for fd, fd_entry in list(proc["file_descriptors"].items()):
            filename = fd_entry["name"]
            mode = fd_entry["mode"]
            file = file_system[filename]

            if mode == "r":
                file["readers"] = max(0, file["readers"] - 1)
            elif mode in ["w", "rw"] and file["writer"] == pid:
                file["writer"] = None

            del proc["file_descriptors"][fd]
            print(f"🔄 Closed FD {fd} for terminated process {pid}")
            
        # Clean up devices
        if pid in deviceMap:
            for device in deviceMap[pid][:]:  # Copy list to avoid modification during iteration
                deviceAvailability[device] = None
                print(f"🔄 Released device {device} from terminated process {pid}")
            del deviceMap[pid]

def handle_memory_allocate(args):
    pid = args.get("pid")
    try:
        size = int(args.get("size", 0))
    except (ValueError, TypeError):
        print(f"❌ Invalid memory size: {args.get('size')}")
        return
    
    if pid not in process_table:
        print(f"❌ Process PID {pid} does not exist.")
        return
        
    if size <= 0:
        print(f"❌ Invalid memory size: {size}")
        return
        
    # Find a free memory block
    allocated_address = None
    for addr in range(0, 2**32, size):  # 32-bit address space
        if addr not in memory_map:
            allocated_address = addr
            break
            
    if allocated_address is None:
        print(f"❌ No free memory block of size {size} found")
        return
        
    # Allocate memory
    memory_map[allocated_address] = {
        "pid": pid,
        "size": size,
        "data": bytearray(size),  # Initialize with zeros
        "type": "dynamic"  # Mark as dynamic allocation
    }
    
    # Add to process's memory allocations
    if "memory_allocations" not in process_table[pid]:
        process_table[pid]["memory_allocations"] = []
    process_table[pid]["memory_allocations"].append(allocated_address)
    
    print(f"✅ Allocated {size} bytes at address 0x{allocated_address:08x} for process {pid}")

def handle_memory_write(args):
    pid = args.get("pid")
    address = int(args.get("address", 0), 16)  # Accept hex address
    data = args.get("data", "")
    
    if pid not in process_table:
        print(f"❌ Process PID {pid} does not exist.")
        return
        
    if address not in memory_map:
        print(f"❌ Invalid memory address: 0x{address:08x}")
        return
        
    if memory_map[address]["pid"] != pid:
        print(f"❌ Process {pid} does not own memory at address 0x{address:08x}")
        return
        
    # Convert data to bytes and write to memory
    try:
        data_bytes = data.encode('utf-8')
        if len(data_bytes) > memory_map[address]["size"]:
            print(f"❌ Data size ({len(data_bytes)} bytes) exceeds allocated memory ({memory_map[address]['size']} bytes)")
            return
        memory_map[address]["data"][:len(data_bytes)] = data_bytes
        print(f"✅ Wrote {len(data_bytes)} bytes to memory at 0x{address:08x}")
    except Exception as e:
        print(f"❌ Error writing to memory: {e}")

def handle_memory_read(args):
    pid = args.get("pid")
    address = int(args.get("address", 0), 16)  # Accept hex address
    size = int(args.get("size", 0))
    
    if pid not in process_table:
        print(f"❌ Process PID {pid} does not exist.")
        return
        
    if address not in memory_map:
        print(f"❌ Invalid memory address: 0x{address:08x}")
        return
        
    if memory_map[address]["pid"] != pid:
        print(f"❌ Process {pid} does not own memory at address 0x{address:08x}")
        return
        
    if size <= 0 or size > memory_map[address]["size"]:
        print(f"❌ Invalid read size: {size}")
        return
        
    # Read from memory
    data = memory_map[address]["data"][:size]
    try:
        print(f"✅ Read from memory at 0x{address:08x}: {data.decode('utf-8')}")
    except:
        print(f"✅ Read from memory at 0x{address:08x}: {data.hex()}")

def handle_memory_free(args):
    pid = args.get("pid")
    address = int(args.get("address", 0), 16)  # Accept hex address
    
    if pid not in process_table:
        print(f"❌ Process PID {pid} does not exist.")
        return
        
    if address not in memory_map:
        print(f"❌ Invalid memory address: 0x{address:08x}")
        return
        
    if memory_map[address]["pid"] != pid:
        print(f"❌ Process {pid} does not own memory at address 0x{address:08x}")
        return
        
    # Remove from process's memory allocations
    process_table[pid]["memory_allocations"].remove(address)
    
    # Free memory
    del memory_map[address]
    print(f"✅ Freed memory at address 0x{address:08x}")

def handle_memory_map(args):
    print_memory_map(args.get("pid"))

def handle_brk(args):
    """Implement brk() system call - change heap size"""
    pid = args.get("pid")
    new_end = int(args.get("new_end", 0), 16)  # Accept hex address
    
    if pid not in process_table:
        print(f"❌ Process PID {pid} does not exist.")
        return
        
    if pid not in memory_regions:
        print(f"❌ Process {pid} has no memory regions.")
        return
        
    heap = memory_regions[pid]['heap']
    
    # Validate new end address
    if new_end < heap['start']:
        print(f"❌ Invalid brk address: new end ({hex(new_end)}) must be greater than start ({hex(heap['start'])})")
        return
        
    # Update heap end
    old_end = heap['end']
    heap['end'] = new_end
    heap['size'] = new_end - heap['start']
    
    # Update memory map
    if new_end > old_end:
        # Growing heap
        for addr in range(old_end, new_end):
            memory_map[addr] = pid
    else:
        # Shrinking heap
        for addr in range(new_end, old_end):
            if addr in memory_map:
                del memory_map[addr]
                
    print(f"✅ Changed heap end for PID {pid} from {hex(old_end)} to {hex(new_end)}")

def handle_mmap(args):
    """Implement mmap() system call - map memory region"""
    pid = args.get("pid")
    size = int(args.get("size", PAGE_SIZE))
    prot = args.get("prot", "rw")  # Protection: r, w, x combinations
    flags = args.get("flags", "private")  # MAP_PRIVATE or MAP_SHARED
    
    if pid not in process_table:
        print(f"❌ Process PID {pid} does not exist.")
        return
        
    # Align size to page boundary
    size = (size + PAGE_SIZE - 1) & ~(PAGE_SIZE - 1)
    
    # Find free memory region
    allocated_address = None
    for addr in range(HEAP_START, STACK_START - size, PAGE_SIZE):
        region_free = True
        for a in range(addr, addr + size):
            if a in memory_map:
                region_free = False
                break
        if region_free:
            allocated_address = addr
            break
            
    if allocated_address is None:
        print(f"❌ No free memory region of size {size} found")
        return
        
    # Create memory region
    region = {
        'start': allocated_address,
        'end': allocated_address + size,
        'size': size,
        'prot': prot,
        'flags': flags
    }
    
    # Add to process's mmap regions
    if 'mmap_regions' not in memory_regions[pid]:
        memory_regions[pid]['mmap_regions'] = []
    memory_regions[pid]['mmap_regions'].append(region)
    
    # Update memory map
    for addr in range(allocated_address, allocated_address + size):
        memory_map[addr] = pid
        
    print(f"✅ Mapped {size} bytes at {hex(allocated_address)} for PID {pid}")
    print(f"  Protection: {prot}, Flags: {flags}")

def handle_munmap(args):
    """Implement munmap() system call - unmap memory region"""
    pid = args.get("pid")
    address = int(args.get("address", 0), 16)  # Accept hex address
    size = int(args.get("size", PAGE_SIZE))
    
    if pid not in process_table:
        print(f"❌ Process PID {pid} does not exist.")
        return
        
    if pid not in memory_regions or 'mmap_regions' not in memory_regions[pid]:
        print(f"❌ Process {pid} has no mapped regions.")
        return
        
    # Find the region
    region = None
    for r in memory_regions[pid]['mmap_regions']:
        if r['start'] == address:
            region = r
            break
            
    if region is None:
        print(f"❌ No mapped region found at address {hex(address)}")
        return
        
    # Remove from memory map
    for addr in range(address, address + size):
        if addr in memory_map:
            del memory_map[addr]
            
    # Remove from process's mmap regions
    memory_regions[pid]['mmap_regions'].remove(region)
    
    print(f"✅ Unmapped {size} bytes at {hex(address)} for PID {pid}")

def handle_stack_push(args):
    """Push value onto process stack"""
    pid = args.get("pid")
    value = args.get("value")
    
    if pid not in process_table:
        print(f"❌ Process PID {pid} does not exist.")
        return
        
    if pid not in memory_regions:
        print(f"❌ Process {pid} has no memory regions.")
        return
        
    stack = memory_regions[pid]['stack']
    
    # Check stack overflow
    if stack['end'] - 8 < stack['start']:  # 8 bytes for a value
        print(f"❌ Stack overflow for PID {pid}")
        return
        
    # Push value (simplified - just store the value)
    stack['end'] -= 8
    memory_map[stack['end']] = pid
    print(f"✅ Pushed value {value} onto stack for PID {pid}")
    print(f"  Stack pointer: {hex(stack['end'])}")

def handle_stack_pop(args):
    """Pop value from process stack"""
    pid = args.get("pid")
    
    if pid not in process_table:
        print(f"❌ Process PID {pid} does not exist.")
        return
        
    if pid not in memory_regions:
        print(f"❌ Process {pid} has no memory regions.")
        return
        
    stack = memory_regions[pid]['stack']
    
    # Check stack underflow
    if stack['end'] >= stack['start'] + STACK_SIZE:
        print(f"❌ Stack underflow for PID {pid}")
        return
        
    # Pop value (simplified - just remove the value)
    if stack['end'] in memory_map:
        del memory_map[stack['end']]
    stack['end'] += 8
    print(f"✅ Popped value from stack for PID {pid}")
    print(f"  Stack pointer: {hex(stack['end'])}")

def handle_attach_device(args):
    """Attach a device to a process"""
    pid = args.get("pid")
    device = args.get("device")
    
    if pid not in process_table:
        print(f"❌ Process PID {pid} does not exist.")
        return
        
    if device not in AVAILABLE_DEVICES:
        print(f"❌ Unknown device: {device}")
        return
        
    if deviceAvailability[device] is not None:
        print(f"❌ Device {device} is already attached to PID {deviceAvailability[device]}")
        return
        
    # Initialize device list for process if needed
    if pid not in deviceMap:
        deviceMap[pid] = []
        
    # Attach device
    deviceAvailability[device] = pid
    deviceMap[pid].append(device)
    print(f"✅ Attached device {device} to PID {pid}")

def handle_release_device(args):
    """Release a device from a process"""
    pid = args.get("pid")
    device = args.get("device")
    
    if pid not in process_table:
        print(f"❌ Process PID {pid} does not exist.")
        return
        
    if device not in AVAILABLE_DEVICES:
        print(f"❌ Unknown device: {device}")
        return
        
    if deviceAvailability[device] != pid:
        print(f"❌ Device {device} is not attached to PID {pid}")
        return
        
    # Release device
    deviceAvailability[device] = None
    deviceMap[pid].remove(device)
    print(f"✅ Released device {device} from PID {pid}")

def handle_read_device(args):
    """Simulate reading from a device"""
    pid = args.get("pid")
    device = args.get("device")
    
    if pid not in process_table:
        print(f"❌ Process PID {pid} does not exist.")
        return
        
    if device not in AVAILABLE_DEVICES:
        print(f"❌ Unknown device: {device}")
        return
        
    if deviceAvailability[device] != pid:
        print(f"❌ Device {device} is not attached to PID {pid}")
        return
        
    print(f"📥 PID {pid} reading from {device}...")
    # Simulate device-specific behavior
    if device == 'keyboard':
        print("  Simulating keyboard input...")
    elif device == 'scanner':
        print("  Simulating document scanning...")
    elif device == 'disk':
        print("  Simulating disk read operation...")
    elif device == 'printer':
        print("  Simulating printer status check...")

def handle_write_device(args):
    """Simulate writing to a device"""
    pid = args.get("pid")
    device = args.get("device")
    data = args.get("data", "")
    
    if pid not in process_table:
        print(f"❌ Process PID {pid} does not exist.")
        return
        
    if device not in AVAILABLE_DEVICES:
        print(f"❌ Unknown device: {device}")
        return
        
    if deviceAvailability[device] != pid:
        print(f"❌ Device {device} is not attached to PID {pid}")
        return
        
    print(f"📤 PID {pid} writing to {device}: {data}")
    # Simulate device-specific behavior
    if device == 'printer':
        print("  Simulating printing document...")
    elif device == 'disk':
        print("  Simulating disk write operation...")
    elif device == 'scanner':
        print("  Simulating scanner configuration...")
    elif device == 'keyboard':
        print("  Simulating keyboard output...")

def handle_list_devices(args):
    """List status of all devices"""
    print("📱 Device Status:")
    for device in AVAILABLE_DEVICES:
        pid = deviceAvailability[device]
        status = f"attached to PID {pid}" if pid is not None else "free"
        print(f"  {device}: {status}")

def execute_command(command, args):
    if command == "exit":
        print("👋 Goodbye!")
        exit(0)
        
    if command == "process_create":
        pid = args['pid']
        cmd = args.get('command', 'noop')
        ppid = args.get('ppid', '0')
        completion_time = args.get('completion_time')  # optional
        
        # Get parent's size if ppid exists and process exists
        parent_size = DEFAULT_PROCESS_SIZE
        if ppid != '0' and ppid in process_table:
            parent_size = process_table[ppid]['size']
            
        # Use specified size or inherit from parent
        size = int(args.get('size', parent_size))

        if pid in process_table:
            print(f"❌ Process PID {pid} already exists.")
        else:
            # Create process entry
            process_table[pid] = {
                "command": cmd,
                "status": "running",
                "start_time": time.time(),
                "ppid": ppid,
                "completion_time": completion_time,
                "file_descriptors": {},  # Initialize empty file descriptors dictionary
                "memory_allocations": [],  # Initialize empty memory allocations list
                "size": size  # Store process size
            }

            # Initialize memory regions
            memory_regions[pid] = {
                'heap': {
                    'start': HEAP_START,
                    'end': HEAP_START + size,
                    'size': size
                },
                'stack': {
                    'start': STACK_START - STACK_SIZE,
                    'end': STACK_START,
                    'size': STACK_SIZE
                },
                'mmap_regions': []
            }

            # Initialize memory map for heap and stack
            for addr in range(HEAP_START, HEAP_START + size):
                memory_map[addr] = pid
            for addr in range(STACK_START - STACK_SIZE, STACK_START):
                memory_map[addr] = pid

            # Initialize device list for process
            deviceMap[pid] = []

            print(f"✅ Created process PID {pid} with command '{cmd}' (PPID: {ppid}, Size: {size} bytes)")
            print(f"✅ Initialized heap at {hex(HEAP_START)} and stack at {hex(STACK_START)}")

            if completion_time:
                seconds = int(completion_time)
                t = threading.Thread(target=simulate_completion, args=(pid, seconds), daemon=True)
                t.start()

    elif command == "process_kill":
        pid = args['pid']
        if pid in process_table:
            # Clean up file descriptors first
            cleanup_process_files(pid)
            
            # Special case: init process
            if pid == "1":
                print("⚠️ Terminating init process. All descendants will also be terminated.")
                descendants = get_all_descendants("1")
                for child_pid in descendants:
                    if child_pid in process_table and process_table[child_pid]["status"] == "running":
                        cleanup_process_files(child_pid)
                        process_table[child_pid]["status"] = "terminated"
                        print(f"💀 Terminated descendant PID {child_pid} of init.")

            # Reparent running children (if not init)
            if pid != "1":
                for child_pid, proc in process_table.items():
                    if proc.get("ppid") == pid and proc["status"] == "running":
                        proc["ppid"] = "1"  # Reparent to PID 1 (init)
                        print(f"👶 Child PID {child_pid} is now reparented to PID 1 (init).")


            # Finally kill the target process
            process_table[pid]["status"] = "terminated"
            print(f"💀 PID {pid} has been forcefully terminated.")

    elif command == "process_status":
        pid = args['pid']
        if pid in process_table:
            status = process_table[pid]['status']
            print(f"Status of PID {pid}: {status}")
        else:
            print(f"⚠️ Process PID {pid} not found.")

    elif command == "process_list":
        if not process_table:
            print("📭 No processes.")
        for pid, info in process_table.items():
            print(f"PID {pid} → {info['command']} | Status: {info['status']}")

    elif command == "sleep":
        seconds = int(args.get('seconds', 1))
        print(f"⏳ Sleeping for {seconds} seconds...")
        time.sleep(seconds)

    elif command == "process_tree":
        print_process_tree()

    elif command == "file_create":
        handle_file_create(args)
    elif command == "file_open":
        handle_file_open(args)
    elif command == "file_write":
        handle_file_write(args)
    elif command == "file_close":
        handle_file_close(args)
    elif command == "file_read":
        handle_file_read(args)
    elif command == "file_delete":
        handle_file_delete(args)
    elif command == "file_stat":
        handle_file_stat(args)
    elif command == "file_seek":
        handle_file_seek(args)

    elif command == "memory_allocate":
        handle_memory_allocate(args)
    elif command == "memory_write":
        handle_memory_write(args)
    elif command == "memory_read":
        handle_memory_read(args)
    elif command == "memory_free":
        handle_memory_free(args)
    elif command == "memory_map":
        handle_memory_map(args)

    elif command == "brk":
        handle_brk(args)
    elif command == "mmap":
        handle_mmap(args)
    elif command == "munmap":
        handle_munmap(args)
    elif command == "stack_push":
        handle_stack_push(args)
    elif command == "stack_pop":
        handle_stack_pop(args)

    elif command == "attach_device":
        handle_attach_device(args)
    elif command == "release_device":
        handle_release_device(args)
    elif command == "read_device":
        handle_read_device(args)
    elif command == "write_device":
        handle_write_device(args)
    elif command == "list_devices":
        handle_list_devices(args)

    else:
        print(f"❓ Unknown command: {command}")

# 🔁 Main loop
def interactive_shell():
    print("💻 OS Simulator Shell (type 'exit' to quit)")
    while True:
        line = input("> ").strip()
        if not line:
            continue  # Skip empty lines

        try:
            cmd, args = parse_dsl_line(line)
        except Exception as e:
            print(f"❌ DSL Parsing Error: {e}")
            continue

        if cmd is None:
            continue

        try:
            execute_command(cmd, args)
        except Exception as e:
            print(f"❌ Execution Error: {e}")


# Run the interactive shell
interactive_shell()

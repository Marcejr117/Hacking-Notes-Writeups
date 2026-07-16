https://github.com/rasta-mouse/ThreatCheck

it identifies the specific byte sequences in a file that trigger detection by Microsoft Defender, AMSI (Antivirus Scan Interface), or other AV engines—essential for payload development and AV evasion in red team operations.​

## Core Purpose

It performs binary splitting analysis to pinpoint the exact "bad bytes" causing AV signatures to fire, allowing you to surgically modify or obfuscate only the problematic sections rather than blindly recompiling or obfuscating entire payloads.​​

## Key Functionalities

- **Byte-Level Detection Mapping**: Recursively splits the target file into smaller chunks and scans each segment to isolate the exact byte ranges flagged by AV engines.​
    
- **Multiple Scanning Engines**: Supports Microsoft Defender (MpCmdRun.exe), AMSI scanning, and can be extended to other AV scanners for multi-engine testing.​
    
- **Hex Dump Output**: Displays hex representation of flagged bytes, making it easier to identify strings, API calls, or signatures embedded in compiled binaries.​
    
- **File Format Support**: Analyzes PE files (EXE, DLL), PowerShell scripts, shellcode binaries, and other artifact types.​
    
- **Integration with Reverse Engineering**: Output can be cross-referenced with tools like Ghidra or IDA to locate flagged bytes in assembly code for precise patching.​
    
- **CI/CD Integration**: Can be automated in DevOps pipelines to continuously test payload detection rates during development.​
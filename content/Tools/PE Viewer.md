PE Viewer refers to specialized tools designed to analyze and dissect Portable Executable (PE) files—the native Windows executable format (EXE, DLL, SYS)—providing deep structural insights critical for malware analysis, reverse engineering, and red team operations.​

## Core Purpose

These tools parse and display the internal structure of PE files, including headers, sections, imports, exports, and resources, without executing the binary—essential for static malware analysis and understanding executable behavior before dynamic analysis.​

## Key Functionalities

- **Header Analysis**: Parse and display DOS, NT, and Optional headers, revealing architecture (x86/x64), entry points, image base, and compilation metadata.​
    
- **Section Inspection**: View PE sections (.text, .data, .rdata, .rsrc), their RVAs (Relative Virtual Addresses), sizes, raw offsets, and memory permissions—critical for identifying packed or obfuscated code.​
    
- **Import/Export Tables**: Enumerate imported DLLs and functions (IAT) and exported functions, helping detect API usage patterns and hooking targets.​
    
- **Resource Viewer/Editor**: Extract and modify embedded resources like icons, dialogs, version info, and hidden data often used for payload storage.​
    
- **Packer Detection**: Identify known packers (UPX, PECompact, Themida, etc.) by signature, guiding unpacking strategies.​
    
- **Dependency Scanning**: Map DLL dependencies to understand runtime requirements and potential DLL hijacking vectors.​
    
- **Hex Editor & Disassembler**: Some variants (PE Explorer, CFF Explorer) include integrated hex editing and basic disassembly for quick inspection and patching.​
    
- **Address Conversion**: Convert between file offsets, RVAs, and virtual addresses—essential for debugging and shellcode analysis.​
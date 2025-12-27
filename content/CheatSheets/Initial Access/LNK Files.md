# Using LNK to execute .hta 
- We can use LNK file in order to execute PowerShell and then download and load a `.hta` that download the ReverShell

- The LNK → PowerShell → HTA → Payload kill chain uses this intermediate approach for tactical evasion reasons, not technical necessity:

**Evasion through legitimate binaries**

- `mshta.exe` is a Microsoft-signed binary present on all Windows systems
- EDRs have more difficulty blocking legitimate system processes than PowerShell executing shellcode directly
- Frequently allowed by application whitelisting and legacy security controls

**Attack chain segmentation**

- Splits execution into multiple phases that hinder correlation by SOC teams
- If PowerShell downloading a file is detected, it may not correlate with subsequent `mshta.exe` execution
- Especially effective with time intervals between phases

**PowerShell restrictions bypass**

- Evades Execution Policy, Constrained Language Mode and other restrictive policies
- HTA executes VBScript/JScript in a different context than PowerShell
- Same security restrictions don't apply

**Specific signature evasion**

- Detection rules look for specific PowerShell patterns: `Invoke-Expression`, direct network connections, in-memory shellcode
- By delegating the final payload to HTA, these signatures don't trigger because malicious code runs under `mshta.exe`

**Forensic evidence reduction**

- Script block logs and AMSI capture initial download, but not the payload if encoded within the HTA
- Fragments forensic evidence and complicates full attack reconstruction

**Tactical variation**

- Executing reverse shell directly from PowerShell is extremely burned
- Detected by virtually all modern EDRs
- Indirect chain evades simple rules that only look for "PowerShell establishes network connection"

**Payload flexibility**

- HTAs can contain VBScript, JScript or embedded malicious content
- Enables obfuscation and packing techniques harder to detect statically
- `mshta.exe` automatically parses multiple formats


# WikiLinks
- https://docs.redteamleaders.com/offensive-security/initial-access/weaponized-lnk-files-for-initial-access-and-delivery
- https://unit42.paloaltonetworks.com/lnk-malware/
- https://www.trendmicro.com/en_us/research/17/e/rising-trend-attackers-using-lnk-files-download-malware.html
- 
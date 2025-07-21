https://github.com/zan8in/afrog

## What is it for?

**afrog** is a high-performance vulnerability scanner designed for security testing, bug bounty, pentesting, and red teaming. It detects known vulnerabilities (CVE, CNVD, default passwords, information leaks, unauthorized access, command execution, etc.) using customizable Proof of Concepts (PoCs) and generates detailed HTML reports.

## Installation

### Prerequisites
- Go 1.19 or higher

### Quick installation (binary)
1. Download the latest binary from:
   https://github.com/zan8in/afrog/releases/latest
2. Unzip and give execution permissions:
   ```bash
   chmod +x afrog
   ./afrog -h
   ```

### Install from source
```bash
git clone https://github.com/zan8in/afrog.git
cd afrog
go build cmd/afrog/main.go
./afrog -h
```

### Install with Go
```bash
go install -v github.com/zan8in/afrog/v3/cmd/afrog@latest
```

## Basic usage

Scan a single target:
```bash
afrog -t https://example.com
```

Scan multiple URLs:
```bash
afrog -T urls.txt
```

Scan using custom PoCs:
```bash
afrog -t https://example.com -P my_pocs_folder/
```

Filter by keyword in PoCs:
```bash
afrog -t https://example.com -s weblogic,jboss
```

Filter by severity:
```bash
afrog -t https://example.com -S high,critical
```

Generate JSON report:
```bash
afrog -t https://example.com -json result.json
```

## Usage examples

1. Scan a site and generate an HTML report:
   ```bash
   afrog -t https://victim.com
   ```
   The report is automatically saved in the current folder.

2. Scan several sites from a file:
   ```bash
   afrog -T targets.txt
   ```

3. Use web mode to view results in your browser:
   ```bash
   afrog -web
   # Then open http://localhost:16868 in your browser
   ```

## Notes
- The first use creates the configuration file `afrog-config.yaml` in `~/.config/afrog/`.
- For PoCs that require interaction with external services (like ceye.io), configure the keys in the YAML file.
- **Legal use:** Only use on your own systems or with explicit authorization.
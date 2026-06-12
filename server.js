const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve the static frontend files
app.use(express.static(path.join(__dirname, '.')));

app.post('/api/command', (req, res) => {
    const text = req.body.text.toLowerCase().trim();
    let responseText = '';
    let isError = false;

    // Safety function to execute commands and return a promise
    const runCommand = (command) => {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Execution Error: ${error}`);
                    reject(stderr || error.message);
                } else {
                    resolve(stdout);
                }
            });
        });
    };

    // Intent Engine - Match user text to OS commands
    try {
        if (text.startsWith('open ') || text.startsWith('launch ')) {
            const appName = text.replace(/^(open|launch)\s+/i, '');
            // For safety, only allow alphanumeric app names to prevent command injection
            if (/^[a-z0-9\s]+$/i.test(appName)) {
                // Windows uses 'start' to launch applications
                runCommand(`start ${appName}`);
                responseText = `Opening ${appName}...`;
            } else {
                responseText = `Invalid application name format.`;
                isError = true;
            }
        } 
        else if (text.startsWith('search ')) {
            const query = text.replace(/^search\s+/i, '');
            runCommand(`start https://www.google.com/search?q=${encodeURIComponent(query)}`);
            responseText = `Searching the web for "${query}"...`;
        }
        else if (text.includes('system info') || text.includes('system troubleshooting')) {
            // We return this asynchronously, but for simplicity we'll just say we are grabbing it
            runCommand(`systeminfo`).then(output => {
                console.log("System info gathered.");
            });
            responseText = `Running system diagnostic... Check backend console for full output.`;
        }
        else if (text.includes('network stats') || text.includes('netstat')) {
            runCommand(`netstat -ano`).then(output => {
                console.log("Network stats gathered.");
            });
            responseText = `Checking active network connections...`;
        }
        else if (text.includes('open file explorer') || text.includes('organize folders')) {
            runCommand(`explorer .`);
            responseText = `Opening File Explorer in the current directory.`;
        }
        else if (text === 'ping google') {
            runCommand(`ping google.com`);
            responseText = `Pinging google.com in the background.`;
        }
        else if (text.startsWith('time') || text.startsWith('date')) {
            responseText = `The current system time is ${new Date().toLocaleString()}.`;
        }
        else {
            // Fallback
            responseText = `I’m sorry, I couldn't map that to an OS-level command. Try saying "open calculator" or "search cats".`;
        }

        res.json({ success: !isError, text: responseText });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, text: `Failed to execute: ${err.message}` });
    }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, '127.0.0.1', () => {
    console.log(`Iris AI Smart Backend running on http://127.0.0.1:${PORT}`);
});

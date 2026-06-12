// app/actions.js
/**
 * Simple keyword‑based intent resolver for the browser‑only Iris AI.
 * Returns a string that will be displayed as the bot reply.
 */
export function resolveIntent(text) {
    const originalText = text;
    text = text.toLowerCase().trim();

    return new Promise(async (resolve) => {
        // Try simple built-in intents first (math, copying)
        if (text.startsWith("calculate ") || text.startsWith("math ")) {
            try {
                let expression = text.replace(/^(calculate|math)\s+/i, '');
                let result = eval(expression);
                resolve(`The result of ${expression} is **${result}**.`);
            } catch (e) {
                resolve(`Sorry, I couldn't calculate that. Please provide a valid mathematical expression.`);
            }
            return;
        }

        if (text.includes("copy ")) {
            resolve(`Here is the text you wanted to copy: \n\n\`\`\`\n${originalText}\n\`\`\`\n\nYou can click the copy icon next to this message.`);
            return;
        }

        // For all other intents (open apps, files, system commands, etc.), send to Smart Backend
        try {
            // Send the request to the local Node.js server
            const response = await fetch('/api/command', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: originalText })
            });

            if (!response.ok) {
                throw new Error("Backend server error");
            }

            const data = await response.json();
            resolve(data.text);
        } catch (error) {
            console.error("Backend error:", error);
            // Fallback if the backend is somehow not running or reachable
            resolve(`⚠️ **Smart Backend Unreachable.** I could not execute the command because the Node.js backend is not responding. Ensure \`server.js\` is running.`);
        }
    });
}

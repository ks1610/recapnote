document.getElementById('summarizeBtn').addEventListener('click', async () => {
    const resultDiv = document.getElementById('result');
    const copyBtn = document.getElementById('copyBtn');
    
    resultDiv.textContent = "Scanning messages...";
    resultDiv.className = "loading";
    copyBtn.style.display = "none"; 

    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: scrapeMessages,
    }, async (results) => {
        if (results && results[0] && results[0].result) {
            const chatData = results[0].result;
            
            if (!chatData.content || chatData.content.length < 5) {
                resultDiv.textContent = "No new chat content found within the time frame.";
                resultDiv.classList.remove("loading");
                return;
            }

            console.log("Data received:", chatData); 

            try {
                const summary = await callGeminiAPI(chatData.content);
                
                resultDiv.textContent = summary;
                resultDiv.classList.remove("loading");
                
                copyBtn.style.display = "block"; 
                copyBtn.textContent = "Copy Result"; 

            } catch (error) {
                resultDiv.textContent = "Error: " + error.message;
                resultDiv.classList.remove("loading");
            }
        } else {
            resultDiv.textContent = "Cannot retrieve chat data.";
            resultDiv.classList.remove("loading");
        }
    });
});

document.getElementById('copyBtn').addEventListener('click', () => {
    const textToCopy = document.getElementById('result').textContent;
    const copyBtn = document.getElementById('copyBtn');

    navigator.clipboard.writeText(textToCopy).then(() => {
        copyBtn.textContent = "Copied! ✓";
        setTimeout(() => {
            copyBtn.textContent = "Copy Result";
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        copyBtn.textContent = "Error Copying";
    });
});


// === CÁC HÀM CŨ GIỮ NGUYÊN ===

function scrapeMessages() {
    const TIME_LIMIT_MINUTES = 195; 
    const NOW = new Date();

    const allBlocks = document.querySelectorAll('.cc-message-bubble');

    if (!allBlocks || allBlocks.length === 0) {
        return { content: document.body.innerText.slice(-5000) }; 
    }

    let extractedMessages = [];
    let stopReason = "";

    for (let i = allBlocks.length - 1; i >= 0; i--) {
        const block = allBlocks[i];
        const text = block.innerText.trim();
        
        const isNote = block.classList.contains('cc-message-type-note') || text.includes("left this private note");
        const recapRegex = /(?:^|\n|:)recap(?:$|\s|:|\n)/i;

        if (isNote && recapRegex.test(text)) {
            stopReason = "Found Recap Note";
            break; 
        }
        try {
            const timeElement = block.querySelector('.cc-message-time, .c-message__time'); 
            if (timeElement) {
                const timeText = timeElement.innerText.trim(); 
                const msgDate = parseCrispTime(timeText); 
                
                if (msgDate) {
                    const diffMinutes = (NOW - msgDate) / 1000 / 60;
                    if (diffMinutes > TIME_LIMIT_MINUTES) {
                        stopReason = "Time Limit Exceeded";
                        break; 
                    }
                }
            }
        } catch (e) {
            console.log("Date parse error", e);
        }

        let sender = "System/Note: ";
        if (block.classList.contains('cc-message-from-visitor')) {
            sender = "Customer: ";
        } else if (block.classList.contains('cc-message-from-operator')) {
            sender = "Frontline (Me): ";
        } else if (isNote) {
            sender = "Private Note: ";
        }

        extractedMessages.push(`${sender}${text}`);
    }

    extractedMessages.reverse();

    function parseCrispTime(timeString) {
        try {
            const now = new Date();
            const timeMatch = timeString.match(/(\d{1,2}):(\d{2})/);
            if (!timeMatch) return null;

            const hours = parseInt(timeMatch[1]);
            const minutes = parseInt(timeMatch[2]);
            
            const msgDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
            
            if (timeString.toLowerCase().includes('pm') && hours < 12) msgDate.setHours(hours + 12);
            if (timeString.toLowerCase().includes('am') && hours === 12) msgDate.setHours(0);

            return msgDate;
        } catch (e) {
            return null;
        }
    }

    return {
        content: extractedMessages.join("\n"),
        stopReason: stopReason
    };
}

async function callGeminiAPI(text) {
    const API_KEY = "PUT_YOUR_API_HERE"; // Dán API Key của bạn vào đây
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

    const prompt = `
        You are a Customer Support assistant. Please read the following conversation (filtered from the last recap or within the last 3 hours).

        Task:
        1. Determine what the customer requested.
        2. Determine what Frontline responded to.
        3. Determine the current status (Done or waiting for customer response).

        STRICT OUTPUT REQUIREMENTS (No additional introduction) PROVIDE RESULTS IN ENGLISH:

        Recap:
        <Brief summary of the customer's problem/request>

        Status:
        <Short Action Phrase> (IMPORTANT: Do NOT explain the details. Do NOT use "Frontline" or "I". JUST write the short action. Examples: "Explained with customer", "Sent guide", "Fixed issue", "Escalated to technical team").
        SUFFIX LOGIC (Choose one ONLY if the conversation ended with Frontline's message):
        - IF the action involves escalating to the developer team or checking with them: append ", cw for dev"
        - ELSE IF the customer has NOT replied: append ", ww for response"
        <Write a note recap as short as possible for next Operator to understand the issue.>

        ---
        Conversation content:
    ${text}
    `;

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.candidates[0].content.parts[0].text;
}
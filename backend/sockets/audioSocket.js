import { Server } from 'socket.io';

export function setupAudioSocket(io) {

    io.on('connection', async (socket) => {
        console.log('Audio socket connected:', socket.id);

        socket.on('sora', async ({ transcript }) => {
            // console.log("user said:", transcript);
            const query = transcript;
            try {
                const response = await fetch("https://hopeconnect-backend-1.onrender.com/philosophy", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ query }),
                });
                const ans = await response.json();
                const reply = ans.answer;
                // console.log("gemini said:", reply);
                io.to(socket.id).emit('sora_says', { reply });
            } catch (error) {
                console.error("Error:", error);
            }

            // io.emit('receiveMessage', { senderId, msg, username })
        });
    });

}

// module.exports = { setupAudioSocket };

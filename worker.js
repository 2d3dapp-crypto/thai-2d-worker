const axios = require('axios');
const admin = require('firebase-admin');

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();

async function runRealtimeLoop() {
    console.log("Realtime 2-Second Loop Started...");
    
    // တစ်ခါ Run ရင် ၁၄၀ မိနစ် (၂ နာရီ ၂၀ မိနစ်) ကြာအောင် loop ပတ်မည်
    const startTime = Date.now();
    const duration = 140 * 60 * 1000; 

    while (Date.now() - startTime < duration) {
        try {
            // API ခေါ်ယူခြင်း
            const res = await axios.get('https://api.thaistock2d.com/live');
            const newData = res.data;
            const docRef = db.collection('app_data').doc('live_results');
            
            // Firebase မှ လက်ရှိဒေတာကို ဖတ်ယူခြင်း
            const snap = await docRef.get();
            const oldData = snap.exists ? snap.data() : null;

            // ဒေတာအသစ်ဖြစ်မှသာ Firebase ကို Update လုပ်မည် (Write Limit သက်သာစေရန်)
            if (!oldData || oldData.live.time !== newData.live.time || oldData.live.twod !== newData.live.twod) {
                await docRef.set({
                    live: newData.live,
                    result: newData.result,
                    updated_at: new Date().toISOString()
                });
                console.log(`[${new Date().toLocaleTimeString()}] Updated: ${newData.live.twod}`);
            }
        } catch (e) {
            console.log("API Error, retrying in 2 seconds...");
        }

        // ၂ စက္ကန့် စောင့်ဆိုင်းခြင်း
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    console.log("Session Timeout - Loop Ended.");
}

runRealtimeLoop();

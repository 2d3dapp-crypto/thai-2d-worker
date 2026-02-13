const axios = require('axios');
const admin = require('firebase-admin');

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();

async function runRealtimeLoop() {
    const startTime = Date.now();
    const duration = 140 * 60 * 1000; 

    while (Date.now() - startTime < duration) {
        try {
            const res = await axios.get('https://api.thaistock2d.com/live');
            const newData = res.data;
            const docRef = db.collection('app_data').doc('live_results');
            
            const snap = await docRef.get();
            const oldData = snap.exists ? snap.data() : null;

            if (!oldData || oldData.live.time !== newData.live.time || oldData.live.twod !== newData.live.twod) {
                await docRef.set({
                    live: newData.live,
                    result: newData.result,
                    updated_at: new Date().toISOString()
                });
                console.log(`Updated: ${newData.live.twod}`);
            }
        } catch (e) {
            console.log("Error");
        }

        await new Promise(resolve => setTimeout(resolve, 3000));
    }
}

runRealtimeLoop();

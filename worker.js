const axios = require('axios');
const admin = require('firebase-admin');
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
async function run() {
  try {
    const res = await axios.get('https://api.thaistock2d.com/live');
    await db.collection('app_data').doc('live_results').set({
      live: res.data.live,
      result: res.data.result,
      updated_at: new Date().toISOString()
    });
    console.log("Success");
  } catch (e) { console.error(e); process.exit(1); }
}
run();

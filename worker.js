async function runLoop() {
  // အကြိမ် ၃၀ (ဥပမာ ၅ မိနစ်စာ) loop ပတ်ပြီး စစ်မည်
  for (let i = 0; i < 30; i++) {
    try {
      const res = await axios.get('https://api.thaistock2d.com/live');
      const newData = res.data;

      const docRef = db.collection('app_data').doc('live_results');
      const oldDoc = await docRef.get();

      // ဒေတာအသစ်ဖြစ်မှသာ Firebase ကိုပို့မည်
      if (!oldDoc.exists || oldDoc.data().live.time !== newData.live.time) {
        await docRef.set({
          live: newData.live,
          result: newData.result,
          updated_at: new Date().toISOString()
        });
        console.log("Updated at: " + newData.live.time);
      }
    } catch (e) {
      console.error("Error fetching data");
    }
    // ၁၀ စက္ကန့် စောင့်ပြီးမှ နောက်တစ်ကြိမ်ပြန်စစ်မည်
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
}
runLoop();

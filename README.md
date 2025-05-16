Imp----------

jab aap frontend (Vite, React) aur backend (e.g., Express.js) alag ports par chala rahe ho, toh dono ke beech CORS (Cross-Origin Resource Sharing) issue aa sakta hai. Isse resolve karne ke 2 main tareeke hain:

✅ Option 1: Proxy Setup (Recommended for Development)
Aap React (Vite) project me proxy laga sakte ho:

🔧 Step-by-step:
vite.config.js file me ye add karo:

js
Copy code
export default {
  server: {
    proxy: {
      '/api': 'http://localhost:5000', // <-- backend ka port
    },
  },
}
Fir frontend se request bas /api/jokes pe bhejo. Ye backend pe http://localhost:5000/api/jokes par chali jaayegi.

✅ Option 2: CORS Whitelisting in server.js (Backend side)
Agar aap frontend aur backend production ya hosted environment me chala rahe ho, toh backend me CORS allow karna zaroori hai.

Example for Express backend:

import express from 'express'
import cors from 'cors'

const app = express()

// ✅ CORS enable karo (yeh sab domains ke liye allow karega)
app.use(cors())

// ✅ Specific origin allow karna ho:
app.use(cors({
  origin: 'http://localhost:5173'  // ya jo bhi frontend ka URL ho
}))

app.get('/api/jokes', (req, res) => {
  res.json([
    { id: 1, title: 'Joke 1', content: 'Funny 1' },
    { id: 2, title: 'Joke 2', content: 'Funny 2' }
  ])
})

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000')
})
🧠 Summary:
Method	Use When
🔁 Proxy	Development me React + Backend alag port par ho
🌐 CORS	Backend hosted ho ya React backend se directly baat kare


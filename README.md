###React + Express

<h2>How to Handle CORS in React + Express (Vite + Node)</h2>

<p>When you're running your frontend (Vite + React) and backend (e.g., Express.js) on different ports during development, a CORS (Cross-Origin Resource Sharing) issue can occur.</p>

<p>There are two main ways to fix this:</p>

<h3>✅ Option 1: Proxy Setup (Recommended for Development)</h3>
<p>You can configure a proxy in your Vite React project so that API calls are automatically forwarded to the backend.</p>

<h4>🔧 Steps:</h4>
<ol>
  <li>Open your <code>vite.config.js</code> file.</li>
  <li>Add the following proxy configuration:</li>
</ol>

<pre><code>export default {
  server: {
    proxy: {
      '/api': 'http://localhost:5000', // Backend running port
    },
  },
}
</code></pre>

<p>Now, when you call <code>/api/endpoint</code> from React, it will be proxied to <code>http://localhost:5000/api/endpoint</code>.</p>

<hr>

<h3>✅ Option 2: Enable CORS on the Backend</h3>
<p>This is useful when your backend is hosted separately or you're not using a proxy in development.</p>

<h4>🔧 Example for Express.js:</h4>

<pre><code>import express from 'express';
import cors from 'cors';

const app = express();

// Enable CORS for all origins
app.use(cors());

// Or restrict to specific frontend origin
app.use(cors({
  origin: 'http://localhost:5173' // Your frontend URL
}));

app.get('/api/jokes', (req, res) => {
  res.json([
    { id: 1, title: 'Joke 1', content: 'Funny 1' },
    { id: 2, title: 'Joke 2', content: 'Funny 2' }
  ]);
});

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
</code></pre>

<hr>

<h3>🧠 Summary</h3>
<table border="1" cellpadding="6">
  <thead>
    <tr>
      <th>Method</th>
      <th>Use When</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>🔁 Proxy</td>
      <td>During development when React and backend run on separate ports</td>
    </tr>
    <tr>
      <td>🌐 CORS</td>
      <td>In production or when React directly calls a hosted backend</td>
    </tr>
  </tbody>
</table>

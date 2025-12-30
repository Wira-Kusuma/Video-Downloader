import { useState } from "react";
import "./index.css";

export default function App() {
  return (
    <>
      <Main />
      <About />
    </>
  );
}

function Main() {
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [downloadType, setDownloadType] = useState('mp4');
  const API_URL = "https://ytdlp.lunox.io";

  // Create a download job
  async function downloadYouTubeAudio(url) {
    // Step 1: Create job
    const createResponse = await fetch(`${API_URL}/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, format: downloadType }),
    });
    const { job_id } = await createResponse.json();
    console.log("Job created:", job_id);

    // Step 2: Poll for completion
    while (true) {
      const statusResponse = await fetch(`${API_URL}/status?id=${job_id}`);
      const { status, progress } = await statusResponse.json();

      console.log(`Status: ${status} (${progress}%)`);

      if (status === "finished") break;
      if (status === "error") throw new Error("Download failed");

      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2s
    }

    // Step 3: Download file
    const fileUrl = `${API_URL}/result?id=${job_id}`;
    console.log("Download ready:", fileUrl);
    return fileUrl;
  }

  // Handle form submission
  function handleSubmit(e) {
    e.preventDefault();
    if (!link.trim()) {
      setError("Please enter a valid URL");
      return;
    }
    setLoading(true);
    setError("");
    downloadYouTubeAudio(link)
      .then((url) => {
        setDownloadUrl(url);
        setLink("");
      })
      .catch((err) => {
        setError(err.message || "Download failed");
      })
      .finally(() => setLoading(false));
  }

  return (
    <main>
      <h1>Youtube video downloader</h1>
      
      <form className='add' onSubmit={handleSubmit}>
        
        <input 
        type="url" 
        value={link} 
        onChange={(e) => setLink(e.target.value)}
        disabled={loading}
        placeholder="Enter YouTube URL" />

        <button type="submit" disabled={loading}>{loading ? "Downloading..." : "Download"}</button>

      </form>
      <div className="downloadType">
        <p>current type {downloadType}</p>
        <button onClick={() => setDownloadType('mp3')}>Mp3</button>
        <button onClick={() => setDownloadType('mp4')}>Mp4</button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {downloadUrl && <p style={{ color: "green" }}>
        <a href={downloadUrl} download>Download ready! Click here</a>
      </p>}
    </main>
  );
}

function About(){
  return(
    <div className="about">
      <h2>about</h2>
      <p>this <b>youtube video downloader</b> using 
        <a href="https://ytdlp.lunox.io/"> https://ytdlp.lunox.io/ </a>
        API, see the <b>web-dlp API Documentation</b> here <a href="https://ytdlp.lunox.io/docs">https://ytdlp.lunox.io/docs</a>
      </p>
      <a href="https://github.com/Wira-Kusuma/Video-Downloader">Github contribution here!</a>
      
      
    </div>
  )
}

import {createRequire as ___nfyCreateRequire} from "module";
import {fileURLToPath as ___nfyFileURLToPath} from "url";
import {dirname as ___nfyPathDirname} from "path";
let __filename=___nfyFileURLToPath(import.meta.url);
let __dirname=___nfyPathDirname(___nfyFileURLToPath(import.meta.url));
let require=___nfyCreateRequire(import.meta.url);


// netlify/functions/chat.mjs
var chat_default = async (req, context) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders() });
  }
  const apiKey = process.env.LLM_API_KEY;
  const baseUrl = process.env.LLM_BASE_URL || "https://openrouter.ai/api/v1";
  const model = process.env.LLM_MODEL || "openai/gpt-4o-mini";
  if (!apiKey) {
    return jsonResponse({ error: "LLM_API_KEY non configur\xE9e sur Netlify" }, 500);
  }
  let body;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "JSON invalide" }, 400);
  }
  const { system, messages } = body;
  if (!Array.isArray(messages)) {
    return jsonResponse({ error: "messages doit \xEAtre un tableau" }, 400);
  }
  const payload = {
    model,
    stream: true,
    messages: [
      { role: "system", content: system || "Tu es un assistant utile." },
      ...messages
    ],
    temperature: 0.7,
    max_tokens: 2048
  };
  try {
    const upstream = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.URL || "https://ined-buddy.netlify.app",
        "X-Title": "INED Buddy"
      },
      body: JSON.stringify(payload)
    });
    if (!upstream.ok) {
      const errText = await upstream.text();
      return jsonResponse({ error: "Erreur API", details: errText }, upstream.status);
    }
    return new Response(upstream.body, {
      headers: {
        ...corsHeaders(),
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });
  } catch (e) {
    return jsonResponse({ error: e.message }, 500);
  }
};
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}
function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders(), "Content-Type": "application/json" }
  });
}
export {
  chat_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibmV0bGlmeS9mdW5jdGlvbnMvY2hhdC5tanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8vIE5ldGxpZnkgRnVuY3Rpb24gXHUyMDE0IHByb3h5IHZlcnMgdW4gbW9kXHUwMEU4bGUgT3BlbkFJLWNvbXBhdGlibGVcclxuLy8gU3VwcG9ydGUgOiBPcGVuQUksIE9wZW5Sb3V0ZXIsIEdyb3EsIERlZXBTZWVrLCBUb2dldGhlciwgZXRjLlxyXG5cclxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgKHJlcSwgY29udGV4dCkgPT4ge1xyXG4gIC8vIENPUlNcclxuICBpZiAocmVxLm1ldGhvZCA9PT0gJ09QVElPTlMnKSB7XHJcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKG51bGwsIHsgc3RhdHVzOiAyMDQsIGhlYWRlcnM6IGNvcnNIZWFkZXJzKCkgfSk7XHJcbiAgfVxyXG4gIGlmIChyZXEubWV0aG9kICE9PSAnUE9TVCcpIHtcclxuICAgIHJldHVybiBuZXcgUmVzcG9uc2UoJ01ldGhvZCBOb3QgQWxsb3dlZCcsIHsgc3RhdHVzOiA0MDUsIGhlYWRlcnM6IGNvcnNIZWFkZXJzKCkgfSk7XHJcbiAgfVxyXG5cclxuICBjb25zdCBhcGlLZXkgPSBwcm9jZXNzLmVudi5MTE1fQVBJX0tFWTtcclxuICBjb25zdCBiYXNlVXJsID0gcHJvY2Vzcy5lbnYuTExNX0JBU0VfVVJMIHx8ICdodHRwczovL29wZW5yb3V0ZXIuYWkvYXBpL3YxJztcclxuICBjb25zdCBtb2RlbCA9IHByb2Nlc3MuZW52LkxMTV9NT0RFTCB8fCAnb3BlbmFpL2dwdC00by1taW5pJztcclxuXHJcbiAgaWYgKCFhcGlLZXkpIHtcclxuICAgIHJldHVybiBqc29uUmVzcG9uc2UoeyBlcnJvcjogJ0xMTV9BUElfS0VZIG5vbiBjb25maWd1clx1MDBFOWUgc3VyIE5ldGxpZnknIH0sIDUwMCk7XHJcbiAgfVxyXG5cclxuICBsZXQgYm9keTtcclxuICB0cnkgeyBib2R5ID0gYXdhaXQgcmVxLmpzb24oKTsgfVxyXG4gIGNhdGNoIHsgcmV0dXJuIGpzb25SZXNwb25zZSh7IGVycm9yOiAnSlNPTiBpbnZhbGlkZScgfSwgNDAwKTsgfVxyXG5cclxuICBjb25zdCB7IHN5c3RlbSwgbWVzc2FnZXMgfSA9IGJvZHk7XHJcbiAgaWYgKCFBcnJheS5pc0FycmF5KG1lc3NhZ2VzKSkge1xyXG4gICAgcmV0dXJuIGpzb25SZXNwb25zZSh7IGVycm9yOiAnbWVzc2FnZXMgZG9pdCBcdTAwRUF0cmUgdW4gdGFibGVhdScgfSwgNDAwKTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHBheWxvYWQgPSB7XHJcbiAgICBtb2RlbCxcclxuICAgIHN0cmVhbTogdHJ1ZSxcclxuICAgIG1lc3NhZ2VzOiBbXHJcbiAgICAgIHsgcm9sZTogJ3N5c3RlbScsIGNvbnRlbnQ6IHN5c3RlbSB8fCAnVHUgZXMgdW4gYXNzaXN0YW50IHV0aWxlLicgfSxcclxuICAgICAgLi4ubWVzc2FnZXNcclxuICAgIF0sXHJcbiAgICB0ZW1wZXJhdHVyZTogMC43LFxyXG4gICAgbWF4X3Rva2VuczogMjA0OFxyXG4gIH07XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCB1cHN0cmVhbSA9IGF3YWl0IGZldGNoKGAke2Jhc2VVcmwucmVwbGFjZSgvXFwvJC8sICcnKX0vY2hhdC9jb21wbGV0aW9uc2AsIHtcclxuICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAgICdBdXRob3JpemF0aW9uJzogYEJlYXJlciAke2FwaUtleX1gLFxyXG4gICAgICAgICdIVFRQLVJlZmVyZXInOiBwcm9jZXNzLmVudi5VUkwgfHwgJ2h0dHBzOi8vaW5lZC1idWRkeS5uZXRsaWZ5LmFwcCcsXHJcbiAgICAgICAgJ1gtVGl0bGUnOiAnSU5FRCBCdWRkeSdcclxuICAgICAgfSxcclxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkocGF5bG9hZClcclxuICAgIH0pO1xyXG5cclxuICAgIGlmICghdXBzdHJlYW0ub2spIHtcclxuICAgICAgY29uc3QgZXJyVGV4dCA9IGF3YWl0IHVwc3RyZWFtLnRleHQoKTtcclxuICAgICAgcmV0dXJuIGpzb25SZXNwb25zZSh7IGVycm9yOiAnRXJyZXVyIEFQSScsIGRldGFpbHM6IGVyclRleHQgfSwgdXBzdHJlYW0uc3RhdHVzKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTdHJlYW1pbmcgU1NFIDogb24gcmV0cmFuc21ldCB0ZWwgcXVlbCBhdSBjbGllbnRcclxuICAgIHJldHVybiBuZXcgUmVzcG9uc2UodXBzdHJlYW0uYm9keSwge1xyXG4gICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgLi4uY29yc0hlYWRlcnMoKSxcclxuICAgICAgICAnQ29udGVudC1UeXBlJzogJ3RleHQvZXZlbnQtc3RyZWFtJyxcclxuICAgICAgICAnQ2FjaGUtQ29udHJvbCc6ICduby1jYWNoZScsXHJcbiAgICAgICAgJ0Nvbm5lY3Rpb24nOiAna2VlcC1hbGl2ZSdcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIHJldHVybiBqc29uUmVzcG9uc2UoeyBlcnJvcjogZS5tZXNzYWdlIH0sIDUwMCk7XHJcbiAgfVxyXG59O1xyXG5cclxuZnVuY3Rpb24gY29yc0hlYWRlcnMoKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXHJcbiAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6ICdQT1NULCBPUFRJT05TJyxcclxuICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogJ0NvbnRlbnQtVHlwZSdcclxuICB9O1xyXG59XHJcbmZ1bmN0aW9uIGpzb25SZXNwb25zZShvYmosIHN0YXR1cyA9IDIwMCkge1xyXG4gIHJldHVybiBuZXcgUmVzcG9uc2UoSlNPTi5zdHJpbmdpZnkob2JqKSwge1xyXG4gICAgc3RhdHVzLFxyXG4gICAgaGVhZGVyczogeyAuLi5jb3JzSGVhZGVycygpLCAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH1cclxuICB9KTtcclxufSJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7QUFHQSxJQUFPLGVBQVEsT0FBTyxLQUFLLFlBQVk7QUFFckMsTUFBSSxJQUFJLFdBQVcsV0FBVztBQUM1QixXQUFPLElBQUksU0FBUyxNQUFNLEVBQUUsUUFBUSxLQUFLLFNBQVMsWUFBWSxFQUFFLENBQUM7QUFBQSxFQUNuRTtBQUNBLE1BQUksSUFBSSxXQUFXLFFBQVE7QUFDekIsV0FBTyxJQUFJLFNBQVMsc0JBQXNCLEVBQUUsUUFBUSxLQUFLLFNBQVMsWUFBWSxFQUFFLENBQUM7QUFBQSxFQUNuRjtBQUVBLFFBQU0sU0FBUyxRQUFRLElBQUk7QUFDM0IsUUFBTSxVQUFVLFFBQVEsSUFBSSxnQkFBZ0I7QUFDNUMsUUFBTSxRQUFRLFFBQVEsSUFBSSxhQUFhO0FBRXZDLE1BQUksQ0FBQyxRQUFRO0FBQ1gsV0FBTyxhQUFhLEVBQUUsT0FBTyw0Q0FBeUMsR0FBRyxHQUFHO0FBQUEsRUFDOUU7QUFFQSxNQUFJO0FBQ0osTUFBSTtBQUFFLFdBQU8sTUFBTSxJQUFJLEtBQUs7QUFBQSxFQUFHLFFBQ3pCO0FBQUUsV0FBTyxhQUFhLEVBQUUsT0FBTyxnQkFBZ0IsR0FBRyxHQUFHO0FBQUEsRUFBRztBQUU5RCxRQUFNLEVBQUUsUUFBUSxTQUFTLElBQUk7QUFDN0IsTUFBSSxDQUFDLE1BQU0sUUFBUSxRQUFRLEdBQUc7QUFDNUIsV0FBTyxhQUFhLEVBQUUsT0FBTyxtQ0FBZ0MsR0FBRyxHQUFHO0FBQUEsRUFDckU7QUFFQSxRQUFNLFVBQVU7QUFBQSxJQUNkO0FBQUEsSUFDQSxRQUFRO0FBQUEsSUFDUixVQUFVO0FBQUEsTUFDUixFQUFFLE1BQU0sVUFBVSxTQUFTLFVBQVUsNEJBQTRCO0FBQUEsTUFDakUsR0FBRztBQUFBLElBQ0w7QUFBQSxJQUNBLGFBQWE7QUFBQSxJQUNiLFlBQVk7QUFBQSxFQUNkO0FBRUEsTUFBSTtBQUNGLFVBQU0sV0FBVyxNQUFNLE1BQU0sR0FBRyxRQUFRLFFBQVEsT0FBTyxFQUFFLENBQUMscUJBQXFCO0FBQUEsTUFDN0UsUUFBUTtBQUFBLE1BQ1IsU0FBUztBQUFBLFFBQ1AsZ0JBQWdCO0FBQUEsUUFDaEIsaUJBQWlCLFVBQVUsTUFBTTtBQUFBLFFBQ2pDLGdCQUFnQixRQUFRLElBQUksT0FBTztBQUFBLFFBQ25DLFdBQVc7QUFBQSxNQUNiO0FBQUEsTUFDQSxNQUFNLEtBQUssVUFBVSxPQUFPO0FBQUEsSUFDOUIsQ0FBQztBQUVELFFBQUksQ0FBQyxTQUFTLElBQUk7QUFDaEIsWUFBTSxVQUFVLE1BQU0sU0FBUyxLQUFLO0FBQ3BDLGFBQU8sYUFBYSxFQUFFLE9BQU8sY0FBYyxTQUFTLFFBQVEsR0FBRyxTQUFTLE1BQU07QUFBQSxJQUNoRjtBQUdBLFdBQU8sSUFBSSxTQUFTLFNBQVMsTUFBTTtBQUFBLE1BQ2pDLFNBQVM7QUFBQSxRQUNQLEdBQUcsWUFBWTtBQUFBLFFBQ2YsZ0JBQWdCO0FBQUEsUUFDaEIsaUJBQWlCO0FBQUEsUUFDakIsY0FBYztBQUFBLE1BQ2hCO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFFSCxTQUFTLEdBQUc7QUFDVixXQUFPLGFBQWEsRUFBRSxPQUFPLEVBQUUsUUFBUSxHQUFHLEdBQUc7QUFBQSxFQUMvQztBQUNGO0FBRUEsU0FBUyxjQUFjO0FBQ3JCLFNBQU87QUFBQSxJQUNMLCtCQUErQjtBQUFBLElBQy9CLGdDQUFnQztBQUFBLElBQ2hDLGdDQUFnQztBQUFBLEVBQ2xDO0FBQ0Y7QUFDQSxTQUFTLGFBQWEsS0FBSyxTQUFTLEtBQUs7QUFDdkMsU0FBTyxJQUFJLFNBQVMsS0FBSyxVQUFVLEdBQUcsR0FBRztBQUFBLElBQ3ZDO0FBQUEsSUFDQSxTQUFTLEVBQUUsR0FBRyxZQUFZLEdBQUcsZ0JBQWdCLG1CQUFtQjtBQUFBLEVBQ2xFLENBQUM7QUFDSDsiLAogICJuYW1lcyI6IFtdCn0K

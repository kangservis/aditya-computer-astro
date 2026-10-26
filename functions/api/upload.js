// File: functions/api/upload.js
export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData();
    const imageFile = formData.get('image');
    
    if (!imageFile) return new Response(JSON.stringify({ error: 'Tidak ada gambar' }), { status: 400 });

    // Mengambil kunci rahasia dari Cloudflare (TIDAK ADA PUBLIC_)
    const apiKey = context.env.IMGBB_API_KEY;
    const imgbbData = new FormData();
    imgbbData.append('image', imageFile);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: imgbbData
    });

    const result = await response.json();
    return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
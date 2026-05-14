// import { NextResponse } from 'next/server';

// export async function GET() {
//   try {
//     const ipResponse = await fetch('https://api.ipify.org?format=json');
//     const ipData = await ipResponse.json();
    
//     // This logs the IP to the Render Dashboard Terminal
//     console.log("CRITICAL - Render Outbound IP is:", ipData.ip);
    
//     return NextResponse.json({ render_ip: ipData.ip });
//   } catch (error) {
//     return NextResponse.json({ error: "Failed to fetch IP" }, { status: 500 });
//   }
// }
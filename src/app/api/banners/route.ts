import { NextResponse } from 'next/server';

export async function GET() {
  const r2BaseUrl = process.env.NEXT_PUBLIC_R2_URL || 'https://example.com';
  const maxBanners = 5;
  const validBannerUrls: string[] = [];

  for (let i = 1; i <= maxBanners; i++) {
    const pngUrl = `${r2BaseUrl}/banners/${i}.png`;
    const jpgUrl = `${r2BaseUrl}/banners/${i}.jpg`;

    try {
      const pngRes = await fetch(pngUrl, { method: 'HEAD' });
      if (pngRes.ok) {
        validBannerUrls.push(pngUrl);
        continue;
      }

      const jpgRes = await fetch(jpgUrl, { method: 'HEAD' });
      if (jpgRes.ok) {
        validBannerUrls.push(jpgUrl);
      }
    } catch (error) {
      console.error(`Error checking banner ${i}:`, error);
    }
  }

  return NextResponse.json({
    banners: validBannerUrls,
    fallback: validBannerUrls.length === 0
  });
}

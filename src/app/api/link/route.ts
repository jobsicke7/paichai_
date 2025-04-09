import axios from 'axios';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        let url = searchParams.get('url');

        if (!url) {
            return new Response(
                JSON.stringify({ success: false, message: 'URL is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        if (!/^https?:\/\//i.test(url)) {
            url = `https://${url}`;
        }

        const response = await axios.get(url);
        const html = response.data;

        const title = html.match(/<title>(.*?)<\/title>/)?.[1] || 'No title';
        const description = html.match(/<meta name="description" content="(.*?)"/)?.[1] || 'No description';
        const image = html.match(/<meta property="og:image" content="(.*?)"/)?.[1] || '';

        return new Response(
            JSON.stringify({
                success: true,
                meta: {
                    title,
                    description,
                    image: { url: image },
                },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error fetching URL metadata:', error);
        return new Response(
            JSON.stringify({ success: false, message: 'Failed to fetch metadata' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

export async function POST(req: Request) {
    try {
        const { url } = await req.json();

        if (!url) {
            return new Response(
                JSON.stringify({ success: false, message: 'URL is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const response = await axios.get(url);
        const html = response.data;

        const title = html.match(/<title>(.*?)<\/title>/)?.[1] || 'No title';
        const description = html.match(/<meta name="description" content="(.*?)"/)?.[1] || 'No description';
        const image = html.match(/<meta property="og:image" content="(.*?)"/)?.[1] || '';

        return new Response(
            JSON.stringify({
                success: true,
                meta: {
                    title,
                    description,
                    image: { url: image },
                },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error fetching URL metadata:', error);
        return new Response(
            JSON.stringify({ success: false, message: 'Failed to fetch metadata' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
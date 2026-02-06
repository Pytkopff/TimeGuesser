// Farcaster Frame meta tags component
// These need to use 'property' attribute, not 'name'

const BASE_URL = "https://time-guesser-three.vercel.app";

export function FrameMetaTags() {
  return (
    <>
      <meta property="fc:frame" content="vNext" />
      <meta property="fc:frame:image" content={`${BASE_URL}/api/frame/image`} />
      <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
      <meta property="fc:frame:post_url" content={`${BASE_URL}/api/frame`} />
      <meta property="fc:frame:button:1" content="🎮 Play Now" />
      <meta property="fc:frame:button:1:action" content="link" />
      <meta property="fc:frame:button:1:target" content={BASE_URL} />
    </>
  );
}

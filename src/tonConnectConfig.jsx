import { TonConnect } from '@tonconnect/sdk';

const connector = new TonConnect({
  manifestUrl: 'https://farmbot-omega.vercel.app/tonconnect-manifest.json' // Thay đổi URL này thành URL của tệp manifest của bạn
});

export default connector;

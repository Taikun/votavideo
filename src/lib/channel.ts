const rawChannelName = process.env.NEXT_PUBLIC_CHANNEL_NAME?.trim() ?? '';
const channelHandle = rawChannelName
  ? rawChannelName.startsWith('@')
    ? rawChannelName
    : `@${rawChannelName}`
  : '';

export const channelName = channelHandle;
export const channelUrl = channelHandle ? `https://www.youtube.com/${channelHandle}` : '';

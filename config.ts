
export const CONFIG = {
  /**
   * Meta Graph API Access Token for audience signal fetching.
   * Prioritizes: Local Storage (User Set) > Environment Variable > Hardcoded Default
   */
  get META_GRAPH_ACCESS_TOKEN(): string {
    const userToken = typeof window !== 'undefined' ? localStorage.getItem('ICE_LABS_META_TOKEN') : null;
    if (userToken) return userToken;
    
    return process.env.META_ACCESS_TOKEN || "EAAVup11nvm4BQkjA4Dc75FdYzgHMZB3vcxHGq01GgTmTAxNdkfIowoZBqtG9lIMENMxysIOIZAu9mDbKLJCJP9TsWtZCuADoqh5fi0xCuu2hVBI10vfjK6jEaZAk7JBcPsrAQBGz5HqWbvhR4reeah9d671pGiVBwFtyMgfLalw8IFBC6QAxyUNZACZA3htiuZAm9ZA1unQ8C3hKVbJncRGASN9L0Im7j3F87bDjcU1R5moM3LXZCdjwAWJaRW1R5F7C0xhx8bZC1WIB5XkbDeLUbfPnWRdPl21YinvlmgKI7SpDzNgOPZCZCCD00wz1v9nyLtN0R32l9FfZC0g2ZCq0slPH7qTab3QgQZDZD";
  }
};

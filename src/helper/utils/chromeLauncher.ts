import * as karmaChromeLauncher from 'karma-chrome-launcher';

type LauncherKeys = 'launcher:Chrome' | 'launcher:ChromeCanary' | 'launcher:Chromium';
type DefaultCmd = { [key: string]: string | undefined };

const launchers: { [key: string]: string | null } = {};

for (const end of ['hrome', 'hromeCanary', 'hromium']) {
  // Use a type assertion to tell TypeScript that these properties exist
  const key = `launcher:C${end}` as keyof typeof karmaChromeLauncher;
  const launcher = (karmaChromeLauncher as any)[key];
  if (launcher && launcher[1] && launcher[1].prototype && launcher[1].prototype.DEFAULT_CMD) {
    const defaultCmd: DefaultCmd = launcher[1].prototype.DEFAULT_CMD;
    launchers[`c${end}`] = defaultCmd[process.platform] || null;
  }
}

export default launchers;
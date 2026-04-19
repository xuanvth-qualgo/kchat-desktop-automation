import { execSync, spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface UserInfo {
  uid: string;
  userPath: string;
}

interface AppInfo {
  appPath: string;
  sessionPath: string;
}

export class AppLauncher {
  private static readonly USER_DIR = '/Users';

  // 1. Get users to launch App
  static getUserInfo(username: string): UserInfo | null {
    try {
      const uid = execSync(`id -u ${username}`).toString().trim();
      const userPath = path.join(/*this.USER_DIR*/ username);
      console.log('Existing user info:', uid, userPath);
      return { uid, userPath };
    } catch {
      return null;
    }
  }

  // 2. Get App path and session path for the user
  static getAppInfo(userPath: string, appName: string): AppInfo | null {
    const appPath = path.join(userPath, 'Applications', `${appName}.app`, 'Contents', 'MacOS', appName);
    const sessionPath = path.join(userPath, 'Library', 'Application Support', appName, 'dev');
    if (fs.existsSync(appPath)) {
      console.log('Existing app info:', appPath, sessionPath);
      return { appPath, sessionPath };
    } else {
      console.log('App path does not exist:', appPath);
    }
    return null;
  }

 
}
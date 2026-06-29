# 0. User Guide Video
Link: [https://qualgotechnologies-my.sharepoint.com/my?id=%2Fpersonal%2Fxuan%5Fvth%5Fqualgo%5Fnet%2FDocuments%2FKChat%20Desktop%20Automation](https://qualgotechnologies-my.sharepoint.com/:f:/g/personal/xuan_vth_qualgo_net/IgABZCIlmQkPQ5y9KFGV79NMAT2mR9SS4Vy7Tme-5G7Agk8?e=H6JRT0)

> clip 1: clone repo

> clip 2: setup libs

> clip 3: setup app

> clip 4: first login

> clip 5: run test
> 
# 1. IDE Tool

* VS Code (recommend to fast debug)

* Windsurf (recommend to auto complete code suggestion)

# 2. Clone repo:

> Open project folder in IDE tool

    git clone "https://github.com/xuanvth-qualgo/kchat-desktop-automation.git" && cd kchat-desktop-automation

    git fetch --all

    git checkout -b phase-1 origin/phase-1

    git add -A (all or select specific files)

    git commit -m "{datetime} - {jira id} - {summary}"

    git push origin phase-1

    git status

# 3. Install app:

> Download the lastest app at KChat-Desktop GitHub repo

* macOS: copy-paste 'KChat QA.app' file to folder 'Applications/macOS'

* Windows: copy-paste 'KChat-QA.exe' file to folder 'Applications/win32'

# 4. Install library:

> Setup brew and NodeJS

    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

    echo >> /Users/admin/.zprofile

    echo 'eval "$(/opt/homebrew/bin/brew shellenv zsh)"' >> /Users/admin/.zprofile

    eval "$(/opt/homebrew/bin/brew shellenv zsh)"

    brew --version

    brew install node

    node -v

    npm -v

> Setup dependencies

* macOS: chmod +x ./setup.sh && ./setup.sh

* Windows: ./setup.bat

# 5. Execution: follow script keys in package.json

> Use VS Code: Run file directly via 'Click to run tests ...' (This option will run all cases and have not generated report)

> Run script by key

* At Terminal: npm run {key}

* Debug in package.json

# First login (*):

    npm run login

# Update setting (if want)

    npm run upd-setting

# All: 

    npm run all

    npm run S-all (only smoke)

# Specific module:

    npm run chat

    npm run S-chat (only smoke)

# Specific feature:

    npm run send-msg

    npm run S-send-msg (only smoke)

# Custom (if want)

    npm run all -g "@smoke"

    npm run chat -g "@smoke"

    npm run reply-msg -g "@regression"

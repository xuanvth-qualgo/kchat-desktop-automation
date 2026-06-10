# 1. Github flow

git clone "https://github.com/xuanvth-qualgo/kchat-desktop-automation.git" && cd kchat-desktop-automation

git fetch --all

git checkout -b demo-1 origin/demo-1

git add -A

git diff --staged

git reset {file}

git commit -m "{datetime} - {jira id} - {summary}"

git push origin demo-1

git status

# 2. Find IP Address (Terminal at VM)

ipconfig getifaddr en0

# 3. Setup brew and node (Terminal at Host and VM)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

echo >> /Users/admin/.zprofile
echo 'eval "$(/opt/homebrew/bin/brew shellenv zsh)"' >> /Users/admin/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv zsh)"

brew --version

brew install node

node -v
npm -v
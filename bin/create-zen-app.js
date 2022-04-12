const { execSync, exec, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

checkArgs();

const args = process.argv.slice(2);
const projectName = args[0];
const currentPath = process.cwd();
const projectPath = path.join(currentPath, projectName);
const GIT_REPO_URL = "https://github.com/fatihgozenc/create-zen-app";

main();

async function main() {
    // checkDir();
    try {
        console.log('Checking package managers...');
        const yarn = await execute("yarn --version");
        const isVersion = /^(\*|\d+(\.\d+){0,2}(\.\*)?)$/g;
        const hasYarn = yarn.match(isVersion).pop();
        const npm = await execute("npm --version");
        const hasNpm = npm.match(isVersion).pop();

        console.log('Downloading files...');
        execSync(`git clone --depth 1 ${GIT_REPO_URL} ${projectPath}`);

        process.chdir(projectPath);

        const { stdout } = execSync('yarn -version');
        const v = spawnSync("yarn -version");

        console.log('Installing dependencies...');
        execSync(hasYarn ? 'yarn' : "npm install");

        console.log(`Removing useless files`);
        //   execSync('npx rimraf ./.git');
        deleteFolderRecursive("./.git");
        fs.rmdirSync(path.join(projectPath, 'bin'), { recursive: true });

        console.log('The installation is done, this is ready to use !');

    } catch(error) {
        console.log(error);
    }
}

function deleteFolderRecursive(path) {
    var files = [];
    if(fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function (file, index) {
            var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

function checkArgs() {
    if(process.argv.length < 3) {
        console.log('You have to provide a name to your app.');
        console.log('For example :');
        console.log('    npx create-zen-app my-app');
        process.exit(1);
    }
}

function checkDir() {
    try {
        fs.mkdirSync(projectPath);
    } catch(err) {
        if(err.code === 'EEXIST') {
            console.log(`The file ${projectName} already exist in the current directory, please give it another name.`);
        } else {
            console.log(error);
        }
        process.exit(1);
    }
}

async function execute(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if(error) reject(error);
            resolve(stdout.trim());
        });
    });
};
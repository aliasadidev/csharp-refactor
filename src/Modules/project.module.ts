import glob = require('glob');

export function findProjects(fsPath: string): string[] {
  let result: string[] = [];

  let files = glob.sync(`${fsPath}/**/*.+(csproj)`, {
    ignore: ['**/node_modules/**', '**/.git/**']
  });

  files.forEach(file => {
    if (result.indexOf(file) === -1) {
      result.push(file);
    }
  });

  return result;
}

export function findCSharpFiles(fsPath: string): string[] {
  let result: string[] = [];

  let files = glob.sync(`${fsPath}/**/*.+(cs)`, {
    ignore: ['**/node_modules/**', '**/.git/**']
  });

  files.forEach(file => {
    if (result.indexOf(file) === -1) {
      result.push(file);
    }
  });

  return result;
}

export function findFirstProject(dir: string): string {
  let csproj = glob.sync(`${dir}/*.+(csproj)`);
  return csproj && csproj[0];
}
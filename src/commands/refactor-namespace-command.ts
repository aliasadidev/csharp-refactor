import * as fs from 'fs';
import * as path from 'path'
import * as vscode from 'vscode';
import { readFileContent, writeToFile } from '../Modules/file.module';
import { findCSharpFiles, findProjects, findFirstProject } from '../Modules/project.module';
import { MultiRegExp2 } from '../utilities/multi-reg-exp2';


interface NamespaceModel {
  NamespaceName: string;
  File: string;
}

export default class RefactorCommandExecutor {
  constructor() { }

  public FindNameSpace(csprojPath: string, csprojName: string, rootPath: string) {

  }

  public async execute(selectedPath: string): Promise<void> {
    selectedPath = selectedPath.split(path.sep).join(path.posix.sep);
    const lstat = fs.lstatSync(selectedPath);
    const isDir = lstat.isDirectory();
    const isFile = lstat.isFile();

    let files: NamespaceModel[] = [];

    const rootPath = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(selectedPath));


    if (isFile) {
      let fileDirName = path.dirname(selectedPath);
      let rootProjPath = findFirstProject(fileDirName);
      let isFind = false;
      let namespace: string = '';

      if (rootProjPath) {
        namespace = path.basename(rootProjPath).replace(".csproj", "");
        isFind = true;
      } else {
        let baseFileDirName = path.dirname(fileDirName);
        const rootPathLength = path.dirname(rootPath?.uri.path!).split(path.posix.sep).filter(ix => ix).length;
        const firDirNamePathLength = path.dirname(baseFileDirName).split(path.posix.sep).filter(ix => ix).length - rootPathLength;
        for (let index = 0; index <= firDirNamePathLength; index++) {
          namespace += "." + path.basename(fileDirName);
          let childProjPath = findFirstProject(baseFileDirName);
          if (childProjPath) {
            const projectName = path.basename(childProjPath).replace(".csproj", "");
            isFind = true;
            namespace = projectName + namespace;
            break;
          }
          baseFileDirName = path.dirname(baseFileDirName);
          fileDirName = path.dirname(fileDirName);
        }
      }
      if (!isFind) {
        throw (`project not found for ${selectedPath} file`);
      }
      files.push({
        File: selectedPath,
        NamespaceName: namespace,
      });

    } else if (isDir) {
      let projList = findProjects(selectedPath);
      let isFind = !!projList.length;
      for (let index = 0; index < projList.length; index++) {
        const element = projList[index];
        let rootDirPath = path.dirname(element);
        let csharpFiles = findCSharpFiles(rootDirPath);
        if (csharpFiles && csharpFiles.length) {

          csharpFiles.forEach(file => {
            let fileRootDir = path.dirname(file);
            let pathName = fileRootDir.substring(rootDirPath.length).split(path.posix.sep).filter(x => x).join('.');
            let csProjName = path.basename(element).replace(".csproj", "");
            let namespace = csProjName + (!pathName ? '' : '.' + pathName);
            files.push({
              File: file,
              NamespaceName: namespace,
            });
          });
        }
      }
      if (!isFind) {
        let rootDirPath = path.dirname(selectedPath)
        let totalDirsCount = path.dirname(rootDirPath).split(path.posix.sep).filter(ix => ix).length -
          path.dirname(rootPath?.uri.path!).split(path.posix.sep).filter(ix => ix).length;

        for (let index = 0; index <= totalDirsCount; index++) {
          let rootProjPath = findFirstProject(rootDirPath);
          if (rootProjPath) {
            let rootDirPath = path.dirname(rootProjPath);
            const projectName = path.basename(rootProjPath).replace(".csproj", "");
            let csharpFiles = findCSharpFiles(selectedPath);
            if (csharpFiles && csharpFiles.length) {
              csharpFiles.forEach(file => {
                let rootDirFileName = path.dirname(file);
                let subNamespace = rootDirFileName.substring(rootDirPath.length).split(path.posix.sep).filter(x => x).join('.');
                let namespace = projectName + '.' + subNamespace;
                files.push({
                  File: file,
                  NamespaceName: namespace,
                })
              });
              isFind = true;
            }
            break;
          }
          rootDirPath = path.dirname(rootDirPath)
        }
        if (!isFind) {
          throw (`project not found for ${selectedPath} file`);
        }
      }
    }

    update(files);
  }
}

function update(array: NamespaceModel[]) {
  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    let content = readFileContent(element.File);
    let mre = new MultiRegExp2();

    let match;

    while ((match = mre.execForGroup(content, 2)) !== null) {
      let start = content.substring(0, match?.start!);
      let end = content.substring(match?.end!);
      let newContent = start + element.NamespaceName + end;
      writeToFile(element.File, newContent);
    }

  }
}


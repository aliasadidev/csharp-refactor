import * as fs from 'fs';
import * as path from 'path'

/**
 * Reads content of a file
 * @param filePath  The file path
 * @returns The file content
 */
export function readFileContent(filePath: string): string {
  let fileContent = fs.readFileSync(filePath, 'utf8');
  return fileContent;
}
/**
 * Writes the new content to a file
 * @param filePath The file path
 * @param content The new content
 */
export function writeToFile(filePath: string, content: string): void {
  fs.writeFileSync(filePath, content);
}
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

/**
 * Function to load data from a CSV file and return an array of names.
 * @param {string} filePath - Path to the CSV file.
 * @param {string} columnName - Name of the column to extract data from.
 * @returns {Promise<string[]>} - A promise that resolves to an array of names.
 */
function loadData(filePath: string, columnName: string): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
    const results: string[] = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row: Record<string, string>) => {
        if (row[columnName]) {
          results.push(row[columnName]);
        }
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

// Define the type for the options object
interface Options {
  gpus?: string[];
  cpus?: string[];
  rams?: string[];
  resolutions?: string[];
  hdds?: string[];
}

// Function to load options from different CSV files
export const getOptions = async (): Promise<Options> => {
  const gpuFilePath = path.join(process.cwd(), './src/data/options/gpus.csv');
  const cpuFilePath = path.join(process.cwd(), './src/data/options/cpu.csv');
  const ramFilePath = path.join(process.cwd(), './src/data/options/ram.csv');
  const hddFilePath = path.join(process.cwd(), './src/data/options/hdd.csv');
  const resolutionFilePath = path.join(process.cwd(), './src/data/options/resoulations.csv');

  const options: Options = {};

  // Load GPU names
  try {
    options.gpus = await loadData(gpuFilePath, 'GPU Name');
  } catch (err) {
    console.error('Error loading GPU names:', err);
  }

  // Load CPU names
  try {
    options.cpus = await loadData(cpuFilePath, 'CPU Name');
  } catch (err) {
    console.error('Error loading CPU names:', err);
  }

  // Load RAM names
  try {
    options.rams = await loadData(ramFilePath, 'RAM Name');
  } catch (err) {
    console.error('Error loading RAM names:', err);
  }
  // Load HDD names
  try {
    options.hdds = await loadData(hddFilePath, 'HDD Name');
  } catch (err) {
    console.error('Error loading HDD names:', err);
  }

  // Load Resolution names
  try {
    options.resolutions = await loadData(resolutionFilePath, 'Resolution Name');
  } catch (err) {
    console.error('Error loading Resolution names:', err);
  }

  return options;
};

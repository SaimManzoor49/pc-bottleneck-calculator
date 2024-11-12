import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

export interface Component {
  type: string;
  model: string;
  benchmark: number;
  url: string;
}

const componentsData: Record<string, Component[]> = {
  cpu: [],
  gpu: [],
  ram: [],
};

export const loadComponentData = async () => {
  const dataFolderPath = path.join(process.cwd(), 'src/data');

  // Read all files in the 'data' folder
  const files = fs.readdirSync(dataFolderPath);

  // Filter CSV files and load them one by one
  const csvFiles = files.filter(file => file.endsWith('.csv'));

  // Process each CSV file
  for (const file of csvFiles) {
    const filePath = path.join(dataFolderPath, file);
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          const component: Component = {
            type: row.Type,
            model: row.Model,
            benchmark: parseFloat(row.Benchmark),
            url: row.URL,
          };

          switch (component.type.toLowerCase()) {
            case 'cpu':
              componentsData.cpu.push(component);
              break;
            case 'gpu':
              componentsData.gpu.push(component);
              break;
            case 'ram':
              componentsData.ram.push(component);
              break;
          }
        })
        .on('end', () => resolve())
        .on('error', (error) => reject(error));
    });
  }
};

export const getComponent = (type: string, model: string): Component | null => {
  const components = componentsData[type.toLowerCase()];
  const component = components.find(
    (c) => c.type.toLowerCase() === type.toLowerCase() && c.model.toLowerCase() === model.toLowerCase()
  );
  return component || null;
};

export const getAllComponents = (type: 'CPU' | 'GPU' | 'RAM'): Component[] => {
  return componentsData[type.toLowerCase()] || [];
};

// Function to search for components based on a search term
export const searchComponents = (type: 'CPU' | 'GPU' | 'RAM', searchText: string): Component[] => {
  const components = componentsData[type.toLowerCase()];
  const lowerSearchText = searchText.toLowerCase();

  return components.filter(
    (component) =>
      component.model.toLowerCase().includes(lowerSearchText) || 
      component.type.toLowerCase().includes(lowerSearchText)
  );
};

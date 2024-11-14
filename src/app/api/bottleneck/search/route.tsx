
import { NextRequest, NextResponse } from 'next/server';
import { loadComponentData, Component,searchComponents } from '../../../../helpers/dataLoader';


// Initialize CSV data once when the server starts
let isDataLoaded = false;
const initializeData = async () => {
  if (!isDataLoaded) {
    await loadComponentData();
    isDataLoaded = true;
  }
};

export async function GET(request: NextRequest,) {
    await initializeData();
  
    const type = request.nextUrl.searchParams.get('type')
    const searchText = request.nextUrl.searchParams.get('searchText')
    if (!type || !searchText) {
      return NextResponse.json({ error: 'Please provide a type and search text' });
    }
  
    let components: Component[] = [];
    switch (type) {
      case 'cpu':
        components = await searchComponents('CPU', searchText);
        break;
      case 'gpu':
        components = await searchComponents('GPU', searchText);
        break;
      case 'ram':
        components = await searchComponents('RAM', searchText);
        break;
      default:
        return NextResponse.json({ error: 'Invalid type. Use "cpu", "gpu", or "ram"' });
    }
  
    return NextResponse.json(components);
  }
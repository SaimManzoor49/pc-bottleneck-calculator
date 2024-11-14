import { NextRequest, NextResponse } from 'next/server';
import { getOptions } from '@/helpers/dataloaderV2';

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type');
  const searchText = request.nextUrl.searchParams.get('searchText');

  if (!type || !searchText) {
    return NextResponse.json({ error: 'Please provide a type and search text' }, { status: 400 });
  }

  // Load all options
  const options = await getOptions();

  // Select the data based on the requested type
  let data: string[] | undefined;
  switch (type.toLowerCase()) {
    case 'gpus':
      data = options.gpus;
      break;
    case 'cpus':
      data = options.cpus;
      break;
    case 'rams':
      data = options.rams;
      break;
    case 'resolutions':
      data = options.resolutions;
    case 'hdds':
      data = options.hdds;
      break;
    default:
      return NextResponse.json({ error: 'Invalid type specified' }, { status: 400 });
  }

  // Filter the data to match the search text (case-insensitive)
  const filteredResults = data?.filter((item) =>
    item.toLowerCase().includes(searchText.toLowerCase())
  ) || [];

  return NextResponse.json({ results: filteredResults });
}

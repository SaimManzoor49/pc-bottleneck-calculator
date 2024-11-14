
import { NextResponse } from 'next/server';
import { getOptions } from '../../../../helpers/dataloaderV2'


export async function GET() {

  const options = await getOptions()
  if (!options) {
    return NextResponse.json({ error: "Something went wrong while fetching options" })
  }
  options.cpus = options.cpus?.slice(0,300)
  options.gpus = options.gpus?.slice(0,300)
  options.rams = options.rams?.slice(0,300)
  options.hdds = options.hdds?.slice(0,300)
  return NextResponse.json(options);
}
"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Command, CommandItem, CommandList, CommandGroup, CommandEmpty } from '@/components/ui/command';
import { cn } from "@/lib/utils";
import { toast } from "sonner"
import { Input } from './ui/input';

interface details{
    model:string;
    benchmark:string;
    bottleneckPercentage:number
}

const BottleneckAnalyzer = () => {
  const [cpuModel, setCpuModel] = useState('');
  const [gpuModel, setGpuModel] = useState('');
  const [ramModel, setRamModel] = useState('');
  const [bottleneck, setBottleneck] = useState<string | undefined>(undefined);
  const [details, setDetails] = useState<details | undefined>(undefined);
  const [error, setError] = useState<string | undefined>('');

  const [cpus, setCpus] = useState<details[]>([]);
  const [gpus, setGpus] = useState<details[]>([]);
  const [rams, setRams] = useState<details[]>([]);

  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  const fetchComponentData = async () => {
    const response = await fetch('/api/bottleneck');
    const { cpus, gpus, rams } = await response.json();
    setCpus(cpus);
    setGpus(gpus);
    setRams(rams);
  };

  const fetchSearchResults = async (type: 'cpu' | 'gpu' | 'ram', searchText: string) => {
    const response = await fetch(`/api/bottleneck/search?type=${type}&searchText=${searchText}`);
    const data = await response.json();
    return data;
  };

  const analyzeBottleneck = async () => {
    if(!cpuModel|| !gpuModel){
        toast.error("Please select cpu and gpu")
        return 
    }
    const response = await fetch('/api/bottleneck', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cpuModel, gpuModel, ramModel }),
    });
    const data = await response.json();
    setBottleneck(data.bottleneck);
    setDetails({...data.details,bottleneckPercentage:data.bottleneckPercentage});
    setError(data?.error)
  };

  const handleSearch = (type: 'cpu' | 'gpu' | 'ram', searchText: string) => {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    setDebounceTimeout(
      setTimeout(() => {
        fetchSearchResults(type, searchText).then((data) => {
          if (type === 'cpu') {
            setCpus(data || []);
          }
          if (type === 'gpu') {
            setGpus(data || []);
          }
          if (type === 'ram') {
            setRams(data || []);
          }
        });
      }, 800) // Debounce time of 500ms
    );
  };

  useEffect(() => {
    fetchComponentData();
  }, []);

  const renderCombobox = (type: 'cpu' | 'gpu' | 'ram', data: details[], value: string, setValue: React.Dispatch<React.SetStateAction<string>>) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[100%] sm:w-[600px] justify-between">
          {value || `Select ${type?.toUpperCase()}`}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[100%] sm:w-[600px] p-0">
        <Command>
          <Input
            className=' focus:no-underline outline-none border-0'
            placeholder={`Search ${type?.toUpperCase()}`}
            onChange={(e) => handleSearch(type, e.target.value)}
          />
          <CommandList>
            <CommandEmpty>No {type} found.</CommandEmpty>
            <CommandGroup>
              {data.map((item) => (
                <CommandItem
                  key={item.model+Math.random().toString()}
                  onSelect={() => {
                    setValue(item.model);
                  }}
                >
                  {item.model}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === item.model ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );

  return (
    <Card className="w-full max-w-3xl flex justify-center items-center flex-col ">
      <CardHeader>
        <CardTitle>PC Bottleneck Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          {/* CPU Combobox */}
          <div>{renderCombobox('cpu', cpus, cpuModel, setCpuModel)}</div>

          {/* GPU Combobox */}
          <div>{renderCombobox('gpu', gpus, gpuModel, setGpuModel)}</div>

          {/* RAM Combobox */}
          <div>{renderCombobox('ram', rams, ramModel, setRamModel)}</div>
        </div>

        {/* Analyze Bottleneck Button */}
        <Button onClick={analyzeBottleneck} className="mt-4">
          Analyze Bottleneck
        </Button>
{error&&<p className='mt-2'>{error}</p>}
        {/* Bottleneck Details */}
        {bottleneck && (
         <Card className='mt-2'>
            <CardContent>
            <div className="mt-4">
            <h3 className="text-lg font-medium">Bottleneck: {bottleneck}</h3>
            {details && (
              <div>

                <p>Selceted CPU: {cpuModel}</p>
                <p>Selected GPU: {gpuModel}</p>
                <p>Bottleneck Device: {details.model}</p>
                <p>Benchmark Score of Bottleneck device: {details.benchmark}</p>
                <p>Bottleneck percentage: {details.bottleneckPercentage?.toFixed(2)}%</p>
                {/* <p>URL: {details.url}</p> */}
              </div>
            )}
          </div>
            </CardContent>
         </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default BottleneckAnalyzer;

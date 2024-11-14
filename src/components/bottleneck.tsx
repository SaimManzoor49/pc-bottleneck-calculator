"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { Command, CommandItem, CommandList, CommandGroup, CommandEmpty } from '@/components/ui/command';
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Input } from './ui/input';

interface IBottleneck{
  "cpu_bottleneck"?:string,
  "gpu_bottleneck"?: string,
  "ram_bottleneck"?: string,
  "storage_bottleneck"?: string,
  "resolution_bottleneck"?: string,
  "overall_bottleneck"?: string,
  "recommendations"?: string[]
}

const PURPOSES = ['Gaming',"Graphic Designing & 3D Modeling",'Browsing','Machine Learning','Programming','Office Work','Simulations']

const BottleneckAnalyzer = () => {
  const [cpuModel, setCpuModel] = useState('');
  const [gpuModel, setGpuModel] = useState('');
  const [ramModel, setRamModel] = useState('');
  const [purpose, setPurpose] = useState('');
  const [resolution, setResolution] = useState('');
  const [hdd, setHdd] = useState('');
  const [bottleneck, setBottleneck] = useState<IBottleneck | undefined>(undefined);
  const [error, setError] = useState<string | undefined>('');

  const [cpus, setCpus] = useState<string[]>([]);
  const [gpus, setGpus] = useState<string[]>([]);
  const [rams, setRams] = useState<string[]>([]);
  const [resolutions, setResolutions] = useState<string[]>([]);
  const [hdds, setHdds] = useState<string[]>([]);

  const [loading,setLoading] = useState(false)

  // Separate open states for each popover
  const [openStates, setOpenStates] = useState({
    cpus: false,
    gpus: false,
    rams: false,
    resolutions: false,
    hdds: false,
    purpose: false,
  });

  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  const fetchComponentData = async () => {
    const response = await fetch('/api/v2/options');
    const { cpus, gpus, rams, resolutions, hdds } = await response.json();
    setCpus(cpus);
    setGpus(gpus);
    setRams(rams);
    setResolutions(resolutions);
    setHdds(hdds);
  };

  const fetchSearchResults = async (type: 'cpus' | 'gpus' | 'rams' | 'resolutions' | 'hdds'|'purpose', searchText: string) => {
    const response = await fetch(`/api/v2/search?type=${type}&searchText=${searchText}`);
    const data = await response.json();
    return data;
  };

  const analyzeBottleneck = async () => {
    if (!cpuModel || !gpuModel||!purpose) {
      toast.error("Please select CPU, GPU and purpose.");
      return;
    }
    setLoading(true)
    const response = await fetch('/api/v2/bottleneck', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cpuModel, gpuModel, ramModel, resolution, hdd,purpose }),
    });

    const data = await response.json();
    const jsonMatch = data.results.match(/```json\n([\s\S]*?)\n```/);

    if (jsonMatch && jsonMatch[1]) {
      try {
         const jsonData = JSON.parse(jsonMatch[1]);
        console.log("Extracted JSON:", jsonData);
        setBottleneck(jsonData);
        setError(data?.error || '');
       } catch (error) {
        setLoading(false)
          console.error("Failed to parse JSON:", error);
    }
    setLoading(false)
  } else {
    console.error("No JSON block found in results");
    setLoading(false)
  }
   
  };

  const handleSearch = (type: 'cpus' | 'gpus' | 'rams' | 'resolutions' | 'hdds'|'purpose', searchText: string) => {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    setDebounceTimeout(
      setTimeout(() => {
        fetchSearchResults(type, searchText).then((data) => {
          if (type === 'cpus') setCpus(data?.results || []);
          if (type === 'gpus') setGpus(data?.results || []);
          if (type === 'rams') setRams(data?.results || []);
          if (type === 'resolutions') setResolutions(data?.results || []);
          if (type === 'hdds') setHdds(data?.results || []);
        });
      }, 800)
    );
  };

  useEffect(() => {
    fetchComponentData();
  }, []);

  const renderCombobox = (type: 'cpus' | 'gpus' | 'rams' | 'resolutions' | 'hdds'|'purpose', data: string[], value: string, label:string,setValue: React.Dispatch<React.SetStateAction<string>>) => (
    <Popover 
      open={openStates[type]} 
      onOpenChange={(open) => setOpenStates(prev => ({ ...prev, [type]: open }))}
    >
      <label htmlFor="">{label}</label>
      <br />
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[100%] sm:w-[600px] justify-between">
          {value || `Select a ${type.slice(0,type?.length-1)}`}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[100%] sm:w-[600px] p-0">
        <Command>
          <Input 
            className='focus:no-underline outline-none border-0'
            style={{display:`${type==='purpose'|| type==='resolutions'&&'none'}`}}
            placeholder={`Search for ${type.toUpperCase()}`}
            onChange={(e) => handleSearch(type, e.target.value)}
          />
          <CommandList>
            <CommandEmpty>No {type} found.</CommandEmpty>
            <CommandGroup>
              {data?.map((item) => (
                <CommandItem
                  key={item + Math.random().toString()}
                  onSelect={() => {
                    setValue(item);
                    setOpenStates(prev => ({ ...prev, [type]: false }));
                  }}
                >
                  {item}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === item ? "opacity-100" : "opacity-0"
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
          <div>{renderCombobox('cpus', cpus, cpuModel,'CPU:', setCpuModel)}</div>
          <div>{renderCombobox('gpus', gpus, gpuModel,'GPU:', setGpuModel)}</div>
          <div>{renderCombobox('rams', rams, ramModel,'RAM:', setRamModel)}</div>
          <div>{renderCombobox('hdds', hdds, hdd,'Storage:', setHdd)}</div>
          <div>{renderCombobox('resolutions', resolutions, resolution,'Resoulation:', setResolution)}</div>
          <div>{renderCombobox('purpose', PURPOSES, purpose,'Whats the main purpose.', setPurpose)}</div>
        </div>

        <Button onClick={analyzeBottleneck} className="mt-4" disabled={loading}>
          {loading?<Loader2 className='animate-spin' />:'Analyze Bottleneck'}
        </Button>

        {error && <p className="mt-2 text-red-500">{error}</p>}
        
        {bottleneck && (
          <Card className="mt-2 max-w-[600px]">
            <CardContent>
              <div className="mt-4">
                <h3 className="text-lg font-medium">Bottleneck: {bottleneck.overall_bottleneck}</h3>
                <p>CPU Bottleneck: {bottleneck?.cpu_bottleneck}</p>
                <p>GPU Bottleneck: {bottleneck?.gpu_bottleneck}</p>
                {bottleneck?.ram_bottleneck && <p>RAM Bottleneck: {bottleneck?.ram_bottleneck}</p>}
                {bottleneck?.storage_bottleneck && <p>HDD Bottleneck: {bottleneck?.storage_bottleneck}</p>}
                {bottleneck?.resolution_bottleneck && <p>Resolution Bottleneck: {bottleneck?.resolution_bottleneck}</p>}
                {bottleneck?.recommendations?.length && <><p>Recomandations: </p>
                <ul>{bottleneck?.recommendations?.map((r:string)=><li key={r}>{r}</li>)}</ul>
                </>}
                
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default BottleneckAnalyzer;

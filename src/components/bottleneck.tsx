'use client'
import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Check,
  ChevronsUpDown,
  Loader2,
  Cpu,
  MemoryStick,
  Microchip,
  HardDrive,
  Monitor,
  Target,
  AlertCircle,
  LightbulbIcon,
} from "lucide-react";
import {
  Command,
  CommandItem,
  CommandList,
  CommandGroup,
  CommandEmpty,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import  './styles.css'

interface IBottleneck {
  cpu_bottleneck?: {exists: string; percentage:string};
  gpu_bottleneck?: {exists: string; percentage:string};
  ram_bottleneck?: {exists: string; percentage:string};
  storage_bottleneck?: {exists: string; percentage:string};
  resolution_bottleneck?: {exists: string; percentage:string};
  overall_bottleneck?: {exists: string; percentage:string};
  recommendations?: string[];
}

const PURPOSES = [
  "Gaming",
  "Graphic Designing & 3D Modeling",
  "Browsing",
  "Machine Learning",
  "Programming",
  "Office Work",
  "Simulations",
];

const BottleneckAnalyzer = () => {
  const [cpuModel, setCpuModel] = useState("");
  const [gpuModel, setGpuModel] = useState("");
  const [ramModel, setRamModel] = useState("");
  const [purpose, setPurpose] = useState("");
  const [resolution, setResolution] = useState("");
  const [hdd, setHdd] = useState("");
  const [bottleneck, setBottleneck] = useState<IBottleneck | undefined>(undefined);
  const [error, setError] = useState<string | undefined>("");

  const [cpus, setCpus] = useState<string[]>([]);
  const [gpus, setGpus] = useState<string[]>([]);
  const [rams, setRams] = useState<string[]>([]);
  const [resolutions, setResolutions] = useState<string[]>([]);
  const [hdds, setHdds] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

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
    try {
      const response = await fetch("/api/v2/options");
      const { cpus, gpus, rams, resolutions, hdds } = await response.json();
      setCpus(cpus);
      setGpus(gpus);
      setRams(rams);
      setResolutions(resolutions);
      setHdds(hdds);
    } catch {
      toast.error("Failed to load component data");
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchSearchResults = async (
    type: "cpus" | "gpus" | "rams" | "resolutions" | "hdds" | "purpose",
    searchText: string
  ) => {
    const response = await fetch(`/api/v2/search?type=${type}&searchText=${searchText}`);
    const data = await response.json();
    return data;
  };

  const getBottleneckSeverity = (value: string): number => {
    const percentage = parseInt(value);
    return isNaN(percentage) ? 0 : percentage;
  };

  const getBottleneckColor = (value: number): string => {
    if (value >= 75) return "text-red-500";
    if (value >= 50) return "text-orange-500";
    if (value >= 25) return "text-yellow-500";
    return "text-green-500";
  };

  const analyzeBottleneck = async () => {
    if (!cpuModel || !gpuModel || !purpose) {
      toast.error("Please fill in all required fields", {
        description: "CPU, GPU, and Purpose are required for analysis",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/v2/bottleneck", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cpuModel,
          gpuModel,
          ramModel,
          resolution,
          hdd,
          purpose,
        }),
      });

      const data = await response.json();
      const jsonMatch = data.results.match(/```json\n([\s\S]*?)\n```/);

      if (jsonMatch && jsonMatch[1]) {
        const jsonData = JSON.parse(jsonMatch[1]);
        setBottleneck(jsonData);
        setError(data.error || "");
        toast.success("Analysis completed successfully");
      } else {
        throw new Error("Invalid response format");
      }
    } catch {
      toast.error("Failed to analyze bottleneck");
      setError("An error occurred during analysis");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (
    type: "cpus" | "gpus" | "rams" | "resolutions" | "hdds" | "purpose",
    searchText: string
  ) => {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    setDebounceTimeout(
      setTimeout(() => {
        fetchSearchResults(type, searchText).then((data) => {
          if (type === "cpus") setCpus(data.results || []);
          if (type === "gpus") setGpus(data.results || []);
          if (type === "rams") setRams(data.results || []);
          if (type === "resolutions") setResolutions(data.results || []);
          if (type === "hdds") setHdds(data.results || []);
        });
      }, 800)
    );
  };

  useEffect(() => {
    fetchComponentData();
  }, []);

  const getComponentIcon = (type: string) => {
    switch (type) {
      case "cpus":
        return <Cpu className="w-4 h-4" />;
      case "gpus":
        return <Microchip className="w-4 h-4" />;
      case "rams":
        return <MemoryStick className="w-4 h-4" />;
      case "hdds":
        return <HardDrive className="w-4 h-4" />;
      case "resolutions":
        return <Monitor className="w-4 h-4" />;
      case "purpose":
        return <Target className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const renderCombobox = (
    type: "cpus" | "gpus" | "rams" | "resolutions" | "hdds" | "purpose",
    data: string[],
    value: string,
    label: string,
    setValue: React.Dispatch<React.SetStateAction<string>>,
    required: boolean = false
  ) => (
    <Popover
      open={openStates[type]}
      onOpenChange={(open) =>
        setOpenStates((prev) => ({ ...prev, [type]: open }))
      }
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {getComponentIcon(type)}
          <label className="text-sm font-medium">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-between",
              !value && "text-muted-foreground",
              required && !value && "border-red-200 hover:border-red-300"
            )}
            disabled={loading || initialLoading}
          >
            {value || `Select ${label}`}
            <ChevronsUpDown className="w-4 h-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <div className="px-3 pt-3">
              <Input
                className="w-full"
                placeholder={`Search ${label}...`}
                onChange={(e) => handleSearch(type, e.target.value)}
                disabled={type === "purpose" || type === "resolutions"}
              />
            </div>
            <CommandList>
              <CommandEmpty>No {label} found.</CommandEmpty>
              <CommandGroup>
                {data.map((item) => (
                  <CommandItem
                    key={item}
                    onSelect={() => {
                      setValue(item);
                      setOpenStates((prev) => ({ ...prev, [type]: false }));
                    }}
                    className="flex items-center justify-between"
                  >
                    <span>{item}</span>
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4",
                        value === item ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </div>
    </Popover>
  );

  const chartData = [
    { name: 'CPU', value: getBottleneckSeverity(bottleneck?.cpu_bottleneck?.percentage || "0") },
    { name: 'GPU', value: getBottleneckSeverity(bottleneck?.gpu_bottleneck?.percentage || "0") },
    { name: 'RAM', value: getBottleneckSeverity(bottleneck?.ram_bottleneck?.percentage || "0") },
    { name: 'Storage', value: getBottleneckSeverity(bottleneck?.storage_bottleneck?.percentage || "0") },
    { name: 'Resolution', value: getBottleneckSeverity(bottleneck?.resolution_bottleneck?.percentage || "0") },
  ];

  return (
    <Card className="w-full max-w-4xl border-none shadow-none sm:border-2 sm:shadow sm:shadow-border ">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          PC Bottleneck Calculator
        </CardTitle>
        <CardDescription className="text-center">
          Analyze your PC components to identify potential performance bottlenecks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {initialLoading ? (
          <div className="space-y-4 p-8">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Loading component data...
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderCombobox("cpus", cpus, cpuModel, "CPU", setCpuModel, true)}
              {renderCombobox("gpus", gpus, gpuModel, "GPU", setGpuModel, true)}
              {renderCombobox("rams", rams, ramModel, "RAM", setRamModel)}
              {renderCombobox("hdds", hdds, hdd, "Storage", setHdd)}
              {renderCombobox(
                "resolutions",
                resolutions,
                resolution,
                "Resolution",
                setResolution
              )}
              {renderCombobox(
                "purpose",
                PURPOSES,
                purpose,
                "Main Purpose",
                setPurpose,
                true
              )}
            </div>

            <div className="pt-4 flex justify-center">
            <button 
                onClick={analyzeBottleneck}
                className="w-full md:w-auto button"
                disabled={loading || !cpuModel || !gpuModel || !purpose}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Bottleneck"
                )}
              </button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {bottleneck && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-xl">Analysis Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Overall Bottleneck</span>
                        <span className={getBottleneckColor(getBottleneckSeverity(bottleneck.overall_bottleneck?.percentage || "0"))}>
                          {bottleneck.overall_bottleneck?.exists}
                          {' '}
                          <span className="text-black">/ {bottleneck.overall_bottleneck?.percentage || "0"}%</span>
                        </span>
                      </div>
                      <Progress
                        value={getBottleneckSeverity(bottleneck.overall_bottleneck?.percentage || "0")}
                        className="h-2"
                      />
                      
                    </div>

                    {bottleneck.cpu_bottleneck && (
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>CPU Bottleneck</span>
                          <span className={getBottleneckColor(getBottleneckSeverity(bottleneck.cpu_bottleneck.percentage))}>
                            {bottleneck.cpu_bottleneck?.exists}
                            {' '}
                            <span className="text-black">/ {bottleneck.cpu_bottleneck?.percentage || "0"}%</span>
                          </span>
                        </div>
                        <Progress
                          value={getBottleneckSeverity(bottleneck.cpu_bottleneck.percentage)}
                          className="h-2"
                        />
                       
                      </div>
                    )}

                    {bottleneck.gpu_bottleneck && (
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>GPU Bottleneck</span>
                          <span className={getBottleneckColor(getBottleneckSeverity(bottleneck.gpu_bottleneck.percentage))}>
                            {bottleneck.gpu_bottleneck.exists}
                            {' '}
                            <span className="text-black">/ {bottleneck.gpu_bottleneck?.percentage || "0"}%</span>
                          </span>
                        </div>
                        <Progress
                          value={getBottleneckSeverity(bottleneck.gpu_bottleneck.percentage)}
                          className="h-2"
                        />
                       
                      </div>
                    )}

                    {bottleneck.ram_bottleneck && (
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>RAM Bottleneck</span>
                          <span className={getBottleneckColor(getBottleneckSeverity(bottleneck.ram_bottleneck.percentage))}>
                            {bottleneck.ram_bottleneck.exists}
                            {' '}
                            <span className="text-black">/ {bottleneck.ram_bottleneck?.percentage || "0"}%</span>
                          </span>
                        </div>
                        <Progress
                          value={getBottleneckSeverity(bottleneck.ram_bottleneck.percentage)}
                          className="h-2"
                        />
                       
                      </div>
                    )}

                    {bottleneck.storage_bottleneck && (
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>Storage Bottleneck</span>
                          <span className={getBottleneckColor(getBottleneckSeverity(bottleneck.storage_bottleneck.percentage))}>
                            {bottleneck.storage_bottleneck.exists}
                            {' '}
                            <span className="text-black">/ {bottleneck.storage_bottleneck?.percentage || "0"}%</span>
                          </span>
                        </div>
                        <Progress
                          value={getBottleneckSeverity(bottleneck.storage_bottleneck.percentage)}
                          className="h-2"
                        />
                        
                      </div>
                    )}

                    {bottleneck.resolution_bottleneck && (
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>Resolution Bottleneck</span>
                          <span className={getBottleneckColor(getBottleneckSeverity(bottleneck.resolution_bottleneck.percentage))}>
                            {bottleneck.resolution_bottleneck.exists}
                            {' '}
                            <span className="text-black">/ {bottleneck.resolution_bottleneck?.percentage || "0"}%</span>
                          </span>
                        </div>
                        <Progress
                          value={getBottleneckSeverity(bottleneck.resolution_bottleneck.percentage)}
                          className="h-2"
                        />
                        
                      </div>
                    )}
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Bottleneck Chart</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {bottleneck?.recommendations && bottleneck.recommendations?.length > 0 && (
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center gap-2">
                        <LightbulbIcon className="w-5 h-5 text-yellow-500" />
                        <h3 className="text-lg font-semibold">Recommendations</h3>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <ul className="space-y-2">
                          {bottleneck.recommendations.map((recommendation, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="mt-1 text-primary">•</span>
                              <span className="text-gray-700">{recommendation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BottleneckAnalyzer;
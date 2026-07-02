"use client";

import { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { motion, useInView } from "framer-motion";
import { Filter, Download, Search, RotateCcw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import LabStep from "@/components/labs/LabStep";
import { AcceptanceCriteria, DEFAULT_HIERARCHY } from "@/data";
import { filterLabs, getPersonas, getTopics, getAreas, getProblems } from "@/lib/lab-utils";
import SelectFilter from "@/components/labs/SelectFilter";
import { getPersonaIntro } from "@/data";
import { downloadLabSheet } from "@/lib/download";
import { copyToClipboard } from "@/lib/utils";
import CaseStudyHierarchy from "@/components/labs/CaseStudyHierarchy";

const findMatchingOption = (options: string[], urlValue: string): string => {
  if (!urlValue) return "";
  return (
    options.find((option) => option.toLowerCase() === urlValue.toLowerCase()) || ""
  );
};

const LabsPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const areas = useMemo(() => getAreas(), []);
  const personas = useMemo(() => getPersonas(), []);

  const [filters, setFilters] = useState({
    area: "",
    topic: "",
    persona: "",
  });

  const [hierarchySelection, setHierarchySelection] = useState({
    problemId: "",
    userStoryId: "",
    acceptanceCriteriaIds: [] as string[],
  });

  const lastParamsRef = useRef<string>("");

  const selectedArea = filters.area;
  const topics = useMemo(() => getTopics(selectedArea), [selectedArea]);

  useEffect(() => {
    const currentParams = searchParams.toString();
    if (currentParams !== lastParamsRef.current) {
      lastParamsRef.current = currentParams;
      const urlArea = findMatchingOption(areas, searchParams.get("area") || "");
      const urlTopic = findMatchingOption(topics, searchParams.get("topic") || "");
      const urlPersona = findMatchingOption(personas, searchParams.get("persona") || "");
      const urlProblemId = searchParams.get("problemId") || "";
      const urlUserStoryId = searchParams.get("userStoryId") || "";
      const urlAcceptanceCriteriaIds = searchParams.get("acceptanceCriteriaIds")?.split(",") || [];
      setFilters((prev) => {
        if (
          prev.area !== urlArea ||
          prev.topic !== urlTopic ||
          prev.persona !== urlPersona
        ) {
          return {
            area: urlArea,
            topic: urlTopic,
            persona: urlPersona,
          };
        }
        return prev;
      });
      setHierarchySelection({
        problemId: urlProblemId,
        userStoryId: urlUserStoryId,
        acceptanceCriteriaIds: urlAcceptanceCriteriaIds,
      });
    }
  }, [searchParams, areas, topics, personas]);


  const selectedTopic = filters.topic;
  const explicitPersona = filters.persona;

  const availableProblems = useMemo(() => {
    if (selectedArea && selectedTopic) {
      return getProblems(selectedArea, selectedTopic);
    }
    return [];
  }, [selectedArea, selectedTopic]);

  const defaultPersona = useMemo(() => {
    if (explicitPersona) return explicitPersona;
    if (selectedArea && selectedTopic && personas.length > 0) {
      return personas[0];
    }
    return "";
  }, [explicitPersona, selectedArea, selectedTopic, personas]);

  const { filteredLabs, selectedProblem, topicHierarchy } = useMemo(() => {
    if (selectedArea && selectedTopic) {
      const result = filterLabs(
        selectedArea,
        selectedTopic,
        hierarchySelection.problemId
      );
      return {
        filteredLabs: result.labs,
        selectedProblem: result.selectedProblem,
        topicHierarchy: result.hierarchy,
      };
    }
    return { filteredLabs: [], selectedProblem: null, topicHierarchy: DEFAULT_HIERARCHY };
  }, [selectedArea, selectedTopic, hierarchySelection.problemId]);

  const selectedHierarchicalData = useMemo(() => {
    if (!selectedProblem) return null;
    const levels = topicHierarchy.levels;

    if (!levels.includes("userStory")) {
      return { problem: selectedProblem, userStory: null, acceptanceCriteria: [] as AcceptanceCriteria[] };
    }

    if (!hierarchySelection.userStoryId) return null;
    const userStory = selectedProblem.userStories.find(us => us.id === hierarchySelection.userStoryId);
    if (!userStory) return null;

    if (!levels.includes("acceptanceCriteria")) {
      return { problem: selectedProblem, userStory, acceptanceCriteria: [] as AcceptanceCriteria[] };
    }

    if (hierarchySelection.acceptanceCriteriaIds.length === 0) return null;
    const acceptanceCriteria = hierarchySelection.acceptanceCriteriaIds
      .map(id => userStory.acceptanceCriteria.find(ac => ac.id === id))
      .filter((ac): ac is AcceptanceCriteria => ac !== undefined);
    if (acceptanceCriteria.length === 0) return null;

    return { problem: selectedProblem, userStory, acceptanceCriteria };
  }, [selectedProblem, hierarchySelection, topicHierarchy]);

  const selectedLab = filteredLabs.length > 0 ? filteredLabs[0] : null;
  const personaIntro = useMemo(
    () => (selectedArea ? getPersonaIntro(selectedArea, defaultPersona) : null),
    [selectedArea, defaultPersona]
  );

  const updateFilters = (updates: Record<string, string>) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      if (updates.area !== undefined) {
        newFilters.area = findMatchingOption(areas, updates.area);
        if (newFilters.area !== prev.area) {
          newFilters.topic = "";
        }
      }
      if (updates.topic !== undefined) {
        newFilters.topic = findMatchingOption(topics, updates.topic);
      }
      if (updates.persona !== undefined) {
        newFilters.persona = findMatchingOption(personas, updates.persona);
      }
      return newFilters;
    });
  };

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.area) params.set("area", filters.area.toLowerCase());
    if (filters.topic) params.set("topic", filters.topic.toLowerCase());
    if (filters.persona) params.set("persona", filters.persona.toLowerCase());
    if (hierarchySelection.problemId) params.set("problemId", hierarchySelection.problemId);
    if (hierarchySelection.userStoryId) params.set("userStoryId", hierarchySelection.userStoryId);
    if (hierarchySelection.acceptanceCriteriaIds.length > 0) params.set("acceptanceCriteriaIds", hierarchySelection.acceptanceCriteriaIds.join(","));
    const queryString = params.toString();
    router.push(queryString ? `/labs?${queryString}` : "/labs", { scroll: false });
  }, [filters, hierarchySelection, router]);

  const handleDownload = () => {
    if (!selectedLab) return;
    downloadLabSheet(selectedLab, personaIntro, selectedHierarchicalData, topicHierarchy);
  };

  const handleReset = () => {
    setFilters({ area: "", topic: "", persona: "" });
    setHierarchySelection({ problemId: "", userStoryId: "", acceptanceCriteriaIds: [] });
  };
  
  return (
    <main className="min-h-screen flex flex-col items-center relative overflow-hidden px-4 py-10 sm:py-12 md:py-16">
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/3 -left-20 w-64 h-64 rounded-full bg-blue-100 opacity-20" />
        <div className="absolute bottom-20 -right-20 w-80 h-80 rounded-full bg-blue-100 opacity-20" />
        <div className="absolute top-40 right-1/4 w-20 h-20 rounded-full bg-green-100 opacity-30" />
      </div>

      <div ref={ref} className="w-full max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-8 sm:mb-10 md:mb-12"
          initial={{ opacity: 0, y: -10 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
            AI-Powered Labs
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-3 sm:mt-4 max-w-2xl mx-auto px-2">
            Select your area, topic, and persona to load a lab. Then choose a
            problem and user story to provide context for Part 2.
          </p>
        </motion.div>
{(filters.area ||
  filters.topic ||
  filters.persona ||
  hierarchySelection.problemId ||
  hierarchySelection.userStoryId ||
  hierarchySelection.acceptanceCriteriaIds.length > 0) && (
  <div className="flex justify-end mb-2">
    <button
      onClick={handleReset}
      className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors border border-gray-200 rounded-lg px-3 py-1.5"
    >
      <RotateCcw size={14} />
      Reset
    </button>
  </div>
)}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <SelectFilter
            label="Area"
            options={areas}
            value={selectedArea}
            onChange={(value) => updateFilters({ area: value })}
            icon={<Search size={18} />}
          />

          <SelectFilter
            label="Topic"
            options={topics}
            value={selectedTopic}
            onChange={(value) => updateFilters({ topic: value })}
            icon={<Search size={18} />}
          />

          <SelectFilter
            label="Persona"
            options={personas}
            value={defaultPersona}
            onChange={(value) => updateFilters({ persona: value })}
            icon={<Search size={18} />}
          />
        </motion.div>

        {selectedArea && selectedTopic && (
          <motion.div
            className="mb-6 sm:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <CaseStudyHierarchy
              problems={availableProblems}
              onSelectionChange={setHierarchySelection}
              initialSelection={hierarchySelection}
              hierarchy={topicHierarchy}
            />
          </motion.div>
        )}

        {!selectedLab && (
          <motion.div
            className="bg-white/30 backdrop-blur-sm border border-white/20 rounded-xl p-6 sm:p-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="p-4 sm:p-6 bg-blue-500/10 rounded-full">
                <Filter size={48} className="sm:hidden text-blue-500" />
                <Filter size={64} className="hidden sm:block text-blue-500" />
              </div>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
              Select Area and Topic to Get Started
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              Choose an area and topic to automatically load the first available
              lab. You can customize the persona and case study afterwards.
            </p>
          </motion.div>
        )}

        {selectedLab && personaIntro && (
          <motion.div
            className="bg-white/30 backdrop-blur-sm border border-white/20 rounded-xl p-4 sm:p-5 md:p-6 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start md:items-center mb-4 sm:mb-6 gap-3 md:gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">
                  {selectedLab.title}
                </h2>
                {selectedLab.description && (
                  <p className="text-sm sm:text-base text-gray-600">
                    {selectedLab.description}
                  </p>
                )}
              </div>
              <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-3 sm:px-4 rounded-lg transition-colors min-w-[140px] sm:min-w-[160px] md:min-w-[180px] text-sm sm:text-base whitespace-nowrap"
              >
                <Download size={16} className="hidden sm:inline" />
                <Download size={14} className="sm:hidden" />
                Download Lab Sheet
              </button>
            </div>

            <div className="space-y-6 sm:space-y-8">
              {selectedLab.steps.map((step, i) => (
                <LabStep
                  key={i}
                  step={step}
                  index={i}
                  copyToClipboard={copyToClipboard}
                  caseStudy={selectedHierarchicalData}
                  isSecondStep={step.type === "interaction"}
                  hierarchy={topicHierarchy}
                  personaIntro={personaIntro}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
};

const LabsPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h3 className="text-lg font-semibold text-gray-700">Loading AI Labs...</h3>
          <p className="text-sm text-gray-500">Preparing interactive software engineering scenarios</p>
        </div>
      </div>
    }>
      <LabsPageContent />
    </Suspense>
  );
};

export default LabsPage;

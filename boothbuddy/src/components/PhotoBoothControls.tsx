import React from "react";
import { FaDownload } from "react-icons/fa";

// Define the Filter type
export interface Filter {
    id: string;
    name: string;
    description: string;
    defaultIntensity: number;
    minIntensity: number;
    maxIntensity: number;
}

interface PhotoBoothControlsProps {
  filters: Filter[];
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
  filterIntensity: number;
  setFilterIntensity: (intensity: number) => void;
  isApplyingFilter: boolean;
  applyFilter: () => Promise<void>;
  createStrip: () => Promise<void>;
  resetPhotos: () => void;
}

const PhotoBoothControls: React.FC<PhotoBoothControlsProps> = ({
  filters,
  selectedFilter,
  setSelectedFilter,
  filterIntensity,
  setFilterIntensity,
  isApplyingFilter,
  applyFilter,
  createStrip,
  resetPhotos,
}) => {
  const selectedFilterData = filters.find((f) => f.id === selectedFilter);

  return (
    <div className="bg-white rounded-lg w-full max-w-md">
      <h3 className="text-lg font-semibold mb-3">Apply Filter</h3>

      <div className="mb-3">
        <select
          value={selectedFilter}
          onChange={(e) => {
            setSelectedFilter(e.target.value);
            const filter = filters.find((f) => f.id === e.target.value);
            if (filter) setFilterIntensity(filter.defaultIntensity);
          }}
          disabled={isApplyingFilter}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-300"
        >
          <option value="none">No Filter</option>
          {filters.map((filter) => (
            <option key={filter.id} value={filter.id}>
              {filter.name} - {filter.description}
            </option>
          ))}
        </select>
      </div>

      {selectedFilter !== "none" && selectedFilterData && (
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">
            Intensity: {filterIntensity.toFixed(1)}
          </label>
          <input
            type="range"
            min={selectedFilterData.minIntensity}
            max={selectedFilterData.maxIntensity}
            step="0.1"
            value={filterIntensity}
            onChange={(e) => setFilterIntensity(parseFloat(e.target.value))}
            disabled={isApplyingFilter}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>{selectedFilterData.minIntensity}</span>
            <span>{selectedFilterData.maxIntensity}</span>
          </div>
        </div>
      )}

      {selectedFilter !== "none" && (
        <button
          onClick={applyFilter}
          disabled={isApplyingFilter}
          className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-gray-400 mb-2"
        >
          {isApplyingFilter ? "Applying..." : "Apply Filter"}
        </button>
      )}

      <div className="mt-4 flex gap-4">
        <button
          onClick={createStrip}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          <FaDownload />
        </button>
        <button
          onClick={resetPhotos}
          className="bg-orange-400 text-white px-4 py-2 rounded hover:bg-orange-500"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default PhotoBoothControls;
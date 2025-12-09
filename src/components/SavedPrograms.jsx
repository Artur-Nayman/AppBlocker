import React from 'react';

function SavedPrograms({ programs, onSelect }) {
  if (programs.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 pt-4 border-t border-gray-700">
      <h3 className="text-lg font-semibold mb-3">Quick Add from Saved</h3>
      <div className="flex flex-wrap gap-2">
        {programs.map(program => (
          <button
            key={program}
            onClick={() => onSelect(program)}
            className="bg-gray-700 text-white px-3 py-1 rounded-lg hover:bg-gray-600 transition-colors text-sm"
            title={`Add ${program} to current block list`}
          >
            + {program}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SavedPrograms;

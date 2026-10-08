import React from 'react';
import { Upload, Database, FileSpreadsheet } from 'lucide-react';

interface EmptyDataStateProps {
  title?: string;
  description?: string;
  onUploadClick: () => void;
}

export const EmptyDataState: React.FC<EmptyDataStateProps> = ({
  title = 'No Logistics Data Uploaded',
  description = 'Upload your CSV or Excel logistics files to initialize delivery success predictions, risk calculations, and fleet suitability analysis.',
  onUploadClick,
}) => {
  return (
    <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs max-w-2xl mx-auto my-8 space-y-4">
      <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
        <FileSpreadsheet className="w-8 h-8" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-1.5 font-medium leading-relaxed">
          {description}
        </p>
      </div>
      <div className="pt-2">
        <button
          onClick={onUploadClick}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer text-xs"
        >
          <Upload className="w-4 h-4" />
          Upload Logistics Data (CSV / Excel)
        </button>
      </div>
    </div>
  );
};
